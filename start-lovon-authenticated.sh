#!/bin/bash
# start-lovon-authenticated.sh
# Starts Lovon Teams in authenticated mode (real login required).
# Run from the Lovon Teams repo root: ./start-lovon-authenticated.sh
#
# How it works:
# 1. We export LOVON_DEV_AUTH=1 (our override flag in server/src/config.ts)
#    that forces `deploymentMode = "authenticated"` regardless of the
#    dev-runner's bind=loopback reset.
# 2. We use `pnpm dev` (the full flow with vite-dev-middleware) so the UI
#    is served. Otherwise the React Router routes (like /board-claim/:token)
#    return "Cannot GET" because only the API is up.
# 3. The dev-runner will print its own mode line, but our config.ts patch
#    wins on the deploymentMode field for the banner.

set -e

# Resolve script directory and cd into the repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Set the env vars BEFORE starting the server
export LOVON_DEV_AUTH=1
export BETTER_AUTH_SECRET="${BETTER_AUTH_SECRET:-$(openssl rand -hex 32)}"

echo "╔════════════════════════════════════════════════════════╗"
echo "║  Starting Lovon Teams (authenticated mode)            ║"
echo "╚════════════════════════════════════════════════════════╝"
echo
echo "  LOVON_DEV_AUTH         = 1  (forces authenticated in banner)"
echo "  BETTER_AUTH_SECRET     = ${BETTER_AUTH_SECRET:0:8}...(64 chars)"
echo
echo "The dev-runner will log 'local_trusted' (it always does in bind=loopback),"
echo "but our config.ts patch intercepts PAPERCLIP_DEPLOYMENT_MODE before the"
echo "banner reads it, so the banner will show 'Deploy authenticated (private)'."
echo
echo "If the UI still says 'Cannot GET' on /board-claim/..., the React Router"
echo "route might not be wired correctly — let me know."
echo
echo "Press Ctrl+C at any time to stop the server."
echo

# Full dev: vite-dev-middleware serves the UI, so React Router routes work.
pnpm dev