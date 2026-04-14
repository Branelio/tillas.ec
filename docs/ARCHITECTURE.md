# 🧠 CONTEXTO GENERAL DEL PROYECTO
- **Nombre del proyecto**: Tillas.ec
- **Objetivo principal**: Plataforma de comercio electrónico de nicho especializada en la venta de sneakers, ofreciendo Drops (lanzamientos exclusivos), programa de lealtad, gestión de órdenes y soporte para pagos locales en Ecuador (DeUna).
- **Problema que resuelve**: Crear una experiencia de compra premium, unificada y fluida para los entusiastas de sneakers en Ecuador, con integraciones específicas del mercado local (ej. pagos con QR, cálculo local de envíos) y un sistema robusto para manejar alta demanda temporal (Drops).
- **Estado actual**: Desarrollo Avanzado (Camino a Producción / Beta).
- **Fecha de última actualización**: 24 de Marzo de 2026.

---

# 🏗️ ARQUITECTURA DEL SISTEMA
- **Tipo de arquitectura**: Arquitectura orientada a servicios estructurada bajo un Monorepo. Separación estricta de responsabilidades (Backend aislado, plataformas Web, App y Admin consumen vía API REST/WebSockets).
- **Diagrama textual de alto nivel**:
  ```text
  [ Mobile App (Expo) ] <--------> [ API Gateway (NestJS) ]
                                            |
  [ Web App (Next.js) ] <-------->          |-----> [ PostgreSQL DB ]
                                            |-----> [ Redis Cache ]
  [ Admin Panel (Next) ] <------->          |-----> [ DeUna API ]
  ```
- **Componentes principales**:
  - `apps/mobile`: App iOS/Android nativa.
  - `apps/web`: Plataforma de e-commerce enfocada al cliente final.
  - `apps/admin`: Panel de control para el negocio.
  - `packages/api`: Núcleo de lógica de negocio, autenticación, y orquestación de pagos.
  - `packages/database`: Abstracción de acceso a datos compartida.
- **Flujo de datos**: Clientes → API → DB. Para pagos: Cliente realiza transferencia bancaria → Sube comprobante → Admin verifica → Orden confirmada.
- **Dependencias externas**: Oracle Cloud Infrastucture (Hosting), Amazon S3 o MinIO (Storage de Imágenes genéricas).

---

# 🧰 STACK TECNOLÓGICO

## Frontend
- **Mobile**: React Native con Expo (SDK 54), Expo Router (File-based navigation).
- **Web & Admin**: Next.js 14 (App Router), React, Tailwind CSS.
- **State Management**: Zustand (Auth, Cart, persistencia con secure-store/localStorage).
- **Data Viz**: Recharts (para dashboard administrativo).

## Backend
- **Framework**: NestJS 10 (TypeScript puro).
- **Real-time**: Socket.io (notificaciones y sincronización de status de pagos/drops).

## Base de datos
- **Relacional**: PostgreSQL 16.
- **ORM**: Prisma.
- **Caché / Jobs**: Redis 7.

## Infraestructura / DevOps
- **Contenedores**: Docker, Docker Compose.
- **CI/CD & Orquestación**: GitHub Actions + Dokploy (PaaS).
- **Proxy/SSL**: Traefik (integrado con Dokploy) con Let's Encrypt.
- **Host**: Oracle Cloud (Instancia ARM Always Free, 24GB RAM).

## Herramientas adicionales
- TypeScript ecosistema completo.
- ESLint & Prettier.

---

# 📂 ESTRUCTURA DEL PROYECTO

```text
/
├── apps/
│   ├── mobile/         # Aplicación móvil Expo. Core en `app/` y `src/screens`
│   ├── web/            # E-commerce frontend en Next.js
│   └── admin/          # Panel administrativo en Next.js
├── packages/
│   ├── api/            # Backend NestJS. Dividido por módulos funcionales
│   └── database/       # Eschema de Prisma, migraciones y seeders
├── docs/               # Documentación y memoria viva (ej. DEPLOYMENT.md)
└── package.json        # Raíz del monorepo
```

---

# ⚙️ FUNCIONALIDADES IMPLEMENTADAS

- **Infraestructura**: Configuración Docker, Dokploy y GitHub actions establecida.
- **Base de Datos**: Modelado completo mediante Prisma y seeding inicial operativo.
- **Backend API (11 Módulos)**: 
  - Funcionalidades listas: Autenticación (JWT modular), Cart, Products, Orders (con delivery dates), Drops, Loyalty (Tillas Points), Reviews, Returns y Users.
  - Pagos: Transferencia bancaria (Banco Pichincha) con subida de comprobante, verificación admin (aprobar/rechazar), notificación email.
  - Media Storage: Subida de imágenes a MinIO (S3) con endpoints de upload simple y múltiple.
  - Health Check: Endpoint `/health` con verificación de conexión a DB.
- **Admin Panel**: Dashboard visual, listado de productos con **subida de imágenes drag & drop**, Drops, tabla de órdenes con items/thumbnails, **detalle de pedido con verificación de comprobantes de pago (aprobar/rechazar), formulario de cambio de estado, timeline, info de delivery**.
- **Web App**: 
  - 16+ rutas funcionales incluyendo catálogo, navegación autenticada.
  - **Flujo de pago por transferencia bancaria**: Checkout → Datos de cuenta + QR → Subir comprobante → Verificación admin.
  - **Detalle de pedido** con pipeline visual, items, delivery info, historial de estados, tracking.
