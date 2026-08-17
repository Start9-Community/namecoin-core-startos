# Namecoin Core

You've installed Namecoin Core — a full Namecoin node and wallet. Namecoin is the first fork of Bitcoin and provides a decentralized DNS and identity system: censorship-resistant `.bit` domains, identity records, and NMC transactions, with no trusted third party.

## Documentation

- [Namecoin website](https://www.namecoin.org/) — what Namecoin is and what you can do with it.
- [Namecoin Core upstream](https://github.com/namecoin/namecoin-core) — the node software this package runs.
- [Name operations](https://www.namecoin.org/dot-bit/) — registering and managing `.bit` names.

## Initial Sync

On first start, Namecoin Core downloads and verifies the entire blockchain. This can take several hours depending on your hardware and connection; the Namecoin chain is much smaller than Bitcoin's (~15 GB). Watch the **Blockchain Sync** health check on the service's **Dashboard** for progress.

## Connecting to your node

RPC access uses Namecoin Core's auto-generated cookie file, so other services running on the same StartOS server can connect without a password.

For **remote** clients (a desktop wallet, a script on another machine), create credentials first:

1. Open the **Actions** tab.
2. Run **Generate RPC User Credentials** and choose a username.
3. Copy and save the generated password — only a hash is stored, so it cannot be recovered later.

Then connect to the **RPC** interface (port **8336**) using that username and password. The **Peer** interface listens on port **8334**.

To check live status — connections, block height, sync progress — run the **Runtime Information** action.

### Name operations

Namecoin's defining feature is its name database. Common RPC calls:

- `name_new` / `name_firstupdate` — register a name (two-step)
- `name_update` — change a name's value
- `name_show` — look up a name
- `name_list` — list names in your wallet
- `name_scan` — browse the name database

## Configuration

Settings are edited through **Actions** (grouped under **Configuration**), not a single config screen:

- **Other Settings** — pruning, transaction index, database cache, wallet, block filters, ZeroMQ.
- **Peer Settings** — onlynet, V2 transport, connect/add nodes, max connections.
- **Mempool Settings** and **RPC Settings** — mempool and RPC tuning.

By default the node runs as a full archival node. On a small disk, enable **Pruning** under Other Settings to cap blockchain storage — note that pruning is incompatible with the transaction index, which will be turned off automatically. If you intend to run ElectrumX or any wallet that needs historical transactions, **leave pruning off and turn `txindex` on**.

## Bootstrap peers and the "Graduate" workflow ⚠️

This is the most important quirk in the current package — read it before you assume sync is broken.

### Why there's a default peer list

Upstream Namecoin Core (nc30.x) inherited Bitcoin's `vSeeds` instead of Namecoin's during the bitcoin-30.x merge (tracked as [namecoin/namecoin-core#593](https://github.com/namecoin/namecoin-core/pull/593)). The DNS-seed thread queries Bitcoin's seeds, never finds a Namecoin peer, and a fresh node sits at 0 connections forever.

Of the six Namecoin mainnet DNS seeds, only **two** currently resolve at all (`dnsseed.nmc.testls.space`, `namecoin.seed.cypherstack.com`). To work around this, the package seeds a curated list of known-good Namecoin nodes as `addnode=` entries in `namecoin.conf` on install. A fresh sideload now connects to ~8 peers within ~9 seconds and starts syncing immediately.

### Why you should "graduate" once sync is moving

`addnode=` peers are exempt from misbehavior disconnect/ban — namecoind logs "not punishing manually connected peer" and keeps them connected even when they spam junk. A single broken or malicious peer in the list can saturate the message-handler thread and **stall the entire sync** with the appearance of "stuck at X%" but no obvious error.

Observed during testing: sync stalled at ~55% with one peer spamming ~20 misbehavior warnings/sec. Removing manual peers individually was whack-a-mole — a different bad peer rotated into the slot. The clean fix is to drop the whole manual peer list once the address manager is warm with peers learned via gossip.

Switching `addnode=` → `connect=` does **not** help — both land in the "manual" bucket.

### When and how to graduate

Run **Actions → Graduate From Bootstrap Peers** once the node has:

- ≥ 5 organic outbound connections, and
- some blocks verified (i.e. address manager is warm).

The action refuses to run otherwise so you can't orphan a node that's still in earliest bootstrap. It edits `namecoin.conf` only; you must **restart the package** afterwards because namecoind reads `addnode=` entries only at startup.

After graduating, the node finds its own peers via the standard gossip path. The Runtime Information action will show 10 outbound on its own.

### Inbound connections

Don't be surprised if **Connections** shows `0 in / N out` — StartOS doesn't expose port 8334 publicly by default, so no Namecoin peer can reach your node from the outside. Outbound peers are all you need to sync and use the node. Enable inbound by exposing the Peer interface publicly in **Service Interfaces → Peer** if you want to help the network.

## Backups

Backups include your wallet and registered names but exclude the blockchain (which is re-synced on restore). **Create a backup before uninstalling or upgrading** — without one, any NMC in the node's wallet and any names you control can be lost permanently.

## Using your node from Amethyst (Nostr client)

[Amethyst](https://github.com/vitorpamplona/amethyst) is a Nostr client for Android that can resolve `.bit` / `d/` / `id/` Namecoin names to Nostr identities (for NIP-05 verification, follow-import, and search). From the _Namecoin_ settings screen you can point Amethyst directly at _this_ Namecoin Core node via JSON-RPC instead of using third-party ElectrumX servers — the most sovereign option, no public operator sees your lookups.

What you need:

1. **An RPC user** for the remote client. Run **Actions → Generate RPC User Credentials**, pick a username, and copy the generated password (only a hash is stored, so you can't recover it later).
2. **The RPC interface URL** for the _RPC_ service interface (port 8336). Open **Service Interfaces → RPC** and copy one of the addresses:
   - **Tor onion** (recommended for phones over the public internet) — the `http://<onion>.onion:8336/` URL listed under the _Tor_ address.
   - **LAN HTTPS** — if Amethyst is on the same network and you've installed the StartOS root CA on the device.
   - **LAN HTTP / IP** — only on a trusted LAN.

Then in Amethyst:

1. **Settings → Namecoin** → set **Resolution backend** to **Namecoin Core RPC**.
2. Paste the URL into **RPC URL** (must start with `http://` or `https://`, must include the port).
3. Paste the username into **RPC username** and the password into **RPC password**.
4. Tap **Test RPC**. A green card showing `chain=main height=… sync=…%` confirms the connection.
5. (Optional) Under **Fallback policy**, decide whether Amethyst is allowed to fall back to ElectrumX if your node is unreachable. Both toggles default **off** — enabling them widens who sees the lookup, so opt in deliberately.

From that point on every `.bit` / `d/` / `id/` lookup in Amethyst (search bar, NIP-05 verification, follow-import) runs `name_show` against _this_ node.

Under the hood Amethyst issues a plain JSON-RPC `name_show` POST, identical to:

```
curl --user '<USER>:<PASS>' \
     --data-binary '{"jsonrpc":"1.0","id":"x","method":"name_show","params":["d/example"]}' \
     -H 'Content-Type: text/plain' \
     http://<onion>.onion:8336/
```

Tor traffic in Amethyst is routed via the app's Tor settings, so the onion URL works without any extra proxy configuration on the phone.

## Support

- [Namecoin Forum](https://forum.namecoin.org/)
- [Namecoin GitHub Issues](https://github.com/namecoin/namecoin-core/issues)
- [Namecoin Chat](https://www.namecoin.org/resources/chat/)
