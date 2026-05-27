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

By default the node runs as a full archival node. On a small disk, enable **Pruning** under Other Settings to cap blockchain storage — note that pruning is incompatible with the transaction index, which will be turned off automatically.

## Backups

Backups include your wallet and registered names but exclude the blockchain (which is re-synced on restore). **Create a backup before uninstalling or upgrading** — without one, any NMC in the node's wallet and any names you control can be lost permanently.

## Using your node from Amethyst (Nostr client)

[Amethyst](https://github.com/vitorpamplona/amethyst) is a Nostr client for Android that can resolve `.bit` / `d/` / `id/` Namecoin names to Nostr identities (for NIP-05 verification, follow-import, and search). From the *Namecoin* settings screen you can point Amethyst directly at *this* Namecoin Core node via JSON-RPC instead of using third-party ElectrumX servers — the most sovereign option, no public operator sees your lookups.

What you need:

1. **An RPC user** for the remote client. Run **Actions → Generate RPC User Credentials**, pick a username, and copy the generated password (only a hash is stored, so you can't recover it later).
2. **The RPC interface URL** for the *RPC* service interface (port 8336). Open **Service Interfaces → RPC** and copy one of the addresses:
   - **Tor onion** (recommended for phones over the public internet) — the `http://<onion>.onion:8336/` URL listed under the *Tor* address.
   - **LAN HTTPS** — if Amethyst is on the same network and you've installed the StartOS root CA on the device.
   - **LAN HTTP / IP** — only on a trusted LAN.

Then in Amethyst:

1. **Settings → Namecoin** → set **Resolution backend** to **Namecoin Core RPC**.
2. Paste the URL into **RPC URL** (must start with `http://` or `https://`, must include the port).
3. Paste the username into **RPC username** and the password into **RPC password**.
4. Tap **Test RPC**. A green card showing `chain=main height=… sync=…%` confirms the connection.
5. (Optional) Under **Fallback policy**, decide whether Amethyst is allowed to fall back to ElectrumX if your node is unreachable. Both toggles default **off** — enabling them widens who sees the lookup, so opt in deliberately.

From that point on every `.bit` / `d/` / `id/` lookup in Amethyst (search bar, NIP-05 verification, follow-import) runs `name_show` against *this* node.

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
