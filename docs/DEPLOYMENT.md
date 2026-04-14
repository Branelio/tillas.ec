# TILLAS.EC — Guía de Deployment

## Stack de Producción

| Componente | Tecnología | Acceso |
|---|---|---|
| API Backend | NestJS → Docker | `api.tillas.ec` |
| Web Frontend | Next.js → Docker | `tillas.ec` |
| Admin Panel | Next.js → Docker | `admin.tillas.ec` |
| Base de Datos | PostgreSQL 16 | Container Dokploy |
| Cache | Redis 7 | Container Dokploy |
| Archivos | MinIO (S3) | `media.tillas.ec` |
| Proxy/SSL | Traefik (Dokploy) | Automático Let's Encrypt |
| Hosting | Oracle Cloud Always Free | 4 OCPU ARM, 24GB RAM |

---

## 1. Setup Inicial del Servidor

```bash
# 1. Crear instancia Oracle Cloud (Always Free ARM)
#    - Shape: Ampere A1 (4 OCPU, 24GB RAM)
#    - OS: Ubuntu 24.04 LTS (recomendado) u Oracle Linux 9
#    - Abrir puertos publicos: 22, 80, 443
#    - Puerto 3000 solo temporal para onboarding de Dokploy
#      y restringido por IP (Security List / NSG)

# 2. Conectar por SSH
ssh -i tu-key.pem ubuntu@tu-ip-publica

# 3. Instalar Dokploy
curl -sSL https://dokploy.com/install.sh | sh

# 4. Acceder a Dokploy y configurar dominio
# https://tu-ip:3000 → Crear cuenta admin → Settings → Dominio: dokploy.tillas.ec
```

### Seguridad de red (Oracle)

- No expongas publicamente `5432`, `6379`, `9000` ni `9001`.
- Mantén PostgreSQL/Redis/MinIO solo en red interna de Docker/Dokploy.
- Una vez configurado Dokploy, cierra `3000` al mundo y permite solo `80/443`.
- Usa DNS A records a la IP publica de la instancia para:
  - `tillas.ec`
  - `api.tillas.ec`
  - `admin.tillas.ec`
  - `media.tillas.ec`

## 2. Configurar Aplicaciones en Dokploy

### 2.1 PostgreSQL
```
Dokploy → Services → Crear PostgreSQL
  - Nombre: tillas-db
  - Versión: 16
  - Puerto externo: 5432 (solo si necesitas acceso remoto)
  - Variables: DB_NAME=tillas, DB_USER=tillas_user, DB_PASSWORD=<password-seguro>
```

### 2.2 Redis
```
Dokploy → Services → Crear Redis
  - Nombre: tillas-redis
  - Versión: 7-alpine
  - Configurar password: REDIS_PASSWORD
```

### 2.3 MinIO
```
Dokploy → Services → Crear Docker
  - Imagen: minio/minio:latest
  - Comando: server /data --console-address ":9001"
  - Variables: MINIO_ROOT_USER, MINIO_ROOT_PASSWORD
  - Dominio: media.tillas.ec → Puerto 9000
  - Volumen: /data
```

### 2.4 API Backend
```
Dokploy → Aplicaciones → Crear desde GitHub
  - Repositorio: tu-repo/Tillas.ec
  - Dockerfile: packages/api/Dockerfile
  - Context: ./  (raíz del monorepo, MUY IMPORTANTE)
  - Dominio: api.tillas.ec → Puerto 4000
  - Variables de entorno: (ver sección 4)
```

### 2.5 Web Frontend
```
Dokploy → Aplicaciones → Crear desde GitHub
  - Repositorio: tu-repo/Tillas.ec
  - Dockerfile: apps/web/Dockerfile
  - Context: ./
  - Build arg: NEXT_PUBLIC_API_URL=https://api.tillas.ec
  - Dominio: tillas.ec → Puerto 3000
```

### 2.6 Admin Panel
```
Dokploy → Aplicaciones → Crear desde GitHub
  - Repositorio: tu-repo/Tillas.ec
  - Dockerfile: apps/admin/Dockerfile
  - Context: ./
  - Build arg: NEXT_PUBLIC_API_URL=https://api.tillas.ec
  - Dominio: admin.tillas.ec → Puerto 3001
```

## 3. Secrets de GitHub Actions

Configurar en **Settings > Secrets and Variables > Actions**:

| Secret | Descripción |
|---|---|
| `DOKPLOY_URL` | `https://dokploy.tillas.ec` |
| `DOKPLOY_TOKEN` | Token API de Dokploy |
| `DOKPLOY_API_APP_ID` | ID de la app API en Dokploy |
| `DOKPLOY_WEB_APP_ID` | ID de la app Web en Dokploy |
| `DOKPLOY_ADMIN_APP_ID` | ID de la app Admin en Dokploy |
| `DB_HOST` | Host PostgreSQL (usualmente el nombre del container) |
| `DB_USER` | Usuario PostgreSQL |
| `DB_PASSWORD` | Password PostgreSQL |
| `DB_NAME` | Nombre de la base de datos |
| `OCI_BUCKET_NAME` | Bucket Oracle Object Storage |
| `OCI_ACCESS_KEY` | Access Key OCI S3 |
| `OCI_SECRET_KEY` | Secret Key OCI S3 |
| `OCI_S3_ENDPOINT` | `https://[namespace].compat.objectstorage.[region].oraclecloud.com` |
| `OCI_REGION` | Región OCI |

