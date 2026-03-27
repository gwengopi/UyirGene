# UyirGene — Cloud Deployment Analysis
**Date:** March 24, 2026
**Prepared for:** UyirGene Academy (learn.uyirgene.com)
**Current Phase:** Testing

---

## 1. Project Overview

UyirGene is a full-featured e-learning platform focused on food safety and professional certifications.

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.3.4 (Java 17) |
| Frontend | React 18 + Vite + Material UI |
| Database | PostgreSQL 15 |
| Containerization | Docker + Docker Compose |
| Web Server | Nginx (reverse proxy + static serving) |
| SSL | Let's Encrypt (Certbot) |
| Payments | Razorpay |
| Email | Gmail SMTP (transactional + marketing) |
| Auth | JWT + Google OAuth 2.0 |

### Key Functionalities
| Feature | Details |
|---------|---------|
| Courses | CRUD, multi-category, pricing, video streaming |
| Flagship Programs | Standalone programs with videos, assessments, pricing |
| Course Bundles | Combo offers (multiple courses, single payment) |
| Video Streaming | AES-GCM encrypted URLs, progress tracking |
| Certificate Generation | PDFBox PDF generation with QR codes, configurable numbering |
| Payments | Razorpay integration, multi-currency, webhook verification |
| Email System | Templated emails, async sending, bulk marketing campaigns |
| Blog | CMS with categories, subscriptions, SEO |
| Analytics | Page view tracking, device detection, visitor stats |
| Standards Library | Document downloads (HACCP, Food Safety, GMP) |
| Admin Panel | Full CRUD for all entities, user management, analytics |
| SEO | react-helmet-async, JSON-LD structured data, sitemap |
| Scheduled Jobs | Course reminders, marketing batch sends (daily 09:00) |

---

## 2. Traffic & User Analysis

| Metric | Value | Notes |
|--------|-------|-------|
| Weekly visitors | 14,000 | Given |
| Daily visitors | ~2,000 | 14,000 / 7 |
| Peak hour visitors | ~800 | 5x daily average |
| Conversion rate | ~2–5% | Typical ed-tech |
| Estimated enrolled users | 280–700 total | Realistic current scale |
| Active learners/day | ~50–150 | ~20% of enrolled |
| Concurrent users (peak) | 5–15 | Low |
| Page views/week | ~42,000 | ~3 pages/visit |

**Key Insight:** Most traffic is unauthenticated browsing (course listings, blogs, landing page).
Heavy operations (certificate generation, video streaming, payments) occur for a much smaller
subset of enrolled users — so infrastructure needs are lower than raw visitor count suggests.

---

## 3. Current AWS Setup Audit

### Instance Details
| Property | Value |
|----------|-------|
| Instance type | t2.micro |
| vCPU | 1 |
| RAM | 954 MB |
| AWS Region | ap-south-1 (Mumbai) |
| Free Tier | Active (created March 6, 2026 — expires March 6, 2027) |
| Compose file in use | docker-compose.prod.yml ✅ |

### Running Containers
| Container | Image | Memory Usage | Ports |
|-----------|-------|-------------|-------|
| uyirgene-frontend | Custom Nginx | 4 MB | 80, 443 (public) |
| uyirgene-backend | Spring Boot JAR | 285 MB | 8080 (internal only) |
| uyirgene-db | postgres:15-alpine | 18 MB | 5432 (internal only) |
| uyirgene-certbot | certbot/certbot | 0.4 MB | internal |
| **Total containers** | | **~308 MB** | |
| OS + Docker daemon | | ~500 MB | |
| **Grand total** | | **~808 MB / 954 MB** | |

### Memory Status
```
Total RAM:     954 MB
Used:          804 MB
Available:     149 MB   ← Critical — very low headroom
Swap active:   527 MB   ← Server already using disk as RAM (2 swapfiles, 4GB total)
```

**Root Cause:** All 4 containers + OS + Docker daemon running on 1GB RAM.
Any spike (PDF certificate generation, marketing batch send) pushes the system
into swap → disk is ~100x slower than RAM → slow responses.

