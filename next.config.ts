import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use the default Next.js output so that dynamic route handlers like
  // /api/outbound-shortages can run on the server (needed for the n8n proxy).
  // If you later want a static export again, this will need to be revisited.
  images: {
    unoptimized: true,
  },
  // Only use basePath in production (GitHub Pages)
  // For local development, basePath should be empty
  basePath: process.env.NODE_ENV === "production" ? "/valio-admin" : "",
  trailingSlash: true,
};

export default nextConfig;
