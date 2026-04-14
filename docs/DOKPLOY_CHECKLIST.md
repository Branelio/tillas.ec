# ✅ Checklist de Despliegue Dokploy

Lista de verificación completa para asegurar un despliegue exitoso de TILLAS.EC en Oracle Cloud con Dokploy.

---

## 🖥️ Preparación del Servidor

- [ ] Instancia Ubuntu 24.04 LTS creada en Oracle Cloud
- [ ] IP pública asignada y accesible (`158.247.126.105`)
- [ ] SSH funcionando: `ssh ubuntu@158.247.126.105`
- [ ] Sistema actualizado: `sudo apt update && sudo apt upgrade -y`
- [ ] Docker instalado y funcionando
- [ ] Docker Compose instalado y funcionando
- [ ] Usuario añadido al grupo docker: `sudo usermod -aG docker $USER`
- [ ] Sesión cerrada y reabierta para aplicar cambios de grupo
- [ ] Firewall UFW habilitado
- [ ] Puerto 22 (SSH) permitido en firewall
- [ ] Puertos 80 y 443 permitidos en firewall
- [ ] Verificar: `sudo ufw status`

---

## 🌐 Configuración de DNS

- [ ] Registro A: `tillas.ec` → `158.247.126.105`
- [ ] Registro A: `api.tillas.ec` → `158.247.126.105`
- [ ] Registro A: `admin.tillas.ec` → `158.247.126.105`
- [ ] Registro A: `media.tillas.ec` → `158.247.126.105`
- [ ] Registro A: `www.tillas.ec` → `158.247.126.105`
- [ ] Propagación DNS verificada: `dig tillas.ec +short`
- [ ] Propagación DNS verificada: `dig api.tillas.ec +short`

---

##  Instalación de Dokploy

- [ ] Dokploy instalado: `curl -fsSL https://dokploy.com/install.sh | sh`
- [ ] Panel accesible en `http://158.247.126.105:3000`
- [ ] Credenciales por defecto probadas
- [ ] **CONTRASEÑA CAMBIADA** (crítico)
- [ ] Email configurado para Let's Encrypt
- [ ] SSL configurado en Settings → SSL

---

## 🔐 Variables de Entorno

- [ ] Archivo `.env.production` copiado y configurado
- [ ] **DB_PASSWORD** generada (mínimo 16 caracteres)
- [ ] **REDIS_PASSWORD** generada (mínimo 16 caracteres)
- [ ] **JWT_SECRET** generado (mínimo 32 caracteres): `openssl rand -base64 32`
- [ ] **JWT_REFRESH_SECRET** generado (mínimo 32 caracteres): `openssl rand -base64 32`
- [ ] **MINIO_ACCESS_KEY** configurado
- [ ] **MINIO_SECRET_KEY** configurado (mínimo 8 caracteres)
- [ ] **GOOGLE_CLIENT_ID** obtenido de Google Cloud Console
- [ ] **GOOGLE_CLIENT_SECRET** obtenido de Google Cloud Console
- [ ] Redirect URIs configurados en Google OAuth2:
  - [ ] `https://api.tillas.ec/auth/google/callback`
- [ ] **FIREBASE_PROJECT_ID** configurado (si aplica)
- [ ] **FIREBASE_PRIVATE_KEY** configurada (si aplica)
- [ ] **FIREBASE_CLIENT_EMAIL** configurado (si aplica)
- [ ] **SMTP_USER** configurado (si aplica)
- [ ] **SMTP_PASS** generada como App Password de Google (si aplica)
- [ ] Todas las variables subidas a Dokploy → Environment Variables

---

##  Preparación del Código

- [ ] Repositorio Git inicializado
- [ ] Todos los archivos Dockerfile presentes:
  - [ ] `packages/api/Dockerfile`
  - [ ] `apps/web/Dockerfile`
  - [ ] `apps/admin/Dockerfile`
- [ ] Archivo `docker-compose.dokploy.yml` presente
- [ ] Archivo `.env.production` presente (no commitear)
- [ ] Archivo `.gitignore` configurado correctamente
- [ ] Código subido a GitHub/GitLab
- [ ] Branch `main` actualizado
- [ ] Repositorio conectado en Dokploy → Git

---

## 🚀 Configuración en Dokploy

- [ ] Proyecto creado en Dokploy: `tillas-ec`
- [ ] Repositorio Git conectado
- [ ] Branch configurado: `main`
- [ ] Docker Compose file seleccionado: `docker-compose.dokploy.yml`
- [ ] Variables de entorno configuradas
- [ ] Build trigger configurado (manual o automático)

---

## 🎯 Primer Despliegue

- [ ] Deploy iniciado desde Dokploy
- [ ] Build completado sin errores
- [ ] Contenedores iniciados correctamente
- [ ] Verificar: `docker ps` muestra todos los servicios
- [ ] Logs revisados sin errores críticos:
  - [ ] `docker logs tillas-api`
  - [ ] `docker logs tillas-web`
  - [ ] `docker logs tillas-admin`
  - [ ] `docker logs tillas-db`
  - [ ] `docker logs tillas-redis`
  - [ ] `docker logs tillas-minio`

