# 🚀 Admin Panel - Quick Reference Guide

## 📱 Nuevas Páginas Disponibles

### 1. **Dashboard** (`/dashboard`)
- **Propósito**: Vista general del negocio
- **Datos mostrados**:
  - Ventas del día con tendencia
  - Pedidos pendientes
  - Productos activos
  - Total usuarios
  - Ingresos del mes
  - Gráfico de ventas (últimos 7 días)
  - Gráfico de ventas por marca
  - Últimos 5 pedidos

### 2. **Productos** (`/products`)
- **Propósito**: Gestión del catálogo
- **Funcionalidades**:
  - ✅ Crear productos con variantes
  - ✅ Editar productos existentes
  - ✅ Archivar productos
  - ✅ Búsqueda por nombre
  - ✅ Upload de imágenes
  - ✅ Marcar como destacado
- **Notificaciones**: Toast en crear/editar/eliminar

### 3. **Pedidos** (`/orders`)
- **Lista** (`/orders`):
  - ✅ Filtros por estado
  - ✅ Actualización rápida de estado
  - ✅ Vista detallada por pedido
  
- **Detalle** (`/orders/[id]`):
  - ✅ Información completa del pedido
  - ✅ Timeline de estados
  - ✅ Datos del cliente
  - ✅ Dirección de envío
  - ✅ Productos con imágenes
  - ✅ Desglose de pago
  - ✅ Historial de cambios
  - ✅ Actualizar estado con notas

### 4. **Pagos** (`/payments`) ⭐ NUEVO
- **Propósito**: Verificar transferencias bancarias
- **Funcionalidades**:
  - ✅ Ver pagos pendientes
  - ✅ Ver comprobante de pago
  - ✅ Aprobar/rechazar con notas
  - ✅ Filtros: Pendientes, Aprobados, Rechazados
- **Estados**:
  - `PROCESSING` → Verificar
  - `APPROVED` → Pago confirmado
  - `REJECTED` → Pago rechazado

### 5. **Drops** (`/drops`)
- **Propósito**: Gestionar lanzamientos especiales
- **Funcionalidades**:
  - ✅ Crear drops programados
  - ✅ Iniciar drops en vivo
  - ✅ Finalizar drops
  - ✅ Gestionar raffles

### 6. **Usuarios** (`/users`)
- **Propósito**: Gestión de clientes y admins
- **Funcionalidades**:
  - ✅ Ver todos los usuarios
  - ✅ Búsqueda por nombre/email
  - ✅ Promover a ADMIN 🛡️
  - ✅ Degradar a USER 👤
  - ✅ Activar/Desactivar usuarios
  - ✅ Ver nivel de lealtad (BRONZE, SILVER, GOLD, ELITE)
  - ✅ Ver cantidad de pedidos

### 7. **Devoluciones** (`/returns`) ⭐ NUEVO
- **Propósito**: Gestionar devoluciones
- **Funcionalidades**:
  - ✅ Ver solicitudes de devolución
  - ✅ Motivo de devolución
  - ✅ Productos involucrados
  - ✅ Monto a reembolsar
  - ✅ Aprobar/Rechazar con notas
  - ✅ Filtros por estado

### 8. **Configuración** (`/settings`) ⭐ NUEVO
- **Propósito**: Configuración del sistema
- **Secciones**:

#### Información Bancaria
- Banco
- Número de cuenta
- Tipo (Ahorros/Corriente)
- Titular
- Cédula/RUC

#### Configuración del Sitio
- Nombre del sitio
- URL
- Costo de envío
- Umbral envío gratis
- Moneda
- Zona horaria

---

## 🔔 Sistema de Notificaciones (Toast)

### Tipos de Toast
```typescript
success  // ✅ Verde - Operaciones exitosas
error    // ❌ Rojo - Errores críticos
warning  // ⚠️ Amarillo - Advertencias
info     // ℹ️ Azul - Información general
```

