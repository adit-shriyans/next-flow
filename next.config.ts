import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.transloadit.com" },
      { protocol: "https", hostname: "**.transloadit.com" },
    ],
  },
  serverExternalPackages: ["pg"],
};

export default nextConfig;
