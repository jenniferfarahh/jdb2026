import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Image domains ─────────────────────────────────────────────────────────
  images: {
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

  // ── Vote test mode — REMOVE before April 28 event ────────────────────────
  // Enables the vote form for testing regardless of the date window.
  // Delete the env block below (or set both to "false") before the real event.
  env: {
    VOTE_TEST_MODE:             "true",
    NEXT_PUBLIC_VOTE_TEST_MODE: "true",
  },
};

export default nextConfig;
