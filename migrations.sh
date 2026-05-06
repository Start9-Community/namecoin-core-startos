#!/bin/bash
set -e

DIRECTION="$1"

# Namecoin Core data migrations
# For the initial release, no migrations are needed
# Future versions should add migration logic here

case "$DIRECTION" in
    from)
        echo '{"configured": true}'
        ;;
    to)
        echo '{"configured": true}'
        ;;
    *)
        echo "Unknown migration direction: $DIRECTION" >&2
        exit 1
        ;;
esac

exit 0
