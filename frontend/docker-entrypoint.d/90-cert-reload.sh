#!/bin/sh
# Reload nginx whenever certbot renews the Let's Encrypt certificate.
#
# nginx loads the certificate into memory once at startup and never re-reads it.
# The certbot container renews the files under /etc/letsencrypt (shared volume),
# but nothing told nginx - so it kept serving the old cert until it expired
# (outage Aug 4 2026, see docs/SERVER_MAINTENANCE.md, Incident 3).
#
# The official nginx image runs every executable *.sh in /docker-entrypoint.d/
# before starting nginx. This script starts a background loop that checks the
# certificate every 6 hours and runs a graceful `nginx -s reload` (zero downtime)
# only when the file content has changed.

CERT="${SSL_CERT_PATH:-/etc/letsencrypt/live/learn.uyirgene.com/fullchain.pem}"
INTERVAL="${CERT_RELOAD_INTERVAL:-6h}"

cert_hash() {
    # live/*.pem are symlinks into archive/ - cat follows them, so a renewal changes the hash
    cat "$CERT" 2>/dev/null | md5sum | cut -d' ' -f1
}

(
    last="$(cert_hash)"
    while :; do
        sleep "$INTERVAL"
        current="$(cert_hash)"
        if [ "$current" != "$last" ]; then
            if nginx -t -q; then
                nginx -s reload
                echo "[cert-reload] $(date -u) certificate changed - nginx reloaded"
                last="$current"
            else
                echo "[cert-reload] $(date -u) certificate changed but nginx config test failed - not reloading" >&2
            fi
        fi
    done
) &

echo "[cert-reload] watching $CERT every $INTERVAL"