- **Mobile App**: 
  - Migración exitosa a Expo Router (SDK 54).
  - 10+ pantallas migradas (Autenticación, Home, Explorar, Producto, Lealtad).
  - Componente de Carrito de Compras funcional.
  - Flujo de *Checkout* optimizado para el contexto Ecuatoriano (Envío Local/Nacional) preparando el payload de la orden.

---

# 🚧 FUNCIONALIDADES EN DESARROLLO

- **Drops en Tiempo Real**: Pulir la actualización de estados de los Drops cuando un evento llega a la hora pautada ("Live").
- **Mobile App — Flujo de pago por transferencia**: Migrar pantalla de pago móvil al nuevo flujo de transferencia bancaria.

---

# 🐞 ERRORES CONOCIDOS / DEUDA TÉCNICA

- **[RESUELTO RECIENTEMENTE]**: Errores graves de resolución del árbol de dependencias de NPM (ERESOLVE) entre múltiples versiones de React, Expo Router y Reanimated 4. Solucionado formateando caché y asegurando versiones strictas correspondientes con SDK 54, más adición del plugin `react-native-worklets-core`.
- **[LIMITACIÓN CONOCIDA]**: La app móvil necesita Expo SDK exacto (54) en el cliente Expo Go del desarrollador para conectarse exitosamente.
- **[DEUDA TÉCNICA]**: Falta implementar y automatizar los Test Unitarios (Unit Testing con Jest) en los conectores críticos del backend, en particular el Gateway de Pagos.

---

# 🔐 DECISIONES TÉCNICAS IMPORTANTES

- **Monorepo**: Decidido para poder compartir fácilmente configuraciones y definiciones de tipado entre los diferentes frentes que integran todo el ecosistema.
- **Expo Router sobre React Navigation**: Modificado para permitir navegación basada en rutas y simplificar drásticamente el manejo de Deeplinks.
- **Pago por Transferencia Bancaria sobre DeUna**: Se descartó DeUna (5% comisión por transacción) en favor de transferencia bancaria directa (Banco Pichincha). El admin verifica comprobantes manualmente — más económico a escala.
- **Dokploy en Oracle Cloud Arm**: Solución altamente económica y eficiente en recursos para correr toda la orquestación (PaaS), Base de Datos (PostgreSQL) y Backend minimizando dependencia en nubes costosas en etapa temprana.

---

# 🔄 CAMBIOS RECIENTES

- **Migración a Transferencia Bancaria + Media Storage + Deploy Ready (Mar 24, 2026)**:
  - **[MAJOR]** Sistema de pagos reescrito: DeUna eliminado (5% comisión), reemplazado por transferencia bancaria (Banco Pichincha #2209004611).
  - Página de pago web con datos de cuenta, QR, y subida de comprobante.
  - Admin: verificación de comprobantes (aprobar/rechazar) con imagen expandible.
  - API: endpoints de bank-info, upload-receipt, verify, pending payments.
  - Schema Prisma actualizado: campos de DeUna reemplazados por receiptImage, verifiedBy, adminNote.
  - Componente `ImageUploader` en admin con drag & drop.
  - Endpoint `/health`, Dockerfiles mejorados, pipeline CI/CD con admin, DEPLOYMENT.md reescrito.

- **Flujo E2E pagos DeUna + Detalle de Pedidos (Mar 23, 2026)** [DEPRECADO]:
  - Pantalla de pago QR DeUna (eliminada y reemplazada por transferencia bancaria).
  - Detalle de pedido admin con formulario de estado, timeline, info cliente/delivery/pago (VIGENTE).
  - Detalle de pedido web mejorado con fechas de delivery (VIGENTE).

- **Order Delivery Logic (Mar 17, 2026)**:
  - Calculadora de fechas de entrega basada en corte semanal (Martes 18h → entrega Sábado).

- **Mobile App Upgrade (Mar 16, 2026)**:
  - Transición completa y funcional desde una navegación dual defectuosa hacia `expo-router` puro.
  - Reescritura de `CheckoutScreen` y `CartTab` para permitir una compra real.

---

# 📅 ROADMAP / PRÓXIMOS PASOS

1. **Prioridad Crítica**: Primer deploy real en Oracle Cloud con Dokploy (validar pipeline completo).
2. **Alta**: Migrar flujo de pago por transferencia bancaria a la app móvil.
3. **Media**: Afinar la lógica front-back de los lanzamientos (Drops) incluyendo websockets para contadores en tiempo real sin saturar base de datos.
4. **Baja**: Pulir visuales (Motion, Transitions) e internacionalización incipiente.

---

# 🧪 INSTRUCCIONES DE DESPLIEGUE Y EJECUCIÓN

## Docker Services / Dependencias Lógicas (Database & Redis)
Asegúrese que una instancia local o remota de Redis/Postgres esté operando (o use `docker-compose`).

## Ejecución Local Monorepo
1. **API Backend**: 
   ```bash
   cd packages/api && npm install && npm run start:dev
   ```
2. **Next.js Web / Admin**:
   ```bash
   cd apps/web && npm install && npm run dev
   cd apps/admin && npm install && npm run dev
   ```
3. **Mobile App**:
   ```bash
   cd apps/mobile && npm install --legacy-peer-deps 
   npx expo start -c
   ```

## Producción
Revisar el archivo `docs/DEPLOYMENT.md` para visualizar todo el pipeline CI/CD con GitHub actions y contenedores manejados automáticamente en Dokploy.

---

# 📊 ESTADO GENERAL DEL PROYECTO
- **Métrica Subjetiva de Progreso**: ~90%
- La fase de cimentación, estructura y gestión de medios está completada.
- **Riesgo Actual**: Bajo-Moderado. Focalizado en conectividad con flujos externos (DeUna) y primer deploy real. El MVP está esencialmente completo.
