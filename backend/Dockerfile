# ================================
# Stage 1: Production dependencies
# ================================
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev --no-audit --no-fund


# ================================
# Stage 2: Production runtime
# ================================
FROM node:22-alpine AS runtime

RUN apk add --no-cache \
    dumb-init \
    wget

RUN addgroup -g 1001 -S nodejs && \
    adduser -S homeease -u 1001 -G nodejs

WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps --chown=homeease:nodejs /app/node_modules ./node_modules

COPY --chown=homeease:nodejs . .

USER homeease

EXPOSE 5000

HEALTHCHECK \
    --interval=30s \
    --timeout=10s \
    --start-period=20s \
    --retries=3 \
    CMD wget -qO- http://127.0.0.1:5000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "server.js"]