# 🚀 Guía de Despliegue - Dokploy en Oracle Cloud

Esta guía te lleva desde una instancia limpia de Ubuntu 24.04 en Oracle Cloud hasta una aplicación TILLAS.EC completamente funcional con Dokploy.

---

## 📋 Prerrequisitos

### Infraestructura Oracle Cloud (según imagen)
- **Instancia**: VM.Standard.A1.Flex
- **OCPU**: 4 cores
- **RAM**: 24 GB
- **SO**: Ubuntu 24.04 LTS (aarch64)
- **IP Pública**: `158.247.126.105`
- **Región**: sa-bogota-1
- **Usuario SSH**: `ubuntu`

### Dominios necesarios
Configura estos DNS apuntando a tu IP pública:
- `tillas.ec` → Web principal
- `api.tillas.ec` → API Backend
- `admin.tillas.ec` → Panel Admin
- `media.tillas.ec` → Minio (almacenamiento de imágenes)

---

## 📦 Paso 1: Preparar el Servidor

### 1.1 Conectar por SSH

```bash
ssh ubuntu@158.247.126.105
```

### 1.2 Actualizar sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Instalar Docker y Docker Compose

```bash
# Instalar Docker
curl -fsSL https://get.docker.com | bash

# Añadir usuario al grupo docker
sudo usermod -aG docker $USER

# Verificar instalación
docker --version
docker compose version
```

> **Importante**: Cerrar sesión y volver a entrar para que el cambio de grupo surta efecto.

### 1.4 Configurar Firewall (UFW)

```bash
# Habilitar firewall
sudo ufw enable

# Permitir SSH (puerto 22)
sudo ufw allow 22/tcp

# Permitir HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Permitir puertos de Dokploy (si usa puertos alternativos)
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp
sudo ufw allow 9000/tcp

# Verificar reglas
sudo ufw status
```

---

## 🐳 Paso 2: Instalar Dokploy

### 2.1 Instalar Dokploy

```bash
# Método directo con curl
curl -fsSL https://dokploy.com/install.sh | sh

# O usando wget
wget -qO- https://dokploy.com/install.sh | sh
```

### 2.2 Acceder al Panel de Dokploy

```
http://158.247.126.105:3000
```

**Credenciales por defecto:**
- Usuario: `admin@dokploy.com`
- Contraseña: `123456`

> **⚠️ IMPORTANTE**: Cambiar la contraseña inmediatamente después del primer login.

### 2.3 Configurar Dominio para Dokploy

En el panel de Dokploy:
1. Ir a **Settings** → **General**
2. Configurar dominio de Dokploy (ej: `dokploy.tillas.ec`)
3. Configurar certificados SSL automáticos

---

## 🚀 Paso 3: Configurar el Proyecto en Dokploy

### 3.1 Crear un Nuevo Proyecto

1. En el panel de Dokploy, ir a **Projects** → **New Project**
2. Nombre: `tillas-ec`
3. Descripción: `E-commerce de sneakers Ecuador`

### 3.2 Conectar Repositorio Git

**Opción A: GitHub/GitLab**
1. Ir a **Projects** → `tillas-ec` → **Git**
2. Seleccionar proveedor (GitHub/GitLab)
3. Autorizar y seleccionar repositorio
4. Branch: `main`

**Opción B: Subir manualmente**
1. En tu máquina local:
```bash
git add .
git commit -m "Preparar para Dokploy"
git push origin main
```

### 3.3 Configurar Docker Compose

1. Ir a **Projects** → `tillas-ec` → **Docker Compose**
2. Seleccionar archivo: `docker-compose.yml`
3. Configurar variables de entorno (ver siguiente sección)

---

## 🔐 Paso 4: Configurar Variables de Entorno

### 4.1 Copiar .env.production

```bash
# En tu máquina local
cp .env.production .env.dokploy

# Editar con valores de producción
nano .env.dokploy
```

### 4.2 Valores Obligatorios a Cambiar

