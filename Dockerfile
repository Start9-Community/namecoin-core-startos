FROM debian:stable-slim AS builder

ARG VERSION=32.1
ARG NAMECOIN_COMMIT=f58a3f9c875d000e90f85fe8e20dc469de426452
# Daniel Kraft's release-tag key, listed in upstream's contrib/verify-commits/trusted-keys.
ARG NAMECOIN_SIGNING_KEY=1142850E6DFF65BA63D688A8B2492AC4A7330737
ARG TARGETPLATFORM

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        ca-certificates \
        cmake \
        git \
        gnupg \
        libboost-dev \
        libevent-dev \
        libsqlite3-dev \
        libssl-dev \
        libzmq3-dev \
        pkg-config \
        python3 \
        && rm -rf /var/lib/apt/lists/*

COPY assets/release-signing-key.asc /build/release-signing-key.asc
# VALIDSIG alone does not reject expired or revoked signing keys.
RUN git -c advice.detachedHead=false clone --depth 1 --branch "nc${VERSION}" \
        https://github.com/namecoin/namecoin-core.git src \
 && cd src \
 && git checkout -q "${NAMECOIN_COMMIT}" \
 && test "$(git rev-parse HEAD)" = "${NAMECOIN_COMMIT}" \
 && export GNUPGHOME="$(mktemp -d)" \
 && gpg --batch --quiet --import /build/release-signing-key.asc \
 && git verify-tag --raw "nc${VERSION}" > /build/tag-signature.status 2>&1 \
 && grep -q "^\[GNUPG:\] VALIDSIG .* ${NAMECOIN_SIGNING_KEY}\$" /build/tag-signature.status

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
