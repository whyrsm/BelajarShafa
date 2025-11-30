# Railway Deployment Guide for BelajarShafa Monorepo

This guide explains how to deploy the BelajarShafa monorepo (client + server) on Railway.

## Prerequisites

- Railway account
- GitHub repository connected to Railway
- PostgreSQL database set up in Railway

## Deployment Strategy

This monorepo is designed to be deployed as **two separate Railway services**:
1. **Backend Service** (NestJS API)
2. **Frontend Service** (Next.js)

## Setup Instructions

### 1. Deploy the Backend (Server)

1. In Railway dashboard, click **"New Project"** → **"Deploy from GitHub repo"**
2. Select your repository
3. Configure the service:
   - **Service Name**: `belajar-shafa-server`
   - **Root Directory**: `server`
   - Railway will auto-detect the `Dockerfile`
4. Add environment variables:
   ```
   DATABASE_URL=<your-postgres-connection-string>
   JWT_SECRET=<your-jwt-secret>
   PORT=3001
   ```
5. Deploy!

### 2. Deploy the Frontend (Client)

1. In the same Railway project, click **"New Service"** → **"GitHub repo"**
2. Select the same repository
3. Configure the service:
   - **Service Name**: `belajar-shafa-client`
   - **Root Directory**: `client`
   - Railway will auto-detect the `Dockerfile`
4. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=<your-backend-url>
   NEXT_PUBLIC_ALLOW_FORWARD_SEEK=true
   ```
5. Deploy!

## Configuration Files

The monorepo uses Docker-based deployment with the following structure:

```
/
├── railway.json                 # Root config (defaults to server)
├── .dockerignore               # Docker ignore patterns
├── package.json                # Workspace root
├── server/
│   ├── Dockerfile              # Server Docker build
│   ├── railway.json            # Server Railway config
│   └── package.json
└── client/
    ├── Dockerfile              # Client Docker build
    ├── railway.json            # Client Railway config
    └── package.json
```

### Key Configuration Details

- **Node Version**: Uses Node.js 20 LTS (compatible with Prisma 7.0.0)
- **Docker Context**: Both Dockerfiles use `..` as context to access workspace dependencies
- **Build Strategy**: Each service is built independently but shares workspace dependencies

## Dockerfiles

### Server Dockerfile (`server/Dockerfile`)
- Installs workspace dependencies
- Generates Prisma Client
- Builds NestJS application
- Runs migrations on startup
- Exposes port 3001

### Client Dockerfile (`client/Dockerfile`)
- Installs workspace dependencies
- Builds Next.js application
- Exposes port 3000

## Troubleshooting

### Node Version Issues
If you see "Unsupported engine" errors, ensure:
- `package.json` engines specify `>=20.19.0`
- Dockerfiles use `FROM node:20-slim`

### Workspace Dependencies Not Found
Ensure:
- `dockerContext: ".."` is set in `railway.json`
- Root `package.json` is copied before installing dependencies

### Prisma Issues
Ensure:
- OpenSSL is installed in the Docker image
- `prisma generate` runs before building
- `DATABASE_URL` environment variable is set

## Environment Variables

### Server Required Variables
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 3001)

### Client Required Variables
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_ALLOW_FORWARD_SEEK`: Enable video seeking

## Deployment Workflow

1. Push changes to GitHub
2. Railway automatically detects changes
3. Builds Docker images
4. Runs migrations (server only)
5. Deploys new versions

## Alternative: Single Service Deployment

If you only want to deploy the server (API only), you can:
1. Use the root `railway.json` which defaults to the server
2. Deploy without specifying a root directory
3. The backend will be available at the Railway-provided URL
