import type { NextConfig } from "next";
import { getAllowedHostsForConfig } from "./src/lib/allowed-hosts";

const allowedHosts = getAllowedHostsForConfig();

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: allowedHosts,
      allowedForwardedHosts: allowedHosts,
    },
  },
};

export default nextConfig;
