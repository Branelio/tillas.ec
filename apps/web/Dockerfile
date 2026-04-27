# ==========================================
# TILLAS.EC — Web Frontend Dockerfile
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
RUN apk add --no-cache python3 make g++
RUN npm ci --workspaces --include-workspace-root

# Copiar código y compilar
COPY . .

# Build args para variables públicas de Next.js
ARG NEXT_PUBLIC_API_URL=https://api.tillas.ec
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm --workspace apps/web run build

# ─── Production ───
FROM node:20-alpine AS runner
WORKDIR /app/apps/web

ENV NODE_ENV=production

# Copiar standalone server + assets estáticos
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/public ./public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node", "server.js"]
