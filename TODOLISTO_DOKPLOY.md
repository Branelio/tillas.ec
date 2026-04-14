# 📦 TILLAS.EC - Todo Listo para Dokploy

## ✅ Archivos Creados para Despliegue

Se han preparado todos los archivos necesarios para desplegar TILLAS.EC en Oracle Cloud usando Dokploy:

### 1. **Archivos de Configuración**

| Archivo | Propósito |
|---------|-----------|
| `.env.production` | Variables de entorno para producción con valores seguros |
| `docker-compose.dokploy.yml` | Configuración Docker Compose optimizada para Dokploy |
| `docker-compose.yml` | Configuración Docker Compose base para producción |
| `docker-compose.dev.yml` | Configuración para desarrollo local |

### 2. **Documentación**

| Archivo | Contenido |
|---------|-----------|
| `docs/DOKPLOY_DEPLOYMENT.md` | Guía completa paso a paso para despliegue en Dokploy |
| `docs/DOKPLOY_CHECKLIST.md` | Lista de verificación completa del despliegue |
| `docs/DOKPLOY_QUICK_REFERENCE.md` | Referencia rápida de comandos y URLs |
| `README.md` | Actualizado con instrucciones de despliegue |

### 3. **Scripts**

| Archivo | Propósito |
|---------|-----------|
| `scripts/setup-server.sh` | Script de instalación automática del servidor Oracle Cloud |
| `scripts/postgres-backup.sh` | Script de backup automático de PostgreSQL |

---

## 🚀 Pasos para Desplegar

### En tu máquina local:

```bash
# 1. Configurar variables de entorno
cp .env.production .env.dokploy
nano .env.dokploy

# 2. Generar contraseñas seguras
openssl rand -base64 32  # Para JWT y passwords

# 3. Subir código al repositorio
git add .
git commit -m "Preparar para despliegue Dokploy"
git push origin main
```

### En el servidor Oracle Cloud:

```bash
# 1. Conectar por SSH
ssh ubuntu@158.247.126.105

# 2. Ejecutar script de setup automático (opcional)
sudo bash /path/to/setup-server.sh

# O seguir manualmente la guía:
# - Instalar Docker y Docker Compose
# - Instalar Dokploy
# - Configurar firewall

# 3. Clonar repositorio
cd /opt
git clone <tu-repositorio> tillas-ec
cd tillas-ec

# 4. Configurar variables de entorno
cp .env.production .env
nano .env  # Editar con valores reales

# 5. Desplegar desde Dokploy
# - Acceder a http://158.247.126.105:3000
# - Conectar repositorio Git
# - Seleccionar docker-compose.dokploy.yml
# - Configurar variables de entorno
# - Click en "Deploy Now"

# 6. Post-deploy
docker exec tillas-api npx prisma migrate deploy
docker exec tillas-api npx prisma db seed
```

---

## 🔧 Configuración de DNS

Configura estos registros DNS en tu proveedor de dominios:

```
tillas.ec          → A → 158.247.126.105
api.tillas.ec      → A → 158.247.126.105
admin.tillas.ec    → A → 158.247.126.105
media.tillas.ec    → A → 158.247.126.105
www.tillas.ec      → A → 158.247.126.105
```

---

## 🔐 Valores Obligatorios a Configurar

### Contraseñas (generar con `openssl rand -base64 32`)

- [ ] `DB_PASSWORD` - Contraseña de PostgreSQL (mínimo 16 caracteres)
- [ ] `REDIS_PASSWORD` - Contraseña de Redis (mínimo 16 caracteres)
- [ ] `JWT_SECRET` - Secreto JWT (mínimo 32 caracteres)
- [ ] `JWT_REFRESH_SECRET` - Secreto refresh JWT (mínimo 32 caracteres)
- [ ] `MINIO_SECRET_KEY` - Contraseña de Minio (mínimo 8 caracteres)

### Servicios Externos

- [ ] **Google OAuth2:**
  - Ir a https://console.cloud.google.com/apis/credentials
  - Crear OAuth 2.0 Client ID
  - Configurar redirect URI: `https://api.tillas.ec/auth/google/callback`
  - Copiar `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`

- [ ] **Firebase (opcional para notificaciones push):**
  - Ir a https://console.firebase.google.com
  - Crear proyecto y service account
  - Copiar `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`

- [ ] **SMTP (opcional para emails):**
  - Generar App Password en Google: https://myaccount.google.com/security
  - Configurar `SMTP_USER` y `SMTP_PASS`

---

## 📊 Arquitectura del Despliegue

