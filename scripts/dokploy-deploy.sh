#!/bin/bash
# ==========================================
# TILLAS.EC — Dokploy Production Deployment Script
# Automated setup for Oracle Cloud (158.247.126.105)
# ==========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Functions
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

# Banner
echo ""
echo -e "${BLUE}==========================================${NC}"
echo -e "${GREEN}  TILLAS.EC - Dokploy Production Setup${NC}"
echo -e "${BLUE}  Oracle Cloud: 158.247.126.105${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ] && [ "$(uname)" != "Darwin" ]; then 
    print_warning "This script should be run with sudo on the server"
    print_info "For local setup, you can run without sudo"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# ==========================================
# STEP 1: Verify Prerequisites
# ==========================================
print_info "STEP 1: Checking prerequisites..."

if command -v docker &> /dev/null; then
    print_status "Docker installed: $(docker --version)"
else
    print_error "Docker not installed. Please run setup-server.sh first"
    exit 1
fi

if command -v docker compose &> /dev/null || docker compose version &> /dev/null; then
    print_status "Docker Compose installed"
else
    print_error "Docker Compose not installed. Please run setup-server.sh first"
    exit 1
fi

# ==========================================
# STEP 2: Create Project Structure
# ==========================================
print_info "STEP 2: Creating project structure..."

PROJECT_DIR="/opt/tillas-ec"
if [ -d "$PROJECT_DIR" ]; then
    print_warning "Directory $PROJECT_DIR already exists"
else
    mkdir -p $PROJECT_DIR/{backups,logs,scripts,config}
    print_status "Project structure created at $PROJECT_DIR"
fi

# ==========================================
# STEP 3: Clone Repository
# ==========================================
print_info "STEP 3: Setting up repository..."

cd $PROJECT_DIR

# Check if already a git repo
if [ -d ".git" ]; then
    print_warning "Git repository already initialized"
    read -p "Pull latest changes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git pull origin main
        print_status "Repository updated"
    fi
else
    read -p "Enter your Git repository URL: " GIT_URL
    if [ -n "$GIT_URL" ]; then
        git clone $GIT_URL .
        print_status "Repository cloned"
    else
        print_warning "Skipping repository clone. Please clone manually."
    fi
fi

# ==========================================
# STEP 4: Generate Secure Credentials
# ==========================================
print_info "STEP 4: Generating secure credentials..."

CREDENTIALS_FILE="$PROJECT_DIR/credentials.txt"

if [ -f "$CREDENTIALS_FILE" ]; then
    print_warning "Credentials file already exists"
    read -p "Overwrite? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Using existing credentials"
        source <(grep '=' $CREDENTIALS_FILE | sed 's/export //g')
    else
        # Generate new credentials
        JWT_SECRET=$(openssl rand -base64 32)
        JWT_REFRESH_SECRET=$(openssl rand -base64 32)
        DB_PASSWORD=$(openssl rand -base64 24 | tr -d '=' | cut -c1-32)
        REDIS_PASSWORD=$(openssl rand -base64 24 | tr -d '=' | cut -c1-32)
        MINIO_ACCESS_KEY=$(openssl rand -hex 16)
        MINIO_SECRET_KEY=$(openssl rand -base64 24 | tr -d '=' | cut -c1-32)
        SESSION_SECRET=$(openssl rand -base64 32)
        
        # Save credentials
        cat > $CREDENTIALS_FILE << EOF
==========================================
TILLAS.EC — Generated Credentials
Date: $(date)
Server: 158.247.126.105
==========================================

JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
DB_PASSWORD=$DB_PASSWORD
REDIS_PASSWORD=$REDIS_PASSWORD
MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY
MINIO_SECRET_KEY=$MINIO_SECRET_KEY
SESSION_SECRET=$SESSION_SECRET

