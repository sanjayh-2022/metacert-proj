#!/bin/bash
# aws-setup-free-tier.sh - Complete AWS EC2 setup script for MetaCert (Free Tier Optimized)

set -e  # Exit on any error

echo "🚀 Setting up MetaCert on AWS EC2 Free Tier (t2.micro)..."

# Check if running on t2.micro
INSTANCE_TYPE=$(curl -s http://169.254.169.254/latest/meta-data/instance-type)
if [ "$INSTANCE_TYPE" != "t2.micro" ]; then
    echo "⚠️  Warning: You're not running on t2.micro. This script is optimized for Free Tier t2.micro instances."
fi

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installed successfully"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
echo "🐙 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed successfully"
else
    echo "✅ Docker Compose already installed"
fi

# Install essential tools only (memory optimization)
echo "📦 Installing essential tools..."
sudo apt install git htop curl -y

# Configure swap for t2.micro (CRITICAL for 1GB RAM)
echo "💾 Configuring swap file for t2.micro..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 1G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ 1GB swap file created and activated"
else
    echo "✅ Swap file already exists"
fi

# Optimize system for low memory
echo "⚙️ Optimizing system for t2.micro..."
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Configure Docker for low memory
echo "🐳 Optimizing Docker for t2.micro..."
sudo mkdir -p /etc/docker
cat << 'EOF' | sudo tee /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF

# Install Nginx (lightweight web server)
echo "🌐 Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    sudo systemctl enable nginx
    echo "✅ Nginx installed successfully"
else
    echo "✅ Nginx already installed"
fi

# Setup firewall (minimal for t2.micro)
echo "🛡️ Configuring firewall..."
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Create project directory
echo "📁 Creating project directory..."
mkdir -p ~/metacert/logs
cd ~/metacert

# Setup log rotation (important for limited storage)
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/metacert > /dev/null <<EOF
/home/ubuntu/metacert/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
    maxsize 50M
}
EOF

# Create memory-optimized Nginx configuration
echo "⚙️ Creating optimized Nginx configuration..."
sudo tee /etc/nginx/sites-available/metacert > /dev/null <<EOF
# Nginx configuration optimized for t2.micro
worker_processes 1;
worker_rlimit_nofile 1024;

events {
    worker_connections 512;
    use epoll;
    multi_accept on;
}

http {
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 30;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    server {
        listen 80;
        server_name _;  # Replace with your domain

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
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/metacert /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Create helpful aliases optimized for Free Tier
echo "🔧 Setting up helpful aliases..."
cat >> ~/.bashrc << 'EOF'

# MetaCert aliases for Free Tier
alias mc-logs='cd ~/metacert && docker-compose logs -f --tail=50'
alias mc-status='cd ~/metacert && docker-compose ps && echo "=== MEMORY USAGE ===" && free -h'
alias mc-restart='cd ~/metacert && docker-compose restart'
alias mc-update='cd ~/metacert && git pull && docker-compose up --build -d'
alias mc-shell='cd ~/metacert && docker-compose exec app sh'
alias mc-memory='free -h && df -h && docker stats --no-stream'
alias mc-clean='docker system prune -f && sudo sync && echo 3 | sudo tee /proc/sys/vm/drop_caches'
alias mc-backup='cd ~/metacert && tar -czf backup-$(date +%Y%m%d).tar.gz --exclude=node_modules .'
EOF

# Create memory monitoring script
echo "📊 Setting up memory monitoring..."
cat > ~/metacert/monitor-memory.sh << 'EOF'
#!/bin/bash
# Memory monitoring for t2.micro

MEMORY_USAGE=$(free | awk 'FNR == 2 {print int($3/$2*100)}')
DISK_USAGE=$(df / | awk 'FNR == 2 {print int($5)}' | sed 's/%//')

echo "$(date): Memory: ${MEMORY_USAGE}%, Disk: ${DISK_USAGE}%" >> ~/metacert/logs/system-usage.log

# Restart containers if memory usage is too high
if [ $MEMORY_USAGE -gt 85 ]; then
    echo "$(date): High memory usage detected (${MEMORY_USAGE}%). Restarting containers..." >> ~/metacert/logs/system-usage.log
    cd ~/metacert && docker-compose restart
fi

# Clean Docker if disk usage is high
if [ $DISK_USAGE -gt 80 ]; then
    echo "$(date): High disk usage detected (${DISK_USAGE}%). Cleaning Docker..." >> ~/metacert/logs/system-usage.log
    docker system prune -f
fi
EOF

chmod +x ~/metacert/monitor-memory.sh

# Add memory monitoring to crontab
echo "⏰ Setting up automated monitoring..."
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/ubuntu/metacert/monitor-memory.sh") | crontab -

# Create Free Tier environment template
echo "📝 Creating environment template..."
cat > ~/metacert/.env.free-tier-template << 'EOF'
# MetaCert Production Environment - Free Tier Optimized
NODE_ENV=production

# Database (Replace with your RDS endpoint)
DATABASE_URL="mysql://admin:your-password@your-rds-endpoint.region.rds.amazonaws.com:3306/metacert"

# Auth Configuration (Replace with your domain or EC2 public IP)
NEXTAUTH_URL="http://your-ec2-public-ip:3000"
NEXTAUTH_SECRET="generate-a-super-secret-key-here"

# Google OAuth (Configure in Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Blockchain Configuration
NEXT_PUBLIC_ALCHEMY_SEPOLIA_API="your-alchemy-api-key"
NEXT_PUBLIC_SMART_CONTRACT_ADDRESS="your-contract-address"
JWT_SECRET="your-jwt-secret"
NEXT_PUBLIC_ACCOUNT_PRIVATE_KEY="your-private-key"

# Free Tier Memory Optimization
NODE_OPTIONS="--max-old-space-size=512"
EOF

# Apply new group membership (for docker)
newgrp docker 2>/dev/null || true

echo ""
echo "🎉 AWS EC2 Free Tier setup complete!"
echo ""
echo "📊 Current System Status:"
echo "Instance Type: $INSTANCE_TYPE"
free -h | head -2
df -h | head -2
echo ""
echo "📋 Next steps:"
echo "1. Clone your MetaCert repository to ~/metacert"
echo "2. Configure your domain in /etc/nginx/sites-available/metacert"
echo "3. Copy and configure .env.free-tier-template to .env.production"
echo "4. Run docker-compose up --build -d"
echo "5. Monitor memory usage with 'mc-memory'"
echo ""
echo "📝 Free Tier Management Commands:"
echo "  mc-logs     - View application logs"
echo "  mc-status   - Check container status + memory"
echo "  mc-restart  - Restart containers"
echo "  mc-memory   - Check memory and disk usage"
echo "  mc-clean    - Clean Docker and free memory"
echo ""
echo "🌐 Your EC2 Public IP: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'Unable to detect')"
echo ""
echo "⚠️ Free Tier Reminders:"
echo "  - Monitor your 750 hours/month EC2 usage"
echo "  - Monitor your 750 hours/month RDS usage"
echo "  - Keep data transfer under 15 GB/month"
echo "  - Set up billing alerts in AWS console"
echo ""