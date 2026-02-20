import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Optimize memory during build for small cloud instances (Amplify)
    memoryBasedWorkersCount: true,
    cpus: 2,
  },
};

export default nextConfig;