⚠️  IMPORTANT: Store these credentials securely
⚠️  DO NOT commit this file to Git
⚠️  Update .env.production with these values
EOF
        
        chmod 600 $CREDENTIALS_FILE
        print_status "New credentials generated and saved to: $CREDENTIALS_FILE"
    fi
else
    # Generate new credentials
    JWT_SECRET=$(openssl rand -base64 32)
    JWT_REFRESH_SECRET=$(openssl rand -base64 32)
    DB_PASSWORD=$(openssl rand -base64 24 | tr -d '=' | cut -c1-32)
    REDIS_PASSWORD=$(openssl rand -base64 24 | tr -d '=' | cut -c1-32)
    MINIO_ACCESS_KEY=$(openssl rand -hex 16)
    MINIO_SECRET_KEY=$(openssl rand -base64 24 | tr -d '=' | cut -c1-32)
    SESSION_SECRET=$(openssl rand -base64 32)
    
    # Save credentials
    cat > $CREDENTIALS_FILE << EOF
==========================================
TILLAS.EC — Generated Credentials
Date: $(date)
Server: 158.247.126.105
==========================================

JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
DB_PASSWORD=$DB_PASSWORD
REDIS_PASSWORD=$REDIS_PASSWORD
MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY
MINIO_SECRET_KEY=$MINIO_SECRET_KEY
SESSION_SECRET=$SESSION_SECRET

⚠️  IMPORTANT: Store these credentials securely
⚠️  DO NOT commit this file to Git
⚠️  Update .env.production with these values
EOF
    
    chmod 600 $CREDENTIALS_FILE
    print_status "Credentials generated and saved to: $CREDENTIALS_FILE"
fi

# ==========================================
# STEP 5: Setup Environment File
# ==========================================
print_info "STEP 5: Configuring environment..."

ENV_FILE="$PROJECT_DIR/.env"

if [ -f "$ENV_FILE" ]; then
    print_warning ".env file already exists"
    read -p "Overwrite with production template? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env.production $ENV_FILE 2>/dev/null || cp .env.example $ENV_FILE
        print_status "Environment file created from template"
    fi
else
    if [ -f ".env.production" ]; then
        cp .env.production $ENV_FILE
    elif [ -f ".env.example" ]; then
        cp .env.example $ENV_FILE
    else
        print_error "No environment template found"
        exit 1
    fi
    print_status "Environment file created"
fi

# Update .env with generated credentials if available
if [ -f "$CREDENTIALS_FILE" ]; then
    print_info "Updating .env with generated credentials..."
    
    sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|g" $ENV_FILE
    sed -i "s|REDIS_PASSWORD=.*|REDIS_PASSWORD=$REDIS_PASSWORD|g" $ENV_FILE
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" $ENV_FILE
    sed -i "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|g" $ENV_FILE
    sed -i "s|MINIO_ACCESS_KEY=.*|MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY|g" $ENV_FILE
    sed -i "s|MINIO_SECRET_KEY=.*|MINIO_SECRET_KEY=$MINIO_SECRET_KEY|g" $ENV_FILE
    sed -i "s|SESSION_SECRET=.*|SESSION_SECRET=$SESSION_SECRET|g" $ENV_FILE
    
    print_status "Environment updated with credentials"
fi

# ==========================================
# STEP 6: Configure Dokploy Project
# ==========================================
print_info "STEP 6: Creating Dokploy configuration..."

