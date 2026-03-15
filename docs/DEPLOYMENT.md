# Uyirgene Learning Platform - Deployment Guide

## Quick Start (Docker Compose)

### Prerequisites
- Docker (v20.10+)
- Docker Compose (v2.0+)
- 2GB RAM minimum
- 10GB disk space

### Local Development Setup

1. **Clone and navigate to project**:
   ```bash
   cd "D:\Java Practise\uyirgene-backend"
   ```

2. **Start all services**:
   ```bash
   docker-compose up
   ```

3. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080
   - Health Check: http://localhost:8080/actuator/health
   - API Docs: http://localhost:8080/swagger-ui.html

4. **Stop services**:
   ```bash
   docker-compose down
   ```

---

## Production Deployment

### Step 1: Environment Configuration

1. **Copy environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with production values**:
   ```bash
   # Required Configuration
   DB_NAME=UyirGene
   DB_USERNAME=your_db_user
   DB_PASSWORD=your_secure_password

   # Frontend API URL (your production domain)
   API_URL=https://api.yourdomain.com
   CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

   # Mail Configuration
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=your_app_password

   # Spring Profile
   SPRING_PROFILES_ACTIVE=prod

   # Payment (use mock for now)
   PAYMENT_PROVIDER=mock
   ```

### Step 2: Build and Deploy

**Option A: Docker Compose (Recommended for single server)**

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

**Option B: Individual Containers**

```bash
# Build backend
docker build -t uyirgene-backend .

# Build frontend
docker build -t uyirgene-frontend \
  --build-arg VITE_API_URL=https://api.yourdomain.com \
  ./frontend

# Run PostgreSQL
docker run -d \
  --name uyirgene-db \
  -e POSTGRES_DB=UyirGene \
  -e POSTGRES_USER=${DB_USERNAME} \
  -e POSTGRES_PASSWORD=${DB_PASSWORD} \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine

# Run Backend
docker run -d \
  --name uyirgene-backend \
  -p 8080:8080 \
  --link uyirgene-db:db \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DATABASE_URL=jdbc:postgresql://db:5432/UyirGene \
  -e DB_USERNAME=${DB_USERNAME} \
  -e DB_PASSWORD=${DB_PASSWORD} \
  uyirgene-backend

# Run Frontend
docker run -d \
  --name uyirgene-frontend \
  -p 80:80 \
  --link uyirgene-backend:backend \
  uyirgene-frontend
```

### Step 3: Database Migration

Flyway will automatically run migrations on startup. To verify:

```bash
# Check backend logs for migration success
docker-compose -f docker-compose.prod.yml logs backend | grep -i flyway

# You should see: "Successfully applied 1 migration(s)"
```

### Step 4: Health Checks

```bash
# Backend health
curl http://localhost:8080/actuator/health

# Expected response:
# {"status":"UP"}

# Frontend health
curl http://localhost:80

# Should return HTML content
```

---

## AWS EC2 Deployment (Step-by-Step)

> This section covers the full deployment workflow for the live server at `ubuntu@ip-172-31-38-116`.

### Swap Management

#### One-time swap setup (first time only)
```bash
# Check if swap exists
free -h
swapon --show

# If no swap or swap < 2GB, create 2GB swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make it persistent across reboots
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
```

#### Increase existing swap (e.g. 1GB → 2GB)
```bash
# Step 1: Create new 2GB swapfile
sudo fallocate -l 2G /swapfile2
sudo chmod 600 /swapfile2
sudo mkswap /swapfile2
sudo swapon /swapfile2

# Step 2: Turn off old swapfile (now safe — new swap absorbs pages)
sudo swapoff /swapfile

# Step 3: Delete old swapfile
sudo rm /swapfile

# Step 4: Turn off new swap, rename, re-enable
sudo swapoff /swapfile2
sudo mv /swapfile2 /swapfile
sudo swapon /swapfile

# Step 5: Update fstab
sudo sed -i 's|/swapfile2|/swapfile|g' /etc/fstab
# If no entry exists yet:
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
```

> **Note:** If `swapoff` gets **Killed**, the server is too low on RAM to absorb swap pages.
> In that case, create the new swapfile first (steps 1–2), then retry `swapoff` on the old one.

---

### Deploy Latest Code

#### Step 1: SSH into server
```bash
ssh ubuntu@ip-172-31-38-116
cd ~/UyirGene
```

#### Step 2: Pull latest code
```bash
git pull origin main
```

#### Step 3: Check resources before building
```bash
free -h           # RAM + swap
df -h /           # disk space
docker system df  # docker disk usage
```

#### Step 4: Free up space/memory (if needed)
```bash
# Remove unused docker images, containers, networks
docker system prune -f

# Remove old build cache (aggressive — frees most space)
docker builder prune -f
```

#### Step 5: Rebuild and restart backend + frontend
```bash
docker compose -f docker-compose.prod.yml up -d --build backend frontend
```
> Leaves `db` and `certbot` containers untouched.

#### Step 6: Watch logs to confirm startup
```bash
# Both services
docker compose -f docker-compose.prod.yml logs -f backend frontend

# Backend only (watch for "Started UyirgeneApplication" message)
docker compose -f docker-compose.prod.yml logs -f backend
```
> Backend takes ~60–90 seconds to start (Spring Boot + Flyway migrations).

#### Step 7: Verify all containers are running
```bash
docker compose -f docker-compose.prod.yml ps
```
All containers should show `healthy` or `Up`.

#### Step 8: Health check
```bash
curl -s http://localhost:8080/actuator/health | python3 -m json.tool
```
Expected: `{"status": "UP"}`

