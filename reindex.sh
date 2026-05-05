#!/bin/bash
set -e

# Set the reindex flag so the entrypoint picks it up on next start
touch /root/.namecoin/.reindex

echo '{"version": "0", "message": "Namecoin Core will reindex the blockchain on the next start. Please restart the service.", "value": null, "copyable": false, "qr": false}'