The backend's Block I/O of **158 MB read** confirms it has been swapping to disk previously.

---

## 4. Issues Found

### 🔴 Critical

| Issue | Detail | Impact |
|-------|--------|--------|
| **t2.micro too small** | 527 MB swap active, only 149 MB free | Slow responses, risk of OOM crash on traffic spikes |

### ✅ Already Correct in Production

| Issue | Status |
|-------|--------|
| Spring profile | ✅ `SPRING_PROFILES_ACTIVE: prod` in docker-compose.prod.yml |
| Email (Mailtrap) | ✅ Gmail SMTP configured in .env |
| DB credentials | ✅ Strong credentials in .env |
| DB port exposed publicly | ✅ Internal Docker network only |
| Backend port exposed publicly | ✅ Internal Docker network only |
| API URL using HTTP + raw IP | ✅ Uses `${APP_BASE_URL}` from .env in production |
| SSL | ✅ Let's Encrypt working via Certbot container |

### 🟠 Pre Go-Live — Must Fix Before Real Users

#### 1. Switch Razorpay to Live Keys
**Current:** `.env` has `rzp_test_` prefix — test mode only, real payments not processed.

**Fix:** Get live keys from Razorpay Dashboard → update `.env`:
```bash
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxx
```
Also update the **Razorpay Dashboard → Webhooks** with production URL:
```
https://learn.uyirgene.com/api/payment/webhook
```

#### 2. Fix Frontend Health Check (False Alarm)
**Current status:** `uyirgene-frontend` shows **unhealthy** (FailingStreak: 70+)

**Root cause:** Health check in `frontend/Dockerfile` runs:
```bash
wget -q --spider http://localhost:80
```
But Nginx port 80 does a **301 redirect → HTTPS (443)**. `wget --spider` fails on redirects
in Alpine's wget, so the health check always fails — even though the site works fine.

**Evidence it's a false alarm:** Container has 7.54 MB real network traffic — site IS serving users.

**Fix:** Override health check in `docker-compose.prod.yml` under the `frontend:` service:
```yaml
frontend:
  ...
  restart: unless-stopped
  healthcheck:
    test: ["CMD-SHELL", "wget -q --spider --no-check-certificate https://localhost:443 || exit 1"]
    interval: 30s
    timeout: 5s
    retries: 3
    start_period: 10s
```
Apply without downtime:
```bash
cd /home/ubuntu/UyirGene
docker-compose -f docker-compose.prod.yml up -d --no-deps frontend
```

#### 3. Set JVM Memory Limits
**Current:** Spring Boot JVM has no memory cap — can grow and consume all available RAM.

**Fix:** Add memory limits to backend service in `docker-compose.prod.yml`:
```yaml
backend:
  ...
  deploy:
    resources:
      limits:
        memory: 512M
      reservations:
        memory: 256M
```
Or set JVM heap directly via environment variable:
```yaml
environment:
  JAVA_OPTS: "-Xms256m -Xmx512m -XX:+UseG1GC"
```

#### 4. Clean .env File Corruption
**Current:** `.env` file starts with duplicate content:
```
https://learn.uyirgene.comhttps://learn.uyirgene.com   ← remove this line
# ================================================================
...
```
**Fix:** SSH into server and edit:
```bash
nano /home/ubuntu/UyirGene/.env
```
Delete the first corrupted line, save with `Ctrl+O`, `Enter`, `Ctrl+X`.

### 🟢 Minor (Optional)

| Issue | Detail |
|-------|--------|
| Old EC2 IP in docker-compose.yml | Dev-only file, not used in production — safe to ignore |
| Google OAuth redirect URIs | Update in Google Cloud Console if domain changes |

---

## 5. Instance Sizing Analysis

### Current vs Options

