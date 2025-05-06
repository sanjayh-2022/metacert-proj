#!/bin/bash
# aws-setup.sh - Complete AWS EC2 setup script for MetaCert

set -e  # Exit on any error

echo "🚀 Setting up MetaCert on AWS EC2..."

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

# Install Git
echo "📂 Installing Git..."
if ! command -v git &> /dev/null; then
    sudo apt install git -y
    echo "✅ Git installed successfully"
else
    echo "✅ Git already installed"
fi

# Install Node.js
echo "📦 Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "✅ Node.js installed successfully"
else
    echo "✅ Node.js already installed"
fi

# Install Nginx
echo "🌐 Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    sudo systemctl enable nginx
    echo "✅ Nginx installed successfully"
else
    echo "✅ Nginx already installed"
fi

# Install Certbot
echo "🔒 Installing Certbot for SSL..."
if ! command -v certbot &> /dev/null; then
    sudo apt install certbot python3-certbot-nginx -y
    echo "✅ Certbot installed successfully"
else
    echo "✅ Certbot already installed"
fi

# Install monitoring tools
echo "📊 Installing monitoring tools..."
sudo apt install htop curl wget unzip -y

# Setup firewall
echo "🛡️ Configuring firewall..."
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000  # Next.js dev port
sudo ufw allow 8080  # Express port

# Create project directory
echo "📁 Creating project directory..."
mkdir -p ~/metacert
cd ~/metacert

# Setup log rotation
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/metacert > /dev/null <<EOF
/home/ubuntu/metacert/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
EOF

# Create basic Nginx configuration
echo "⚙️ Creating basic Nginx configuration..."
sudo tee /etc/nginx/sites-available/metacert > /dev/null <<EOF
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
        client_max_body_size 10M;
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
        client_max_body_size 10M;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/metacert /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Setup automatic security updates
echo "🔒 Setting up automatic security updates..."
sudo apt install unattended-upgrades -y
echo 'Unattended-Upgrade::Automatic-Reboot "false";' | sudo tee -a /etc/apt/apt.conf.d/50unattended-upgrades

# Create helpful aliases
echo "🔧 Setting up helpful aliases..."
cat >> ~/.bashrc << 'EOF'

# MetaCert aliases
alias mc-logs='cd ~/metacert && docker-compose logs -f'
alias mc-status='cd ~/metacert && docker-compose ps'
alias mc-restart='cd ~/metacert && docker-compose restart'
alias mc-update='cd ~/metacert && ./scripts/update-metacert.sh'
alias mc-shell='cd ~/metacert && docker-compose exec app sh'
EOF

# Apply new group membership (for docker)
newgrp docker

echo ""
echo "🎉 AWS EC2 setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Clone your MetaCert repository"
echo "2. Configure your domain in /etc/nginx/sites-available/metacert"
echo "3. Set up your .env.production file"
echo "4. Run docker-compose up --build -d"
echo "5. Configure SSL with certbot"
echo ""
echo "📝 Useful commands:"
echo "  mc-logs     - View application logs"
echo "  mc-status   - Check container status"
echo "  mc-restart  - Restart containers"
echo "  mc-update   - Update deployment"
echo ""
echo "🌐 Don't forget to:"
echo "  - Point your domain to this server's IP: $(curl -s ipinfo.io/ip)"
echo "  - Configure AWS RDS database"
echo "  - Update Google OAuth callback URLs"
echo ""