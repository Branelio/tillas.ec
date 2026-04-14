# ==========================================
# TILLAS.EC — Web Frontend Dockerfile
# Context: raíz del monorepo
# ==========================================

FROM node:20-alpine AS builder
WORKDIR /app

# Instalar dependencias
COPY apps/web/package*.json ./
RUN npm ci

# Copiar código y compilar
COPY apps/web ./

# Build args para variables públicas de Next.js
ARG NEXT_PUBLIC_API_URL=https://api.tillas.ec
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ─── Production ───
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copiar standalone server + assets estáticos
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node", "server.js"]
