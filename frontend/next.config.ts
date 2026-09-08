import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    qualities: [40, 60, 75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.kitsu.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.kitsu.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "kitsu-production-media.s3.us-west-002.backblazeb2.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.backblazeb2.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.kitsu.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.kitsu.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
