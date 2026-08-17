# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **The `addnode` bootstrap list in `defaultPeers.ts` is a workaround for [namecoin-core#593](https://github.com/namecoin/namecoin-core/issues/593)** — upstream nc30.x ships Bitcoin's mainnet DNS seeds, so a fresh node never finds a Namecoin peer. Don't delete it until the package is built against a release that fixes the seeds.
- **`addnode=` is a footgun, and `connect=` is not a fix.** namecoind exempts every manually configured peer from misbehavior disconnect/ban ("not punishing manually connected peer"), so one junk peer can saturate the message-handler thread and stall sync — observed stalling at ~55% until _all_ manual peers were removed. That is what `graduate-from-bootstrap` is for; keep its guards (organic outbound count, blocks > 0).
- **The `.cookie` is removed before every start** and the daemon's `ready` waits for the new one before probing the port — a stale cookie from an unclean shutdown authenticates nothing.
- **`sigtermTimeout: 300_000` is deliberate.** A chainstate flush can take minutes; cutting it short corrupts the database.
- **`rpcuser`/`rpcpassword` are `z.undefined().catch(undefined)`**, so a plaintext credential written into `namecoin.conf` is stripped on read. Authentication is the cookie or a hashed `rpcauth` entry.
- **`dbcache`/`dbbatchsize` are sized at install and cleared by the `synced-true` oneshot** once the node reports fully synced — they exist to speed the initial sync, not to hold memory forever.
- **`watchHosts` owns `externalip`.** It writes the peer interface's onion and public-IPv4 addresses with `allowWriteAfterConst: true`; don't also set `externalip` from an action.
- **Default branch is `main`, not `master`.** Its CI workflows reference `main`; leave them.