| Instance | RAM | vCPU | Cost/month | Suitable? |
|----------|-----|------|-----------|-----------|
| t2.micro (current) | 1 GB | 1 | ₹0 (free tier till Mar 2027) | ⚠️ Testing only |
| t3.small | 2 GB | 2 | ~₹1,340/month | ✅ Go-live ready |
| t3.medium | 4 GB | 2 | ~₹2,500/month | ✅ Future scaling |
| **Lightsail $10** | **2 GB** | **2** | **~₹830/month** | ✅ Best value |

### How to Upgrade EC2 t2.micro → t3.small
1. EC2 Console → select instance
2. **Instance State → Stop Instance** (site down ~3 min)
3. **Actions → Instance Settings → Change Instance Type**
4. Select `t3.small` → Apply
5. **Instance State → Start Instance**
6. Containers auto-restart (`restart: unless-stopped`)
7. **All data preserved** — Docker volumes are on EBS disk, unaffected by instance type change

---

## 6. AWS Free Tier Status

| Service | Monthly Limit | Current Usage | Status |
|---------|--------------|--------------|--------|
| EC2 t2.micro | 750 hrs | ~400 hrs (53%) | ✅ Free |
| EBS Storage | 30 GB | 11 GB | ✅ Free |
| Data Transfer Out | 100 GB | 1 GB | ✅ Free |
| **Free Tier Expiry** | | | **March 6, 2027** |

After expiry, t2.micro costs ~₹743/month on-demand.
At that point upgrading to Lightsail $10 (~₹830/month) is better value.

---

## 7. Amazon Lightsail Analysis

### What is Lightsail?
AWS's simplified VPS service with **fixed flat monthly pricing**.
Same AWS infrastructure as EC2, but simpler setup and cheaper for small-medium workloads.

### Full Compatibility Assessment

| Component | Compatible? | Changes Required |
|-----------|------------|-----------------|
| Docker Compose 3.8 | ✅ Full support | None |
| PostgreSQL 15 container | ✅ Works identically | None |
| Nginx reverse proxy | ✅ Works identically | None |
| SSL via Certbot container | ✅ Works identically | None |
| Razorpay webhooks | ✅ Public endpoint | Update webhook URL in Razorpay dashboard |
| Google OAuth 2.0 | ✅ Domain-agnostic | Update redirect URI in Google Cloud Console |
| Gmail SMTP (transactional + marketing) | ✅ Works anywhere | None |
| Scheduled jobs (@Scheduled) | ✅ Single instance | None |
| File storage via Docker volumes | ✅ Volumes persist | None |
| No AWS service lock-in | ✅ Cloud-agnostic codebase | None |

**Verdict: Drop-in replacement. Zero code changes required.**

### Lightsail Plans (Mumbai Region)

| Plan | RAM | vCPU | SSD | Cost/month |
|------|-----|------|-----|-----------|
| $5 | 1 GB | 2 | 40 GB | ~₹415 |
| **$10 ← Recommended** | **2 GB** | **2** | **60 GB** | **~₹830** |
| $20 | 4 GB | 2 | 80 GB | ~₹1,660 |

**$10 plan is sufficient for 14,000 visitors/week.**

### Lightsail vs EC2 t3.small Comparison

| | Lightsail $10 | EC2 t3.small |
|--|--|--|
| RAM | 2 GB | 2 GB |
| vCPU | 2 | 2 |
| SSD Storage | 60 GB included | 30 GB (separate EBS ~₹250/month) |
| Static IP | Free | ~₹300/month extra |
| Cost/month | **~₹830** | ~₹1,340 |
| **Monthly savings** | **~₹510 cheaper** | — |
| Simplicity | ✅ Easier dashboard | More complex IAM/VPC |
| Auto-scaling | ❌ Not available | ✅ Available |
| Future AWS integration (RDS, S3) | ⚠️ Limited | ✅ Full |

