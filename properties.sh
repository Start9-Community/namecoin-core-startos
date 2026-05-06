#!/bin/bash
set -e

CONF_FILE="/root/.namecoin/namecoin.conf"

RPC_USER=$(grep '^rpcuser=' "$CONF_FILE" | cut -d'=' -f2)
RPC_PASS=$(grep '^rpcpassword=' "$CONF_FILE" | cut -d'=' -f2)

# Attempt to get info from the running node
BLOCKCHAIN_INFO=$(namecoin-cli \
    -datadir=/root/.namecoin \
    -rpcuser="$RPC_USER" \
    -rpcpassword="$RPC_PASS" \
    -rpcport=8336 \
    getblockchaininfo 2>/dev/null) || BLOCKCHAIN_INFO="{}"

NETWORK_INFO=$(namecoin-cli \
    -datadir=/root/.namecoin \
    -rpcuser="$RPC_USER" \
    -rpcpassword="$RPC_PASS" \
    -rpcport=8336 \
    getnetworkinfo 2>/dev/null) || NETWORK_INFO="{}"

BLOCKS=$(echo "$BLOCKCHAIN_INFO" | jq -r '.blocks // "N/A"')
HEADERS=$(echo "$BLOCKCHAIN_INFO" | jq -r '.headers // "N/A"')
CHAIN=$(echo "$BLOCKCHAIN_INFO" | jq -r '.chain // "N/A"')
SIZE_ON_DISK=$(echo "$BLOCKCHAIN_INFO" | jq -r '.size_on_disk // 0')
PRUNED=$(echo "$BLOCKCHAIN_INFO" | jq -r '.pruned // false')
VERIFICATION=$(echo "$BLOCKCHAIN_INFO" | jq -r '.verificationprogress // 0' | awk '{printf "%.4f", $1 * 100}')
CONNECTIONS=$(echo "$NETWORK_INFO" | jq -r '.connections // "N/A"')
VERSION=$(echo "$NETWORK_INFO" | jq -r '.subversion // "N/A"')

# Convert size to human readable
if [ "$SIZE_ON_DISK" != "0" ]; then
    SIZE_GB=$(echo "$SIZE_ON_DISK" | awk '{printf "%.2f", $1 / 1073741824}')
    SIZE_DISPLAY="${SIZE_GB} GB"
else
    SIZE_DISPLAY="N/A"
fi

# Output properties as YAML
cat <<EOF
version: 2
data:
  RPC Credentials:
    type: object
    value:
      Username:
        type: string
        value: "${RPC_USER}"
        description: RPC username for connecting to Namecoin Core
        copyable: true
        masked: false
        qr: false
      Password:
        type: string
        value: "${RPC_PASS}"
        description: RPC password for connecting to Namecoin Core
        copyable: true
        masked: true
        qr: false
      RPC Port:
        type: string
        value: "8336"
        description: The RPC port
        copyable: true
        masked: false
        qr: false
      P2P Port:
        type: string
        value: "8334"
        description: The peer-to-peer port
        copyable: true
        masked: false
        qr: false
  Blockchain Info:
    type: object
    value:
      Chain:
        type: string
        value: "${CHAIN}"
        description: The network chain
        copyable: false
        masked: false
        qr: false
      Block Height:
        type: string
        value: "${BLOCKS}"
        description: Current block height
        copyable: false
        masked: false
        qr: false
      Header Height:
        type: string
        value: "${HEADERS}"
        description: Current header height
        copyable: false
        masked: false
        qr: false
      Sync Progress:
        type: string
        value: "${VERIFICATION}%"
        description: Blockchain verification progress
        copyable: false
        masked: false
        qr: false
      Size on Disk:
        type: string
        value: "${SIZE_DISPLAY}"
        description: Blockchain data size
        copyable: false
        masked: false
        qr: false
      Pruned:
        type: string
        value: "${PRUNED}"
        description: Whether pruning is enabled
        copyable: false
        masked: false
        qr: false
  Network Info:
    type: object
    value:
      Connections:
        type: string
        value: "${CONNECTIONS}"
        description: Number of peer connections
        copyable: false
        masked: false
        qr: false
      Version:
        type: string
        value: "${VERSION}"
        description: Node version string
        copyable: false
        masked: false
        qr: false
EOF
