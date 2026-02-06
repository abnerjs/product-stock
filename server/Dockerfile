# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npx tsc --outDir dist

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY drizzle.config.ts ./

# Install all dependencies (need drizzle-kit for db:push)
RUN npm install

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db ./src/db

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3333

CMD ["node", "dist/src/api/server.js"]
