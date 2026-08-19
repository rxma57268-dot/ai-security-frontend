import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/tasks",
        destination: "https://ai-security-saas.onrender.com/tasks",
      },
      {
        source: "/api/tasks/:path*",
        destination: "https://ai-security-saas.onrender.com/tasks/:path*",
      },
      {
        source: "/api/patterns",
        destination: "https://ai-security-saas.onrender.com/patterns",
      },
    ];
  },
};

export default nextConfig;
