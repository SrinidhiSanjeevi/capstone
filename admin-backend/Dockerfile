# ============================================================
# Stage 1: Production dependencies
# ============================================================

FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev --no-audit --no-fund \
    && npm cache clean --force


# ============================================================
# Stage 2: Production runtime
# ============================================================

FROM node:22-alpine AS runtime

# Install only runtime utilities
RUN apk add --no-cache dumb-init wget

# Remove package managers from production image.
# npm is not required to run the Node.js application.
RUN rm -rf \
        /usr/local/lib/node_modules/npm \
        /usr/local/lib/node_modules/corepack \
        /opt/yarn-v1.22.22 \
    && rm -f \
        /usr/local/bin/npm \
        /usr/local/bin/npx \
        /usr/local/bin/corepack \
        /usr/local/bin/yarn \
        /usr/local/bin/yarnpkg

# Create non-root user
RUN addgroup -g 1001 -S nodejs \
    && adduser -S homeease -u 1001 -G nodejs

WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps --chown=homeease:nodejs /app/node_modules ./node_modules

COPY --chown=homeease:nodejs . .

USER homeease

EXPOSE 5001

HEALTHCHECK \
    --interval=30s \
    --timeout=10s \
    --start-period=20s \
    --retries=3 \
    CMD wget -qO- http://127.0.0.1:5001/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "server.js"]