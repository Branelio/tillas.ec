# ⚡ Quick Reference - Dokploy Deployment

##  Comandos Rápidos

### En tu máquina local

```bash
# Generar contraseñas seguras
openssl rand -base64 32

# Subir cambios
git add .
git commit -m "Update"
git push origin main

# Ver estado de Docker local
docker ps
```

### En el servidor Oracle Cloud

```bash
# Conectar por SSH
ssh ubuntu@158.247.126.105

# Ver contenedores corriendo
docker ps

# Ver logs
docker logs -f tillas-api
docker logs -f tillas-web
docker logs -f tillas-db

# Reiniciar servicios
docker restart tillas-api
docker compose -f docker-compose.dokploy.yml restart

# Ejecutar migraciones
docker exec tillas-api npx prisma migrate deploy

# Ejecutar seed
docker exec tillas-api npx prisma db seed

# Backup manual
docker exec tillas-db pg_dump -U tillas_user tillas > backup.sql

# Ver uso de recursos
docker stats

# Limpiar Docker
docker system prune -a
```

---

## 🔧 URLs de Servicios

| Servicio | URL |
|----------|-----|
| Web Principal | https://tillas.ec |
| API Backend | https://api.tillas.ec |
| API Swagger | https://api.tillas.ec/api |
| Admin Panel | https://admin.tillas.ec |
| Minio API | https://media.tillas.ec |
| Minio Console | https://media-console.tillas.ec |
| Dokploy Panel | http://158.247.126.105:3000 |

---

## 📋 Variables Críticas

### Base de Datos
```env
DB_HOST=postgres
DB_PORT=5432
DATABASE_URL=postgresql://tillas_user:PASSWORD@postgres:5432/tillas
```

### Redis
```env
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://:PASSWORD@redis:6379
```

### JWT
```env
JWT_SECRET=mínimo_32_caracteres
JWT_REFRESH_SECRET=mínimo_32_caracteres
```

### Minio
```env
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_PUBLIC_URL=https://media.tillas.ec
```

### App URLs
```env
API_URL=https://api.tillas.ec
WEB_URL=https://tillas.ec
ADMIN_URL=https://admin.tillas.ec
EXPO_PUBLIC_API_URL=https://api.tillas.ec
```

---

## 🚨 Troubleshooting Rápido

### Contenedor no inicia
```bash
docker logs tillas-api
docker inspect tillas-api
```

### Base de datos no conecta
```bash
docker exec tillas-db psql -U tillas_user -d tillas -c "SELECT 1"
```

### Redis no responde
```bash
docker exec tillas-redis redis-cli -a PASSWORD ping
```

### SSL no funciona
```bash
curl -vI https://tillas.ec
dig tillas.ec +short
```

### Verificar health checks
```bash
docker inspect --format='{{json .State.Health}}' tillas-api
```

---

## 📊 Resources Allocation (4 OCPU, 24GB RAM)

| Servicio | CPU Limit | RAM Limit |
|----------|-----------|-----------|
| API | 1.5 cores | 2 GB |
| Web | 1 core | 1 GB |
| Admin | 1 core | 1 GB |
| PostgreSQL | 1 core | 2 GB |
| Redis | 0.5 cores | 1 GB |
| Minio | 0.5 cores | 1 GB |
| **Total** | **5.5 cores** | **8 GB** |

> ✅ Con 4 OCPU y 24GB RAM, hay recursos de sobra para el despliegue

---

## 🔄 Deployment Workflow

1. **Local:**
   ```bash
   git push origin main
   ```

2. **Dokploy Panel:**
   - Ir a Projects → tillas-ec
   - Click "Deploy Now"
   - Esperar build completo

3. **Post-Deploy:**
   ```bash
   docker exec tillas-api npx prisma migrate deploy
   docker logs -f tillas-api
   ```

4. **Verify:**
   - https://api.tillas.ec/health
   - https://tillas.ec
   - https://admin.tillas.ec

---

## 📞 Emergency Commands

### Full restart
```bash
docker compose -f docker-compose.dokploy.yml down
docker compose -f docker-compose.dokploy.yml up -d
```

### Database restore
```bash
cat backup.sql | docker exec -i tillas-db psql -U tillas_user tillas
```

### Clear all Docker data
```bash
docker system prune -a --volumes -f
```

### View all containers
```bash
docker ps -a
```

### Force remove container
```bash
docker rm -f tillas-api
```

---

## 🎯 DNS Records

```
Type: A
Name: tillas.ec
Value: 158.247.126.105
TTL: Auto

Type: A
Name: api.tillas.ec
Value: 158.247.126.105
TTL: Auto

Type: A
Name: admin.tillas.ec
Value: 158.247.126.105
TTL: Auto

Type: A
Name: media.tillas.ec
Value: 158.247.126.105
TTL: Auto

Type: A
Name: www.tillas.ec
Value: 158.247.126.105
TTL: Auto
```

---

## 🔐 Security Checklist

- [ ] Dokploy password changed
- [ ] Strong DB password (16+ chars)
- [ ] Strong Redis password (16+ chars)
- [ ] JWT secrets generated (32+ chars)
- [ ] Minio credentials strong
- [ ] Firewall enabled (UFW)
- [ ] SSL certificates active
- [ ] Google OAuth2 configured
- [ ] SMTP App Password generated
- [ ] .env files not committed to Git
- [ ] Backup script running

---

**Quick Access:**
- Oracle Cloud: https://cloud.oracle.com/
- Dokploy: http://158.247.126.105:3000
- GitHub: [tu-repositorio]
