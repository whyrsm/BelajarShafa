# Railway Deployment Guide

This project contains both a NestJS backend (server) and Next.js frontend (client) in a monorepo structure.

## Recommended Approach: Deploy as Separate Services

### 1. Deploy the Backend (Server)

1. **Create a new Railway project** or use an existing one
2. **Add a new service** from your GitHub repository
3. **Configure the service:**
   - **Root Directory**: Set to `server`
   - **Build Command**: Will be automatically detected from `server/nixpacks.toml`
   - **Start Command**: Will be automatically detected from `server/nixpacks.toml`

4. **Set Environment Variables:**
   ```
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret_here
   PORT=3001
   NODE_ENV=production
   ```

5. **Add PostgreSQL Database:**
   - In Railway, click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set the `DATABASE_URL` environment variable
   - The start command includes `npx prisma migrate deploy` to run migrations automatically

### 2. Deploy the Frontend (Client)

1. **Add another service** to your Railway project
2. **Configure the service:**
   - **Root Directory**: Set to `client`
   - **Build Command**: Will be automatically detected from `client/nixpacks.toml`
   - **Start Command**: Will be automatically detected from `client/nixpacks.toml`

3. **Set Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-service.railway.app
   NODE_ENV=production
   ```

## Alternative: Deploy from Root (Not Recommended for Production)

If you want to deploy just one service (server) from the root:

1. **Don't set a Root Directory** (deploy from project root)
2. The root `railway.json` will be used
3. Set environment variables as needed

## Configuration Files

- `railway.json` - Railway service configuration
- `nixpacks.toml` - Nixpacks build configuration (alternative to railway.json)
- `Dockerfile` - Docker build configuration (fallback if Nixpacks fails)
- `.npmrc` - npm configuration to handle peer dependency issues
- All files are provided for maximum compatibility

## Important Notes

### For Server:
- The server automatically runs `npx prisma migrate deploy` on startup
- Make sure your `DATABASE_URL` is set correctly
- The server uses Node.js 20
- OpenSSL is included for Prisma

### For Client:
- The client connects to the backend via `NEXT_PUBLIC_API_URL`
- Make sure to update this environment variable with your deployed backend URL
- The client uses Node.js 20

## Troubleshooting

### "No start command was found"
- Make sure you've set the correct **Root Directory** in Railway
- Check that the `nixpacks.toml` or `railway.json` file exists in that directory
- For server: Should be in `/server` directory
- For client: Should be in `/client` directory

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check that the PostgreSQL service is running
- Ensure your database allows connections from Railway

### Build Failures

#### "npm ci" Error / "process did not complete successfully: exit code: 1"
This error occurs when Railway tries to use `npm ci` which requires a `package-lock.json` file or has issues with workspace structures.

**Solutions:**
1. **CRITICAL: Set Root Directory correctly**
   - Go to your Railway service settings
   - Under "Settings" → "Root Directory", set it to `server` (for backend) or `client` (for frontend)
   - This ensures Railway builds from the correct directory, not the monorepo root

2. **Use Dockerfile instead of Nixpacks:**
   - If the error persists, Railway will automatically detect and use the `Dockerfile` in the server directory
   - The Dockerfile explicitly uses `npm install` instead of `npm ci`

3. **Manual Build Command Override:**
   - In Railway service settings, go to "Settings" → "Build & Deploy"
   - Override the build command with: `npm install --legacy-peer-deps && npx prisma generate && npm run build`
   - This bypasses the default `npm ci` behavior

4. **Check Build Logs:**
   - Look at the full error message in Railway build logs
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

## Manual Build Commands (if needed)

If Railway doesn't detect the configuration automatically, you can set these manually:

### Server
- **Build Command**: `npm install --legacy-peer-deps && npx prisma generate && npm run build`
- **Start Command**: `npx prisma migrate deploy && npm run start:prod`
- **Alternative**: Use the provided `Dockerfile` by setting builder to "Dockerfile" in Railway settings

### Client
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`

## Health Check

Once deployed:
- Backend: `https://your-backend.railway.app` should return a response
- Frontend: `https://your-frontend.railway.app` should load the app
- Check that the frontend can communicate with the backend

## Environment Variables Reference

### Required for Server:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token generation
- `PORT` - Port to run on (default: 3001)
- `NODE_ENV` - Set to "production"

### Required for Client:
- `NEXT_PUBLIC_API_URL` - URL of your deployed backend
- `NODE_ENV` - Set to "production"