```
┌─────────────────────────────────────────────────┐
│          Oracle Cloud (Ubuntu 24.04)            │
│  VM.Standard.A1.Flex - 4 OCPU, 24GB RAM        │
│  IP: 158.247.126.105                            │
└─────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│                    Dokploy                      │
│         (Panel de control en puerto 3000)       │
└─────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│              Docker Compose                      │
│  (docker-compose.dokploy.yml)                    │
└─────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│    Traefik   │ │  PostgreSQL  │ │    Redis     │
│  (Reverse    │ │   (Puerto    │ │  (Puerto     │
│   Proxy)     │ │    5432)     │ │    6379)     │
└──────────────┘ └──────────────┘ └──────────────┘
        │
        ├─────────────┬─────────────┬─────────────┐
        ▼             ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ──────────────┐
│  API (NestJS)│ │Web (Next.js) │ │Admin(Next.js)│ │  Minio (S3)  │
│  Puerto 4000 │ │ Puerto 3000  │ │ Puerto 3001  │ │ Puerto 9000  │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
        │             │             │             │
        ▼             ▼             ▼             ▼
api.tillas.ec   tillas.ec   admin.tillas.ec  media.tillas.ec
```

---

## 🎯 Verificación Post-Despliegue

Después del despliegue, verificar:

```bash
# Health check de API
curl https://api.tillas.ec/health

# Swagger documentation
# Abrir: https://api.tillas.ec/api

# Ver contenedores
docker ps

# Ver logs
docker logs -f tillas-api
docker logs -f tillas-web
docker logs -f tillas-db
```

### URLs a verificar

- ✅ https://tillas.ec (Web principal)
- ✅ https://api.tillas.ec (API Backend)
- ✅ https://api.tillas.ec/api (Swagger Docs)
- ✅ https://admin.tillas.ec (Panel Admin)
- ✅ https://media.tillas.ec (Minio API)
- ✅ https://media-console.tillas.ec (Minio Console)
- ✅ http://158.247.126.105:3000 (Dokploy Panel)

---

## 📚 Documentación Completa

Para instrucciones detalladas, consultar:

1. **Guía Completa:** `docs/DOKPLOY_DEPLOYMENT.md`
   - Instrucciones paso a paso
   - Configuración detallada de cada servicio
   - Troubleshooting

2. **Checklist:** `docs/DOKPLOY_CHECKLIST.md`
   - Lista de verificación completa
   - Todos los pasos a verificar
   - Sección de firmas

3. **Referencia Rápida:** `docs/DOKPLOY_QUICK_REFERENCE.md`
   - Comandos más usados
   - URLs de servicios
   - Troubleshooting rápido

---

## 🔄 Flujo de Trabajo para Actualizaciones

```bash
# 1. En tu máquina local
git add .
git commit -m "Descripción de cambios"
git push origin main

# 2. Dokploy detectará cambios automáticamente
# O hacer deploy manual desde el panel

# 3. Verificar logs
docker logs -f tillas-api

# 4. Probar en producción
curl https://api.tillas.ec/health
```

---

## 💾 Backup y Recovery

### Backup Automático

Configurado para ejecutarse diariamente a las 2 AM:

```bash
# Ver backups
ls -lh /opt/tillas-ec/backups/

# Ver logs de backup
cat /opt/tillas-ec/logs/backup.log
```

### Backup Manual

```bash
docker exec tillas-db pg_dump -U tillas_user tillas > backup_$(date +%Y%m%d).sql
```

### Restore

```bash
cat backup_20260413.sql | docker exec -i tillas-db psql -U tillas_user tillas
```

---

## 🆘 Soporte y Recursos

- **Dokploy Docs:** https://docs.dokploy.com
- **Oracle Cloud Console:** https://cloud.oracle.com/
- **Docker Docs:** https://docs.docker.com
- **Prisma Docs:** https://www.prisma.io/docs
- **NestJS Docs:** https://docs.nestjs.com
- **Next.js Docs:** https://nextjs.org/docs

---

## ✨ Estado Actual

**✅ TODO LISTO PARA DESPLIEGUE EN DOKPLOY**

- [x] Archivos Docker configurados
- [x] Variables de entorno preparadas
- [x] Documentación completa
- [x] Scripts de automatización
- [x] README actualizado
- [x] Checklist de verificación
- [x] Guía de referencia rápida

**Próximo paso:** Seguir la guía `docs/DOKPLOY_DEPLOYMENT.md` para desplegar en tu servidor Oracle Cloud.

---

**¡Éxito con el despliegue! 🚀**
