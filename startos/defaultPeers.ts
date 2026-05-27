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
// Last refreshed: 2026-05-27 — pulled from the two known-live DNS seeds:
//   dnsseed.nmc.testls.space   (mjgill89)
//   namecoin.seed.cypherstack.com (Dan Miller)
// then TCP-probed on 8334. Each entry was reachable on initial probe.
//
// Format: "<host-or-ip>:<port>" — the file model accepts both IPv4 and
// IPv6 (bracketed), and the entries flow into namecoin.conf as `addnode=`.
export const DEFAULT_ADDNODE_PEERS: string[] = [
  // dnsseed.nmc.testls.space (subset)
  '23.108.191.178:8334',
  '15.204.102.127:8334',
  '66.45.249.50:8334',
  '37.58.57.233:8334',
  '23.108.191.142:8334',
  '23.81.45.138:8334',
  '88.80.28.4:8334',
  // namecoin.seed.cypherstack.com (subset)
  '116.203.63.94:8334',
  '162.19.96.8:8334',
  '3.74.254.94:8334',
  '198.96.89.98:8334',
  '185.87.45.95:8334',
  // DNS seeds themselves — also resolved by namecoind, but listing them
  // as addnodes makes the bootstrap path explicit and resilient to
  // namecoind's seed list being stale.
  'dnsseed.nmc.testls.space:8334',
  'namecoin.seed.cypherstack.com:8334',
]
