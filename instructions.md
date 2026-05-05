# Namecoin Core - Instructions

## What is Namecoin?

Namecoin is the first fork of Bitcoin, providing a decentralized DNS and identity system. It allows you to register `.bit` domains, store identity data, and transact NMC (Namecoin) cryptocurrency — all without trusting any central authority.

## Initial Sync

On first install, Namecoin Core must download and verify the entire Namecoin blockchain. This process may take several hours depending on your hardware and internet speed. The Namecoin blockchain is significantly smaller than Bitcoin's (~15 GB).

You can monitor sync progress in the **Properties** section of the service page.

## Connecting to Namecoin Core

### RPC Access

Your RPC credentials are available in the **Properties** tab. Use these to connect wallets and other services to your Namecoin node.

- **RPC Port**: 8336
- **P2P Port**: 8334

### Example RPC Usage (via command line)

```
namecoin-cli -rpcuser=<username> -rpcpassword=<password> -rpcport=8336 getblockchaininfo
```

### Name Operations

Namecoin Core supports name registration and management via RPC:

- `name_new` — Start registering a name
- `name_firstupdate` — Complete name registration
- `name_update` — Update a name's value
- `name_show` — Look up a name's current value
- `name_list` — List names in your wallet
- `name_scan` — Scan the name database

## Configuration

### Pruning

By default, Namecoin Core runs as a full archival node. If disk space is limited, you can enable automatic pruning in the **Config** section. Note that pruning is incompatible with the transaction index (txindex).

### Transaction Index

The transaction index is enabled by default. This allows looking up any transaction by its ID and is useful for blockchain exploration. Disable it if you need pruning or want to save some disk space.

## Backups

Backups include your `wallet.dat` file, which contains your private keys and name registrations. **It is strongly recommended to create regular backups**, especially before any upgrades.

## Merged Mining

Namecoin supports merged mining with Bitcoin. If you are running a mining operation, you can mine both Bitcoin and Namecoin simultaneously. This is not configured through StartOS directly — consult your mining pool's documentation for setup instructions.

## Support

- [Namecoin Forum](https://forum.namecoin.org/)
- [Namecoin GitHub Issues](https://github.com/namecoin/namecoin-core/issues)
- [Namecoin Matrix/IRC](https://www.namecoin.org/resources/chat/)
