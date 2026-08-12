import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
  },
  eslint: {
    dirs: ["src"],
  },
};

export default nextConfig;
