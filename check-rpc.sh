#!/bin/bash
set -e

CONF_FILE="/root/.namecoin/namecoin.conf"

RPC_USER=$(grep '^rpcuser=' "$CONF_FILE" | cut -d'=' -f2)
RPC_PASS=$(grep '^rpcpassword=' "$CONF_FILE" | cut -d'=' -f2)

# Try to get blockchain info via RPC
RESULT=$(namecoin-cli \
    -datadir=/root/.namecoin \
    -rpcuser="$RPC_USER" \
    -rpcpassword="$RPC_PASS" \
    -rpcport=8336 \
    getblockchaininfo 2>&1) || {
    echo '{"result": "starting"}'
    exit 61  # starting status
}

# Check if we're still syncing
BLOCKS=$(echo "$RESULT" | jq -r '.blocks // 0')
HEADERS=$(echo "$RESULT" | jq -r '.headers // 0')
VERIFICATION=$(echo "$RESULT" | jq -r '.verificationprogress // 0')
IBD=$(echo "$RESULT" | jq -r '.initialblockdownload // true')

if [ "$IBD" = "true" ]; then
    PERCENT=$(echo "$VERIFICATION" | awk '{printf "%.1f", $1 * 100}')
    echo "{\"result\": \"loading\", \"message\": \"Syncing blockchain: ${PERCENT}% (block ${BLOCKS}/${HEADERS})\"}"
    exit 61  # starting status
fi

echo '{"result": "ready"}'
exit 0
