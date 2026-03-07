#!/bin/bash
# ================================================================
# First-time SSL setup for UyirGene
# Run ONCE on your server before starting docker-compose.prod.yml
#
# Usage:
#   chmod +x init-ssl.sh
#   ./init-ssl.sh app.uyirgene.com your_email@gmail.com
# ================================================================

set -e

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "Usage: ./init-ssl.sh <domain> <email>"
  echo "Example: ./init-ssl.sh app.uyirgene.com admin@uyirgene.com"
  exit 1
fi

CERT_PATH="./certbot/conf/live/$DOMAIN"

echo "==> Setting up SSL for $DOMAIN"

# Create required directories
mkdir -p ./certbot/conf ./certbot/www

# Step 1: Create a temporary self-signed cert so nginx can start
# (nginx refuses to start if SSL cert files don't exist)
echo "==> Creating temporary self-signed certificate..."
mkdir -p "$CERT_PATH"
openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
  -keyout "$CERT_PATH/privkey.pem" \
  -out "$CERT_PATH/fullchain.pem" \
  -subj "/CN=$DOMAIN" 2>/dev/null

# Step 2: Start nginx with the dummy cert (HTTP + HTTPS both come up)
echo "==> Starting nginx with temporary certificate..."
docker compose -f docker-compose.prod.yml up -d frontend

# Wait for nginx to be ready
sleep 5

# Step 3: Delete the dummy cert and get a real one from Let's Encrypt
echo "==> Requesting real certificate from Let's Encrypt..."
rm -rf "$CERT_PATH"
docker compose -f docker-compose.prod.yml run --rm certbot \
  certonly --webroot -w /var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

# Step 4: Reload nginx with the real certificate
echo "==> Reloading nginx with real certificate..."
docker compose -f docker-compose.prod.yml exec frontend nginx -s reload

echo ""
echo "SSL setup complete!"
echo "Your site is now live at https://$DOMAIN"
echo ""
echo "Auto-renewal is handled by the certbot container (runs every 12h)."