### Uso en Código
```typescript
import { useToast } from '@/components/ToastProvider';

const MyComponent = () => {
  const toast = useToast();

  const handleAction = async () => {
    try {
      await someApiCall();
      toast.success('Acción completada', 'Descripción opcional');
    } catch (err) {
      toast.error('Error', 'No se pudo completar la acción');
    }
  };
};
```

### Características
- ⏱️ Auto-dismiss: 5 segundos
- ❌ Cierre manual disponible
- 📱 Posición: Esquina superior derecha
- 🎨 Animación: Slide-in suave

---

## 🔧 Manejo de Errores

### Funciones Disponibles
**Archivo**: `apps/admin/lib/error-handling.ts`

```typescript
// 1. Convertir error de API en mensaje amigable
const message = handleApiError(error);

// 2. Wrapper con callbacks
await withErrorHandling(
  () => api.post('/endpoint', data),
  (data) => toast.success('Éxito'),
  (error) => toast.error(error)
);

// 3. Safe API call
const { data, error } = await safeApiCall(() => api.get('/endpoint'));
if (error) {
  toast.error(error);
}
```

---

## 📊 Endpoints de API Disponibles

### Dashboard
```typescript
dashboardApi.getStats()          // GET /admin/stats
dashboardApi.getRecentOrders()   // GET /admin/recent-orders
dashboardApi.getSalesReport(7)   // GET /admin/sales-report?days=7
dashboardApi.getBrandSales()     // GET /admin/brand-sales
```

### Products
```typescript
adminProductsApi.getAll(params)       // GET /products
adminProductsApi.getById(id)          // GET /products/:id
adminProductsApi.create(data)         // POST /products
adminProductsApi.update(id, data)     // PATCH /products/:id
adminProductsApi.delete(id)           // DELETE /products/:id
```

### Orders
```typescript
adminOrdersApi.getAll(params)         // GET /orders/all
adminOrdersApi.getById(id)            // GET /orders/:id
adminOrdersApi.updateStatus(id, status, note)  // PATCH /orders/:id/status
```

### Payments
```typescript
adminPaymentsApi.getPending()         // GET /payments/pending
adminPaymentsApi.getAll(params)       // GET /payments/all
adminPaymentsApi.verify(orderId, approved, note)  // PATCH /payments/verify/:orderId
```

### Users
```typescript
adminUsersApi.getAll(params)          // GET /users
adminUsersApi.getById(id)             // GET /users/:id
adminUsersApi.updateRole(id, role)    // PATCH /users/:id/role
adminUsersApi.updateStatus(id, isActive)  // PATCH /users/:id/status
```

### Returns
```typescript
adminReturnsApi.getAll(params)        // GET /returns/all
adminReturnsApi.updateStatus(id, status, note)  // PATCH /returns/:id/status
```

### Drops
```typescript
adminDropsApi.getAll()                // GET /drops
adminDropsApi.create(data)            // POST /drops
adminDropsApi.updateStatus(id, status)  // PATCH /drops/:id/status
```

### Media
```typescript
adminMediaApi.upload(file)            // POST /media/upload
```

---

## 🎨 Componentes Reutilizables

### ToastProvider
**Ubicación**: `apps/admin/components/ToastProvider.tsx`

**Uso**: Ya integrado en `layout.tsx`, disponible globalmente

### ImageUploader
**Ubicación**: `apps/admin/components/ImageUploader.tsx`

**Props**:
```typescript
interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}
```

---

## ⌨️ Atajos de Teclado (Recomendados)

| Atajo | Acción |
|-------|--------|
| `Ctrl + K` | Búsqueda rápida (por implementar) |
| `Esc` | Cerrar modales |
| `Ctrl + S` | Guardar formulario (por implementar) |

---

## 🔄 Flujos de Trabajo Comunes