**Contraseñas de Base de Datos:**
```bash
DB_PASSWORD=genera_una_contraseña_segura_aqui
REDIS_PASSWORD=otra_contraseña_segura_aqui
```

**JWT Secrets (mínimo 32 caracteres):**
```bash
JWT_SECRET=ejecuta_este_comando_para_generar: openssl rand -base64 32
JWT_REFRESH_SECRET=ejecuta_este_comando_para_generar: openssl rand -base64 32
```

**Minio Credentials:**
```bash
MINIO_ACCESS_KEY=admin_tillas
MINIO_SECRET_KEY=contraseña_segura_minio
```

**Google OAuth2:**
1. Ir a https://console.cloud.google.com/apis/credentials
2. Crear OAuth 2.0 Client ID
3. Redirect URIs:
   - `https://api.tillas.ec/auth/google/callback`
4. Copiar Client ID y Client Secret

**Firebase (para notificaciones push):**
1. Ir a https://console.firebase.google.com
2. Crear proyecto o usar existente
3. Generar clave privada de service account
4. Copiar PROJECT_ID, PRIVATE_KEY, CLIENT_EMAIL

**SMTP (para emails):**
1. Ir a https://myaccount.google.com/security
2. Activar "2-Step Verification"
3. Generar "App Password" para SMTP
4. Usar esa contraseña en `SMTP_PASS`

### 4.3 Subir Variables a Dokploy

1. Ir a **Projects** → `tillas-ec` → **Environment Variables**
2. Copiar todo el contenido de `.env.dokploy`
3. Pegar y guardar

---

## 🌐 Paso 5: Configurar Dominios y SSL

### 5.1 Configurar DNS en tu Proveedor de Dominios

Añadir registros A:
```
tillas.ec          → 158.247.126.105
api.tillas.ec      → 158.247.126.105
admin.tillas.ec    → 158.247.126.105
media.tillas.ec    → 158.247.126.105
www.tillas.ec      → 158.247.126.105  (CNAME a tillas.ec)
```

### 5.2 Configificar SSL en Dokploy

Dokploy usa Traefik automáticamente. Los certificados SSL se generan con Let's Encrypt:

1. Ir a **Settings** → **SSL**
2. Email para Let's Encrypt: `tu_email@tillas.ec`
3. Los certificados se generan automáticamente al acceder a los dominios

---

## 🚀 Paso 6: Desplegar la Aplicación

### 6.1 Deploy desde Dokploy

1. Ir a **Projects** → `tillas-ec` → **Deployments**
2. Click en **Deploy Now**
3. Esperar a que finalice el build (puede tomar 5-10 minutos)

### 6.2 Monitorear el Deploy

- Ver logs en tiempo real en **Deployments** → **Logs**
- Si hay errores, revisar la sección de errores

### 6.3 Verificar Servicios

```bash
# En el servidor
docker ps

# Deberías ver estos contenedores corriendo:
# - tillas-api
# - tillas-web
# - tillas-admin
# - tillas-db (postgres)
# - tillas-redis
# - tillas-minio
```

---

## ✅ Paso 7: Post-Despliegue

### 7.1 Inicializar Base de Datos

```bash
# Ejecutar migraciones Prisma
docker exec tillas-api npx prisma migrate deploy

# Ejecutar seed de datos iniciales
docker exec tillas-api npx prisma db seed

# Verificar base de datos
docker exec tillas-api npx prisma studio
```

### 7.2 Crear Usuario Administrador

Accede a la API para crear un usuario admin:

```bash
# Registrar usuario
curl -X POST https://api.tillas.ec/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tillas.ec",
    "password": "Admin123!",
    "name": "Administrador",
    "role": "ADMIN"
  }'
```

### 7.3 Configurar Minio Bucket

1. Acceder a Minio Console: `https://media.tillas.ec`
2. Login con `MINIO_ACCESS_KEY` y `MINIO_SECRET_KEY`
3. Crear bucket `tillas-media`
4. Configurar política de acceso público para lectura

### 7.4 Verificar Dominios

