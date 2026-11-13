import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Uploaded images are served from MongoDB through this route.
    localPatterns: [{ pathname: "/api/uploads/**" }, { pathname: "/images/**" }],
    // Strict allowlist for remote placeholder imagery.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "plus.unsplash.com", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
