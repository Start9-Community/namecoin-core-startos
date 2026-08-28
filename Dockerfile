FROM debian:stable-slim AS builder

ARG VERSION=31.1
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

RUN cmake -B build \
        -DCMAKE_BUILD_TYPE=Release \
        -DCMAKE_INSTALL_PREFIX=/opt/namecoin \
        -DBUILD_BITCOIN_BIN=OFF \
        -DBUILD_TESTS=OFF \
        -DBUILD_BENCH=OFF \
        -DBUILD_FUZZ_BINARY=OFF \
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
