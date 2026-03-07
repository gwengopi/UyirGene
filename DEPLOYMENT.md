# UyirGene — Complete Deployment Guide

This guide takes you from zero to a live, secure production deployment.
Follow every step in order. Do not skip anything.

---

## What You Need Before Starting

| Item | Where to get it |
|------|----------------|
| EC2 server running (Ubuntu 22.04) | AWS Console |
| GoDaddy login for uyirgene.com | GoDaddy account |
| Razorpay live account | Razorpay Dashboard |
| Gmail App Password (not your Gmail password) | Google Account settings |
| Google OAuth Client ID | Google Cloud Console |
| Your EC2 .pem key file | Downloaded when you created EC2 |

**Your EC2 IP: `13.232.159.64`**

---

## Phase 1 — Decide Your Subdomain

Pick one name now. You cannot easily change it later.

**Options:**
- `learn.uyirgene.com`
- `learn.uyirgene.com`
- `www.uyirgene.com`

Write it down. You will use it everywhere in this guide.
**Example used in this guide: `learn.uyirgene.com`**
Replace every occurrence with your actual choice.

---

## Phase 2 — Open Ports on AWS EC2

Razorpay and Let's Encrypt need to reach your server.

1. Go to [AWS Console](https://console.aws.amazon.com) → EC2
2. Click your instance → click the **Security** tab
3. Click your Security Group name (looks like `sg-xxxxxxxxx`)
4. Click **Edit inbound rules**
5. Make sure these 3 rules exist:

| Type | Port | Source |
|------|------|--------|
| SSH | 22 | My IP (only you can SSH) |
| HTTP | 80 | 0.0.0.0/0 (everyone) |
| HTTPS | 443 | 0.0.0.0/0 (everyone) |

6. Click **Save rules**

---

## Phase 3 — Create Subdomain on GoDaddy

This points `learn.uyirgene.com` to your EC2 server.

1. Login to [GoDaddy](https://www.godaddy.com)
2. Click your profile → **My Products**
3. Find `uyirgene.com` → click **DNS**
4. Scroll down → click **Add New Record**
5. Fill in:

| Field | Value |
|-------|-------|
| Type | A |
| Name | app (or learn or www — your choice) |
| Value | 13.232.159.64 |
| TTL | 600 seconds |

6. Click **Save**

**Wait 10–30 minutes for DNS to propagate.**

To check if it's ready, run this from your laptop:
```bash
nslookup learn.uyirgene.com
# Should show: Address: 13.232.159.64
```

Or go to https://dnschecker.org and type your subdomain.
Wait until you see green ticks before moving to Phase 5.

---

## Phase 4 — Update nginx.conf With Your Subdomain

Do this on your **laptop** (before pushing to server).

Open `frontend/nginx.conf`. Find and replace all 5 occurrences of
`learn.uyirgene.com` with your subdomain.

The lines to change:
```
Line 8:  server_name learn.uyirgene.com;
Line 22: server_name learn.uyirgene.com;
Line 26: ssl_certificate     /etc/letsencrypt/live/learn.uyirgene.com/fullchain.pem;
Line 27: ssl_certificate_key /etc/letsencrypt/live/learn.uyirgene.com/privkey.pem;
```

After changing, commit and push to GitHub:
```bash
git add frontend/nginx.conf
git commit -m "Set production subdomain in nginx config"
git push origin main
```

---

## Phase 5 — SSH Into Your EC2 Server

Open a terminal on your laptop:

```bash
# If your .pem file is in Downloads folder
ssh -i ~/Downloads/your-key-name.pem ubuntu@13.232.159.64
```

If you get "Permission denied":
```bash
chmod 400 ~/Downloads/your-key-name.pem
ssh -i ~/Downloads/your-key-name.pem ubuntu@13.232.159.64
```

You should now see a prompt like: `ubuntu@ip-xxx-xxx-xxx-xxx:~$`
You are now inside your EC2 server.

---

## Phase 6 — Install Docker on EC2

Run these commands one by one inside your EC2 server:

```bash
# Update the server
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Allow your user to run Docker without sudo
sudo usermod -aG docker $USER

# Log out and log back in (required for group change)
exit
```

SSH back in:
```bash
ssh -i ~/Downloads/your-key-name.pem ubuntu@13.232.159.64
```

Verify Docker is working:
```bash
docker --version
# Should show: Docker version 24.x.x

docker compose version
# Should show: Docker Compose version v2.x.x
```

---

## Phase 7 — Clone Your Repository on EC2

```bash
# Install git (if not already installed)
sudo apt install git -y

# Clone your project
git clone https://github.com/YOUR_GITHUB_USERNAME/UyirGene.git
cd UyirGene
```

---

## Phase 8 — Generate Secrets

You need two random secret keys. Run these on the EC2 server:

```bash
# Generate JWT Secret (copy the output, you'll need it in .env)
openssl rand -hex 64

# Generate Video Encryption Key (copy the output, you'll need it in .env)
openssl rand -hex 32
```

Write down both outputs. They will not be shown again.

---

## Phase 9 — Create .env File on EC2

```bash
cp .env.example .env
nano .env
```

Fill in every value. Use the table below as reference:

```env
APP_BASE_URL=https://learn.uyirgene.com
CORS_ALLOWED_ORIGINS=https://learn.uyirgene.com

DB_NAME=UyirGene
DB_USERNAME=uyirgene_user
DB_PASSWORD=SomeStrongPasswordHere123!

JWT_SECRET=<paste output of first openssl command>
VIDEO_ENCRYPTION_KEY=<paste output of second openssl command>

GOOGLE_CLIENT_ID=<your Google OAuth client ID>
VITE_GOOGLE_CLIENT_ID=<same Google OAuth client ID>

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=<Gmail App Password — see note below>
MAIL_FROM=UyirGene <your@gmail.com>

MARKETING_MAIL_HOST=
MARKETING_MAIL_PORT=
MARKETING_MAIL_USERNAME=
MARKETING_MAIL_PASSWORD=

PAYMENT_PROVIDER=razorpay
RAZORPAY_KEY_ID=rzp_live_XXXX
RAZORPAY_KEY_SECRET=XXXX
RAZORPAY_WEBHOOK_SECRET=<leave blank for now — fill in Phase 12>

SPRING_PROFILES_ACTIVE=prod
```

**How to get Gmail App Password:**
1. Go to myaccount.google.com
2. Security → 2-Step Verification (must be ON)
3. Security → App Passwords
4. Select app: Mail → Generate
5. Copy the 16-character password shown

Save the file: `Ctrl+O` → Enter → `Ctrl+X`

---

## Phase 10 — Get SSL Certificate (HTTPS)

This runs once to get your free Let's Encrypt certificate.

```bash
# Make the script executable
chmod +x init-ssl.sh

# Run it — replace with your subdomain and your email
./init-ssl.sh learn.uyirgene.com your@gmail.com
```

**What happens:**
1. Script creates a temporary self-signed certificate
2. Starts nginx on port 80
3. Let's Encrypt visits your domain to verify you own it
4. Issues a real trusted certificate
5. Reloads nginx with the real certificate

**If it fails** with "domain not found":
- DNS has not propagated yet — wait 10 more minutes and retry
- Make sure port 80 is open in AWS Security Groups (Phase 2)

**Success message looks like:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/learn.uyirgene.com/fullchain.pem
```

---

## Phase 11 — Start Everything

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

This will:
1. Build the Spring Boot backend (~5 minutes first time)
2. Build the React frontend (~3 minutes first time)
3. Start PostgreSQL, Backend, Frontend, Certbot containers

**Watch the progress:**
```bash
docker compose -f docker-compose.prod.yml ps
```

Wait until all containers show `healthy` or `Up`.

**Watch backend startup:**
```bash
docker compose -f docker-compose.prod.yml logs -f backend
```

Look for this line — it means the backend is fully ready:
```
Started UyirgeneApplication in X.XXX seconds
```

Press `Ctrl+C` to stop watching logs (containers keep running).

---

## Phase 12 — Verify Deployment

Open your browser and go to: `https://learn.uyirgene.com`

You should see:
- Padlock icon in the address bar (SSL working)
- UyirGene website loading

Test the backend is working:
```
https://learn.uyirgene.com/api/actuator/health
# Should show: {"status":"UP"}
```

If the site does not load, check logs:
```bash
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend
```

---

## Phase 13 — Configure Razorpay Webhook

Now that your server is live, set up the webhook.

**Step 1 — Generate a webhook secret on EC2:**
```bash
openssl rand -hex 32
```
Copy the output.

**Step 2 — Add it to Razorpay Dashboard:**
1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings → Webhooks**
3. Click **Add New Webhook**
4. Fill in:

| Field | Value |
|-------|-------|
| Webhook URL | https://learn.uyirgene.com/api/payment/webhook |
| Secret | (paste the openssl output from Step 1) |
| Active Events | ✅ payment.captured |

5. Click **Save**

**Step 3 — Add the secret to your .env on EC2:**
```bash
nano .env
```
Find `RAZORPAY_WEBHOOK_SECRET=` and paste the secret.
Save: `Ctrl+O` → Enter → `Ctrl+X`

**Step 4 — Restart the backend to pick up the new secret:**
```bash
docker compose -f docker-compose.prod.yml restart backend
```

**Step 5 — Test the webhook:**
In Razorpay Dashboard → Webhooks → click your webhook → **Send Test Webhook**
Check backend logs:
```bash
docker compose -f docker-compose.prod.yml logs -f backend
# Should show: Razorpay webhook received: event=payment.captured
```

---

## Phase 14 — Test a Real Payment

1. Go to your live site: `https://learn.uyirgene.com`
2. Register a test account
3. Buy a course using Razorpay test card:

```
Card Number : 4111 1111 1111 1111
Expiry      : Any future date
CVV         : Any 3 digits
OTP         : 1234 (Razorpay test OTP)
```

4. Verify the course appears in My Courses after payment
5. Check email was received

---

## Phase 15 — Update Google OAuth Authorized URLs

Your Google OAuth Client ID needs to know about your new domain.

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials → your OAuth Client
3. Under **Authorized JavaScript origins**, add:
   ```
   https://learn.uyirgene.com
   ```
4. Under **Authorized redirect URIs**, add:
   ```
   https://learn.uyirgene.com
   https://learn.uyirgene.com/login
   ```
5. Save

---

## Ongoing — How to Deploy New Code

Whenever you push new code and want to update the live site:

```bash
# SSH into EC2
ssh -i ~/Downloads/your-key-name.pem ubuntu@13.232.159.64
cd UyirGene

# Pull latest code
git pull

# Rebuild and restart (only the changed service)
docker compose -f docker-compose.prod.yml up -d --build backend
# or
docker compose -f docker-compose.prod.yml up -d --build frontend
# or both
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Useful Commands Reference

```bash
# View running containers
docker compose -f docker-compose.prod.yml ps

# View logs (live)
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# Restart one service
docker compose -f docker-compose.prod.yml restart backend

# Stop everything
docker compose -f docker-compose.prod.yml down

# Stop and delete all data (CAREFUL — deletes database)
docker compose -f docker-compose.prod.yml down -v

# Check SSL certificate expiry
openssl s_client -connect learn.uyirgene.com:443 2>/dev/null | openssl x509 -noout -dates

# Database backup
docker exec uyirgene-db pg_dump -U uyirgene_user UyirGene > backup_$(date +%Y%m%d).sql
```

---

## SSL Auto-Renewal

Your SSL certificate expires every 90 days but **renews automatically**.
The `certbot` container in docker-compose.prod.yml runs every 12 hours and
renews the certificate when it has less than 30 days remaining.
You do not need to do anything.

---

## Summary Checklist

- [ ] Phase 1  — Decided subdomain name
- [ ] Phase 2  — AWS Security Groups: ports 80, 443, 22 open
- [ ] Phase 3  — GoDaddy A record added, DNS propagated
- [ ] Phase 4  — nginx.conf updated with subdomain, pushed to GitHub
- [ ] Phase 5  — SSH access to EC2 working
- [ ] Phase 6  — Docker installed on EC2
- [ ] Phase 7  — Repository cloned on EC2
- [ ] Phase 8  — JWT_SECRET and VIDEO_ENCRYPTION_KEY generated
- [ ] Phase 9  — .env file created with all values
- [ ] Phase 10 — SSL certificate obtained (init-ssl.sh ran successfully)
- [ ] Phase 11 — All Docker containers running and healthy
- [ ] Phase 12 — Site opens in browser with padlock (https)
- [ ] Phase 13 — Razorpay webhook configured and tested
- [ ] Phase 14 — Test payment completed successfully
- [ ] Phase 15 — Google OAuth URLs updated
