# Multi-stage build for JSON Converter Worker
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the worker
RUN npm run build

# Production stage
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies and wrangler
RUN npm install --production && \
    npm install -g wrangler

# Copy built worker, source files, and wrangler config
COPY --from=builder /app/worker.js ./
COPY --from=builder /app/src ./src
COPY wrangler.toml ./

# Expose Wrangler dev server port
EXPOSE 8787

# Set environment variables
ENV NODE_ENV=production

# Start Wrangler dev server in non-interactive mode
# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Start using entrypoint script
CMD ["./docker-entrypoint.sh"]