### Verificar Pago de Transferencia
1. Ir a **Pagos** en sidebar
2. Filtrar por "Pendientes" (default)
3. Click en 👁️ para ver comprobante
4. Revisar monto y datos
5. Click en ✅ Aprobar o ❌ Rechazar
6. Agregar nota (opcional)
7. Confirmar acción

### Actualizar Estado de Pedido
**Opción A - Rápida (desde lista):**
1. Ir a **Pedidos**
2. Filtrar por estado si es necesario
3. Click en botón de siguiente estado (→ Preparando, etc.)

**Opción B - Detallada (desde detalle):**
1. Ir a **Pedidos**
2. Click en pedido específico
3. Ver información completa
4. Agregar nota (opcional)
5. Click en botón de siguiente estado
6. O usar botones de cancelar si es PENDING

### Gestionar Devolución
1. Ir a **Devoluciones**
2. Filtrar por "Pendientes"
3. Click en 👁️ para ver detalles
4. Revisar productos y motivo
5. Click en ✅ Aprobar o ❌ Rechazar
6. Agregar nota explicativa
7. Confirmar

### Promover Usuario a Admin
1. Ir a **Usuarios**
2. Buscar usuario si es necesario
3. Click en 🛡️ (escudo) en columna Acciones
4. Esperar confirmación visual
5. Rol cambia de "Cliente" a "Admin"

---

## 📱 Responsive Design

El admin panel es completamente responsive:

| Breakpoint | Comportamiento |
|------------|----------------|
| `mobile` (< 768px) | Sidebar colapsable con menú hamburguesa |
| `tablet` (768-1024px) | Sidebar visible, grid de 2 columnas |
| `desktop` (> 1024px) | Sidebar fijo, grid de 3-4 columnas |

---

## 🎯 Estados de Pedido

### Flujo Normal
```
PENDING → PAID → PREPARING → SHIPPED → DELIVERED
```

### Estados Especiales
- `CANCELLED` - Pedido cancelado (desde PENDING)
- `REFUNDED` - Pedido reembolsado
- `PAYMENT_PROCESSING` - Pago en verificación

### Colores de Estados
| Estado | Color | Clase Tailwind |
|--------|-------|----------------|
| PENDING | 🟡 Amarillo | `bg-yellow-500/20 text-yellow-400` |
| PAID | 🟢 Verde | `bg-admin-primary/20 text-admin-primary` |
| PREPARING | 🟣 Morado | `bg-purple-500/20 text-purple-400` |
| SHIPPED | 🔵 Azul | `bg-blue-500/20 text-blue-400` |
| DELIVERED | 🟢 Verde | `bg-admin-success/20 text-admin-success` |
| CANCELLED | 🔴 Rojo | `bg-admin-error/20 text-admin-error` |

---

## 💾 Datos Mock vs Reales

### Dashboard
- ✅ **Real**: Stats desde `/admin/stats`
- ✅ **Real**: Ventas desde `/admin/sales-report`
- ✅ **Real**: Marcas desde `/admin/brand-sales`
- ✅ **Real**: Pedidos desde `/orders/all`

### Charts
- **Antes**: Datos hardcodeados
- **Ahora**: Datos dinámicos desde API
- **Fallback**: Mensaje "Sin datos" si no hay información

---

## 🔐 Autenticación

### Login
- **Endpoint**: `/login`
- **Credenciales**: Email + Password
- **Storage**: localStorage + cookies
- **Middleware**: Protección automática en `/dashboard`, `/products`, etc.

### Logout
- Click en "Cerrar sesión" en sidebar
- Limpia localStorage y cookies
- Redirect automático a `/login`

---

## 📚 Resources Adicionales

- **Documentación Completa**: Ver `ADMIN_IMPROVEMENTS.md`
- **API Reference**: Swagger en `http://localhost:4000/api`
- **Prisma Studio**: `npm run db:studio`
- **Admin Dev**: `npm run dev:admin` (puerto 3001)

---

**Última Actualización**: Abril 2026
**Versión**: Admin Panel v2.0.0
