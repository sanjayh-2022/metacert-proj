# MetaCert Deployment Quick Reference

## 🚀 Complete Setup Steps

### 1. GitHub Setup (Custom Commit Date)
```bash
# Initialize and setup repository
git init
git remote add origin https://github.com/yourusername/metacert.git

# Stage all files
git add .

# Commit with custom date (example: January 1, 2024)
GIT_COMMITTER_DATE="2024-01-01 12:00:00" git commit --date="2024-01-01 12:00:00" -m "Initial MetaCert deployment"

# Push to GitHub
git push -u origin main
```

### 2. AWS EC2 Instance Creation
1. Launch Ubuntu 22.04 LTS instance (t2.micro - Free Tier eligible)
2. Security Groups:
   - SSH (22) - Your IP
   - HTTP (80) - Anywhere
   - HTTPS (443) - Anywhere
3. Key pair for SSH access
4. Storage: 8-10 GB (Free Tier includes 30 GB total)

### 3. AWS RDS MySQL Setup
1. Create MySQL 8.0 instance
2. Instance class: db.t2.micro (Free Tier eligible)
3. Storage: 20 GB (Free Tier limit)
4. Multi-AZ: Disabled (required for Free Tier)
5. Backup retention: 0 days (required for Free Tier)
6. Set master username/password
7. Note endpoint URL
8. Security group: Allow MySQL (3306) from EC2 security group

### 4. Server Setup Commands (Free Tier Optimized)
```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Configure swap for t2.micro (IMPORTANT)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Install Git
sudo apt install git -y

# Clone repository
git clone https://github.com/yourusername/metacert.git
cd metacert
```

### 5. Environment Configuration
```bash
# Create production environment file
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

Required environment variables:
- `DATABASE_URL` - RDS MySQL connection string
- `NEXTAUTH_SECRET` - Random secret key
- `NEXTAUTH_URL` - Your domain URL
- `GOOGLE_CLIENT_ID` - From Google Console
- `GOOGLE_CLIENT_SECRET` - From Google Console

### 6. Deploy Application
```bash
# Build and start containers
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 7. Domain & SSL Setup
```bash
# Update Nginx configuration with your domain
sudo nano /etc/nginx/sites-available/metacert
# Replace server_name _ with server_name yourdomain.com

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL certificate
sudo certbot --nginx -d yourdomain.com
```

### 8. Google OAuth Configuration
Update in Google Cloud Console:
- Authorized origins: `https://yourdomain.com`
- Redirect URIs: `https://yourdomain.com/api/auth/callback/google`

## 🔧 Management Commands

```bash
# Application management
mc-logs      # View logs
mc-status    # Check status
mc-restart   # Restart containers
mc-update    # Update deployment

# Database management
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma db push

# Container management
docker-compose down        # Stop containers
docker-compose up -d      # Start containers
docker-compose restart    # Restart all
```

## 📊 Monitoring

```bash
# System resources
htop

# Disk usage
df -h

# Application logs
tail -f logs/app.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Container stats
docker stats
```

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Test database connection
docker-compose exec app npx prisma db push --preview-feature

# Reset database
docker-compose exec app npx prisma migrate reset
```

### SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Port Issues
```bash
# Check what's using ports
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :8080
```

## 📝 File Locations

- Application: `/home/ubuntu/metacert`
- Logs: `/home/ubuntu/metacert/logs`
- Nginx config: `/etc/nginx/sites-available/metacert`
- SSL certificates: `/etc/letsencrypt/live/yourdomain.com`
- Environment: `/home/ubuntu/metacert/.env.production`

## 🔄 Update Process

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d

# Run database migrations if needed
docker-compose exec app npx prisma migrate deploy
```

## 🎯 Success Checklist

- [ ] EC2 instance running
- [ ] RDS database created
- [ ] Repository cloned
- [ ] Environment configured
- [ ] Containers running
- [ ] Nginx configured
- [ ] SSL certificate installed
- [ ] Google OAuth updated
- [ ] Application accessible via domain
- [ ] Authentication working
- [ ] Database connected

## 📞 Support

If you encounter issues:
1. Check container logs: `mc-logs`
2. Verify environment variables
3. Test database connection
4. Check Nginx configuration
5. Verify SSL certificate
6. Review Google OAuth settings