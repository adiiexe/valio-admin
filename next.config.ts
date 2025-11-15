import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Only use basePath in production (GitHub Pages)
  // For local development, basePath should be empty
  basePath: process.env.NODE_ENV === 'production' ? '/valio-admin' : '',
  trailingSlash: true,
};

export default nextConfig;