### Lightsail Migration Steps (EC2 → Lightsail)
1. Create Lightsail Ubuntu 22.04 instance ($10 plan, Mumbai region)
2. Assign a static IP in Lightsail console
3. Open firewall ports: 80 (HTTP), 443 (HTTPS), 22 (SSH)
4. SSH in and install Docker:
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   ```
5. Copy `.env` file to server (via `scp` or paste manually)
6. Clone repository:
   ```bash
   git clone <repo-url> UyirGene
   cd UyirGene
   ```
7. Start containers:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```
8. Update domain DNS → new Lightsail static IP
9. SSL auto-renews via existing Certbot container (no changes needed)
10. Update Google OAuth redirect URI in Google Cloud Console
11. Update Razorpay webhook URL in Razorpay Dashboard

**Estimated migration effort: 2–3 hours. No code changes.**

---

## 8. Pre Go-Live Checklist

### Infrastructure
- [ ] Upgrade instance: t2.micro → t3.small (EC2) OR migrate to Lightsail $10
- [ ] Enable automated backups (EC2 snapshots or Lightsail backup plan)
- [ ] Set up CloudWatch or Lightsail alarms (CPU > 80%)
- [ ] Set JVM memory limits in docker-compose.prod.yml

### Payments
- [ ] Switch Razorpay to **live keys** (`rzp_live_` prefix)
- [ ] Update webhook URL in Razorpay Dashboard → Webhooks
- [ ] Test full payment flow end-to-end with live keys

### Application Fixes
- [ ] Fix frontend health check (override in docker-compose.prod.yml)
- [ ] Clean `.env` file (remove duplicate URL at top of file)

### Security
- [ ] Rotate `JWT_SECRET` before go-live (generate: `openssl rand -hex 64`)
- [ ] Rotate `VIDEO_ENCRYPTION_KEY` (generate: `openssl rand -hex 32`)
- [ ] Verify `.env` is in `.gitignore` and never committed to git

### Email
- [ ] Verify Gmail App Password is active and working
- [ ] Test enrollment confirmation email
- [ ] Test certificate delivery email
- [ ] Test course reminder email
- [ ] Consider AWS SES for higher sending limits (marketing campaigns — Gmail has 500/day limit)

### Domain & SSL
- [ ] Verify SSL certificate auto-renewal is working
- [ ] Test HTTPS on all pages
- [ ] Update Google OAuth redirect URIs to match production domain

---

## 9. Recommended Roadmap

### Phase 1 — Testing (Now, Free)
| Action | Cost | Priority |
|--------|------|----------|
| Stay on free t2.micro | ₹0 | Done ✅ |
| Set JVM memory limits | ₹0 | Medium |
| Fix frontend health check | ₹0 | Low |
| Clean .env corruption | ₹0 | Low |
| Test all features with Razorpay test keys | ₹0 | High |

### Phase 2 — Go-Live
| Action | Cost | Priority |
|--------|------|----------|
| Migrate to **Lightsail $10 plan** | ~₹830/month | Critical |
| Switch Razorpay to live keys | ₹0 | Critical |
| Enable automated Lightsail backups | ~₹200/month | High |
| Request AWS SES production access | ~₹350/month | High |

### Phase 3 — Scale (50,000+ visitors/week)
| Action | Cost | Priority |
|--------|------|----------|
| Upgrade to Lightsail $20 (4 GB RAM) | ~₹1,660/month | As needed |
| Migrate file storage to S3 | ~₹100–500/month | Medium |
| Add CloudFront CDN (images, assets) | ~₹200/month | Medium |
| Migrate PostgreSQL to Lightsail Managed DB | ~₹2,500/month | Medium |
| Add Redis for distributed job locking | ~₹500/month | Low |

---

## 10. Cost Summary

### Testing Phase (Now)
| Service | Cost |
|---------|------|
| EC2 t2.micro | ₹0 (free tier till March 2027) |
| EBS Storage | ₹0 (free tier) |
| **Total** | **₹0/month** |

### Go-Live — Recommended (Lightsail)
| Service | Cost |
|---------|------|
| Lightsail $10 instance (2 GB, Mumbai) | ~₹830/month |
| Lightsail automated backups | ~₹200/month |
| AWS SES (5,000 emails/month) | ~₹350/month |
| Domain/DNS (existing) | ~₹0 |
| **Total** | **~₹1,380/month** |

