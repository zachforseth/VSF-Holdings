import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Strictly limit to 1 CPU to prevent SWC Minifier from parallelizing and spiking RAM
    cpus: 1,
  },
};

export default nextConfig;
