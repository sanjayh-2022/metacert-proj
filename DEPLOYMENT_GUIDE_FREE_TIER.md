# MetaCert Deployment Guide - AWS Free Tier Edition

## 🚀 Complete AWS EC2 Deployment with Docker (Free Tier Optimized)

This guide covers the complete deployment process for MetaCert application optimized for AWS Free Tier usage with both Next.js and Express servers running in containers.

### ⚠️ AWS Free Tier Limitations
- **EC2**: 750 hours/month of t2.micro instances (1 vCPU, 1 GB RAM)
- **RDS**: 750 hours/month of db.t2.micro instances
- **Data Transfer**: 15 GB outbound per month
- **EBS Storage**: 30 GB gp2 per month
- **RDS Storage**: 20 GB per month
- **Monitor usage** in AWS Cost Explorer to avoid charges

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

# AWS
.aws/

# Docker
.dockerignore

# Uploads (for development)
uploads/*
!uploads/.gitkeep
```

### 1.2 Initialize Git with Custom Commit Date
```bash
# Initialize repository
git init

# Add remote origin (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/metacert.git

# Stage all files
git add .

# Commit with custom date (example: setting to January 1, 2024)
# Format: YYYY-MM-DD HH:MM:SS
GIT_COMMITTER_DATE="2024-01-01 12:00:00" git commit --date="2024-01-01 12:00:00" -m "Initial MetaCert deployment - Free Tier optimized"

# Push to GitHub
git push -u origin main

# If you want multiple commits with different dates:
# git add new_file.js
# GIT_COMMITTER_DATE="2024-01-15 10:30:00" git commit --date="2024-01-15 10:30:00" -m "Add new feature"
# git push
```

---

## 🛠️ **STEP 2: Docker Configuration (Memory Optimized)**

### 2.1 Create Free Tier Optimized Dockerfile
```dockerfile
# Dockerfile - Optimized for t2.micro (1GB RAM)
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY contracts/package*.json ./contracts/

# Install dependencies with memory optimization
RUN npm ci --only=production --no-audit --prefer-offline

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js with memory limits for t2.micro
ENV NODE_OPTIONS="--max-old-space-size=512"
RUN npm run build

# Production image, copy all the files and run next
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/app.js ./app.js
COPY --from=builder /app/contracts ./contracts

# Create directories for uploads and logs
RUN mkdir -p uploads logs && chown nextjs:nodejs uploads logs

# Install PM2 globally
RUN npm install -g pm2

# Copy PM2 configuration
COPY ecosystem.config.js .

USER nextjs

EXPOSE 3000 8080

# Start both servers with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
```

### 2.2 Create Memory-Optimized PM2 Configuration
```javascript
// ecosystem.config.js - Optimized for t2.micro
module.exports = {
  apps: [
    {
      name: 'metacert-nextjs',
      script: 'npm',
      args: 'start',
      cwd: '/app',
      instances: 1, // Single instance for t2.micro
      exec_mode: 'fork', // Fork mode uses less memory than cluster
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NODE_OPTIONS: '--max-old-space-size=300' // Limit to 300MB
      },
      max_memory_restart: '400M', // Restart if memory exceeds 400MB
      error_file: '/app/logs/nextjs-error.log',
      out_file: '/app/logs/nextjs-out.log',
      log_file: '/app/logs/nextjs-combined.log',
      time: true
    },
    {
      name: 'metacert-express',
      script: '/app/app.js',
      cwd: '/app',
      instances: 1, // Single instance for t2.micro
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 8080,
        NODE_OPTIONS: '--max-old-space-size=200' // Limit to 200MB
      },
      max_memory_restart: '300M', // Restart if memory exceeds 300MB
      error_file: '/app/logs/express-error.log',
      out_file: '/app/logs/express-out.log',
      log_file: '/app/logs/express-combined.log',
      time: true
    }
  ]
};
```

### 2.3 Create Lightweight Docker Compose
```yaml
# docker-compose.yml - Free Tier optimized
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
    # Memory limits for t2.micro
    deploy:
      resources:
        limits:
          memory: 800M # Leave 200MB for system
        reservations:
          memory: 400M
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

# Note: Using external RDS instead of local MySQL to save memory
```

---

## 🌐 **STEP 3: AWS Infrastructure Setup (Free Tier)**

### 3.1 Create AWS EC2 Instance (Free Tier)

**Launch EC2 Instance:**
1. **AMI:** Ubuntu Server 22.04 LTS (Free Tier eligible)
2. **Instance Type:** `t2.micro` (1 vCPU, 1 GB RAM) ⚠️ IMPORTANT: Only this is Free Tier eligible
3. **Storage:** 8-10 GB gp2 (Free Tier includes 30 GB total)
4. **Security Group:** 
   - SSH (22) - Your IP only
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0
5. **Key Pair:** Create or use existing for SSH access

**Security Group Configuration:**
```
Type        Protocol    Port    Source          Description
SSH         TCP         22      Your-IP/32      SSH access
HTTP        TCP         80      0.0.0.0/0       HTTP access
HTTPS       TCP         443     0.0.0.0/0       HTTPS access
```

### 3.2 Setup EC2 Instance (Memory Optimized)
```bash
# Connect to your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker (optimized installation)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
rm get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install essential tools only
sudo apt install git htop curl -y

# Configure swap for t2.micro (important for builds)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Optimize system for low memory
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

### 3.3 Setup AWS RDS MySQL Database (Free Tier)

**RDS Configuration for Free Tier:**
1. **Engine:** MySQL 8.0
2. **Instance Class:** `db.t2.micro` ⚠️ IMPORTANT: Only this is Free Tier eligible
3. **Storage:** 20 GB gp2 (Free Tier limit)
4. **Multi-AZ:** No (required for Free Tier)
5. **Backup Retention:** 0 days (required for Free Tier)
6. **VPC:** Same as EC2 instance
7. **Public Access:** No
8. **Database Name:** metacert
9. **Username:** admin
10. **Password:** Generate strong password

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
nano .env.production
```

### 4.2 Production Environment Variables (Free Tier)
```bash
# .env.production
NODE_ENV=production

# Database (Use RDS endpoint)
DATABASE_URL="mysql://admin:your-password@your-rds-endpoint:3306/metacert"

# Auth Configuration
NEXTAUTH_URL="http://your-ec2-public-ip:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Google OAuth (update in Google Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Blockchain Configuration
NEXT_PUBLIC_ALCHEMY_SEPOLIA_API="your-alchemy-api-key"
NEXT_PUBLIC_SMART_CONTRACT_ADDRESS="your-contract-address"
JWT_SECRET="your-jwt-secret"
NEXT_PUBLIC_ACCOUNT_PRIVATE_KEY="your-private-key"
```

### 4.3 Build and Deploy
```bash
# Build with memory optimization
export NODE_OPTIONS="--max-old-space-size=512"

# Build and start services
docker-compose up --build -d

# Check if services are running
docker-compose ps

# Monitor logs
docker-compose logs -f
```

### 4.4 Setup Nginx (Lightweight Configuration)
```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration for MetaCert
sudo tee /etc/nginx/sites-available/metacert > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or EC2 public IP

    # Increase client max body size for file uploads
    client_max_body_size 10M;

    # Next.js Application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings for t2.micro
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Express API
    location /api/v1/ {
        proxy_pass http://localhost:8080/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings for t2.micro
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}
EOF

# Enable the site and remove default
sudo ln -sf /etc/nginx/sites-available/metacert /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and start Nginx
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
```

---

## 🔒 **STEP 5: SSL Configuration (Optional - Let's Encrypt)**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Auto-renewal setup
sudo systemctl enable certbot.timer
```

---

## 📊 **STEP 6: Monitoring and Maintenance (Free Tier)**

### 6.1 Basic Monitoring Commands
```bash
# Check system resources
htop

# Check memory usage
free -h

# Check disk usage
df -h

# Check Docker containers
docker-compose ps
docker stats

# Check application logs
docker-compose logs app --tail=50

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 6.2 Memory Management for t2.micro
```bash
# Monitor memory usage every 5 minutes
*/5 * * * * /usr/bin/free -m | awk 'NR==2{printf "Memory Usage: %s/%sMB (%.2f%%)\n", $3,$2,$3*100/$2}' >> /var/log/memory-usage.log

