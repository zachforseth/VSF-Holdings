import type { NextConfig } from "next";

const nextConfig: any = {
  productionBrowserSourceMaps: false,

  // @ts-ignore
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Strictly limit to 1 CPU to prevent SWC Minifier from parallelizing and spiking RAM
    cpus: 1,
    // Disable server source maps to save memory
    serverSourceMaps: false,
  },
};

export default nextConfig;
