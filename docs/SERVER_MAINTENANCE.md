# Server Maintenance & Incident Log

## Server Details
- **Provider:** AWS EC2
- **OS:** Ubuntu
- **IP:** 172-31-38-116
- **Disk:** 19 GB total
- **App URL:** https://learn.uyirgene.com
- **Project path:** `~/UyirGene`

---

## Incident 1 — April 2, 2026 (First Outage)

### What Happened
Website went down. All containers showing `unhealthy`.

### Root Cause
Disk hit 100% (19 GB used out of 19 GB).
Docker build cache accumulated over weeks of deployments and filled the disk.
Backend could not restart: `no space left on device`.

### Fix Applied
```bash
docker system prune -f
# Freed 2.76 GB of Docker build cache and stopped containers
docker compose -f docker-compose.prod.yml up -d
```

### Result
Disk dropped from 100% → 71%. All containers came back healthy.

---

## Incident 2 — April 2, 2026 (Second Outage, Same Day)

### What Happened
Website went down again within hours of recovery.

### Root Cause
Disk hit 100% again. This time Docker cache was not the cause (`docker system prune` freed 0B).
The real culprit was **Spring Boot application log files** filling the disk:

| File | Size |
|------|------|
| `application.log` (current) | 4.1 GB |
| Container JSON log | 2.8 GB |
| `application-2026-04-01.log` | 1.7 GB |
| `application-2026-03-30.log` | 1.1 GB |
| `application-2026-03-31.log` | 105 MB |
| **Total** | **~10 GB** |

The backend was spamming thousands of font warnings per hour from PDF certificate generation:
```
Skip table '00">' which goes past the file size...
Skip table 'meta' which goes past the file size...
```
These were written to both the log file AND the Docker container JSON log simultaneously — every log line written twice.

### Fix Applied
```bash
# Clear log files
sudo truncate -s 0 /var/lib/docker/containers/bd8d6840.../bd8d6840...-json.log
sudo rm /var/lib/docker/volumes/uyirgene_logs_data/_data/application-2026-03-*.log
sudo rm /var/lib/docker/volumes/uyirgene_logs_data/_data/application-2026-04-01.log
sudo truncate -s 0 /var/lib/docker/volumes/uyirgene_logs_data/_data/application.log

# Bring containers back up
docker compose -f docker-compose.prod.yml up -d
```

### Result
9.6 GB freed. Disk at 49%. Containers came back healthy.

---

## Permanent Fixes Implemented

### Fix 1 — Logging Configuration
**File:** `src/main/resources/logback-spring.xml`

Changes:
- Switched to `SizeAndTimeBasedRollingPolicy` — max 50 MB per log file
- Keep only 7 days of log history
- Total log cap: 500 MB
- Removed console appender — was writing every log line twice (once to file, once to Docker JSON log)
- Suppressed noisy font warnings from PDF generation — fontbox/pdfbox/itext set to ERROR level

### Fix 2 — Docker Container Log Limits
**File:** `docker-compose.prod.yml`

Added to backend service:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```
Caps Docker container JSON log to 30 MB max (10 MB × 3 files).

### Fix 3 — JVM Heap Dump Prevention
**File:** `docker-compose.prod.yml`

Updated `JAVA_OPTS`:
```
-XX:+ExitOnOutOfMemoryError -XX:HeapDumpPath=/dev/null
```
- `ExitOnOutOfMemoryError` — container exits cleanly on OOM so Docker restarts it automatically
- `HeapDumpPath=/dev/null` — discards heap dump instead of writing GBs to disk on crash

### Fix 4 — Gmail App Password Quotes
**File:** `~/UyirGene/.env` on server

Gmail app passwords contain spaces which caused bash errors when sourcing `.env`.
Fixed by wrapping passwords in quotes:
```
MAIL_PASSWORD="uqns mtfg xkau revw"
MARKETING_MAIL_PASSWORD="lnsd wpzq ishj ntvi"
```

### Fix 5 — Docker Auto-Start on Reboot (Verified)
Docker daemon was already set to auto-start (`sudo systemctl is-enabled docker` → `enabled`).
No change needed.

### Fix 6 — Systemd Service for Container Auto-Start
**File:** `/etc/systemd/system/uyirgene.service`

Ensures all Docker containers start automatically after AWS server reboot:
```ini
[Unit]
Description=UyirGene Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/UyirGene
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
User=ubuntu

