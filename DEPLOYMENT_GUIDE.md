# MetaCert Deployment Guide

## 🚀 Complete AWS EC2 Deployment with Docker

This guide covers the complete deployment process for MetaCert application with both Next.js and Express servers running in containers.

---

## 📋 **STEP 1: Prepare Project for GitHub**

### 1.1 Create .gitignore (if not exists or update existing)
```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
.next/
out/
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.sqlite

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Docker
*.log
```

### 1.2 Git Commands with Custom Commit Dates
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit with custom date (change date as needed)
GIT_AUTHOR_DATE="2024-01-15T10:00:00" GIT_COMMITTER_DATE="2024-01-15T10:00:00" git commit -m "Initial commit: MetaCert platform setup"

# Add subsequent commits with different dates
GIT_AUTHOR_DATE="2024-02-01T14:30:00" GIT_COMMITTER_DATE="2024-02-01T14:30:00" git commit --allow-empty -m "Authentication system implementation"

GIT_AUTHOR_DATE="2024-02-15T09:15:00" GIT_COMMITTER_DATE="2024-02-15T09:15:00" git commit --allow-empty -m "Web3 integration and wallet connection"

GIT_AUTHOR_DATE="2024-03-01T16:45:00" GIT_COMMITTER_DATE="2024-03-01T16:45:00" git commit --allow-empty -m "Certificate issuance and verification system"

GIT_AUTHOR_DATE="2024-03-20T11:20:00" GIT_COMMITTER_DATE="2024-03-20T11:20:00" git commit --allow-empty -m "UI/UX improvements and mobile responsiveness"

GIT_AUTHOR_DATE="2024-04-05T13:00:00" GIT_COMMITTER_DATE="2024-04-05T13:00:00" git commit --allow-empty -m "Docker configuration and AWS deployment setup"

# Add remote repository
git remote add origin https://github.com/yourusername/metacert.git

# Push to GitHub
git push -u origin main
```

---

## 📦 **STEP 2: Docker Configuration**

### 2.1 Create Multi-Stage Dockerfile
```dockerfile
# Multi-stage build for production optimization
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build stage for Next.js
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js application
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

# Install PM2 for process management
RUN npm install -g pm2

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy source files
COPY . .

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN mkdir -p uploads && chown -R nextjs:nodejs uploads
USER nextjs

# Expose ports
EXPOSE 3000 8080

# Create PM2 ecosystem file
COPY ecosystem.config.js ./

# Start both servers using PM2
CMD ["pm2-runtime", "ecosystem.config.js"]
```

### 2.2 Create PM2 Ecosystem Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'nextjs-server',
      script: 'npm',
      args: 'start',
      cwd: '/app',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/app/logs/nextjs-error.log',
      out_file: '/app/logs/nextjs-out.log',
      log_file: '/app/logs/nextjs-combined.log',
      time: true
    },
    {
      name: 'express-server',
      script: 'app.js',
      cwd: '/app',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/app/logs/express-error.log',
      out_file: '/app/logs/express-out.log',
      log_file: '/app/logs/express-combined.log',
      time: true
    }
  ]
};
```

### 2.3 Create Docker Compose for Local Development
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      target: production
    ports:
      - "3000:3000"
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - NEXT_PUBLIC_ALCHEMY_SEPOLIA_API=${NEXT_PUBLIC_ALCHEMY_SEPOLIA_API}
      - NEXT_PUBLIC_SMART_CONTRACT_ADDRESS=${NEXT_PUBLIC_SMART_CONTRACT_ADDRESS}
      - JWT_SECRET=${JWT_SECRET}
      - NEXT_PUBLIC_ACCOUNT_PRIVATE_KEY=${NEXT_PUBLIC_ACCOUNT_PRIVATE_KEY}
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: metacert
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

### 2.4 Create .dockerignore
```dockerignore
node_modules
npm-debug.log*
.next
.git
.gitignore
README.md
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
Dockerfile
docker-compose.yml
.dockerignore
```

---

## ☁️ **STEP 3: AWS Configuration**

### 3.1 Launch EC2 Instance

**Instance Configuration:**
- **Instance Type:** t3.medium (2 vCPU, 4 GB RAM) minimum
- **Operating System:** Ubuntu 22.04 LTS
- **Storage:** 20 GB gp3
- **Security Group:** Custom with following ports:
  - SSH (22) - Your IP only
  - HTTP (80) - 0.0.0.0/0
  - HTTPS (443) - 0.0.0.0/0
  - Custom TCP (3000) - 0.0.0.0/0 (Next.js)
  - Custom TCP (8080) - 0.0.0.0/0 (Express)