### Go-Live — Alternative (EC2 t3.small)
| Service | Cost |
|---------|------|
| EC2 t3.small | ~₹1,340/month |
| EBS 30 GB gp3 storage | ~₹250/month |
| Elastic IP (static) | ~₹300/month |
| AWS SES | ~₹350/month |
| **Total** | **~₹2,240/month** |

**Lightsail saves ~₹860/month vs EC2 t3.small at go-live.**

---

## 11. Final Recommendation

| Phase | Action | Cost |
|-------|--------|------|
| **Now (Testing)** | Stay on free EC2 t2.micro, fix health check + .env + JVM limits | ₹0 |
| **Before Go-Live** | Migrate to Lightsail $10, switch Razorpay live keys, enable backups | ~₹1,380/month |
| **When Scaling** | Upgrade Lightsail plan or move back to EC2 with auto-scaling | ~₹2,000+/month |

**Bottom line:** Your Docker Compose setup is well-architected and cloud-agnostic.
Lightsail is the best fit for go-live — same AWS reliability, half the cost of EC2 t3.small,
zero code changes required.

---

## 12. Future Scaling Plan

As UyirGene grows, here is the natural upgrade path — each stage only when actually needed.

### Scaling Stages

#### Stage 1 — Current (0–700 enrolled, 14k visitors/week)
**Lightsail $10/month (~₹830)**
- Single server, Docker Compose
- All 4 containers on one instance
- ✅ Perfectly sufficient

#### Stage 2 — Growing (700–5,000 enrolled, 50k visitors/week)
**Lightsail $20/month (~₹1,660)**
- Upgrade 2GB → 4GB RAM
- Same Docker Compose setup, no code changes
- Takes 2 minutes in Lightsail console

#### Stage 3 — Scaling (5,000–20,000 enrolled, 100k+ visitors/week)
**EC2 t3.medium + separate managed services (~₹6,000–8,000/month)**
- EC2 t3.medium (4GB RAM) — ~₹2,500/month
- PostgreSQL → **RDS** (managed DB, automated backups, read replicas)
- File storage → **S3** (certificates, course images, PDFs)
- **CloudFront CDN** (faster asset delivery across India)
- **AWS SES** (high volume email sending)

#### Stage 4 — Large Scale (20,000+ enrolled, 500k+ visitors/week)
**Full AWS architecture (~₹20,000–40,000/month)**
- **EC2 Auto Scaling Group** (multiple instances, handles traffic spikes)
- **Application Load Balancer** (distributes traffic across instances)
- **RDS Multi-AZ** (high availability, automatic failover)
- **ElastiCache Redis** (session caching, distributed job locking)
- **S3 + CloudFront** (global CDN for all static assets)
- **SES** (bulk email at scale)

---

### Visual Upgrade Path

```
Lightsail $10  →  Lightsail $20  →  EC2 + RDS + S3  →  Auto Scaling + CDN
  ₹830/month       ₹1,660/month      ₹6,000/month        ₹20,000+/month
  14k visitors      50k visitors      100k visitors         500k+ visitors
  700 enrolled      5k enrolled       20k enrolled          20k+ enrolled
```

---

### Code Changes Required at Each Stage

| Change | Stage Needed | Effort |
|--------|-------------|--------|
| S3 for file storage (replace FileStorageService) | Stage 3 | 1–2 days |
| Redis for distributed scheduled job locking | Stage 3 | 1 day |
| Read replica for analytics queries | Stage 3 | Half day |
| CDN for video streaming | Stage 3 | 1 day |
| Horizontal scaling (stateless sessions) | Stage 4 | 1 week |

**Good news:** Your codebase is already well-structured for scaling.
No major rewrites needed — mostly infrastructure changes with small code additions.
Don't over-engineer now — scale only when you actually need it.

---

*Document prepared based on live server audit conducted on March 25, 2026.*
*Server: ubuntu@ip-172-31-38-116 | Region: ap-south-1 (Mumbai)*
