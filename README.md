<p align="center">
  <img src="icon.png" alt="Namecoin Core Logo" width="21%">
</p>

# Namecoin Core on StartOS

> Everything not listed in this document should behave the same as upstream
> Namecoin Core. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[Namecoin Core](https://github.com/namecoin/namecoin-core) is the reference full node for Namecoin, a merge-mined blockchain that stores names as well as coins. This package builds it from source and manages its configuration file.

- **Upstream repo:** <https://github.com/namecoin/namecoin-core>
- **Wrapper repo:** <https://github.com/Start9-Community/namecoin-core-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

One image, **built from upstream source** rather than pulled.

| Property      | Value                                          |
| ------------- | ---------------------------------------------- |
| Image         | Built from this repo's `Dockerfile`            |
| Architectures | x86_64, aarch64                                |
| Command       | `namecoind`, against the managed configuration |

| Subcontainer    | Purpose                                  |
| --------------- | ---------------------------------------- |
| `namecoind-sub` | The only daemon — the one to `attach` to |

The build clones a pinned upstream tag and compiles it. **There is no release-signer verification** the way Bitcoin Core's packaging does it — Namecoin does not publish a signing quorum, so trust rests on the pinned git ref and GitHub's TLS chain. That is stated here because it is a genuine difference in provenance, not an oversight.

Two oneshots run first:

| Oneshot                | Purpose                                                         |
| ---------------------- | --------------------------------------------------------------- |
| `nocow`                | Marks the data directory `nodatacow` on Btrfs                   |
| `clean-chainstate-old` | Removes a leftover `chainstate.old` from an interrupted reindex |

The daemon is given a **five-minute termination grace period**, because flushing the chainstate on shutdown can take minutes and killing it mid-flush is how a database gets corrupted.

## Volume and Data Layout

One volume, holding the whole node.

| Volume | Mount Point       | Purpose                           |
| ------ | ----------------- | --------------------------------- |
| `main` | `/root/.namecoin` | The chain, the config, the wallet |

| Path            | Written by  | Holds                                       |
| --------------- | ----------- | ------------------------------------------- |
| `blocks/`       | namecoind   | The block files                             |
| `chainstate/`   | namecoind   | The UTXO set                                |
| `indexes/`      | namecoind   | The optional transaction and filter indexes |
| `namecoin.conf` | Actions     | The node configuration                      |
| `store.json`    | The package | Reindex flags and sync state                |
| `.cookie`       | namecoind   | The RPC cookie, regenerated every start     |

**The cookie file is deleted before every start.** It is a per-run credential, and a stale one left behind by an unclean shutdown would be presented by anything that cached it — so the daemon's readiness check waits for the new one to appear before it will call the node ready.

## File Models

Two models.

| File            | Format | Modelled                | Written by    |
| --------------- | ------ | ----------------------- | ------------- |
| `namecoin.conf` | INI    | Yes — `FileHelper.ini`  | Actions, init |
| `store.json`    | JSON   | Yes — `FileHelper.json` | The package   |

`namecoin.conf` splits three ways:

- **Enforced.** The RPC bind address and allow list, the cookie file name, listening being on, and both peer bind addresses are `z.literal(...).catch(...)` — **repaired on read**, so a hand-edit is reverted. The interfaces are built on exactly those values.
- **Enforced absent.** Plaintext `rpcuser` and `rpcpassword` are forced to `undefined`: authentication is by cookie, or by hashed `rpcauth` entries the actions generate. A password in the file would be silently stripped rather than honored.
- **Configurable.** Everything else — mempool policy, peer settings, RPC threading, indexes, pruning, and the advertised addresses.

The store carries only package state: two "do this on the next start" reindex flags and whether the node has ever finished syncing.

**`dbcache` and `dbbatchsize` are sized to the machine at install and reduced once sync completes.** A large cache makes the initial sync far faster; keeping it afterwards would hold that memory forever for no benefit. The first fully-synced start clears `dbbatchsize` and pins `dbcache` to 450 MiB — namecoind's own default is 1024 MiB on a host reporting 4 GiB or more, so clearing it would raise the post-sync footprint rather than lower it.

## Dependencies

One, optional, and **declared only while it is in use**.

| Dependency | Required               | Kind      | Why                       |
| ---------- | ---------------------- | --------- | ------------------------- |
| Tor        | No — only if Tor is on | `running` | Reaching peers over onion |

The dependency appears when an onion address is advertised on the Peer interface or when the network is restricted to onion, and disappears otherwise.

**The Tor SOCKS address is resolved with a fallback**, so it stays constant whether Tor is installed, updated, or removed — installing Tor never restarts the node, and a dead address is simply a refused connection until Tor is up.

**The advertised addresses are maintained for you.** A watcher on the Peer interface writes the node's own onion and public IPv4 addresses into the configuration as they appear, so `externalip` tracks the interface rather than needing to be typed in.

## Network Access and Interfaces

Up to three interfaces.

| Interface | Id     | Type | Port  | Description                          |
| --------- | ------ | ---- | ----- | ------------------------------------ |
| RPC       | `rpc`  | api  | 8336  | JSON-RPC, for wallets and dependents |
| Peer      | `peer` | p2p  | 8334  | The Namecoin peer network            |
| ZeroMQ    | `zmq`  | api  | 28336 | Block and transaction notifications  |

**The peer binding maps two different ports.** The daemon listens internally on one port and is published externally on the standard one, which is what lets StartOS front the standard port while the node also keeps a separate internal bind for connections arriving over the bridge.

**The ZeroMQ interface is conditional** — exported only while ZMQ is enabled in the configuration, which it is by default on a fresh install.

**RPC has no interface-level gate.** Access is the node's own: the per-run cookie for anything with the volume mounted, or a hashed `rpcauth` credential generated by an action for anything remote.

## Installation and First-Run Flow

Install writes a configuration sized to the machine: ZeroMQ on, block filters on, cache values chosen from available memory, and **pruning enabled automatically when the disk is too small for a full chain**.

**Peer discovery is namecoind's own** — the mainnet DNS seeders compiled into the release, with its built-in fixed seed list as the fallback. The package configures no peers of its own.

**Manually configured peers are a sharp edge, and that is why an action exists to clear them.** namecoind exempts every `addnode` and `connect` peer from misbehavior penalties. A single broken or hostile peer in that list can saturate the message-handler thread and stall the sync indefinitely, and dropping one peer just lets another rotate into the slot. A node carrying a manual list from an earlier release of this package should have it cleared once the node has learned real peers by gossip.

The node then syncs the Namecoin chain. The sync check distinguishes the phases rather than showing a flat percentage, because headers download before any block does — an honest "syncing headers" beats a stuck-looking 0.00%.

## Actions

Seventeen actions, in five groups plus two ungrouped.

### Configuration

#### Peer Settings, RPC Settings, Mempool Settings, Other Settings

Four forms over `namecoin.conf`, split by subject: peer and connection policy, RPC threading and timeouts, mempool size and expiry, and everything else including indexes and pruning.

- **Cost:** the service restarts — namecoind reads its configuration only at start.

#### Graduate From Bootstrap Peers

Empties the manually configured peer list in `namecoin.conf`.

- **Requires the service to be running**, and refuses unless the node has a healthy number of organic outbound peers and has actually verified blocks — the checks exist so clearing the list cannot orphan the node.
- **What it changes:** the manual peer list, emptied.
- **Requires a restart afterwards**, deliberately not done for you: the change is destructive to the peer configuration and worth doing on your own schedule.
- **Reports that there is nothing to do** when no manual peers are set, which is the state a fresh install starts in.

#### Configure for ElectrumX

Prepares the node to back a local ElectrumX server: generates an RPC user for it, disables pruning, and enables the transaction index.

- **Shows the generated password once.**
- **Carries a real warning:** if the node was pruned, turning pruning off means a **full reindex from genesis** on the next start, which takes hours and needs the whole chain on disk plus the index.

#### Name Lookup

Looks up a Namecoin name and shows its current value.

- **Requires the service to be running**; it queries the node over RPC from a temporary container using the cookie.
- Expired names return an error from the node rather than a value, since resolving them needs an option this package does not enable.

### RPC Users

#### Generate RPC User Credentials

Creates a username and a randomly generated password for remote RPC, storing only the hash in the configuration.

- **The password is shown once.** Only its hash is persisted, so it cannot be recovered afterwards — generate a new one instead.

#### Delete RPC User

Removes a previously generated credential.

### Reindex

#### Reindex Blockchain

Rebuilds everything from the block files on the next start. Hours of work; for a corrupted chainstate or a changed index setting.

#### Reindex Chainstate

Rebuilds only the UTXO set from the existing blocks. Faster than a full reindex, and enough for most chainstate corruption.

Both set a flag that the next start consumes and clears, so the reindex happens exactly once.

### Delete Corrupted Files

#### Delete Transaction Index, Delete Coinstats Index, Delete Peers

Three targeted deletions for a node that will not start.

- **All three require the service to be stopped.**
- Each removes something the node rebuilds: the transaction index, the coin statistics index, or the peer database.

### Ungrouped

#### Runtime Information

Reports the node's network and chain state — connection counts, chain height, verification progress, size on disk. **Requires the service to be running.**

#### Auto-Configure

Hidden. It lets a dependent service write the node settings it needs, with the fields it supplies locked in the form.

## Tasks

None. This package raises no tasks, so the service is never held on a prompt and its ordinary controls are always available.

## Health Checks

One daemon check and three standalone ones.

| Check           | Displayed as      | Method                                          |
| --------------- | ----------------- | ----------------------------------------------- |
| `namecoind`     | "RPC"             | The cookie exists, then the RPC port listens    |
| `sync-progress` | "Blockchain Sync" | The node's own chain info, over RPC             |
| `tor`           | "Tor"             | Whether onion is installed, running, in use     |
| `clearnet`      | "Clearnet"        | Whether clearnet is in use, and inbound-capable |

**The RPC check waits for the cookie before it probes the port**, so it cannot report ready while the credential a client would need has not been written.

**The sync check reports the phase, not just a number.** Connecting, downloading headers, and downloading blocks are three distinct states, and it says which one it is in — a node at 0.00% with headers climbing is working, and one at 0.00% with nothing climbing is not.

The Tor and Clearnet checks are status displays: they report "disabled" when a network is excluded by the configuration, and otherwise say whether the node can accept inbound connections or only make outbound ones.

## Backups and Restore

The `main` volume is copied, with everything rebuildable excluded — `sdk.Backups.ofVolumes('main').setOptions({ exclude })`.

**The chain, the UTXO set, and the indexes are all excluded**, along with the per-run cookie and any database journals. That is by design: the block data re-downloads from the network, and including it would make every backup as large as the chain.

What the backup keeps is what the network cannot give back: **the wallet**, the configuration, the generated RPC credentials, and the package's own state.

**A restored node re-syncs from scratch**, which is the trade. It comes back with the same wallet, the same RPC users, and the same settings.

## Limitations and Differences

1. **No release-signature verification.** The build pins a git tag; upstream publishes no signing quorum to check against.
2. **The chain is not backed up.** A restore re-syncs from the network.
3. **Plaintext RPC credentials cannot be set** in the configuration; they are stripped on read in favor of the cookie or a hashed entry.
4. **A generated RPC password is shown once** and only its hash is kept.
5. **Turning pruning off requires a full reindex** if the node was ever pruned.
6. **Pruning may be enabled automatically at install** on a machine without room for the full chain.
7. **Mainnet only.**
8. **Expired name lookups fail**, since historic name resolution is not enabled.

---

## Quick Reference for AI Consumers

```yaml
package_id: namecoind # note: the repo is namecoin-core-startos
image: built from ./Dockerfile # compiled from a pinned upstream git tag
architectures:
  - x86_64
  - aarch64
subcontainers:
  - namecoind-sub
volumes:
  main: /root/.namecoin
file_models:
  - namecoin.conf # ini; enforced literals, and rpcuser/rpcpassword forced undefined
  - store.json # reindex flags, fullySynced, snapshotInUse
startos_managed_env_vars: [] # configuration is namecoin.conf plus computed CLI args
dependencies:
  - tor # optional, kind: running, declared only when onion is advertised or forced
interfaces:
  rpc: { type: api, port: 8336 } # cookie auth, or a hashed rpcauth entry
  peer: { type: p2p, port: 8334 } # internal bind is a different port
  zmq: { type: api, port: 28336 } # only while ZMQ is enabled
actions:
  - peers-config
  - rpc-config
  - mempool-config
  - other-config
  - graduate-from-bootstrap # only-running; guards on organic peer count
  - configure-for-electrumx
  - name-lookup # only-running
  - generate-rpcuser
  - generate-rpc-dependent
  - delete-rpcauth
  - reindex-blockchain
  - reindex-chainstate
  - delete-txindex # only-stopped
  - delete-coinstats-index # only-stopped
  - delete-peers # only-stopped
  - runtime-info # only-running
  - autoconfig # hidden; for dependent services
tasks: []
health_checks:
  - namecoind # displayed "RPC"; waits for the cookie before probing the port
  - sync-progress # reports connecting / headers / blocks as distinct phases
  - tor # status display
  - clearnet # status display
```
