#!/bin/bash
# ============================================================
# UyirGene Production Deploy Script
# Usage: ./deploy.sh
#
# Required env vars (add to your .env):
#   CF_ZONE_ID    — Cloudflare Dashboard → your domain → Overview → Zone ID
#   CF_API_TOKEN  — Cloudflare Dashboard → My Profile → API Tokens
#                   → Create Token → "Cache Purge" permission on this zone
# ============================================================

set -e  # Exit immediately on any error

# Load .env if present
if [ -f .env ]; then
  export $(grep -v '^#' .env | grep -v '^$' | xargs)
fi

# ── Validate required vars ────────────────────────────────────
if [ -z "$CF_ZONE_ID" ] || [ -z "$CF_API_TOKEN" ]; then
  echo "ERROR: CF_ZONE_ID and CF_API_TOKEN must be set in .env"
  echo "  CF_ZONE_ID   → Cloudflare Dashboard → your domain → Overview → Zone ID"
  echo "  CF_API_TOKEN → Cloudflare Dashboard → My Profile → API Tokens → Cache Purge"
  exit 1
fi

echo "==> Pulling latest code..."
git pull origin main

echo "==> Building and restarting containers..."
docker compose -f docker-compose.prod.yml build --no-cache frontend
docker compose -f docker-compose.prod.yml up -d

echo "==> Waiting for containers to be healthy..."
sleep 10

echo "==> Purging Cloudflare cache..."
RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}')

SUCCESS=$(echo "$RESPONSE" | grep -o '"success":true' || true)
if [ -n "$SUCCESS" ]; then
  echo "==> Cloudflare cache purged successfully."
else
  echo "WARNING: Cloudflare purge may have failed. Response:"
  echo "$RESPONSE"
fi

echo ""
echo "✓ Deployment complete. Users will see the new version immediately."
