// Default addnode peers seeded on install.
//
// Workaround for namecoin/namecoin-core#593: the upstream nc30.x release
// shipped with Bitcoin Core's mainnet vSeeds instead of Namecoin's, so a
// fresh node never finds a real Namecoin peer through DNS. We pre-load a
// set of known-good Namecoin nodes here so the node can bootstrap.
//
// Once that upstream PR is merged AND we rebuild against a fixed namecoind
// (>= nc30.3?), this list can be reduced or removed.
//
// =====================================================================
// WARNING — `addnode=` is a footgun. namecoind exempts ANY manually
// configured peer (both `addnode=` AND `connect=`) from misbehavior
// penalties ("not punishing manually connected peer"). A single broken
// or malicious peer in this list can keep the message-handler thread
// saturated with junk packets and stall the entire sync indefinitely.
//
// Switching `addnode=` → `connect=` does NOT fix this — both paths land
// in namecoind's "manual" peer bucket and skip the disconnect/ban logic.
// The only durable mitigation is to stop using manual peers once we have
// enough organic peers learned via peer-relay (gossip). The package ships
// an action for this purpose:
//
//     "Graduate From Bootstrap Peers"   (id: graduate-from-bootstrap)
//
// Run that action once the node has >= ~5 outbound peers AND a non-zero
// verified block height, then restart Namecoin. The bootstrap list will
// be cleared; from then on namecoind discovers and PUNISHES peers
// normally.
//
// Observed failure mode in testing (2026-05-27):
//   - Sync stalled at ~55% with peer N flooding ~20 "not punishing
//     manually connected peer N!" warnings per second.
//   - Dropping the suspect IP + restarting only worked for ~1 minute
//     before a different peer rotated into the bad slot. Whack-a-mole.
//   - Clean fix: clear the manual list entirely. addrman was warm by
//     this point, namecoind found 10 healthy outbound on its own, and
//     sync resumed at ~250 blocks/sec with zero spam in the logs.
//
// As a precaution we removed 37.58.57.233 (adjacent IP to the originally
// observed bad peer 37.58.57.243, same Leaseweb DE / Frankfurt /24, same
// suspect operator) from the bootstrap list and replaced it with
// 77.22.59.24 (AS3209 Vodafone DE — different operator, different ASN).
//
// See the failure-mode notes in the PR thread for details and mitigation
// options if a node here goes bad in the future.
// =====================================================================
//
// Last refreshed: 2026-05-27 — pulled from the two known-live DNS seeds:
//   dnsseed.nmc.testls.space   (mjgill89)
//   namecoin.seed.cypherstack.com (Dan Miller)
// then TCP-probed on 8334. Each entry was reachable on initial probe.
//
// ASN diversity is desirable: a single misbehaving operator can poison
// multiple addnodes in the same /24. Spread across hosts and providers.
//
// Format: "<host-or-ip>:<port>" — the file model accepts both IPv4 and
// IPv6 (bracketed), and the entries flow into namecoin.conf as `addnode=`.
export const DEFAULT_ADDNODE_PEERS: string[] = [
  // dnsseed.nmc.testls.space (subset)
  '23.108.191.178:8334', // AS7203  Leaseweb US (San Jose)
  '15.204.102.127:8334', // AS16276 OVH (Hillsboro)
  '66.45.249.50:8334', // AS19318 Interserver (NYC)
  '77.22.59.24:8334', // AS3209  Vodafone DE — replaces 37.58.57.233 (Leaseweb DE, suspect /24)
  '23.108.191.142:8334', // AS7203  Leaseweb US (San Jose)
  '23.81.45.138:8334', // AS134351 Leaseweb JP (Tokyo)
  '88.80.28.4:8334', // AS33837 Fredrik Holmqvist (Stockholm)
  // namecoin.seed.cypherstack.com (subset)
  '116.203.63.94:8334', // AS24940 Hetzner DE (Nürnberg)
  '162.19.96.8:8334', // AS16276 OVH FR (Calais)
  '3.74.254.94:8334', // AS16509 AWS DE (Frankfurt)
  '198.96.89.98:8334', // AS19318 Interserver (NYC)
  '185.87.45.95:8334', // AS6752  Andorra Telecom
  // DNS seeds themselves — also resolved by namecoind, but listing them
  // as addnodes makes the bootstrap path explicit and resilient to
  // namecoind's seed list being stale.
  'dnsseed.nmc.testls.space:8334',
  'namecoin.seed.cypherstack.com:8334',
]