## 4. Variables de Entorno del API (.env)

```env
# Database
DATABASE_URL=postgresql://tillas_user:password@tillas-db:5432/tillas

# Redis
REDIS_URL=redis://:redis_password@tillas-redis:6379

# JWT
JWT_SECRET=tu-secret-seguro-minimo-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=otro-secret-seguro-minimo-32-chars
JWT_REFRESH_EXPIRES_IN=30d

# Pagos: No requiere API keys (transferencia bancaria)
# Los datos de cuenta se configuran en payments.service.ts

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@tillas.ec
SMTP_PASS=app-password
SMTP_FROM=TILLAS.EC <noreply@tillas.ec>

# MinIO
MINIO_ENDPOINT=tillas-minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=tu-minio-access
MINIO_SECRET_KEY=tu-minio-secret
MINIO_BUCKET=tillas-media
MINIO_PUBLIC_URL=https://media.tillas.ec

# App
NODE_ENV=production
API_PORT=4000
```

## 5. Flujo CI/CD

```
Push a main → GitHub Actions:
  1. ✅ Lint + Type Check (API + Web + Admin)
  2. 🐳 Build imágenes Docker multi-arch (amd64 + arm64)
     → Context: raíz del monorepo
     → Build args: NEXT_PUBLIC_API_URL para Web y Admin
  3. 📦 Push a ghcr.io (con tag SHA + latest)
  4. 🚀 Trigger Dokploy redeploy (rolling update, zero downtime)
     → API: Ejecuta prisma migrate deploy antes de iniciar
     → Web/Admin: Standalone Next.js con health checks
```

## 6. Primer Deploy (Checklist)

```bash
# 1. [ ] Servidor Oracle Cloud creado y accesible por SSH
# 2. [ ] Dokploy instalado y accesible en dokploy.tillas.ec
# 3. [ ] PostgreSQL creado en Dokploy
# 4. [ ] Redis creado en Dokploy
# 5. [ ] MinIO creado y bucket configurado
# 6. [ ] API app creada con variables de entorno
# 7. [ ] Web app creada con build args
# 8. [ ] Admin app creada con build args
# 9. [ ] DNS configurado:
#         tillas.ec      → IP servidor
#         api.tillas.ec  → IP servidor
#         admin.tillas.ec → IP servidor
#         media.tillas.ec → IP servidor
# 10.[ ] GitHub Secrets configurados
# 11.[ ] Push a main → pipeline verde
# 12.[ ] Verificar health checks en https://api.tillas.ec/health
# 13.[ ] Seed de datos inicial:
#         docker exec -it tillas-api npx prisma db seed
```

## 6.1 Variables clave para Dokploy

En la aplicacion API en Dokploy usa, como minimo:

```env
NODE_ENV=production
API_PORT=4000
DATABASE_URL=postgresql://tillas_user:<password>@tillas-db:5432/tillas
REDIS_HOST=tillas-redis
REDIS_PORT=6379
REDIS_PASSWORD=<redis_password>
MINIO_ENDPOINT=tillas-minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=<minio_access_key>
MINIO_SECRET_KEY=<minio_secret_key>
MINIO_BUCKET=tillas-media
MINIO_PUBLIC_URL=https://media.tillas.ec
JWT_SECRET=<min_32_chars>
JWT_REFRESH_SECRET=<min_32_chars>
WEB_URL=https://tillas.ec
ADMIN_URL=https://admin.tillas.ec
```

## 7. Backups

- **PostgreSQL**: Diario 3:00 AM (UTC-5) → Oracle Object Storage
- **Retención**: 30 días (limpieza automática)
- **Manual**: `workflow_dispatch` desde GitHub Actions

## 8. Restauración de Desastre

```bash
# 1. Crear nueva instancia Oracle Cloud
# 2. Instalar Dokploy
curl -sSL https://dokploy.com/install.sh | sh

# 3. Crear PostgreSQL en Dokploy
# 4. Descargar último backup desde Oracle Object Storage
aws s3 cp s3://tillas-backups/backup_latest.dump.gz . \
  --endpoint-url https://[namespace].compat.objectstorage.[region].oraclecloud.com

# 5. Restaurar
gunzip backup_latest.dump.gz
pg_restore -h localhost -U tillas_user -d tillas backup_latest.dump

# 6. Configurar variables de entorno en Dokploy
# 7. Deploy apps → Todo restaurado en ~30 minutos
```

## 9. Monitoreo

```bash
# Health checks automáticos (Docker HEALTHCHECK):
# - API:   http://localhost:4000/health  (cada 30s)
# - Web:   http://localhost:3000         (cada 30s)
# - Admin: http://localhost:3001         (cada 30s)

# Logs en Dokploy:
# Dashboard → App → Logs (tiempo real)

# Métricas del servidor:
# Dashboard → Monitoring (CPU, RAM, disco)
```
