FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production


FROM node:22-alpine AS runtime
RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && \
    adduser -S homeease -u 1001 -G nodejs
WORKDIR /app
COPY --from=deps --chown=homeease:nodejs /app/node_modules ./node_modules
COPY --chown=homeease:nodejs . .
USER homeease
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
