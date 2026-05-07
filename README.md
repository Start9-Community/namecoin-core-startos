# Namecoin Core for StartOS (0.4.x)

Wrapper that builds the [Namecoin Core](https://www.namecoin.org/) full node as a StartOS v0.4.x service package (`.s9pk`).

This branch (`0.4.x`) targets StartOS v0.4.x with the TypeScript SDK.
For the v0.3.5.x branch, see [`main`](https://github.com/mstrofnone/namecoin-core-startos/tree/main).

## Versions

- **Namecoin Core:** nc30.2 (Bitcoin Core 30.2 fork)
- **StartOS:** v0.4.0+ (TS-SDK packaging)
- **start-cli:** v0.4.0-beta.8

## What's in the box

- `namecoind` — full node daemon (P2P 8334, RPC 8336)
- `namecoin-cli` — JSON-RPC client
- `namecoin-tx` — transaction utility
- Tor integration (optional dependency)
- ZeroMQ block/tx notifications (optional)
- Configurable pruning, txindex, RPC auth, peer settings

## Build locally

Requires Node.js v22+, Docker, and [start-cli v0.4.x](https://github.com/Start9Labs/start-os/releases) on `$PATH`.

```bash
make           # build all supported arches
make x86       # build x86_64 only
make arm       # build aarch64 only
```

Output: `namecoind_<arch>.s9pk`.

## Sideload

```bash
# In your StartOS server config (~/.startos/config.yaml):
# host: http://my-server.local

make install
```

Or paste the GitHub release URL into the StartOS web UI (System → Sideload).

## License

MIT
