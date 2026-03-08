# UyirGene — Complete Deployment Guide (From Zero to Live)

Follow every step in order. Do not skip anything.

---

## Part 0 — Create AWS Account

1. Go to https://aws.amazon.com
2. Click **Create an AWS Account**
3. Fill in email, password, account name
4. Enter credit/debit card (required, but won't charge for free tier usage)
5. Verify phone number
6. Choose **Basic Support** (free)
7. Login to https://console.aws.amazon.com

---

## Part 1 — Create EC2 Server

### Step 1 — Go to EC2
1. In AWS Console, search **EC2** in the top search bar
2. Click EC2
3. Click **Launch Instance** (orange button)

### Step 2 — Configure the Server

| Field | What to select |
|-------|---------------|
| Name | `uyirgene-server` |
| OS | Ubuntu → **Ubuntu Server 22.04 LTS** |
| Architecture | 64-bit (x86) |
| Instance type | `t3.small` (2GB RAM — minimum for Spring Boot) |
| Key pair | Create new — see Step 3 |

### Step 3 — Create Key Pair (.pem file)
1. Click **Create new key pair**
2. Name: `uyirgene-key`
3. Type: RSA
4. Format: `.pem`
5. Click **Create key pair**
6. A file `uyirgene-key.pem` downloads automatically
7. **Move it to a safe place** — Desktop or Documents
8. **Never delete this file** — you cannot recover it

### Step 4 — Network Settings
1. Click **Edit** next to Network settings
2. Set the following:
   - Allow SSH traffic from → **My IP** (only you can connect)
   - Allow HTTPS traffic from → **Anywhere** (0.0.0.0/0)
   - Allow HTTP traffic from → **Anywhere** (0.0.0.0/0)

### Step 5 — Storage
- Change disk size to **20 GB** (default 8 GB is not enough)

### Step 6 — Launch
1. Click **Launch Instance**
2. Wait 2 minutes
3. Click **View all instances**
4. Copy your **Public IPv4 address** (looks like `13.x.x.x`)
5. Save this IP — you will use it everywhere

---

## Part 2 — Set Up Google OAuth (Sign in with Google)

### Step 1 — Create a Google Cloud Project
1. Go to https://console.cloud.google.com
2. Sign in with your Gmail
3. Top left → click the project dropdown → **New Project**
4. Name: `UyirGene` → click **Create**

### Step 2 — Configure OAuth Consent Screen
1. Left menu → **APIs & Services** → **OAuth consent screen**
2. User Type → **External** → click **Create**
3. Fill in:
   - App name: `UyirGene`
   - User support email: your Gmail
   - Developer contact email: your Gmail
4. Click **Save and Continue** through all remaining steps

### Step 3 — Create OAuth Credentials
1. Left menu → **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth Client ID**
3. Application type → **Web application**
4. Name: `UyirGene Web`
5. Under **Authorized JavaScript origins** → click **Add URI** → add:
   ```
   http://localhost:5173
   ```
6. Click **Create**
7. A popup shows your **Client ID** — copy it. Looks like:
   ```
   812345678901-abcdefghijk.apps.googleusercontent.com
   ```
8. Save this — you will need it in your `.env` file

---

## Part 3 — Decide Subdomain & Set Up DNS on GoDaddy

### Step 1 — Decide your subdomain name
Pick one (you cannot easily change it later):
- `learn.uyirgene.com`
- `app.uyirgene.com`
- `www.uyirgene.com`

### Step 2 — Add DNS A Record on GoDaddy
1. Login to GoDaddy
2. Profile (top right) → **My Products**
3. Find `uyirgene.com` → click **DNS**
4. Scroll down → click **Add New Record**
5. Fill in:

| Field | Value |
|-------|-------|
| Type | A |
| Name | `learn` (or `app` or `www`) |
| Value | Your EC2 IP from Part 1 |
| TTL | 600 seconds |

6. Click **Save**

### Step 3 — Wait for DNS to Propagate
DNS takes 10–30 minutes to work globally.

Verify it is ready by running this on your laptop:
```bash
nslookup learn.uyirgene.com
# Must show your EC2 IP address before continuing
```

Or check at https://dnschecker.org — type your subdomain, wait for green ticks.

**Do not continue to Part 4 until this shows your EC2 IP.**

---

## Part 4 — Update nginx.conf With Your Subdomain

Do this on your **laptop** before deploying.

Open `frontend/nginx.conf` in your code editor.
Replace all occurrences of `app.uyirgene.com` with your subdomain.

Lines to change (search and replace all):
```
server_name app.uyirgene.com;                                        → your subdomain
ssl_certificate /etc/letsencrypt/live/app.uyirgene.com/fullchain.pem → your subdomain
ssl_certificate_key /etc/letsencrypt/live/app.uyirgene.com/privkey.pem → your subdomain
```

After changing, commit and push:
```bash
git add frontend/nginx.conf
git commit -m "Set production subdomain in nginx config"
git push origin main
```

---

## Part 5 — Connect to Your EC2 Server

Open Terminal on your laptop:

**Mac / Linux:**
```bash
# Fix key file permissions (required)
chmod 400 ~/Desktop/uyirgene-key.pem

# Connect to server
ssh -i ~/Desktop/uyirgene-key.pem ubuntu@YOUR_EC2_IP
```

**Windows (Command Prompt):**
```bash
ssh -i C:\Users\YourName\Desktop\uyirgene-key.pem ubuntu@YOUR_EC2_IP
```

You will see a prompt like this — you are now inside the server:
```
ubuntu@ip-13-xxx-xxx-xxx:~$
```

If you get "Permission denied":
- Check the key file path is correct
- On Mac/Linux, make sure you ran `chmod 400`

---

## Part 6 — Install Docker on EC2

Run these commands one by one inside the EC2 server:

```bash
# Update the server packages
sudo apt update && sudo apt upgrade -y

# Install Docker (official script)
curl -fsSL https://get.docker.com | sh

# Allow your user to run Docker without sudo
sudo usermod -aG docker $USER

# Log out — required for the group change to take effect
exit
```

SSH back in:
```bash
ssh -i ~/Desktop/uyirgene-key.pem ubuntu@YOUR_EC2_IP
```

Verify Docker is working:
```bash
docker --version
# Should show: Docker version 24.x.x

docker compose version
# Should show: Docker Compose version v2.x.x
```

---

## Part 7 — Clone Repository & Generate Secrets

```bash
# Install git
sudo apt install git -y

# Clone your project
git clone https://github.com/gwengopi/UyirGene.git
cd UyirGene
```

Generate the 3 secret keys you will need:
```bash
# 1. JWT Secret (copy the output — you need it in .env)
openssl rand -hex 64

# 2. Video Encryption Key (copy the output)
openssl rand -hex 32

# 3. Webhook Secret (copy the output)
openssl rand -hex 32
```

**Write down all 3 outputs. They will not be shown again.**

---

## Part 8 — Create .env File on EC2

```bash
cp .env.example .env
nano .env
```

Fill in every value:

```env
# App
APP_BASE_URL=https://learn.uyirgene.com
CORS_ALLOWED_ORIGINS=https://learn.uyirgene.com

# Database
DB_NAME=UyirGene
DB_USERNAME=uyirgene_user
DB_PASSWORD=StrongPassword123!

# Security — paste your generated secrets here
JWT_SECRET=<paste openssl rand -hex 64 output>
VIDEO_ENCRYPTION_KEY=<paste openssl rand -hex 32 output>

# Google OAuth
GOOGLE_CLIENT_ID=<your Client ID from Part 2>
VITE_GOOGLE_CLIENT_ID=<same Client ID>

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=<Gmail App Password — see below>
MAIL_FROM=UyirGene <your@gmail.com>

# Marketing email (leave blank to use MAIL_* above)
MARKETING_MAIL_HOST=
MARKETING_MAIL_PORT=
MARKETING_MAIL_USERNAME=
MARKETING_MAIL_PASSWORD=

# Payment
PAYMENT_PROVIDER=razorpay
RAZORPAY_KEY_ID=rzp_live_XXXX
RAZORPAY_KEY_SECRET=XXXX
RAZORPAY_WEBHOOK_SECRET=<paste openssl rand -hex 32 output>

SPRING_PROFILES_ACTIVE=prod
```

**How to get Gmail App Password:**
1. Go to https://myaccount.google.com
2. Security → **2-Step Verification** → turn it ON first
3. Security → **App Passwords**
4. Select app: **Mail** → click **Generate**
5. Copy the 16-character password shown → paste as `MAIL_PASSWORD`

Save the file: `Ctrl+O` → Enter → `Ctrl+X`

---

## Part 9 — Get SSL Certificate (Free HTTPS)

This runs once to get your Let's Encrypt certificate.

```bash
chmod +x init-ssl.sh

# Replace with your actual subdomain and email
./init-ssl.sh learn.uyirgene.com your@gmail.com
```

This takes about 1 minute. Success looks like:
```
Successfully received certificate.
SSL setup complete!
Your site is now live at https://learn.uyirgene.com
```

**If it fails** with "domain not found" or "connection refused":
- DNS has not propagated yet — wait 10 more minutes and retry
- Make sure ports 80 and 443 are open in AWS (Part 1, Step 4)

---

## Part 10 — Start Everything

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

First build takes 5–8 minutes. Watch it:
```bash
docker compose -f docker-compose.prod.yml logs -f backend
```

Wait until you see:
```
Started UyirgeneApplication in X.XXX seconds
```

Press `Ctrl+C` to stop watching (containers keep running).

Check all containers are healthy:
```bash
docker compose -f docker-compose.prod.yml ps
```

All should show `healthy` or `Up`.

---

## Part 11 — Verify Site is Live

Open your browser and go to: `https://learn.uyirgene.com`

You should see:
- Padlock icon in the address bar (HTTPS working)
- UyirGene website loading correctly

Test the backend health:
```
https://learn.uyirgene.com/api/actuator/health
```
Should return: `{"status":"UP"}`

If the site does not load:
```bash
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend
```

---

## Part 12 — Configure Razorpay Webhook

Now that your server is live, set up the webhook so payments are confirmed even if a user's browser closes.

1. Login to https://dashboard.razorpay.com
2. Go to **Settings** → **Webhooks**
3. Click **Add New Webhook**
4. Fill in:

| Field | Value |
|-------|-------|
| Webhook URL | `https://learn.uyirgene.com/api/payment/webhook` |
| Secret | Paste your `RAZORPAY_WEBHOOK_SECRET` from `.env` |
| Active Events | Tick **payment.captured** |

5. Click **Save**

**Test the webhook:**
In Razorpay Dashboard → Webhooks → click your webhook → **Send Test Webhook**

Then check backend logs:
```bash
docker compose -f docker-compose.prod.yml logs -f backend
# Look for: Razorpay webhook received: event=payment.captured
```

---

## Part 13 — Update Google OAuth With Live Domain

Your Google OAuth needs to know about your live domain to allow login.

1. Go to https://console.cloud.google.com
2. **APIs & Services** → **Credentials** → click your OAuth Client
3. Under **Authorized JavaScript origins** → **Add URI**:
   ```
   https://learn.uyirgene.com
   ```
4. Click **Save**

---

## Part 14 — Test End-to-End

1. Go to `https://learn.uyirgene.com`
2. Register a test account
3. Try Google login
4. Buy a course using Razorpay test card:

```
Card Number : 4111 1111 1111 1111
Expiry      : Any future date (e.g. 12/26)
CVV         : Any 3 digits (e.g. 123)
OTP         : 1234
```

5. Verify the course appears in My Courses after payment
6. Check that enrollment email is received

---

## Ongoing — How to Deploy New Code

Whenever you push code changes and want to update the live site:

```bash
# SSH into EC2
ssh -i ~/Desktop/uyirgene-key.pem ubuntu@YOUR_EC2_IP
cd UyirGene

# Pull latest code
git pull

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build
```

---

## To deploy future code updates

```bash
ssh -i uyirgene-key.pem ubuntu@YOUR_EC2_IP
cd UyirGene
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Useful Commands

```bash
# View all running containers
docker compose -f docker-compose.prod.yml ps

# Watch live logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# Restart one service
docker compose -f docker-compose.prod.yml restart backend

# Stop everything (keeps data)
docker compose -f docker-compose.prod.yml down

# Database backup
docker exec uyirgene-db pg_dump -U uyirgene_user UyirGene > backup_$(date +%Y%m%d).sql

# Check SSL certificate expiry date
openssl s_client -connect learn.uyirgene.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## SSL Auto-Renewal

SSL certificates expire every 90 days but **renew automatically**.
The `certbot` container runs every 12 hours and renews when less than 30 days remain.
You do not need to do anything.

---

## Final Checklist

- [ ] Part 0  — AWS account created
- [ ] Part 1  — EC2 instance launched, IP noted, .pem file saved
- [ ] Part 2  — Google OAuth Client ID created
- [ ] Part 3  — GoDaddy A record added, DNS shows EC2 IP
- [ ] Part 4  — nginx.conf updated with subdomain, pushed to GitHub
- [ ] Part 5  — SSH into EC2 working
- [ ] Part 6  — Docker installed and verified
- [ ] Part 7  — Repo cloned, 3 secrets generated and saved
- [ ] Part 8  — .env file created with all values
- [ ] Part 9  — SSL certificate obtained successfully
- [ ] Part 10 — All Docker containers running and healthy
- [ ] Part 11 — Site opens in browser with padlock icon
- [ ] Part 12 — Razorpay webhook configured and tested
- [ ] Part 13 — Google OAuth URL updated with live domain
- [ ] Part 14 — Test payment completed successfully