- ✅ https://tillas.ec (Web principal)
- ✅ https://api.tillas.ec (API + Swagger en /api)
- ✅ https://admin.tillas.ec (Panel Admin)
- ✅ https://media.tillas.ec (Minio Console)

### 7.5 Probar API

```bash
# Health check
curl https://api.tillas.ec/health

# Swagger documentation
# Abrir en navegador: https://api.tillas.ec/api
```

---

## 🔄 Mantenimiento

### Ver Logs

```bash
# Todos los servicios
docker compose logs -f

# Servicio específico
docker logs -f tillas-api
docker logs -f tillas-web
docker logs -f tillas-db
```

### Reiniciar Servicios

```bash
# Reiniciar todo
docker compose restart

# Reiniciar servicio específico
docker restart tillas-api
```

### Backup de Base de Datos

```bash
# Crear backup
docker exec tillas-db pg_dump -U tillas_user tillas > backup_$(date +%Y%m%d).sql

# Restaurar backup
cat backup_20260413.sql | docker exec -i tillas-db psql -U tillas_user tillas
```

### Actualizar Aplicación

```bash
# En tu máquina local
git pull origin main
git push origin main

# En Dokploy, hacer nuevo deploy automáticamente
# O manualmente desde el panel
```

---

## 🆘 Troubleshooting

### Problema: Contenedores no inician

```bash
# Ver logs de error
docker logs tillas-api

# Verificar variables de entorno
docker exec tillas-api env | grep DB_

# Verificar conectividad entre servicios
docker exec tillas-api ping postgres
```

### Problema: SSL no funciona

```bash
# Verificar registros DNS
dig tillas.ec +short
dig api.tillas.ec +short

# Verificar certificados
curl -vI https://tillas.ec 2>&1 | grep "SSL"
```

### Problema: Base de datos no conecta

```bash
# Verificar que postgres está corriendo
docker ps | grep postgres

# Verificar credenciales
docker exec tillas-db psql -U tillas_user -d tillas -c "SELECT 1"

# Ver logs de postgres
docker logs tillas-db
```

### Problema: Redis no conecta

```bash
# Verificar redis
docker exec tillas-redis redis-cli -a $REDIS_PASSWORD ping

# Debería responder: PONG
```

### Problema: Minio no funciona

```bash
# Verificar buckets
docker exec tillas-minio mc alias set local http://localhost:9000 $MINIO_ACCESS_KEY $MINIO_SECRET_KEY
docker exec tillas-minio mc ls local
```

---

## 📚 Recursos Útiles

- **Dokploy Docs**: https://docs.dokploy.com
- **Docker Compose Docs**: https://docs.docker.com/compose/
- **Prisma Docs**: https://www.prisma.io/docs
- **NestJS Docs**: https://docs.nestjs.com
- **Next.js Docs**: https://nextjs.org/docs

---

## 🎯 Checklist Final de Despliegue

- [ ] Servidor Ubuntu 24.04 actualizado
- [ ] Docker y Docker Compose instalados
- [ ] Firewall configurado (UFW)
- [ ] Dokploy instalado y accesible
- [ ] Contraseña de Dokploy cambiada
- [ ] DNS configurados correctamente
- [ ] Repositorio conectado a Dokploy
- [ ] Variables de entorno configuradas
- [ ] Contraseñas generadas y seguras
- [ ] Google OAuth2 configurado
- [ ] Firebase configurado (si aplica)
- [ ] SMTP configurado (si aplica)
- [ ] Deploy realizado exitosamente
- [ ] Migraciones de base de datos ejecutadas
- [ ] Seed de datos ejecutado
- [ ] Usuario admin creado
- [ ] Minio bucket configurado
- [ ] SSL funcionando en todos los dominios
- [ ] Health checks pasando
- [ ] Logs verificados sin errores
- [ ] Backup automático configurado (recomendado)

---

**¡Felicidades! Tu aplicación TILLAS.EC está desplegada en Oracle Cloud con Dokploy 🎉**
