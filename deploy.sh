#!/bin/bash
# Ice Cold Beer SP1 - Server Deployment Script
# Run this on your Ubuntu server after cloning the repo

set -e  # Exit on error

echo "=== Ice Cold Beer SP1 Deployment ==="
echo

# Update system
echo "1. Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install Nginx
echo "2. Installing Nginx..."
sudo apt install nginx -y

# Create directory structure
echo "3. Creating directory structure..."
cd ~
git clone https://github.com/NoCritics/ice-cold-beer-sp1.git ice-cold-beer
cd ice-cold-beer

# Create public directory and move game files
mkdir -p public
cp index.html game.js style.css public/

# Configure Nginx
echo "4. Configuring Nginx..."
sudo tee /etc/nginx/sites-available/ice-cold-beer << 'EOF'
server {
    listen 80;
    server_name succylongtimegames.space www.succylongtimegames.space;

    root /home/ubuntu/ice-cold-beer/public;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Future API proxy (for SP1 backend)
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/ice-cold-beer /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
echo "5. Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx
echo "6. Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Install Certbot for SSL
echo "7. Installing Certbot for SSL..."
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
echo "8. Obtaining SSL certificate..."
sudo certbot --nginx -d succylongtimegames.space -d www.succylongtimegames.space --non-interactive --agree-tos --email vladislavkd99@gmail.com

# Create directories for future SP1 development
echo "9. Creating SP1 development directories..."
mkdir -p server sp1-program sp1-script

echo
echo "=== Deployment Complete! ==="
echo "Your game should now be accessible at:"
echo "https://succylongtimegames.space"
echo
echo "Next steps for SP1 integration:"
echo "1. Install Rust: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
echo "2. Install SP1: curl -L https://sp1up.succinct.xyz | bash"
echo "3. Install Node.js for the API server"
echo
