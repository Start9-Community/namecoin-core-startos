import { sdk } from './sdk'

// Host ids (the `sdk.MultiHost.of` groups) — distinct from the interface ids
// exported on them.
export const rpcHostId = 'rpc'
export const peerHostId = 'peer'
export const zmqHostId = 'zmq'

export const rpcInterfaceId = 'rpc'
export const peerInterfaceId = 'peer'
export const zmqInterfaceId = 'zmq'

export const zmqPortBlock = 28336
export const zmqPortTransaction = 28337

export const peerPortExternal = 8334
export const peerPortInternal = 58334

export const rpcPort = 8336

export const rpcbind = `0.0.0.0:${rpcPort}`

export const rpcallowip = '0.0.0.0/0'

export const rootDir = '/root/.namecoin'
export const rpccookiefile = '.cookie'

export const namecoinMounts = sdk.Mounts.of().mountVolume({
  volumeId: 'main',
  subpath: null,
  mountpoint: rootDir,
  readonly: false,
})

export type GetNetworkInfo = {
  connections: number
  connections_in: number
  connections_out: number
}

export type GetBlockchainInfo = {
  chain: string
  blocks: number
  headers: number
  bestblockhash: string
  difficulty: number
  mediantime: number
  verificationprogress: number
  initialblockdownload: boolean
  chainwork: string
  size_on_disk: number
  pruned: boolean
  pruneheight?: number
  automatic_pruning?: boolean
  prune_target_size?: number
  softforks: Record<
    string,
    {
      type: string
      bip9?: {
        status: string
        bit?: number
        start_time: number
        timeout: number
        since: number
        statistics?: {
          period: number
          threshold: number
          elapsed: number
          count: number
          possible: boolean
        }
      }
      height?: number
      active: boolean
    }
  >
  warnings: string
}

/** RPC connection args shared by namecoin-cli and shell-script wrappers. */
export function rpcArgs(): string[] {
  return [
    `-conf=${rootDir}/namecoin.conf`,
    `-rpccookiefile=${rootDir}/.cookie`,
    `-rpcport=${rpcPort}`,
  ]
}

/** Full namecoin-cli command prefix for actions running in temp subcontainers. */
export function namecoinCliArgs(): string[] {
  return ['namecoin-cli', ...rpcArgs()]
}

export const zmqBundle = {
  zmqpubrawblock: `tcp://0.0.0.0:${zmqPortBlock}`,
  zmqpubhashblock: `tcp://0.0.0.0:${zmqPortBlock}`,
  zmqpubrawtx: `tcp://0.0.0.0:${zmqPortTransaction}`,
  zmqpubhashtx: `tcp://0.0.0.0:${zmqPortTransaction}`,
  zmqpubsequence: `tcp://0.0.0.0:${zmqPortTransaction}`,
}
