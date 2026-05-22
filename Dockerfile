# Build stage: build namecoind from source at a pinned tag.
# nc30.2 uses CMake (autotools was dropped). See workspace/start9.txt for
# notes from the v0.3.5 build.
FROM debian:stable-slim AS builder

ARG VERSION=30.2
ARG TARGETPLATFORM

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        ca-certificates \
        cmake \
        git \
        libboost-dev \
        libevent-dev \
        libsqlite3-dev \
        libssl-dev \
        libzmq3-dev \
        pkg-config \
        python3 \
        && rm -rf /var/lib/apt/lists/*

# Pin to nc${VERSION} tag on github.com/namecoin/namecoin-core. We don't
# verify a release-signer GPG quorum here (the way Bitcoin Core does);
# Namecoin's release-signing infra isn't a 7-of-N quorum yet. Trust is
# anchored on the pinned git ref + the GitHub TLS chain.
RUN git clone --depth 1 --branch nc${VERSION} \
        https://github.com/namecoin/namecoin-core.git src

WORKDIR /build/src

# Patch DNS seeds. Upstream nc30.2's mainnet CMainParams ships Bitcoin's DNS
# seeds (seed.bitcoin.sipa.be, dnsseed.bluematt.me, …) and an empty fixed-seed
# list, so a stock build finds *zero* Namecoin peers and never syncs. Replace
# them with the Namecoin community seeder dnsseed.nmc.testls.space, which
# returns ~25 reachable mainnet peers. The trailing grep guards fail the build
# loudly if upstream renames these lines.
RUN set -eu; cp=src/kernel/chainparams.cpp; \
    sed -i \
      -e 's|vSeeds\.emplace_back("seed\.bitcoin\.sipa\.be\.");.*|vSeeds.emplace_back("dnsseed.nmc.testls.space."); // Namecoin DNS seeder (patched in; upstream ships Bitcoin seeds)|' \
      -e '/vSeeds\.emplace_back("dnsseed\.bluematt\.me\.");/d' \
      -e '/vSeeds\.emplace_back("seed\.bitcoin\.jonasschnelli\.ch\.");/d' \
      -e '/vSeeds\.emplace_back("seed\.btc\.petertodd\.net\.");/d' \
      -e '/vSeeds\.emplace_back("seed\.bitcoin\.sprovoost\.nl\.");/d' \
      -e '/vSeeds\.emplace_back("dnsseed\.emzy\.de\.");/d' \
      -e '/vSeeds\.emplace_back("seed\.bitcoin\.wiz\.biz\.");/d' \
      -e '/vSeeds\.emplace_back("seed\.mainnet\.achownodes\.xyz\.");/d' \
      "$cp"; \
    grep -q 'dnsseed\.nmc\.testls\.space' "$cp" || { echo "PATCH FAILED: Namecoin seed not inserted"; exit 1; }; \
    if grep -qE 'seed\.bitcoin\.(sipa|jonasschnelli|sprovoost|wiz)|dnsseed\.bluematt|seed\.btc\.petertodd|dnsseed\.emzy|seed\.mainnet\.achownodes' "$cp"; then \
      echo "PATCH FAILED: a Bitcoin mainnet DNS seed remains"; exit 1; \
    fi

RUN cmake -B build \
        -DCMAKE_BUILD_TYPE=Release \
        -DCMAKE_INSTALL_PREFIX=/opt/namecoin \
        -DBUILD_BITCOIN_BIN=OFF \
        -DBUILD_TESTS=OFF \
        -DBUILD_BENCH=OFF \
        -DBUILD_FUZZ_BINARIES=OFF \
        -DBUILD_GUI=OFF \
        -DBUILD_TX=ON \
        -DBUILD_UTIL=ON \
        -DENABLE_IPC=OFF \
        -DENABLE_WALLET=ON \
        -DWITH_ZMQ=ON \
        -DWITH_SQLITE=ON \
        -DREDUCE_EXPORTS=ON

RUN cmake --build build -j"$(nproc)"
RUN cmake --install build --strip

# Final image
FROM debian:stable-slim

ENV NAMECOIN_DATA=/root/.namecoin
ENV NAMECOIN_PREFIX=/opt/namecoin
ENV PATH=${NAMECOIN_PREFIX}/bin:$PATH

RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        e2fsprogs \
        jq \
        libevent-2.1-7 \
        libevent-core-2.1-7 \
        libevent-extra-2.1-7 \
        libevent-pthreads-2.1-7 \
        libsqlite3-0 \
        libzmq5 \
        python3 \
        tini \
        && rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/namecoin/bin/namecoind ${NAMECOIN_PREFIX}/bin/
COPY --from=builder /opt/namecoin/bin/namecoin-cli ${NAMECOIN_PREFIX}/bin/
COPY --from=builder /opt/namecoin/bin/namecoin-tx ${NAMECOIN_PREFIX}/bin/

# Smoke-test the binaries during image build so a broken build fails fast.
RUN namecoind -version | head -1

# P2P + RPC
EXPOSE 8334 8336
