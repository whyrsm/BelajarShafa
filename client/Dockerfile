# Use Node.js 20 LTS
FROM node:20-slim

WORKDIR /app

# Copy workspace package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install all workspace dependencies
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy client source code
COPY client ./client

# Build the Next.js app
WORKDIR /app/client
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:4000}
RUN npm run build

# Expose port
EXPOSE 3000

# Start the client
CMD ["npm", "run", "start"]

