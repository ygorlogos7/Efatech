import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "74ca45c6-fa8a-4584-8723-09939e8e1666.preview.emergentagent.com",
        "74ca45c6-fa8a-4584-8723-09939e8e1666.cluster-0.preview.emergentcf.cloud",
        "localhost:3000",
      ],
      allowedForwardedHosts: [
        "74ca45c6-fa8a-4584-8723-09939e8e1666.preview.emergentagent.com",
        "74ca45c6-fa8a-4584-8723-09939e8e1666.cluster-0.preview.emergentcf.cloud",
        "localhost:3000",
      ],
    },
  },
};

export default nextConfig;
