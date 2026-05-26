# Updating the upstream version

The `namecoind` image is built locally from `Dockerfile`: it clones the pinned `nc<VERSION>` tag from `github.com/namecoin/namecoin-core`, builds it with CMake (nc30.x dropped autotools), and copies the binaries into a slim Debian runtime. Unlike Bitcoin Core, Namecoin Core does not yet publish a multi-signer release-hash quorum, so trust is anchored on the pinned git tag plus the GitHub TLS chain.

## Determining the upstream version

- **Namecoin Core** — [namecoin/namecoin-core](https://github.com/namecoin/namecoin-core)
  - Latest release tag (Namecoin tags are prefixed `nc`, e.g. `nc30.2`):
    ```sh
    gh release list -R namecoin/namecoin-core --limit 20 --json tagName -q '.[].tagName' | head
    ```
  - Current pin: `VERSION` build-arg under `images.namecoind.source.dockerBuild.buildArgs` in `startos/manifest/index.ts` (the value _without_ the `nc` prefix — the Dockerfile prepends it).

## Applying the bump

1. Bump `VERSION` in `startos/manifest/index.ts` under `images.namecoind.source.dockerBuild.buildArgs` (e.g. `'30.2'` → `'30.3'`).
2. **Re-verify the DNS-seed patch.** `Dockerfile` rewrites `src/kernel/chainparams.cpp` because upstream's mainnet chain params ship Bitcoin DNS seeds (and no usable Namecoin seed), which leaves a stock build unable to find peers. The patch has a built-in guard that fails the build if upstream renames the seed lines — if a bump fails there, update the `sed` to match the new upstream lines. Also confirm the seeder is still live, e.g. `dig +short dnsseed.nmc.testls.space A` returns multiple reachable peers (substitute the current community seeder if it has gone away).
3. If a new upstream release changes available config options or runtime behavior, update the `startos/` source, `README.md`, and `instructions.md` to match.