# Create dokploy.json configuration file
cat > $PROJECT_DIR/dokploy.json << 'EOF'
{
  "project": {
    "name": "tillas-ec",
    "description": "E-commerce platform - Tillas.ec",
    "repository": {
      "type": "git",
      "branch": "main"
    }
  },
  "deployment": {
    "type": "docker-compose",
    "composeFile": "docker-compose.dokploy.yml",
    "environment": "production"
  },
  "domains": {
    "web": "tillas.ec",
    "api": "api.tillas.ec",
    "admin": "admin.tillas.ec",
    "media": "media.tillas.ec",
    "mediaConsole": "media-console.tillas.ec"
  },
  "services": {
    "api": {
      "port": 4000,
      "healthCheck": "/health",
      "resources": {
        "cpu": "1.5",
        "memory": "2G"
      }
    },
    "web": {
      "port": 3000,
      "healthCheck": "/",
      "resources": {
        "cpu": "1",
        "memory": "1G"
      }
    },
    "admin": {
      "port": 3001,
      "healthCheck": "/",
      "resources": {
        "cpu": "1",
        "memory": "1G"
      }
    },
    "postgres": {
      "port": 5432,
      "resources": {
        "cpu": "1",
        "memory": "2G"
      }
    },
    "redis": {
      "port": 6379,
      "resources": {
        "cpu": "0.5",
        "memory": "1G"
      }
    },
    "minio": {
      "apiPort": 9000,
      "consolePort": 9001,
      "resources": {
        "cpu": "0.5",
        "memory": "1G"
      }
    }
  },
  "ssl": {
    "enabled": true,
    "provider": "letsencrypt",
    "email": "admin@tillas.ec"
  },
  "backup": {
    "enabled": true,
    "schedule": "0 2 * * *",
    "retention": 7
  }
}
EOF

print_status "Dokploy configuration created: dokploy.json"

# ==========================================
# STEP 7: Setup Backup System
# ==========================================
print_info "STEP 7: Configuring backup system..."

BACKUP_SCRIPT="$PROJECT_DIR/scripts/backup.sh"
cat > $BACKUP_SCRIPT << 'BACKUP_EOF'
#!/bin/bash
# ==========================================
# TILLAS.EC — Automated PostgreSQL Backup
# ==========================================

BACKUP_DIR="/opt/tillas-ec/backups"
LOG_FILE="/opt/tillas-ec/logs/backup.log"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/tillas_$TIMESTAMP.sql.gz"
RETENTION_DAYS=7

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Log start
echo "[$(date)] Starting backup..." >> $LOG_FILE

# Perform backup
if docker exec tillas-db pg_dump -U tillas_user tillas | gzip > $BACKUP_FILE 2>>$LOG_FILE; then
    BACKUP_SIZE=$(du -h $BACKUP_FILE | cut -f1)
    echo "[$(date)] Backup completed: $BACKUP_FILE ($BACKUP_SIZE)" >> $LOG_FILE
else
    echo "[$(date)] ERROR: Backup failed" >> $LOG_FILE
    exit 1
fi

# Clean old backups
echo "[$(date)] Cleaning backups older than $RETENTION_DAYS days..." >> $LOG_FILE
find $BACKUP_DIR -name "tillas_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print >> $LOG_FILE 2>&1

echo "[$(date)] Backup process completed" >> $LOG_FILE
echo "" >> $LOG_FILE
BACKUP_EOF

chmod +x $BACKUP_SCRIPT
print_status "Backup script created"

# Setup cron job for daily backups at 2 AM
if crontab -l 2>/dev/null | grep -q "backup.sh"; then
    print_warning "Backup cron job already exists"
else
    (crontab -l 2>/dev/null; echo "0 2 * * * $BACKUP_SCRIPT") | crontab -
    print_status "Daily backup scheduled at 2:00 AM"
fi

# ==========================================
# STEP 8: Create Management Scripts
# ==========================================
print_info "STEP 8: Creating management scripts..."

# Deploy script
cat > $PROJECT_DIR/scripts/deploy.sh << 'EOF'
#!/bin/bash
# TILLAS.EC - Deploy Script
echo "🚀 Deploying TILLAS.EC..."

cd /opt/tillas-ec

# Pull latest changes
git pull origin main

# Deploy with Docker Compose
docker compose -f docker-compose.dokploy.yml down
docker compose -f docker-compose.dokploy.yml up -d --build

# Wait for services to start
echo "Waiting for services to start..."
sleep 30

# Run database migrations
echo "Running database migrations..."
docker exec tillas-api npx prisma migrate deploy

