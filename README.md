<p align="center">
  <img src="icon.svg" alt="Namecoin Core Logo" width="21%">
</p>

# Namecoin Core on StartOS

> **Upstream repo:** <https://github.com/namecoin/namecoin-core>

[Namecoin](https://www.namecoin.org/) is the first fork of Bitcoin: a decentralized key/value store on its own blockchain, used for censorship-resistant `.bit` domains, identity records, and the NMC cryptocurrency. Namecoin Core is the reference full node and wallet, built on the Bitcoin Core codebase. This package runs a full Namecoin node on StartOS.

## Getting Started

To learn how to build and package a StartOS service, see the [Packaging Guide](https://docs.start9.com/packaging).

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                                                                      |
| ------------- | -------------------------------------------------------------------------- |
| Image         | Built from source by `Dockerfile` (CMake build of the pinned upstream tag) |
| Upstream      | `github.com/namecoin/namecoin-core`                                        |
| Architectures | x86_64, aarch64                                                            |
| Command       | `namecoind`                                                                |
| Binaries      | `namecoind`, `namecoin-cli`, `namecoin-tx`                                 |

The image is compiled from a pinned upstream git tag rather than pulled from a registry; the upstream version is set by the `VERSION` build-arg in `startos/manifest/index.ts`.

---

## Volume and Data Layout

| Volume | Mount Point       | Purpose                                             |
| ------ | ----------------- | --------------------------------------------------- |
| `main` | `/root/.namecoin` | Blockchain, chainstate, wallet, and `namecoin.conf` |

`namecoin.conf` is generated and managed by StartOS from the in-app settings — see [Configuration Management](#configuration-management). Do not edit it by hand.

---

## Installation and First-Run Flow

On install, StartOS seeds `namecoin.conf` with sensible defaults (cookie-based RPC auth, ZeroMQ and compact block filters enabled, pruning auto-selected on small disks) and starts the node. On first run, Namecoin Core downloads and verifies the entire Namecoin blockchain (~15 GB, smaller than Bitcoin's), which can take several hours. Sync progress is reported by the **Blockchain Sync** health check.

---

## Configuration Management

There is no monolithic config screen. Settings are edited through grouped **Actions** that write to `namecoin.conf`:

| Action           | Group         | Covers                                                           |
| ---------------- | ------------- | ---------------------------------------------------------------- |
| RPC Settings     | Configuration | RPC server timeout, threads, work queue                          |
| Peer Settings    | Configuration | Onlynet, V2 transport, connect/add nodes, max connections        |
| Mempool Settings | Configuration | Persist mempool, size, expiry, OP_RETURN relay, blocks-only      |
| Other Settings   | Configuration | Pruning, txindex, dbcache/dbbatch, block filters, wallet, ZeroMQ |

RPC authentication uses Namecoin Core's auto-generated `.cookie` file, so on-box services can reach the node without a configured password. For remote clients (e.g. a wallet), use the **Generate RPC User Credentials** action to add an `rpcauth` entry.

Enforced values (set by StartOS, not user-editable): `rpcbind`/`rpcallowip`, `rpccookiefile`, `listen`/`bind`/`whitebind`. Enabling pruning forces `txindex` off and binds RPC to localhost.

---

## Network Access and Interfaces

| Interface | Internal Port | External Port | Type | Purpose                                              |
| --------- | ------------- | ------------- | ---- | ---------------------------------------------------- |
| RPC       | 8336          | 8336          | api  | JSON-RPC commands                                    |
| Peer      | 58334         | 8334          | p2p  | Namecoin P2P network connections                     |
| ZeroMQ    | 28336         | 28336         | api  | Block/tx notifications (only when ZeroMQ is enabled) |

**Access methods:** LAN IP, `<hostname>.local`, Tor `.onion` address, and custom domains (if configured).

---

## Actions (StartOS UI)

| Action                        | Group                  | Notes                                               |
| ----------------------------- | ---------------------- | --------------------------------------------------- |
| Runtime Information           | —                      | Connections, block height, sync progress, softforks |
| Generate RPC User Credentials | RPC Users              | Adds an `rpcauth` entry for remote clients          |
| Delete RPC Users              | RPC Users              | Removes `rpcauth` entries                           |
| Reindex Blockchain            | Reindex                | Rebuilds block + chainstate databases from genesis  |
| Reindex Chainstate            | Reindex                | Rebuilds chainstate only (hidden when pruned)       |
| Delete Peer List              | Delete Corrupted Files | Removes `peers.dat`                                 |
| Delete Transaction Index      | Delete Corrupted Files | Removes the txindex                                 |
| Delete Coinstats Index        | Delete Corrupted Files | Removes the coinstats index                         |

Two further actions — Auto-Configure and Create RPC Credentials — are hidden and exist only for use by dependent services.

---

## Backups and Restore

**Included in backup:**

- `main` volume, **excluding** regenerable data: `blocks/`, `chainstate/`, `chainstate.old/`, `indexes/`, `.cookie`, and SQLite journals.

This preserves the wallet, registered names, and `namecoin.conf` while keeping backups small; the blockchain is re-synced on restore. **Restore behavior:** the volume is restored before the service starts.

---

## Health Checks

| Check           | Method                               | Meaning                                       |
| --------------- | ------------------------------------ | --------------------------------------------- |
| RPC             | Cookie file present + port 8336      | The node's RPC interface is up                |
| Blockchain Sync | `getblockchaininfo` polling          | Reports IBD progress, then "fully synced"     |
| Tor             | Tor install/run + onlynet/externalip | Inbound/outbound onion connectivity status    |
| Clearnet        | onlynet/externalip                   | Inbound/outbound clearnet connectivity status |

---

## Dependencies

| Dependency | Required? | Why                                                                                         |
| ---------- | --------- | ------------------------------------------------------------------------------------------- |
| Tor        | Optional  | Needed for `.onion` peer connectivity, `onlynet=onion`, or when a Tor address is requested. |

---

## Limitations and Differences

1. **StartOS manages `namecoin.conf`.** Settings are edited via Actions; manual edits are overwritten.
2. **RPC auth is cookie-first.** There is no fixed RPC username/password; use Generate RPC User Credentials for remote access.
3. **Fixed ports and binds** are enforced so StartOS networking and dependent services work reliably.
4. **Built from source**, not from an upstream-published binary — there is no GPG release-signer quorum (Namecoin does not publish one); trust is anchored on the pinned git tag.
5. **DNS seeds are patched at build time.** Upstream's mainnet chain params ship Bitcoin's DNS seeds and an empty fixed-seed list, so a stock build finds no Namecoin peers and never syncs. The `Dockerfile` rewrites them to the Namecoin community seeder `dnsseed.nmc.testls.space` (a guarded `sed` that fails the build if upstream renames the lines). See [UPDATING.md](./UPDATING.md).

---

## What Is Unchanged from Upstream

Namecoin Core's consensus rules, wallet, and RPC surface (including all `name_*` operations) are stock upstream. This package only wraps configuration, networking, health, backup, and lifecycle management around the upstream node — plus the build-time DNS-seed fix noted above (a peer-discovery workaround, not a consensus change).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for build instructions and development workflow.

---

## Quick Reference for AI Consumers

```yaml
package_id: namecoind
image: built-from-source (github.com/namecoin/namecoin-core, CMake)
architectures: [x86_64, aarch64]
volumes:
  main: /root/.namecoin
interfaces:
  rpc: { port: 8336, type: api, auth: cookie + optional rpcauth }
  peer: { external_port: 8334, internal_port: 58334, type: p2p }
  zmq: { port: 28336, type: api, conditional: zmqEnabled }
config: via actions (RPC / Peer / Mempool / Other Settings, group "Configuration")
dependencies:
  tor: optional
actions:
  - runtime-info
  - generate-rpcuser
  - delete-rpcauth
  - reindex-blockchain
  - reindex-chainstate
  - delete-peers
  - delete-txindex
  - delete-coinstatsindex
```
