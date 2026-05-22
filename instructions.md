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

## Support

- [Namecoin Forum](https://forum.namecoin.org/)
- [Namecoin GitHub Issues](https://github.com/namecoin/namecoin-core/issues)
- [Namecoin Chat](https://www.namecoin.org/resources/chat/)
