import { T } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import {
  namecoinCliArgs,
  namecoinMounts,
  GetBlockchainInfo,
  GetNetworkInfo,
} from '../utils'

export const runtimeInfo = sdk.Action.withoutInput(
  // id
  'runtime-info',

  // metadata
  async ({ effects }) => ({
    name: i18n('Runtime Information'),
    description: i18n(
      'Network and other runtime information about this Namecoin node',
    ),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  // execution function
  async ({ effects }) => {
    // getnetworkinfo

    const networkInfoRes = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'namecoind' },
      namecoinMounts,
      'getnetworkinfo',
      async (subc) => {
        return await subc.execFail([...namecoinCliArgs(), 'getnetworkinfo'])
      },
    )

    const networkInfoRaw: GetNetworkInfo = JSON.parse(
      networkInfoRes.stdout as string,
    )

    // getblockchaininfo

    const blockchainInfoRes = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'namecoind' },
      namecoinMounts,
      'getblockchaininfo',
      async (subc) => {
        return await subc.execFail([...namecoinCliArgs(), 'getblockchaininfo'])
      },
    )

    const blockchainInfoRaw: GetBlockchainInfo = JSON.parse(
      blockchainInfoRes.stdout as string,
    )

    // The StartOS UI renders nested `group` results as collapsed
    // `<tui-accordion>` items. Deeply nested groups force users to expand
    // multiple accordions to see basic numbers, and report as "cut off"
    // when they scroll past the first collapsed header. Flatten the
    // top-level summary (connections + block heights + sync progress)
    // into singles so they are visible immediately, and hide the
    // softfork detail behind a single top-level accordion that contains
    // a flat per-softfork group with no further nesting.
    const value: T.ActionResultMember[] = [
      getConnections(networkInfoRaw),
      ...getBlockchainSummary(blockchainInfoRaw),
    ]

    if (blockchainInfoRaw.softforks) {
      value.push(getSoftforkInfo(blockchainInfoRaw))
    }

    return {
      version: '1',
      title: i18n('Node Runtime Info'),
      message: null,
      result: { type: 'group', value },
    }
  },
)

function getConnections(networkInfoRaw: GetNetworkInfo): T.ActionResultMember {
  return {
    type: 'single',
    name: i18n('Connections'),
    description: i18n('The number of peers connected (inbound and outbound)'),
    value: `${networkInfoRaw.connections} (${networkInfoRaw.connections_in} in / ${networkInfoRaw.connections_out} out)`,
    copyable: false,
    masked: false,
    qr: false,
  }
}

function getBlockchainSummary(
  blockchainInfoRaw: GetBlockchainInfo,
): T.ActionResultMember[] {
  return [
    {
      type: 'single',
      name: i18n('Block Height'),
      value: String(blockchainInfoRaw.headers),
      description: i18n('The current block height for the network'),
      copyable: false,
      masked: false,
      qr: false,
    },
    {
      type: 'single',
      name: i18n('Synced Block Height'),
      value: String(blockchainInfoRaw.blocks),
      description: i18n('The number of blocks the node has verified'),
      copyable: false,
      masked: false,
      qr: false,
    },
    {
      type: 'single',
      name: i18n('Sync Progress'),
      value:
        blockchainInfoRaw.blocks < blockchainInfoRaw.headers ||
        blockchainInfoRaw.blocks === 0
          ? `${(blockchainInfoRaw.verificationprogress * 100).toFixed(2)}%`
          : '100%',
      description: i18n(
        'The percentage of the blockchain that has been verified',
      ),
      copyable: false,
      masked: false,
      qr: false,
    },
  ]
}

function getSoftforkInfo(
  blockchainInfoRaw: GetBlockchainInfo,
): T.ActionResultMember {
  return {
    type: 'group',
    name: i18n('Softfork Info'),
    description: null,
    value: getSoftforks(blockchainInfoRaw),
  }
}

