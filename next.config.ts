import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // If your repo name is not the root, set basePath
  // basePath: '/valio-admin',
  // trailingSlash: true,
};

export default nextConfig;