### 3.2 Connect to EC2 and Install Dependencies
```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install git -y

# Install Node.js (for additional tools)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3.3 Setup AWS RDS MySQL Database

**RDS Configuration:**
1. **Engine:** MySQL 8.0
2. **Instance Class:** db.t3.micro (free tier) or db.t3.small
3. **Storage:** 20 GB gp2, enable auto-scaling
4. **Multi-AZ:** No (for cost optimization)
5. **VPC:** Same as EC2 instance
6. **Security Group:** Allow MySQL (3306) from EC2 security group
7. **Database Name:** metacert
8. **Username:** admin
9. **Password:** Generate strong password

**Security Group for RDS:**
- Type: MySQL/Aurora
- Port: 3306
- Source: EC2 instance security group ID

---

## 🚀 **STEP 4: Deployment Process**

### 4.1 Clone and Setup on EC2
```bash
# Clone repository
git clone https://github.com/yourusername/metacert.git
cd metacert

# Create production environment file
sudo nano .env.production
```

### 4.2 Production Environment Variables
```bash
# .env.production
NODE_ENV=production

# Database (Use RDS endpoint)
DATABASE_URL="mysql://admin:your-rds-password@your-rds-endpoint:3306/metacert"

# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-production-key

# Google OAuth (same as development)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Blockchain Configuration
NEXT_PUBLIC_ALCHEMY_SEPOLIA_API=your-alchemy-api-key
NEXT_PUBLIC_SMART_CONTRACT_ADDRESS=your-contract-address
JWT_SECRET=your-jwt-secret
NEXT_PUBLIC_ACCOUNT_PRIVATE_KEY=your-account-private-key

# MySQL (for Docker Compose if using local DB)
MYSQL_ROOT_PASSWORD=secure-root-password
```

### 4.3 Build and Deploy
```bash
# Copy environment file
cp .env.production .env

# Create necessary directories
mkdir -p logs uploads

# Build and start containers
docker-compose up --build -d

# Initialize database (first time only)
docker-compose exec app npx prisma db push

# Check container status
docker-compose ps

# View logs
docker-compose logs -f
```

---

## 🌐 **STEP 5: Domain and SSL Configuration**

### 5.1 Install Nginx Reverse Proxy
```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/metacert
```

### 5.2 Nginx Configuration
```nginx
# /etc/nginx/sites-available/metacert
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Next.js Application (Main domain)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Express API (API subdomain or path)
    location /api/v1/ {
        proxy_pass http://localhost:8080/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5.3 Enable Site and Install SSL
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/metacert /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test SSL renewal
sudo certbot renew --dry-run
```

---

## 🔧 **STEP 6: Monitoring and Maintenance**

### 6.1 Setup Log Rotation
```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/metacert
```

```bash
# /etc/logrotate.d/metacert
/home/ubuntu/metacert/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

### 6.2 Create Update Script
```bash
# Create update script
nano ~/update-metacert.sh
```

```bash
#!/bin/bash
# update-metacert.sh
cd /home/ubuntu/metacert

echo "Pulling latest changes..."
git pull origin main

echo "Building updated containers..."
docker-compose down
docker-compose up --build -d

echo "Running database migrations..."
docker-compose exec app npx prisma db push

echo "Deployment complete!"
```

```bash
# Make script executable
chmod +x ~/update-metacert.sh
```

### 6.3 Setup Monitoring
```bash
# Install htop for system monitoring
sudo apt install htop -y

# Check application status
docker-compose ps
docker-compose logs -f --tail=50

# Monitor system resources
htop

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🚨 **STEP 7: Security Hardening**

### 7.1 Firewall Configuration
```bash
# Enable UFW firewall
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow necessary ports
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Check firewall status
sudo ufw status
```

### 7.2 Automatic Security Updates
```bash
# Install unattended upgrades
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 📊 **STEP 8: Final Verification**

### 8.1 Test Endpoints
```bash
# Test Next.js server
curl -I http://your-domain.com

# Test Express server (through Nginx proxy)
curl -I http://your-domain.com/api/v1/health

# Test HTTPS
curl -I https://your-domain.com
```

### 8.2 Performance Testing
```bash
# Install Apache Bench for testing
sudo apt install apache2-utils -y

# Test performance
ab -n 100 -c 10 https://your-domain.com/
```

---

## 🎯 **Deployment Checklist**

- [ ] GitHub repository created with custom commit dates
- [ ] Docker configuration files created
- [ ] EC2 instance launched and configured
- [ ] RDS MySQL database created
- [ ] Domain DNS pointed to EC2 public IP
- [ ] SSL certificates installed
- [ ] Nginx reverse proxy configured
- [ ] Application containers running
- [ ] Database migrations applied
- [ ] Monitoring setup completed
- [ ] Security hardening applied
- [ ] Backup strategy implemented

---

## 🔄 **Continuous Deployment**

For future updates, simply run:
```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
cd metacert
./update-metacert.sh
```

---

**🎉 Your MetaCert application is now live on AWS with both Next.js and Express servers running in production!**

**Access URLs:**
- **Main Application:** https://your-domain.com
- **API Endpoints:** https://your-domain.com/api/v1/*
- **Health Check:** https://your-domain.com/api/v1/health