#!/bin/bash
set -e

echo "========================================"
echo "TRNG.le Website Deployment Script"
echo "========================================"

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo "Docker installed. Please log out and back in, then run this script again."
    exit 1
fi

# Check if docker compose is available
if ! docker compose version &> /dev/null; then
    echo "Docker Compose not found. Installing..."
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
fi

# Create certbot directories
mkdir -p certbot/conf certbot/www

# Step 1: Get SSL certificate first (if not already done)
if [ ! -f "certbot/conf/live/trngle.xyz/fullchain.pem" ]; then
    echo ""
    echo "Step 1: Getting SSL certificate..."
    echo "Using initial nginx config for certificate request..."
    
    # Use the init config for getting certificate
    cp nginx-init.conf nginx.conf.bak
    cp nginx-init.conf nginx.conf
    
    # Start nginx with init config
    docker compose up -d nginx
    
    # Wait for nginx to start
    sleep 5
    
    # Get certificate
    echo "Requesting SSL certificate from Let's Encrypt..."
    docker compose run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email admin@trngle.xyz \
        --agree-tos \
        --no-eff-email \
        -d trngle.xyz \
        -d www.trngle.xyz
    
    # Stop nginx
    docker compose down
    
    # Restore full nginx config
    mv nginx.conf.bak nginx.conf
    
    echo "SSL certificate obtained!"
else
    echo "SSL certificate already exists."
fi

# Step 2: Build and start the application
echo ""
echo "Step 2: Building and starting the application..."
docker compose build --no-cache
docker compose up -d

echo ""
echo "========================================"
echo "Deployment complete!"
echo "========================================"
echo ""
echo "Your website should now be available at:"
echo "  https://trngle.xyz"
echo "  https://www.trngle.xyz"
echo ""
echo "Useful commands:"
echo "  docker compose logs -f      # View logs"
echo "  docker compose down         # Stop services"
echo "  docker compose up -d        # Start services"
echo "  docker compose restart      # Restart services"
echo ""
