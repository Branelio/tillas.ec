#!/bin/bash
# ==========================================
# TILLAS.EC — Setup Rápido para Dokploy
# Ejecutar en el servidor Oracle Cloud
# ==========================================

set -e

echo "🚀 Iniciando configuración del servidor para TILLAS.EC..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Verificar que es root o tiene sudo
if [ "$EUID" -ne 0 ]; then 
    print_error "Por favor ejecutar como root o con sudo"
    exit 1
fi

# 1. Actualizar sistema
print_status "Actualizando sistema..."
apt update && apt upgrade -y

# 2. Instalar Docker
print_status "Instalando Docker..."
curl -fsSL https://get.docker.com | bash

# 3. Instalar Docker Compose
print_status "Instalando Docker Compose..."
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')
curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 4. Añadir usuario ubuntu al grupo docker
print_status "Configurando permisos de Docker..."
usermod -aG docker ubuntu

# 5. Configurar firewall UFW
print_status "Configurando firewall..."
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw allow 8000/tcp
ufw allow 9000/tcp

# 6. Instalar Dokploy
print_status "Instalando Dokploy..."
curl -fsSL https://dokploy.com/install.sh | sh

# 7. Habilitar servicios al inicio
print_status "Habilitando servicios al inicio..."
systemctl enable docker
systemctl enable ufw

# 8. Crear directorio para el proyecto
print_status "Creando estructura de directorios..."
mkdir -p /opt/tillas-ec/{backups,logs,scripts}

# 9. Generar contraseñas seguras
print_status "Generando contraseñas seguras..."
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 24)
REDIS_PASSWORD=$(openssl rand -base64 24)
MINIO_SECRET=$(openssl rand -base64 24)

# Guardar contraseñas en archivo
cat > /opt/tillas-ec/credentials.txt << EOF
==========================================
TILLAS.EC — Credenciales Generadas
Fecha: $(date)
==========================================

JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
DB_PASSWORD=$DB_PASSWORD
REDIS_PASSWORD=$REDIS_PASSWORD
MINIO_SECRET_KEY=$MINIO_SECRET

⚠️  IMPORTANTE: Guardar estas credenciales de forma segura
⚠️  NO commitear este archivo al repositorio
EOF

chmod 600 /opt/tillas-ec/credentials.txt

# 10. Crear script de backup
cat > /opt/tillas-ec/scripts/backup.sh << 'BACKUP_EOF'
#!/bin/bash
# Backup automático de PostgreSQL
BACKUP_DIR="/opt/tillas-ec/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/tillas_$TIMESTAMP.sql.gz"

mkdir -p $BACKUP_DIR
docker exec tillas-db pg_dump -U tillas_user tillas | gzip > $BACKUP_FILE
echo "Backup creado: $BACKUP_FILE"

# Mantener solo backups de los últimos 7 días
find $BACKUP_DIR -name "tillas_*.sql.gz" -mtime +7 -delete
echo "Backups antiguos eliminados"
BACKUP_EOF

chmod +x /opt/tillas-ec/scripts/backup.sh

# 11. Agregar cron job para backups diarios
print_status "Configurando backups automáticos..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/tillas-ec/scripts/backup.sh >> /opt/tillas-ec/logs/backup.log 2>&1") | crontab -

# 12. Mostrar información final
echo ""
echo "=========================================="
print_status "¡Configuración completada!"
echo "=========================================="
echo ""
print_warning "IMPORTANTE:"
echo "1. Cerrar sesión y volver a entrar para aplicar permisos de Docker"
echo "2. Acceder a Dokploy: http://$(curl -s ifconfig.me):3000"
echo "3. Cambiar la contraseña por defecto de Dokploy"
echo "4. Configurar DNS para apuntar a: $(curl -s ifconfig.me)"
echo "5. Revisar credenciales generadas en: /opt/tillas-ec/credentials.txt"
echo ""
print_status "Puertos abiertos:"
echo "  - 22: SSH"
echo "  - 80: HTTP"
echo "  - 443: HTTPS"
echo "  - 3000: Dokploy Panel"
echo "  - 8000: Traefik Dashboard"
echo "  - 9000: Minio API"
echo ""
print_status "Siguientes pasos:"
echo "  1. Clonar repositorio en /opt/tillas-ec"
echo "  2. Copiar .env.production y configurar variables"
echo "  3. Configurar proyecto en Dokploy"
echo "  4. Desplegar aplicación"
echo ""
print_warning "No olvidar:"
echo "  - Configurar Google OAuth2"
echo "  - Configurar Firebase (notificaciones push)"
echo "  - Configurar SMTP (emails)"
echo "  - Crear bucket en Minio"
echo "  - Ejecutar migraciones Prisma"
echo "  - Ejecutar seed de datos"
echo ""
echo "=========================================="
echo "¡Listo para desplegar TILLAS.EC! 🎉"
echo "=========================================="
