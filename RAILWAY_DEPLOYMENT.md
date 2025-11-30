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
- Both files are provided for maximum compatibility

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
- Check Railway build logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

## Manual Build Commands (if needed)

If Railway doesn't detect the configuration automatically, you can set these manually:

### Server
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npx prisma migrate deploy && npm run start:prod`

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

