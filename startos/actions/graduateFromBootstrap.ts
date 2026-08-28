import { sdk } from '../sdk'
import { i18n } from '../i18n'
import { namecoinConfFile } from '../fileModels/namecoin.conf'
import {
  namecoinCliArgs,
  namecoinMounts,
  GetNetworkInfo,
  GetBlockchainInfo,
} from '../utils'

const MIN_OUTBOUND = 5

export const graduateFromBootstrap = sdk.Action.withoutInput(
  // id
  'graduate-from-bootstrap',

  // metadata
  async ({ effects }) => ({
    name: i18n('Graduate From Bootstrap Peers'),
    description: i18n(
      'Remove any manually configured peers once the node has learned enough peers on its own. Manual peers are exempt from misbehavior penalties; keeping them long-term lets a single bad peer stall sync. Restart the package after running this action.',
    ),
    warning: i18n(
      'You must restart Namecoin after running this action for the new peer config to take effect.',
    ),
    allowedStatuses: 'only-running',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),

  // execution function
  async ({ effects }) => {
    // Read current conf so we can preserve everything except the peer list.
    const conf = await namecoinConfFile.read().once()
    if (!conf) {
      throw new Error('namecoin.conf not found')
    }

    const rawPeers = conf.connectpeer?.value?.peers
    const peers: string[] = Array.isArray(rawPeers)
      ? rawPeers.filter((p): p is string => typeof p === 'string')
      : []

    if (peers.length === 0) {
      return {
        version: '1' as const,
        title: i18n('Already Graduated'),
        message: i18n('The manual peer list is already empty.'),
        result: null,
      }
    }

    // Sanity-check: only graduate if we have enough organic peers + some
    // verified blocks.
    const networkInfoRes = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'namecoind' },
      namecoinMounts,
      'graduate-getnetworkinfo',
      async (subc) =>
        await subc.execFail([...namecoinCliArgs(), 'getnetworkinfo']),
    )
    const networkInfo: GetNetworkInfo = JSON.parse(
      networkInfoRes.stdout as string,
    )

    const blockchainInfoRes = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'namecoind' },
      namecoinMounts,
      'graduate-getblockchaininfo',
      async (subc) =>
        await subc.execFail([...namecoinCliArgs(), 'getblockchaininfo']),
    )
    const blockchainInfo: GetBlockchainInfo = JSON.parse(
      blockchainInfoRes.stdout as string,
    )

    if (networkInfo.connections_out < MIN_OUTBOUND) {
      // Plain Error messages get surfaced to the UI verbatim, not i18n-ised.
      throw new Error(
        `Refusing to graduate: only ${networkInfo.connections_out} outbound connections (need >= ${MIN_OUTBOUND}). Removing the manual peers now could leave the node without connections. Wait for more peers and retry.`,
      )
    }

    if (blockchainInfo.blocks === 0) {
      throw new Error(
        'Refusing to graduate: 0 blocks verified. Let the node sync at least a few thousand blocks before removing bootstrap peers.',
      )
    }

    // Wipe the manual peer list. Keep selection so the config form stays
    // structurally identical; just empty the peers array.
    await namecoinConfFile.merge(effects, {
      connectpeer: {
        selection: 'addnode',
        value: { peers: [] },
      },
    })

    console.log(
      `graduate-from-bootstrap: removed ${peers.length} bootstrap peers; ` +
        `${networkInfo.connections_out} outbound / ${networkInfo.connections_in} inbound; ` +
        `${blockchainInfo.blocks} blocks verified`,
    )

    return {
      version: '1' as const,
      title: i18n('Bootstrap Peers Removed'),
      message: i18n(
        'Bootstrap peers removed from namecoin.conf. Restart Namecoin to apply.',
      ),
      result: null,
    }
  },
)
