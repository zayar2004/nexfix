import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "br-winter-rice-azsenois.storage.c-3.ap-southeast-1.aws.neon.tech" },
      { protocol: "https", hostname: "**.neon.tech" },
    ],
  },
};

export default nextConfig;
