# Namecoin Core for StartOS

This is the service wrapper for running [Namecoin Core](https://github.com/namecoin/namecoin-core) on [StartOS](https://github.com/Start9Labs/start-os). It packages Namecoin Core nc30.2 as a `.s9pk` for installation on any StartOS server.

## About Namecoin

Namecoin is the first fork of Bitcoin. It provides a decentralized DNS and identity system, enabling censorship-resistant `.bit` domains, identity storage, and NMC transactions — all without trusting any third party.

## Features

- Full Namecoin node with blockchain validation
- Name registration, lookup, and management via RPC
- Wallet functionality for NMC transactions
- Configurable pruning mode
- Transaction index support
- Tor integration via StartOS
- Backup and restore support
- Health checks with sync progress

## Dependencies

To build this project, install the following:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Buildx](https://docs.docker.com/buildx/working-with-buildx/)
- [yq](https://github.com/mikefarah/yq)
- [Rust & Cargo](https://rustup.rs/)
- [start-sdk](https://github.com/Start9Labs/start-os)

Or run `prepare.sh` on a Debian system to install everything automatically.

## Building

Clone this repository:

```bash
git clone https://github.com/your-username/namecoin-core-startos.git
cd namecoin-core-startos
```

Build for all platforms:

```bash
make
```

Build for a single platform:

```bash
make x86    # for amd64
make arm    # for arm64
```

## Installing

### Via Sideload

1. In the StartOS web UI, navigate to **System → Sideload Service**
2. Upload the `namecoind.s9pk` file

### Via CLI

```bash
start-cli auth login
start-cli --host https://server-name.local package install namecoind.s9pk
```

## Submitting to Start9 Community Registry

Once you've tested the package thoroughly:

1. Email `submissions@start9.com` with a link to this repository
2. Start9 will build, test, and review the package
3. If accepted, it will be published to the Community Beta Registry
4. After beta testing, reply to the email to request production publication

See the [Start9 Community Submission Process](https://docs.start9.com/0.3.5.x/developer-docs/submission) for full details.

## Project Structure

```
namecoin-core-startos/
├── Dockerfile                  # Multi-stage build for Namecoin Core
├── Makefile                    # Build orchestration
├── manifest.yaml               # StartOS service manifest
├── instructions.md             # User-facing instructions
├── LICENSE                     # MIT license
├── prepare.sh                  # Debian build env setup
├── docker_entrypoint.sh        # Container entrypoint
├── check-rpc.sh                # Health check script
├── properties.sh               # Service properties display
├── migrations.sh               # Version migration handler
├── reindex.sh                  # Blockchain reindex action
├── icon.png                    # Service icon (256x256)
├── assets/
│   └── compat/
│       ├── config_spec.yaml    # Configuration schema
│       ├── config_rules.yaml   # Configuration constraints
│       └── namecoin.conf.template  # Config file template
└── docker-images/              # Built Docker images (generated)
    ├── aarch64.tar
    └── x86_64.tar
```

## Contributing

Please fork this repository, make your changes, and open a pull request.

## License

This wrapper is released under the MIT License. Namecoin Core itself is also MIT licensed.
