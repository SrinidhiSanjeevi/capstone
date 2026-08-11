# ============================================================
# Stage 1: Build React application
# ============================================================

FROM node:22-alpine AS build

WORKDIR /app

# Copy dependency files first for better Docker layer caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --no-audit --no-fund

# Copy application source
COPY . .

# Build React/Vite application
RUN npm run build


# ============================================================
# Stage 2: Nginx production runtime
# ============================================================

FROM nginx:1.29-alpine AS runtime

# Update Alpine packages to latest security fixes
RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache wget && \
    rm -rf /var/cache/apk/*

# Remove default Nginx configuration
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy our Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy React production build
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx listens on port 80
EXPOSE 80

# Container health check
HEALTHCHECK \
    --interval=30s \
    --timeout=5s \
    --start-period=10s \
    --retries=3 \
    CMD wget -qO- http://127.0.0.1/health || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]