#!/bin/bash
# Script de backup automático para PostgreSQL
# Se ejecuta diariamente y mantiene backups de los últimos 7 días

#!/bin/sh
set -e

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/tillas_$TIMESTAMP.sql.gz"

echo "Iniciando backup de base de datos..."
pg_dump -h postgres -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"
echo "Backup completado: $BACKUP_FILE"

# Eliminar backups antiguos (más de 7 días)
find "$BACKUP_DIR" -name "tillas_*.sql.gz" -mtime +7 -delete
echo "Backups antiguos eliminados"
