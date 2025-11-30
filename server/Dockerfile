# Use Node.js 20 LTS (Prisma 7.0.0 requires 20.19+)
FROM node:20-slim

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy workspace package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install all workspace dependencies
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy Prisma schema
COPY server/prisma ./server/prisma

# Generate Prisma Client
WORKDIR /app/server
RUN npx prisma generate

# Copy server source code
WORKDIR /app
COPY server ./server

# Build the server
WORKDIR /app/server
RUN npm run build

# Expose port
EXPOSE 3001

# Run migrations and start the server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]

