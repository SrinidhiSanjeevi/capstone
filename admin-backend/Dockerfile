FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund


FROM node:22-alpine AS runtime
RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && \
    adduser -S homeease -u 1001 -G nodejs

WORKDIR /app
ENV NODE_ENV=production
# Baked-in default so the app listens on the same port the HEALTHCHECK
# probes, even if someone runs this container with a bare `docker run`
# and forgets -e PORT=5001 (docker-compose's `environment: PORT: 5001`
# still overrides this at runtime, same as before).
ENV PORT=5001

COPY --from=deps --chown=homeease:nodejs /app/node_modules ./node_modules
COPY --chown=homeease:nodejs . .

USER homeease

EXPOSE 5001

HEALTHCHECK --interval=30s \
  --timeout=10s \
  --start-period=20s \
  --retries=3 \
  CMD wget -qO- http://localhost:5001/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]