import { access, rm } from 'fs/promises'
import { socksHostId, socksPort } from 'tor-startos/startos/utils'
import { namecoinConfFile } from './fileModels/namecoin.conf'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  GetBlockchainInfo,
  namecoinCliArgs,
  namecoinMounts,
  rootDir,
  rpccookiefile,
  rpcPort,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  /**
   * ======================== Setup ========================
   */
  console.log('Starting Namecoin!')

  // get store.json but don't watch for changes
  const store = await storeJson.read().once()
  if (!store) {
    throw new Error('No store')
  }
  // get namecoin.conf and watch for changes
  const namecoinConf = await namecoinConfFile.read().const(effects)
  if (!namecoinConf) {
    throw new Error('No namecoin.conf')
  }

  const { reindexBlockchain, reindexChainstate } = store

  // Tor SOCKS over the bridge. The bridge address only changes when tor's
  // binding does — with the 9050 fallback it stays constant across tor
  // install/update/uninstall, so this .const() never restarts Namecoin unless
  // tor lands on a different port (then one healing restart). A dead bridge
  // address is just connection-refused, so -onion is always safe to pass.
  const torSocks = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'tor',
      hostId: socksHostId,
      internalPort: socksPort,
      fallbackPort: socksPort,
    })
    .const()

  // track Tor install/run state dynamically for the health check (no restart)
  let torInstalled = false
  let torRunning = false
  sdk.getStatus(effects, { packageId: 'tor' }).onChange((status) => {
    torInstalled = status !== null
    torRunning = status?.desired.main === 'running'
    return { cancel: false }
  })

  const namecoinArgs: string[] = [`-onion=${torSocks}`]

  if (reindexBlockchain) {
    namecoinArgs.push('-reindex')
    await storeJson.merge(effects, { reindexBlockchain: false })
  } else if (reindexChainstate) {
    namecoinArgs.push('-reindex-chainstate')
    await storeJson.merge(effects, { reindexChainstate: false })
  }

  const namecoindSub = await sdk.SubContainer.eager(
    effects,
    { imageId: 'namecoind' },
    namecoinMounts,
    'namecoind-sub',
  )

  const rpcCookiePath = `${rootDir}/${rpccookiefile}`

  // remove cookie file
  await rm(`${namecoindSub.rootfs}${rpcCookiePath}`, {
    force: true,
    recursive: true,
  })

  /**
   * ======================== Daemons ========================
   */

  const externalip = namecoinConf.raw?.externalip
  const onlynetList = [namecoinConf.onlynet ?? []].flat()
  const onlynetActive = onlynetList.length > 0
  const excludedByOnlynetResult = () => ({
    result: 'disabled' as const,
    message: i18n('Excluded by onlynet'),
  })

  const base = sdk.Daemons.of(effects)
    .addOneshot('nocow', {
      subcontainer: namecoindSub,
      exec: {
        command: ['chattr', '-R', '+C', rootDir],
      },
      requires: [],
    })
    .addOneshot('clean-chainstate-old', {
      subcontainer: namecoindSub,
      exec: {
        command: [
          'sh',
          '-c',
          `rm -rf ${rootDir}/chainstate.old ${rootDir}/*/chainstate.old`,
        ],
      },
      requires: [],
    })

  const withNamecoind = await base
    .addDaemon('namecoind', {
      subcontainer: namecoindSub,
      exec: {
        command: ['namecoind', ...namecoinArgs],
        sigtermTimeout: 300_000,
      },
      ready: {
        display: 'RPC',
        fn: async () => {
          try {
            await access(`${namecoindSub.rootfs}${rpcCookiePath}`)
          } catch {
            console.log('Waiting for cookie to be created')
            return {
              message: i18n('The Namecoin RPC Interface is not ready'),
              result: 'starting',
            }
          }

          return sdk.healthCheck.checkPortListening(effects, rpcPort, {
            successMessage: i18n('The Namecoin RPC Interface is ready'),
            errorMessage: i18n('The Namecoin RPC Interface is not ready'),
          })
        },
      },
      requires: ['nocow', 'clean-chainstate-old'],
    })
    .addHealthCheck('sync-progress', {
      ready: {
        display: i18n('Blockchain Sync'),
        trigger: sdk.trigger.statusTrigger(30_000, {
          starting: 5_000,
          failure: 5_000,
        }),
        fn: async () => {
          const res = await namecoindSub.exec([
            ...namecoinCliArgs(),
            '-rpcconnect=127.0.0.1',
            'getblockchaininfo',
          ])

          if (
            res.exitCode === 0 &&
            res.stdout !== '' &&
            typeof res.stdout === 'string'
          ) {
            const info: GetBlockchainInfo = JSON.parse(res.stdout)

            if (info.initialblockdownload) {
              // Headers-first sync: namecoind downloads and validates the
              // entire header chain before requesting any block bodies. While
              // that is happening, info.blocks stays at 0 and
              // info.verificationprogress is ~0, which would otherwise read
              // as the (correct but uninformative) "Syncing blocks...0.00%".
              // Surface the actual phase so users can tell pre-block-download
              // progress (headers ticking up) from a stalled node.
              const headers = info.headers
              const blocks = info.blocks

              if (headers === 0) {
                return {
                  message: i18n(
                    'Connecting to peers and downloading headers\u2026',
                  ),
                  result: 'loading',
                }
              }

              if (blocks === 0) {
                return {
                  message: i18n('Syncing headers\u2026 ${headers} downloaded', {
                    headers: String(headers),
                  }),
                  result: 'loading',
                }
              }

              const percentage = (info.verificationprogress * 100).toFixed(2)
              return {
                message: i18n(
                  'Syncing blocks... ${blocks} / ${headers} (${percentage}%)',
                  {
                    blocks: String(blocks),
                    headers: String(headers),
                    percentage,
                  },
                ),
                result: 'loading',
              }
            }

            return {
              message: i18n('Namecoin is fully synced'),
              result: 'success',
            }
          }

          return {
            message: i18n('Namecoin is starting…'),
            result: 'starting',
          }
        },
      },
      requires: ['namecoind'],
    })
    .addOneshot('synced-true', {
      subcontainer: null,
      exec: {
        fn: async () => {
          if (!store.fullySynced) {
            await storeJson.merge(effects, {
              fullySynced: true,
              snapshotInUse: false,
            })
            // Reduce dbcache and dbbatchsize after initial sync to free RAM
            await namecoinConfFile.merge(effects, {
              dbcache: 450,
              dbbatchsize: undefined,
            })
          }

          return null
        },
      },
      requires: ['sync-progress'],
    })

  const withTor = withNamecoind.addHealthCheck('tor', {
    ready: {
      display: 'Tor',
      fn: () => {
        if (!torInstalled) {
          return { result: 'disabled', message: i18n('Tor is not installed') }
        }
        if (!torRunning) {
          return { result: 'disabled', message: i18n('Tor is not running') }
        }
        if (onlynetActive && !onlynetList.includes('onion')) {
          return excludedByOnlynetResult()
        }
        return {
          result: 'success',
          message: externalip?.some((ip) => ip?.includes('.onion'))
            ? i18n('Inbound and outbound connections')
            : i18n('Outbound only. Add an onion address to enable inbound.'),
        }
      },
    },
    requires: [],
  })

  return withTor.addHealthCheck('clearnet', {
    ready: {
      display: 'Clearnet',
      fn: () => {
        if (
          onlynetActive &&
          !onlynetList.includes('ipv4') &&
          !onlynetList.includes('ipv6')
        ) {
          return excludedByOnlynetResult()
        }
        return {
          result: 'success',
          message: externalip?.some((ip) => ip && !ip.includes('.onion'))
            ? i18n('Inbound and outbound connections')
            : i18n('Outbound only. Publish an IP address to enable inbound.'),
        }
      },
    },
    requires: [],
  })
})
