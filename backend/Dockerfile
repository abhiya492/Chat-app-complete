# Multi-stage build for production optimization
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package.json for module type
COPY --chown=nodejs:nodejs package*.json ./

# Copy dependencies from base stage
COPY --from=base /app/node_modules ./node_modules

# Copy source code
COPY --chown=nodejs:nodejs src ./src

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/auth/check', (res) => { process.exit(res.statusCode < 500 ? 0 : 1) })"

# Start the application
CMD ["node", "src/index.js"]