# Clean Docker system when needed
docker system prune -f

# Restart containers if memory gets low
if [ $(free | awk 'FNR == 2 {print int($3/$2*100)}') -gt 85 ]; then
    docker-compose restart
fi
```

### 6.3 Useful Aliases for Management
```bash
# Add to ~/.bashrc
echo "alias mc-logs='cd ~/metacert && docker-compose logs -f'" >> ~/.bashrc
echo "alias mc-status='cd ~/metacert && docker-compose ps'" >> ~/.bashrc
echo "alias mc-restart='cd ~/metacert && docker-compose restart'" >> ~/.bashrc
echo "alias mc-update='cd ~/metacert && git pull && docker-compose up --build -d'" >> ~/.bashrc
echo "alias mc-stats='docker stats'" >> ~/.bashrc
echo "alias mc-memory='free -h && df -h'" >> ~/.bashrc

# Reload bashrc
source ~/.bashrc
```

---

## 🚨 **STEP 7: Troubleshooting (Free Tier Specific)**

### Common Issues with t2.micro:

**1. Out of Memory Errors:**
```bash
# Check memory usage
free -h

# Restart containers
docker-compose restart

# Clear system cache
sudo sync && echo 3 | sudo tee /proc/sys/vm/drop_caches
```

**2. Build Failures:**
```bash
# Build with reduced memory
export NODE_OPTIONS="--max-old-space-size=400"
docker-compose build --no-cache

