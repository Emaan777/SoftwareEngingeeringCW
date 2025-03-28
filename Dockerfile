# Multi-stage build for better optimization
# Stage 1: Dependencies
FROM node:18-alpine AS dependencies

# Set working directory
WORKDIR /app

# Copy package files for efficient caching
COPY package*.json ./

# Install all dependencies, will use package-lock.json if it exists
RUN if [ -f package-lock.json ]; then \
      npm ci --no-optional && npm cache clean --force; \
    else \
      npm install --no-optional && npm cache clean --force; \
    fi

# Stage 2: Production build
FROM node:18-alpine AS production-build
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN if [ -f package-lock.json ]; then \
      npm ci --only=production --no-optional && npm cache clean --force; \
    else \
      npm install --only=production --no-optional && npm cache clean --force; \
    fi

# Install supervisor globally only for non-production builds
RUN npm install -g supervisor@0.12.0

# Stage 3: Final image
FROM node:18-alpine AS final

# Create a non-root user for security
RUN addgroup -S nodeapp && adduser -S nodeapp -G nodeapp

# Set environment and work directory
ENV NODE_ENV=production
ENV PORT=8000
WORKDIR /app

# Copy production dependencies from the production-build stage
COPY --from=production-build /app/node_modules /app/node_modules
COPY --from=production-build /usr/local/bin/supervisor /usr/local/bin/supervisor

# Copy application code
COPY . .

# Create required directories with proper permissions
RUN mkdir -p /app/src/views && \
    chown -R nodeapp:nodeapp /app

# Switch to non-root user
USER nodeapp

# Expose the application port
EXPOSE 8000

# Health check to verify the app is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8000/api/debug || exit 1

# Use different start commands based on environment
CMD if [ "$NODE_ENV" = "development" ]; then \
      npm run dev; \
    else \
      npm start; \
    fi


