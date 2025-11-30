import type { NextConfig } from "next";
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from root .env file
config({ path: resolve(__dirname, '../.env') });

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // Explicitly pass through the variable from root .env
    NEXT_PUBLIC_ALLOW_FORWARD_SEEK: process.env.NEXT_PUBLIC_ALLOW_FORWARD_SEEK,
  },
};

export default nextConfig;