[Install]
WantedBy=multi-user.target
```

---

## Server-Side Preventive Measures

### Cron Jobs

**Ubuntu user crons** (`crontab -l`):
```
0 1 * * *   ~/backups/backup-db.sh       # Daily DB backup at 1 AM
0 8 * * 1   ~/backups/check-ssl.sh       # SSL expiry check every Monday 8 AM
0 9 * * *   ~/backups/check-disk.sh      # Disk usage check daily at 9 AM
*/5 * * * * ~/backups/check-health.sh    # Backend health check every 5 mins
```

**Root crons** (`sudo crontab -l`):
```
0 2 * * 0   docker system prune -f       # Weekly Docker cache cleanup Sunday 2 AM
```

### Scripts Location
All scripts stored in `~/backups/` on the server:

| Script | Purpose | Alert |
|--------|---------|-------|
| `backup-db.sh` | pg_dump → compressed .sql.gz, keeps 14 days | No |
| `check-ssl.sh` | Checks SSL cert expiry, logs if <30 days | Log only |
| `check-disk.sh` | Checks disk + volume sizes | Email if disk >80% |
| `check-health.sh` | Checks backend container health every 5 mins | Email if unhealthy >5 mins |

### Log Files
All script logs stored in `~/backups/`:

| Log file | Contents |
|----------|---------|
| `disk-check.log` | Daily disk usage + volume sizes |
| `ssl-check.log` | Weekly SSL expiry status |
| `health-check.log` | Backend health check results |

### Email Alerts
- **Alert sent to:** `dharanibalanp@gmail.com`
- **Sent via:** `uyirgeneacademy@gmail.com` (Gmail SMTP port 465)
- **Triggers:** Disk >80% OR Backend unhealthy for >5 minutes

### Database Backups
- **Location:** `~/backups/db/`
- **Format:** Compressed `.sql.gz` (gzip)
- **Schedule:** Daily at 1 AM
- **Retention:** 14 days
- **Current size per backup:** ~37 MB (55 MB database)
- **Max storage used:** ~520 MB

---

## Response Guide — What To Do When You Get an Alert Email

### Alert: Disk Usage Above 80%

**Step 1 — Check what's using space:**
```bash
df -h
sudo du -sh /var/lib/docker/volumes/uyirgene_logs_data/_data/
sudo du -sh /var/lib/docker/volumes/uyirgene_postgres_data/_data/
sudo du -sh /var/lib/docker/volumes/uyirgene_uploads_data/_data/
```

**Step 2 — Clear Docker cache:**
```bash
docker system prune -f
```

**Step 3 — If logs are large, clear them:**
```bash
sudo truncate -s 0 /var/lib/docker/volumes/uyirgene_logs_data/_data/application.log
```

**Step 4 — Check disk again:**
```bash
df -h
```

---

### Alert: Backend Unhealthy

**Step 1 — Check container status:**
```bash
docker ps
```

**Step 2 — Check backend logs for errors:**
```bash
cd ~/UyirGene && docker compose -f docker-compose.prod.yml logs --tail=50 backend
```

**Step 3 — Check disk (full disk causes unhealthy):**
```bash
df -h
```

**Step 4 — Restart backend:**
```bash
cd ~/UyirGene && docker compose -f docker-compose.prod.yml restart backend
```

**Step 5 — If restart fails, full redeploy:**
```bash
cd ~/UyirGene && docker compose -f docker-compose.prod.yml up -d
```

---

## Useful Commands Reference

### Check system status
```bash
df -h                                    # Disk usage
docker ps                                # Container status
sudo crontab -l                          # Root cron jobs
crontab -l                               # Ubuntu user cron jobs
```

### Check log sizes
```bash
sudo ls -lh /var/lib/docker/volumes/uyirgene_logs_data/_data/
cat ~/backups/disk-check.log | tail -10
cat ~/backups/health-check.log | tail -10
cat ~/backups/ssl-check.log | tail -5
```

### Emergency disk cleanup
```bash
docker system prune -f
sudo truncate -s 0 /var/lib/docker/volumes/uyirgene_logs_data/_data/application.log
```

### Container management
```bash
# Check logs
cd ~/UyirGene && docker compose -f docker-compose.prod.yml logs --tail=50 backend

# Restart backend only
cd ~/UyirGene && docker compose -f docker-compose.prod.yml restart backend

# Start all containers
cd ~/UyirGene && docker compose -f docker-compose.prod.yml up -d

# Stop all containers
cd ~/UyirGene && docker compose -f docker-compose.prod.yml down
```

### Database backup & restore
```bash
# Run backup manually
~/backups/backup-db.sh

# List available backups
ls -lh ~/backups/db/

# Restore a specific backup
gunzip -c ~/backups/db/backup-2026-04-02.sql.gz | docker exec -i uyirgene-db psql -U uyirgene_user -d UyirGene
```

### SSL certificate
```bash
# Check expiry date
sudo openssl x509 -enddate -noout -in ~/UyirGene/certbot/conf/live/learn.uyirgene.com/fullchain.pem

# Force renewal manually
cd ~/UyirGene && docker compose -f docker-compose.prod.yml run --rm certbot renew
```

### Run scripts manually for testing
```bash
~/backups/backup-db.sh              # Test DB backup
~/backups/check-ssl.sh              # Test SSL check
~/backups/check-disk.sh             # Test disk check
~/backups/check-health.sh           # Test health check
```

### Auto-start service
```bash
sudo systemctl is-enabled uyirgene.service    # Should show: enabled
sudo systemctl status uyirgene.service        # Check status
sudo systemctl start uyirgene.service         # Start manually
```
