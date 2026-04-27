# ==========================================
# TILLAS.EC — API Dockerfile (Multi-stage)
# Context: raíz del monorepo
# ==========================================

FROM node:20-alpine AS builder

WORKDIR /app

# 1. Copiar archivos de dependencias del monorepo
COPY package.json package-lock.json ./
COPY packages/api/package.json ./packages/api/
COPY packages/database/package.json ./packages/database/
COPY packages/database/prisma ./packages/database/prisma/
COPY apps/web/package.json ./apps/web/
COPY apps/admin/package.json ./apps/admin/

# 2. Instalar dependencias del monorepo usando el lockfile raíz
RUN apk add --no-cache python3 make g++
RUN npm ci --workspaces --include-workspace-root --ignore-scripts

# 3. Copiar código fuente
COPY packages/database ./packages/database
COPY packages/api ./packages/api
COPY apps/web ./apps/web
COPY apps/admin ./apps/admin

# 4. Generar Prisma Client y compilar
RUN npm --workspace packages/database exec prisma generate
RUN npm --workspace packages/api run build

# ─── Production ───
FROM node:20-alpine AS runner

WORKDIR /app

# Instalar solo dependencias de producción desde el lockfile raíz
COPY package.json package-lock.json ./
COPY packages/api/package.json ./packages/api/
COPY packages/database/package.json ./packages/database/
COPY apps/web/package.json ./apps/web/
COPY apps/admin/package.json ./apps/admin/
RUN apk add --no-cache python3 make g++
RUN npm ci --omit=dev --workspaces --include-workspace-root --ignore-scripts

# Copiar artefactos del builder
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma

# Instalar Prisma CLI para migraciones en producción
RUN npm i -g prisma@6.4.0

ENV NODE_ENV=production
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

# Ejecutar migraciones y luego iniciar
CMD ["sh", "-c", "prisma migrate deploy --schema ./packages/database/prisma/schema.prisma && node packages/api/dist/main"]