function getSoftforks(
  blockchainInfoRaw: GetBlockchainInfo,
): T.ActionResultMember[] {
  return Object.entries(blockchainInfoRaw.softforks).map(([key, val]) => {
    // Flat list of singles for one softfork. The previous layout nested
    // a `Bip9` group and a `Statistics` group inside each softfork; that
    // pushed BIP9 fields four accordion-clicks deep. Prefix the BIP9
    // field names with `BIP9 ` so they read as a single flat list while
    // keeping their original meaning.
    const value: T.ActionResultMember[] = [
      {
        type: 'single',
        name: i18n('Type'),
        value: val.type,
        description: i18n('Either "buried", "bip9"'),
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: i18n('Height'),
        value: val.height ? String(val.height) : 'N/A',
        description: i18n(
          'height of the first block which the rules are or will be enforced (only for "buried" type, or "bip9" type with "active" status)',
        ),
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: i18n('Active'),
        value: String(val.active),
        description: i18n(
          'true if the rules are enforced for the mempool and the next block',
        ),
        copyable: false,
        masked: false,
        qr: false,
      },
    ]

    if (val.bip9) {
      value.push(...getBip9Flat(val.bip9))

      if (val.bip9.statistics) {
        value.push(...getBip9StatisticsFlat(val.bip9.statistics))
      }
    }

    return { type: 'group', name: key, description: null, value }
  })
}

function getBip9Flat(bip9: Bip9): T.ActionResultMember[] {
  const { status, bit, start_time, timeout, since } = bip9

  return [
    {
      type: 'single',
      name: i18n('BIP9 Status'),
      value: status,
      description: i18n(
        'One of "defined", "started", "locked_in", "active", "failed"',
      ),
      copyable: false,
      masked: false,
      qr: false,
    },
    {
      type: 'single',
      name: i18n('BIP9 Bit'),
      value: bit !== undefined ? String(bit) : 'N/A',
      description: i18n(
        'The bit (0-28) in the block version field used to signal this softfork (only for "started" status)',
      ),
      copyable: false,
      masked: false,
      qr: false,
    },
    {
      type: 'single',
      name: i18n('BIP9 Start Time'),
      value: String(start_time),
      description: i18n(
        'The minimum median time past of a block at which the bit gains its meaning',
      ),
      copyable: false,
      masked: false,
      qr: false,
    },
    {
      type: 'single',
      name: i18n('BIP9 Timeout'),
      value: String(timeout),
      description: i18n(
        'The median time past of a block at which the deployment is considered failed if not yet locked in',
      ),
      copyable: false,
      masked: false,
      qr: false,
    },
    {
      type: 'single',
      name: i18n('BIP9 Since'),
      value: String(since),
      description: i18n(
        'height of the first block to which the status applies',
      ),
      copyable: false,
      masked: false,
      qr: false,
    },
  ]
}

function getBip9StatisticsFlat(statistics: Bip9Stats): T.ActionResultMember[] {
  const { period, threshold, elapsed, count, possible } = statistics

  return [
    {
      type: 'single',
      name: i18n('BIP9 Period'),
      value: String(period),
      description: i18n('The length in blocks of the BIP9 signalling period'),
      copyable: false,
      masked: false,
      qr: false,
    },
    {
      type: 'single',
      name: i18n('BIP9 Threshold'),
      value: String(threshold),
      description: i18n(
        'The number of blocks with the version bit set required to activate the feature',
      ),
      copyable: false,
      masked: false,
      qr: false,
    },
    {
      type: 'single',
      name: i18n('BIP9 Elapsed'),
      value: String(elapsed),
      description: i18n(
        'The number of blocks elapsed since the beginning of the current period',
      ),
      copyable: false,
      masked: false,
      qr: false,
    },
    {
      type: 'single',
      name: i18n('BIP9 Count'),
      value: String(count),
      description: i18n(
        'The number of blocks with the version bit set in the current period',
      ),
      copyable: false,
      masked: false,
      qr: false,
    },
    {
      type: 'single',
      name: i18n('BIP9 Possible'),
      value: String(possible),
      description: i18n(
        'returns false if there are not enough blocks left in this period to pass activation threshold',
      ),
      copyable: false,
      masked: false,
      qr: false,
    },
  ]
}

type Bip9 = NonNullable<GetBlockchainInfo['softforks']['']['bip9']>
type Bip9Stats = NonNullable<Bip9['statistics']>
