import type { NextConfig } from "next";
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from root .env file
config({ path: resolve(__dirname, '../.env') });

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  env: {
    // Explicitly pass through the variable from root .env
    NEXT_PUBLIC_ALLOW_FORWARD_SEEK: process.env.NEXT_PUBLIC_ALLOW_FORWARD_SEEK,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
};

export default nextConfig;
