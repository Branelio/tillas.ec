# Plan de Accion 30/60/90 dias - Tillas.ec

## Objetivo
Consolidar estabilidad tecnica, cerrar brechas de calidad y dejar el proyecto listo para una operacion de produccion confiable y escalable.

## Resumen Ejecutivo
- Estado actual estimado: MVP avanzado con backend/admin fuertes y brecha de calidad en pruebas.
- Prioridad 1: pruebas y confiabilidad de flujos criticos.
- Prioridad 2: paridad funcional mobile frente a web/admin.
- Prioridad 3: observabilidad, rendimiento y seguridad operativa.

## Plan a 30 dias
### Calidad y estabilidad
- Implementar pruebas unitarias en API para auth, payments, orders y cart.
- Agregar pruebas de integracion para checkout y verificacion de pago.
- Definir un umbral minimo de cobertura para API (meta inicial: 60%).

### Datos y migraciones
- Auditar migraciones Prisma pendientes y validar consistencia entre schema y DB.
- Crear checklist de migracion para deploy (dev, staging, prod).

### Frontend web/admin
- Estandarizar manejo de errores y estados de carga/vacio.
- Corregir inconsistencias de validacion en formularios de admin.

### Entregables 30 dias
- Pipeline CI pasando con lint, build y tests base.
- Flujos criticos de compra cubiertos por pruebas automatizadas.

## Plan a 60 dias
### Mobile parity
- Completar flujo de pago por transferencia en mobile (incluyendo subida de comprobante).
- Homologar comportamiento de carrito, checkout y estados de orden con web.
- Validar UX de errores de red y reintentos.

### Tiempo real y performance
- Optimizar eventos de drops y notificaciones en tiempo real para evitar saturacion.
- Revisar consultas de dashboard y pedidos para reducir cargas innecesarias.
- Introducir cache selectivo en endpoints de lectura frecuente.

### Entregables 60 dias
- Mobile con paridad funcional minima para compra end-to-end.
- Mejora medible de latencia en endpoints criticos.

## Plan a 90 dias
### Operacion de produccion
- Configurar observabilidad completa: logs estructurados, metricas y alertas.
- Definir politicas de respaldo, restauracion y pruebas periodicas de recovery.
- Endurecer seguridad: revision de CORS, roles/permisos y secretos.

### Calidad de release
- Agregar pruebas E2E para: registro, compra, pago, verificacion admin y tracking.
- Establecer criterios de release y rollback documentados.

### Entregables 90 dias
- Go-live con monitoreo activo y runbooks de incidentes.
- Proceso de despliegue repetible con criterios de calidad claros.

## KPIs sugeridos
- Cobertura API >= 75% en modulos criticos.
- Tasa de fallos en deploy < 5%.
- Tiempo medio de recuperacion (MTTR) < 60 minutos.
- Tiempo de respuesta p95 en endpoints criticos < 500 ms.

## Orden de ejecucion recomendado
1. Pruebas y migraciones.
2. Paridad mobile.
3. Observabilidad y seguridad operativa.