# Check service health
echo ""
echo "Service Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✓ Deployment completed!"
echo "Check logs: docker logs -f tillas-api"
EOF

chmod +x $PROJECT_DIR/scripts/deploy.sh

# Logs script
cat > $PROJECT_DIR/scripts/logs.sh << 'EOF'
#!/bin/bash
# TILLAS.EC - View Logs
SERVICE=${1:-all}

case $SERVICE in
  api)
    docker logs -f tillas-api --tail 100
    ;;
  web)
    docker logs -f tillas-web --tail 100
    ;;
  admin)
    docker logs -f tillas-admin --tail 100
    ;;
  db|postgres)
    docker logs -f tillas-db --tail 100
    ;;
  redis)
    docker logs -f tillas-redis --tail 100
    ;;
  minio)
    docker logs -f tillas-minio --tail 100
    ;;
  all)
    echo "=== API Logs ==="
    docker logs tillas-api --tail 20
    echo ""
    echo "=== Web Logs ==="
    docker logs tillas-web --tail 20
    echo ""
    echo "=== Admin Logs ==="
    docker logs tillas-admin --tail 20
    echo ""
    echo "=== Database Logs ==="
    docker logs tillas-db --tail 20
    ;;
  *)
    echo "Usage: $0 {api|web|admin|db|redis|minio|all}"
    exit 1
    ;;
esac
EOF

chmod +x $PROJECT_DIR/scripts/logs.sh

# Status script
cat > $PROJECT_DIR/scripts/status.sh << 'EOF'
#!/bin/bash
# TILLAS.EC - System Status
echo "========================================"
echo "  TILLAS.EC - System Status"
echo "========================================"
echo ""

echo "📦 Running Containers:"
echo "----------------------------------------"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "💾 Resource Usage:"
echo "----------------------------------------"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
echo ""

echo "🔍 Health Checks:"
echo "----------------------------------------"
for container in tillas-api tillas-web tillas-db tillas-redis tillas-minio; do
    if docker inspect --format='{{.State.Health.Status}}' $container 2>/dev/null; then
        echo "  $container: $(docker inspect --format='{{.State.Health.Status}}' $container 2>/dev/null)"
    else
        echo "  $container: no health check"
    fi
done
echo ""

echo "🌐 URLs:"
echo "----------------------------------------"
echo "  Web: https://tillas.ec"
echo "  API: https://api.tillas.ec"
echo "  Admin: https://admin.tillas.ec"
echo "  Minio: https://media.tillas.ec"
echo "  Dokploy: http://158.247.126.105:3000"
echo ""

echo "📊 Disk Usage:"
echo "----------------------------------------"
du -sh /opt/tillas-ec/backups 2>/dev/null || echo "  No backups yet"
docker system df
echo ""

echo "========================================"
EOF

chmod +x $PROJECT_DIR/scripts/status.sh

print_status "Management scripts created in $PROJECT_DIR/scripts/"

# ==========================================
# STEP 9: Create Post-Deployment Script
# ==========================================
print_info "STEP 9: Creating post-deployment setup..."

cat > $PROJECT_DIR/scripts/post-deploy.sh << 'EOF'
#!/bin/bash
# ==========================================
# TILLAS.EC — Post-Deployment Setup
# Run this after initial deployment
# ==========================================

set -e

echo "🔧 Running post-deployment setup..."

# 1. Run Prisma migrations
echo ""
echo "1️⃣  Running database migrations..."
docker exec tillas-api npx prisma migrate deploy
echo "✓ Migrations completed"

# 2. Seed database
echo ""
echo "2️⃣  Seeding database..."
read -p "Run database seed? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker exec tillas-api npx prisma db seed
    echo "✓ Database seeded"
fi

