# Updating the upstream version

The `namecoind` image is built locally from `Dockerfile`: it clones the pinned `nc<VERSION>` tag from `github.com/namecoin/namecoin-core`, checks that the tag resolves to `NAMECOIN_COMMIT` and is signed by `NAMECOIN_SIGNING_KEY` (the public key is `assets/release-signing-key.asc`), builds it with CMake, and copies the binaries into a slim Debian runtime.

## Determining the upstream version

- **Namecoin Core** — [namecoin/namecoin-core](https://github.com/namecoin/namecoin-core)
  - Latest release tag (Namecoin tags are prefixed `nc`, e.g. `nc31.1`):
    ```sh
    gh release list -R namecoin/namecoin-core --limit 20 --json tagName -q '.[].tagName' | head
    ```
  - Current pin: `VERSION` build-arg under `images.namecoind.source.dockerBuild.buildArgs` in `startos/manifest/index.ts` (the value _without_ the `nc` prefix — the Dockerfile prepends it).

## Applying the bump

1. Bump `VERSION` in `startos/manifest/index.ts` under `images.namecoind.source.dockerBuild.buildArgs` (e.g. `'31.1'` → `'31.2'`).
2. **Pin the tag's commit.** Set `NAMECOIN_COMMIT` in `Dockerfile` to the commit the tag points to; the build fails unless the tag resolves to it and verifies against `NAMECOIN_SIGNING_KEY`:

   ```sh
   git ls-remote https://github.com/namecoin/namecoin-core.git 'refs/tags/nc<VERSION>^{}'
   ```

   If that step fails because the tag is signed by another key, or the key (expires 2027-09-02) has expired, confirm the new or refreshed key against upstream's `contrib/verify-commits/trusted-keys` at that tag before trusting it. Then replace `assets/release-signing-key.asc` (from `https://keys.openpgp.org/vks/v1/by-fingerprint/<FPR>`) and `NAMECOIN_SIGNING_KEY` together.

3. **Check the mainnet DNS seeds.** `CMainParams` in `src/kernel/chainparams.cpp` must list Namecoin seeders — upstream has shipped Bitcoin's here before, which leaves a fresh node unable to find any peer and the package no longer compensates. Confirm at least one still resolves, e.g. `dig +short dnsseed.nmc.testls.space A`.
4. If a new upstream release changes available config options or runtime behavior, update the `startos/` source, `README.md`, and `instructions.md` to match.
