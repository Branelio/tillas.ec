# ==========================================
# TILLAS.EC — API Dockerfile (Multi-stage)
# Context: raíz del monorepo
# ==========================================

FROM node:20-alpine AS builder

WORKDIR /app

# 1. Copiar archivos de dependencias
COPY packages/database/package*.json ./packages/database/
COPY packages/database/prisma ./packages/database/prisma/
COPY packages/api/package*.json ./packages/api/

# 2. Instalar dependencias
RUN cd packages/database && npm ci --ignore-scripts
RUN cd packages/api && npm ci

# 3. Copiar código fuente
COPY packages/database ./packages/database
COPY packages/api ./packages/api

# 4. Generar Prisma Client y compilar
RUN cd packages/database && npx prisma generate
RUN cd packages/api && npm run build

# ─── Production ───
FROM node:20-alpine AS runner

WORKDIR /app

# Instalar solo dependencias de producción
COPY packages/api/package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copiar artefactos del builder
COPY --from=builder /app/packages/api/dist ./dist
COPY --from=builder /app/packages/database/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/packages/database/prisma ./prisma

# Instalar Prisma CLI para migraciones en producción
RUN npm i -g prisma@latest

ENV NODE_ENV=production
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

# Ejecutar migraciones y luego iniciar
CMD ["sh", "-c", "prisma migrate deploy --schema ./prisma/schema.prisma && node dist/main"]
