import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "res.cloudinary.com"
      },
      {
        hostname: "flagcdn.com"
      },
      {
        hostname: "asset.cloudinary.com"
      },
    ]
  }
};

export default nextConfig;
