# Multi-stage build for JSON Converter Worker
FROM node:18-alpine AS builder

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
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies and wrangler
RUN npm install --production && \
    npm install -g wrangler

# Copy built worker and source files
COPY --from=builder /app/worker.js ./
COPY --from=builder /app/src ./src

# Expose Wrangler dev server port
EXPOSE 8787

# Set environment variables
ENV NODE_ENV=development

# Start Wrangler dev server
CMD ["wrangler", "dev", "--ip", "0.0.0.0", "--port", "8787"]
