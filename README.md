# 👟 TILLAS.EC

**La tienda de sneakers #1 de Ecuador 🇪🇨**

Plataforma de e-commerce de zapatillas para el mercado ecuatoriano. App móvil (iOS/Android), sitio web y panel de administración.

## 🏗️ Stack Tecnológico

| Componente    | Tecnología                         |
| ------------- | ---------------------------------- |
| Mobile        | React Native + Expo SDK 52         |
| Web           | Next.js 14 + Tailwind CSS          |
| Admin         | Next.js 14 + Tailwind CSS          |
| Backend       | NestJS 10 + TypeScript             |
| Base de Datos | PostgreSQL 16 + Prisma ORM         |
| Caché         | Redis 7                            |
| Imágenes      | Minio (S3 self-hosted)             |
| Pagos         | Transferencia bancaria (Banco Pichincha) |
| Real-time     | Socket.io                          |
| Push          | Firebase Cloud Messaging           |
| Deploy        | Dokploy + Oracle Cloud Always Free |

## 📁 Estructura

```
tillas-ec/
├── apps/
│   ├── mobile/       # React Native + Expo (iOS + Android)
│   ├── web/          # Next.js 14 (tillas.ec)
│   └── admin/        # Next.js 14 (admin.tillas.ec)
├── packages/
│   ├── api/          # NestJS Backend (api.tillas.ec)
│   └── database/     # Prisma Schema + Migrations + Seed
├── docker-compose.yml      # Producción (Dokploy)
├── docker-compose.dev.yml  # Desarrollo local
└── .github/workflows/      # CI/CD
```

## 🚀 Inicio Rápido

### 1. Clonar y configurar

```bash
git clone <repo-url>
cd tillas-ec
cp .env.example .env
# Editar .env con tus credenciales
```

### 2. Levantar infraestructura local

```bash
# Inicia PostgreSQL, Redis y Minio
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Configurar base de datos

```bash
cd packages/database
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Iniciar backend

```bash
cd packages/api
npm install
npm run start:dev
# API en http://localhost:4000
# Swagger en http://localhost:4000/api
```

### 5. Iniciar web

```bash
cd apps/web
npm install
npm run dev
# Web en http://localhost:3000
```

### 6. Iniciar mobile

```bash
cd apps/mobile
npm install
npx expo start
# Escanear QR con Expo Go
```

### 7. Iniciar admin

```bash
cd apps/admin
npm install
npm run dev
# Admin en http://localhost:3001
```

## ☁️ Despliegue en Producción (Dokploy + Oracle Cloud)

Para desplegar TILLAS.EC en Oracle Cloud usando Dokploy:

### Requisitos
- Instancia Ubuntu 24.04 en Oracle Cloud (recomendado: VM.Standard.A1.Flex con 4 OCPU, 24GB RAM)
- Dominio configurado con registros DNS apuntando a la IP pública
- Docker y Docker Compose instalados en el servidor

### Pasos de Despliegue

1. **Instalar Dokploy en el servidor:**
   ```bash
   curl -fsSL https://dokploy.com/install.sh | sh
   ```

2. **Acceder al panel de Dokploy:**
   ```
   http://TU_IP_PUBLICA:3000
   ```

3. **Configurar el proyecto:**
   - Conectar repositorio Git
   - Seleccionar `docker-compose.dokploy.yml`
   - Configurar variables de entorno desde `.env.production`

4. **Desplegar:**
   - Iniciar deploy desde el panel de Dokploy
   - Ejecutar migraciones: `docker exec tillas-api npx prisma migrate deploy`
   - Ejecutar seed: `docker exec tillas-api npx prisma db seed`

📖 **Guía completa:** Ver [docs/DOKPLOY_DEPLOYMENT.md](docs/DOKPLOY_DEPLOYMENT.md)

✅ **Checklist:** Usar [docs/DOKPLOY_CHECKLIST.md](docs/DOKPLOY_CHECKLIST.md) para verificar el despliegue

## 💳 Pagos por Transferencia Bancaria

Pagos exclusivos vía transferencia bancaria (Banco Pichincha):

1. Usuario confirma compra → Backend genera datos bancarios + QR
2. Usuario realiza transferencia desde su app bancaria
3. Usuario sube comprobante de pago en la plataforma
4. Admin verifica el comprobante y confirma el pago
5. Socket.io notifica al cliente en tiempo real

## 🇪🇨 Adaptación Ecuador

- Precios en **USD** (moneda oficial)
- Tallas en formato **US** + conversión EU/CM
- Direcciones: ciudad → sector → calle principal/secundaria → referencia
- Envío Quito: $3.50 | Nacional: $7.00
- Horario: ECT (UTC-5)

## 📄 Licencia

Privado — © 2026 TILLAS.EC