---

### Rollback (if something breaks)
```bash
# Check recent commits
git log --oneline -5

# Roll back to a previous commit
git checkout <previous-commit-hash>

# Rebuild with old code
docker compose -f docker-compose.prod.yml up -d --build backend frontend
```

---

### Useful Commands
```bash
# Restart a single service without rebuild
docker compose -f docker-compose.prod.yml restart backend

# Stop everything
docker compose -f docker-compose.prod.yml down

# View backend logs (last 100 lines)
docker compose -f docker-compose.prod.yml logs --tail=100 backend

# Get a shell inside the backend container
docker exec -it uyirgene-backend sh

# Connect to the database
docker exec -it uyirgene-db psql -U $DB_USERNAME -d UyirGene
```

---

## Cloud Platform Specific Instructions

### AWS Deployment

**Using EC2 + RDS:**

1. **Set up RDS PostgreSQL**:
   - Create PostgreSQL 15 database
   - Note endpoint, username, password
   - Configure security group to allow EC2 access

2. **Launch EC2 instance**:
   - Ubuntu 22.04 LTS
   - t2.medium or larger
   - Install Docker and Docker Compose:
     ```bash
     sudo apt update
     sudo apt install -y docker.io docker-compose
     sudo usermod -aG docker ubuntu
     ```

3. **Deploy application**:
   ```bash
   # Clone repository
   git clone <your-repo>
   cd uyirgene-backend

   # Configure environment
   cp .env.example .env
   nano .env  # Set RDS credentials

   # Update docker-compose.prod.yml to use RDS
   # Comment out the 'db' service
   # Update DATABASE_URL to RDS endpoint

   # Deploy
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Configure security groups**:
   - Allow ports 80, 8080
   - Configure Load Balancer for HTTPS

### Google Cloud Platform

**Using Cloud Run:**

```bash
# Build and push images
gcloud builds submit --tag gcr.io/PROJECT_ID/uyirgene-backend
gcloud builds submit --tag gcr.io/PROJECT_ID/uyirgene-frontend

# Deploy backend
gcloud run deploy uyirgene-backend \
  --image gcr.io/PROJECT_ID/uyirgene-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars SPRING_PROFILES_ACTIVE=prod,DATABASE_URL=<cloud-sql-url>

# Deploy frontend
gcloud run deploy uyirgene-frontend \
  --image gcr.io/PROJECT_ID/uyirgene-frontend \
  --platform managed \
  --region us-central1
```

### DigitalOcean / Generic VPS

```bash
# SSH to server
ssh root@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone and deploy
git clone <your-repo>
cd uyirgene-backend
cp .env.example .env
nano .env  # Configure
docker-compose -f docker-compose.prod.yml up -d
```

---

## Monitoring and Maintenance

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Database Backup

```bash
# Create backup
docker-compose exec db pg_dump -U postgres UyirGene > backup_$(date +%Y%m%d).sql

# Restore backup
docker-compose exec -T db psql -U postgres UyirGene < backup_20260109.sql
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Remove old images
docker image prune -f
```

### Scale Services

```bash
# Scale backend to 3 instances
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

---

## Troubleshooting

### Backend won't start

1. Check logs:
   ```bash
   docker-compose logs backend
   ```

2. Common issues:
   - **Database connection**: Verify DATABASE_URL, username, password
   - **Port conflict**: Check if port 8080 is in use
   - **Flyway migration fails**: Check database is empty or has correct schema

### Frontend can't connect to backend

1. Check CORS configuration:
   ```bash
   # Verify in application-prod.yml
   cors:
     allowed-origins: https://yourdomain.com
   ```

2. Check frontend API URL:
   ```bash
   # Rebuild frontend with correct API URL
   docker build -t uyirgene-frontend \
     --build-arg VITE_API_URL=https://api.yourdomain.com \
     ./frontend
   ```

### Database connection refused

1. Check database is running:
   ```bash
   docker-compose ps db
   ```

2. Test database connection:
   ```bash
   docker-compose exec db psql -U postgres -c "SELECT 1"
   ```

### Mock payment not working

1. Check profile is set to 'dev' or 'prod':
   ```bash
   docker-compose exec backend env | grep SPRING_PROFILES_ACTIVE
   ```

2. Verify MockPaymentService is loaded:
   ```bash
   docker-compose logs backend | grep -i "mock"
   # Should see: "MockPaymentService" bean created
   ```

---

## Performance Tuning

### Backend JVM Settings

Add to docker-compose.prod.yml:

```yaml
backend:
  environment:
    JAVA_OPTS: "-Xms512m -Xmx1024m"
```

### Database Connection Pool

Update application-prod.yml:

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
```

### Nginx Caching (Frontend)

Already configured in nginx.conf:
- Static assets: 1 year cache
- index.html: no cache

---

## Security Checklist

Before going live:

- [ ] Change all default passwords
- [ ] Enable HTTPS (use Let's Encrypt)
- [ ] Set CORS to your domain only
- [ ] Configure firewall rules
- [ ] Enable database backups
- [ ] Set up monitoring/alerts
- [ ] Review exposed ports
- [ ] Update mail credentials
- [ ] Test mock payment flow
- [ ] Verify error handling works

---

## Support

For issues:
1. Check logs first
2. Review troubleshooting section
3. Check health endpoints
4. Verify environment variables

## Additional Resources

- Spring Boot Docs: https://spring.io/projects/spring-boot
- Docker Compose: https://docs.docker.com/compose/
- PostgreSQL: https://www.postgresql.org/docs/
- Material-UI: https://mui.com/
