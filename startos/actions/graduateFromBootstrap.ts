import { sdk } from '../sdk'
import { i18n } from '../i18n'
import { namecoinConfFile } from '../fileModels/namecoin.conf'
import {
  namecoinCliArgs,
  namecoinMounts,
  GetNetworkInfo,
  GetBlockchainInfo,
} from '../utils'

// Minimum healthy outbound peers before we let the user graduate.
// Below this, removing the bootstrap addnodes risks orphaning the node.
const MIN_OUTBOUND = 5

/**
 * "Graduate from bootstrap peers" action.
 *
 * Once the node has finished initial bootstrap and learned real peers via
 * peer-relay, the install-time `addnode=` entries become harmful, not
 * helpful: namecoind exempts manually configured peers (addnode= AND
 * connect=) from misbehavior disconnect/ban ("not punishing manually
 * connected peer"). A single broken or malicious peer in the list can
 * saturate the message-handler thread with junk packets and stall the
 * entire sync.
 *
 * Observed 2026-05-27 in testing: sync stalled at ~55% with one peer
 * spamming ~20 misbehavior warnings/sec. Dropping a single suspect was
 * whack-a-mole — a different peer rotated into the same slot. The clean
 * fix was to remove ALL manual peers; once addrman was warm with peers
 * learned via gossip, namecoind found 10 healthy outbound on its own and
 * sync resumed at ~250 blocks/sec.
 *
 * This action wipes the manual peer list AFTER verifying:
 *   - the node is up (allowed-statuses: only-running)
 *   - peers >= MIN_OUTBOUND organic outbound connections
 *   - blocks > 0 (something has been verified, i.e. addrman is warm)
 *
 * The user must restart the package for the change to take effect, since
 * namecoind only reads `namecoin.conf` at startup. We don't restart
 * automatically because (a) it's surprising, (b) the user may want to
 * snapshot first, (c) PR review preference is to keep destructive ops
 * explicit.
 */
export const graduateFromBootstrap = sdk.Action.withoutInput(
  // id
  'graduate-from-bootstrap',

  // metadata
  async ({ effects }) => ({
    name: i18n('Graduate From Bootstrap Peers'),
    description: i18n(
      'Remove the install-time addnode list once the node has learned enough organic peers. Manual peers are exempt from misbehavior penalties; keeping them long-term lets a single bad peer stall sync. Restart the package after running this action.',
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
    // verified blocks. This avoids orphaning a node that's still in the
    // earliest phase of bootstrap.
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
        `Refusing to graduate: only ${networkInfo.connections_out} outbound connections (need >= ${MIN_OUTBOUND}). Bootstrap addnodes are still the only thing holding this node to the network. Wait for more peers and retry.`,
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
