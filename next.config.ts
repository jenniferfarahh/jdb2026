import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Image domains ─────────────────────────────────────────────────────────
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
        pathname: "/thumbnail**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

};

export default nextConfig;