# 3. Create admin user
echo ""
echo "3️⃣  Creating admin user..."
read -p "Create admin user? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Admin email: " ADMIN_EMAIL
    read -s -p "Admin password: " ADMIN_PASSWORD
    echo
    
    curl -X POST https://api.tillas.ec/auth/register \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$ADMIN_EMAIL\",
        \"password\": \"$ADMIN_PASSWORD\",
        \"name\": \"Administrator\",
        \"role\": \"ADMIN\"
      }"
    
    echo ""
    echo "✓ Admin user created"
fi

# 4. Setup Minio bucket
echo ""
echo "4️⃣  Configuring Minio..."
read -p "Setup Minio bucket? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    source /opt/tillas-ec/.env
    
    echo "Access Minio Console at: https://media-console.tillas.ec"
    echo "Login with your MINIO_ACCESS_KEY and MINIO_SECRET_KEY"
    echo "Create bucket: tillas-media"
    echo "Set read policy for public access"
fi

# 5. Verify services
echo ""
echo "5️⃣  Verifying services..."
sleep 5

echo "Testing API..."
curl -f https://api.tillas.ec/health || echo "⚠️  API health check failed"

echo ""
echo "Testing Web..."
curl -f https://tillas.ec || echo "⚠️  Web check failed"

echo ""
echo "========================================"
echo "✓ Post-deployment setup completed!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Verify all services: /opt/tillas-ec/scripts/status.sh"
echo "  2. Check logs: /opt/tillas-ec/scripts/logs.sh"
echo "  3. Configure Google OAuth2"
echo "  4. Configure Firebase (optional)"
echo "  5. Configure SMTP (optional)"
echo "  6. Setup SSL certificates in Dokploy"
EOF

chmod +x $PROJECT_DIR/scripts/post-deploy.sh

print_status "Post-deployment script created"

# ==========================================
# STEP 10: Final Summary
# ==========================================
echo ""
echo -e "${BLUE}==========================================${NC}"
echo -e "${GREEN}  ✓ Setup Completed Successfully!${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

echo -e "${GREEN}Server:${NC} 158.247.126.105"
echo -e "${GREEN}Project Directory:${NC} $PROJECT_DIR"
echo ""

echo -e "${YELLOW}Important Files:${NC}"
echo "  - Credentials: $CREDENTIALS_FILE"
echo "  - Environment: $ENV_FILE"
echo "  - Dokploy Config: $PROJECT_DIR/dokploy.json"
echo ""

echo -e "${YELLOW}Management Scripts:${NC}"
echo "  - Deploy: $PROJECT_DIR/scripts/deploy.sh"
echo "  - Logs: $PROJECT_DIR/scripts/logs.sh [service]"
echo "  - Status: $PROJECT_DIR/scripts/status.sh"
echo "  - Post-Deploy: $PROJECT_DIR/scripts/post-deploy.sh"
echo "  - Backup: $PROJECT_DIR/scripts/backup.sh"
echo ""

echo -e "${YELLOW}Dokploy Panel:${NC}"
echo "  URL: http://158.247.126.105:3000"
echo "  Default: admin@dokploy.com / 123456"
echo "  ⚠️  CHANGE PASSWORD IMMEDIATELY!"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Access Dokploy panel and login"
echo "  2. Change Dokploy password"
echo "  3. Import project from dokploy.json"
echo "  4. Configure environment variables"
echo "  5. Setup DNS records for your domains"
echo "  6. Deploy from Dokploy panel"
echo "  7. Run post-deploy script"
echo ""

echo -e "${YELLOW}DNS Records to Configure:${NC}"
echo "  A  tillas.ec          → 158.247.126.105"
echo "  A  api.tillas.ec      → 158.247.126.105"
echo "  A  admin.tillas.ec    → 158.247.126.105"
echo "  A  media.tillas.ec    → 158.247.126.105"
echo "  A  www.tillas.ec      → 158.247.126.105"
echo ""

echo -e "${BLUE}==========================================${NC}"
echo -e "${GREEN}  Ready for Production! 🚀${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""
