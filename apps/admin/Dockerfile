# ==========================================
# TILLAS.EC — Admin Panel Dockerfile
# Context: raíz del monorepo
# ==========================================

FROM node:20-alpine AS builder
WORKDIR /app

# Instalar dependencias desde el lockfile raíz
COPY package.json package-lock.json ./
COPY packages/api/package.json ./packages/api/
COPY packages/database/package.json ./packages/database/
COPY apps/web/package.json ./apps/web/
COPY apps/admin/package.json ./apps/admin/
RUN npm ci --workspaces --include-workspace-root

# Copiar código y compilar
COPY . .

# Build args para variables públicas de Next.js
ARG NEXT_PUBLIC_API_URL=https://api.tillas.ec
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm --workspace apps/admin run build

# ─── Production ───
FROM node:20-alpine AS runner
WORKDIR /app/apps/admin

ENV NODE_ENV=production

# Copiar standalone server + assets estáticos
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./.next/static
RUN mkdir -p ./public
COPY --from=builder /app/apps/admin/public/ ./public/

EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001 || exit 1

CMD ["node", "server.js"]