# Or build without parallel processes
docker-compose build --parallel 1
```

**3. Slow Performance:**
```bash
# Enable swap if not already done
sudo swapon --show

# Optimize Docker for low memory
echo '{"log-driver": "json-file", "log-opts": {"max-size": "10m", "max-file": "3"}}' | sudo tee /etc/docker/daemon.json
sudo systemctl restart docker
```

---

## 💰 **STEP 8: Cost Monitoring**

### Free Tier Usage Monitoring:
1. **AWS Cost Explorer:** Monitor your usage
2. **CloudWatch:** Set up billing alerts
3. **EC2 Dashboard:** Check instance usage hours
4. **RDS Dashboard:** Monitor database hours

### Billing Alerts Setup:
1. Go to AWS Billing Dashboard
2. Create billing alert for $1 threshold
3. Monitor data transfer usage
4. Set up SNS notifications

---

## ✅ **Success Checklist**

- [ ] GitHub repository created with custom commit dates
- [ ] EC2 t2.micro instance launched
- [ ] RDS db.t2.micro database created
- [ ] Docker and Docker Compose installed
- [ ] Swap file configured (important for t2.micro)
- [ ] Application deployed and running
- [ ] Nginx configured as reverse proxy
- [ ] SSL certificate installed (optional)
- [ ] Monitoring setup
- [ ] Billing alerts configured

## 🎯 **Free Tier Optimization Tips**

1. **Use only t2.micro and db.t2.micro instances**
2. **Monitor your 750 hours/month limit**
3. **Stop instances when not needed**
4. **Use swap file for memory optimization**
5. **Minimize data transfer**
6. **Use CloudWatch free tier for monitoring**
7. **Set up billing alerts**

Your MetaCert application is now deployed on AWS Free Tier! The setup is optimized for the 1GB RAM limitation of t2.micro instances while maintaining full functionality.