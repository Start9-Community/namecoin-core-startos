# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **`0 addresses found from DNS seeds` in the log is normal.** The Namecoin seeders don't serve the `x9.` service-bit prefix namecoind queries, so that lookup always returns nothing; namecoind then reaches the same seeders as addr-fetch peers and bootstraps fine. Don't read it as broken seeds and don't answer it by re-adding a bootstrap `addnode` list.
- **`addnode=` is a footgun, and `connect=` is not a fix.** namecoind exempts every manually configured peer from misbehavior disconnect/ban ("not punishing manually connected peer"), so one junk peer can saturate the message-handler thread and stall sync — observed stalling at ~55% until _all_ manual peers were removed. That is what `graduate-from-bootstrap` is for; keep its guards (organic outbound count, blocks > 0).
- **The `.cookie` is removed before every start** and the daemon's `ready` waits for the new one before probing the port — a stale cookie from an unclean shutdown authenticates nothing.
- **`sigtermTimeout: 300_000` is deliberate.** A chainstate flush can take minutes; cutting it short corrupts the database.
- **`rpcuser`/`rpcpassword` are `z.undefined().catch(undefined)`**, so a plaintext credential written into `namecoin.conf` is stripped on read. Authentication is the cookie or a hashed `rpcauth` entry.
- **`dbcache`/`dbbatchsize` are sized at install and reduced by the `synced-true` oneshot** once the node reports fully synced — they exist to speed the initial sync, not to hold memory forever. `dbcache` is pinned to 450 MiB there rather than cleared: namecoind's own default is 1024 MiB on any host reporting 4 GiB or more, so clearing it would raise the post-sync footprint, not lower it.
- **`watchHosts` owns `externalip`.** It writes the peer interface's onion and public-IPv4 addresses with `allowWriteAfterConst: true`; don't also set `externalip` from an action.
- **Default branch is `main`, not `master`.** Its CI workflows reference `main`; leave them.
