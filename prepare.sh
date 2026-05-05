#!/bin/bash
set -e

# prepare.sh - Sets up the build environment on a Debian system
# This script is used by Start9 to verify the build process upon submission

echo "=== Preparing build environment for Namecoin Core StartOS wrapper ==="

# Install system dependencies
export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y \
    build-essential \
    ca-certificates \
    curl \
    git \
    jq \
    wget

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | bash
fi

# Install Docker Buildx if not present
if ! docker buildx version &> /dev/null; then
    echo "Installing Docker Buildx..."
    docker buildx install
    docker buildx create --use
fi

# Enable cross-platform builds
docker run --rm --privileged multiarch/qemu-user-static --reset -p yes -c yes 2>/dev/null || true

# Install yq if not present
if ! command -v yq &> /dev/null; then
    echo "Installing yq..."
    YQ_VERSION="v4.35.1"
    ARCH=$(dpkg --print-architecture)
    wget -qO /usr/local/bin/yq "https://github.com/mikefarah/yq/releases/download/${YQ_VERSION}/yq_linux_${ARCH}"
    chmod +x /usr/local/bin/yq
fi

# Install Rust and Cargo if not present (needed for start-sdk)
if ! command -v cargo &> /dev/null; then
    echo "Installing Rust..."
    curl https://sh.rustup.rs -sSf | sh -s -- -y
    source "$HOME/.cargo/env"
fi

# Install start-sdk if not present
if ! command -v start-sdk &> /dev/null; then
    echo "Installing start-sdk..."
    if [ -d start-os ]; then
        rm -rf start-os
    fi
    git clone https://github.com/Start9Labs/start-os.git
    cd start-os
    git submodule update --init --recursive
    make sdk
    cd ..
    start-sdk init
fi

echo "=== Build environment ready ==="
echo "Run 'make' to build the package."
