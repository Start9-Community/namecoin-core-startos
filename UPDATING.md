# Updating the upstream version

The `namecoind` image is built locally from `Dockerfile`: it clones the pinned `nc<VERSION>` tag from `github.com/namecoin/namecoin-core`, builds it with CMake, and copies the binaries into a slim Debian runtime. Unlike Bitcoin Core, Namecoin Core does not yet publish a multi-signer release-hash quorum, so trust is anchored on the pinned git tag plus the GitHub TLS chain.

## Determining the upstream version

- **Namecoin Core** — [namecoin/namecoin-core](https://github.com/namecoin/namecoin-core)
  - Latest release tag (Namecoin tags are prefixed `nc`, e.g. `nc31.1`):
    ```sh
    gh release list -R namecoin/namecoin-core --limit 20 --json tagName -q '.[].tagName' | head
    ```
  - Current pin: `VERSION` build-arg under `images.namecoind.source.dockerBuild.buildArgs` in `startos/manifest/index.ts` (the value _without_ the `nc` prefix — the Dockerfile prepends it).

## Applying the bump

1. Bump `VERSION` in `startos/manifest/index.ts` under `images.namecoind.source.dockerBuild.buildArgs` (e.g. `'31.1'` → `'31.2'`).
2. **Check the mainnet DNS seeds.** `CMainParams` in `src/kernel/chainparams.cpp` must list Namecoin seeders — upstream has shipped Bitcoin's here before, which leaves a fresh node unable to find any peer and the package no longer compensates. Confirm at least one still resolves, e.g. `dig +short dnsseed.nmc.testls.space A`.
3. If a new upstream release changes available config options or runtime behavior, update the `startos/` source, `README.md`, and `instructions.md` to match.