---

## 🗄️ Base de Datos

- [ ] Migraciones Prisma ejecutadas: `docker exec tillas-api npx prisma migrate deploy`
- [ ] Seed de datos ejecutado: `docker exec tillas-api npx prisma db seed`
- [ ] Conexión a DB verificada: `docker exec tillas-db psql -U tillas_user -d tillas -c "SELECT 1"`
- [ ] Tablas creadas correctamente: `docker exec tillas-db psql -U tillas_user -d tillas -c "\dt"`

---

## 👤 Usuarios y Acceso

- [ ] Usuario administrador creado vía API
- [ ] Login probado en `https://admin.tillas.ec`
- [ ] Permisos de administrador verificados

---

## 💾 Minio (Almacenamiento)

- [ ] Minio Console accesible: `https://media-console.tillas.ec`
- [ ] Login con MINIO_ACCESS_KEY y MINIO_SECRET_KEY
- [ ] Bucket `tillas-media` creado
- [ ] Política de lectura pública configurada para el bucket
- [ ] Subida de imagen de prueba exitosa
- [ ] URL pública de imagen verificada: `https://media.tillas.ec/tillas-media/imagen.jpg`

---

## 🔒 Seguridad SSL

- [ ] Certificado SSL generado para `tillas.ec`
- [ ] Certificado SSL generado para `api.tillas.ec`
- [ ] Certificado SSL generado para `admin.tillas.ec`
- [ ] Certificado SSL generado para `media.tillas.ec`
- [ ] Verificar: `curl -vI https://tillas.ec 2>&1 | grep "SSL"`
- [ ] Verificar: `curl -vI https://api.tillas.ec 2>&1 | grep "SSL"`
- [ ] HTTPS funcionando en todos los dominios
- [ ] Redirección HTTP → HTTPS funcionando

---

## ✅ Verificación de Servicios

### API Backend
- [ ] Health check responde: `curl https://api.tillas.ec/health`
- [ ] Swagger accesible: `https://api.tillas.ec/api`
- [ ] CORS configurado correctamente
- [ ] Endpoints principales probados

### Web Frontend
- [ ] Página principal carga: `https://tillas.ec`
- [ ] Navegación funcional
- [ ] Conexión a API verificada
- [ ] Imágenes cargan correctamente

### Admin Panel
- [ ] Login funciona: `https://admin.tillas.ec`
- [ ] Dashboard carga correctamente
- [ ] CRUD de productos funcional
- [ ] Gestión de pedidos funcional

### Mobile API
- [ ] API_URL configurada: `https://api.tillas.ec`
- [ ] Endpoints de autenticación probados
- [ ] Endpoints de productos probados
- [ ] Notificaciones push configuradas (si aplica)

---

## 🔄 Backup y Recovery

- [ ] Script de backup configurado
- [ ] Backup manual probado:
  ```bash
  docker exec tillas-db pg_dump -U tillas_user tillas > backup_manual.sql
  ```
- [ ] Restore manual probado:
  ```bash
  cat backup_manual.sql | docker exec -i tillas-db psql -U tillas_user tillas
  ```
- [ ] Backup automático ejecutándose (verificar en 24h)
- [ ] Volumen `backup_data` montado y accesible

---

## 📊 Monitoreo

- [ ] Logs accesibles desde Dokploy
- [ ] Métricas de recursos monitoreadas
- [ ] Alertas configuradas (si aplica)
- [ ] Health checks pasando en todos los servicios
- [ ] Uso de CPU/RAM dentro de límites

---

## 🧹 Limpieza y Optimización

- [ ] Imágenes Docker no utilizadas eliminadas: `docker image prune -a`
- [ ] Contenedores detenidos eliminados: `docker container prune`
- [ ] Volúmenes no utilizados eliminados: `docker volume prune`
- [ ] Logs rotados y gestionados
- [ ] Espacio en disco verificado: `df -h`

---

## 📝 Documentación

- [ ] README actualizado con instrucciones de despliegue
- [ ] Variables de entorno documentadas
- [ ] Procedimiento de backup documentado
- [ ] Procedimiento de recovery documentado
- [ ] Contactos de soporte documentados

---

## 🎉 Checklist Final

- [ ] **TODOS** los items anteriores completados
- [ ] Aplicación accesible públicamente
- [ ] Sin errores en logs
- [ ] Backups funcionando
- [ ] SSL activo en todos los dominios
- [ ] Performance aceptable
- [ ] Documentación completa

---

## 📞 Contactos de Emergencia

- **Oracle Cloud Console**: https://cloud.oracle.com/
- **Dokploy Docs**: https://docs.dokploy.com
- **Equipo TILLAS.EC**: [tu-email@tillas.ec]

---

**Despliegue completado exitosamente** ✅

Fecha de despliegue: ________________

Responsable: ________________
