#!/bin/bash
# update-metacert.sh - Deployment update script

set -e  # Exit on any error

echo "🚀 Starting MetaCert deployment update..."

# Change to project directory
cd /home/ubuntu/metacert

echo "📥 Pulling latest changes from GitHub..."
git pull origin main

echo "🛑 Stopping current containers..."
docker-compose down

echo "🔨 Building updated containers..."
docker-compose up --build -d

echo "⏳ Waiting for containers to start..."
sleep 30

echo "🗄️ Running database migrations..."
docker-compose exec -T app npx prisma db push

echo "📊 Checking container status..."
docker-compose ps

echo "📝 Showing recent logs..."
docker-compose logs --tail=20

echo "✅ Deployment update complete!"
echo "🌐 Application should be available at: https://your-domain.com"

# Health check
echo "🏥 Performing health check..."
if curl -f -s https://your-domain.com > /dev/null; then
    echo "✅ Health check passed - Application is responding"
else
    echo "❌ Health check failed - Please investigate"
    docker-compose logs --tail=50
fi