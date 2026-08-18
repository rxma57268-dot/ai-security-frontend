import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/tasks",
        destination: "https://ai-security-saas.onrender.com/tasks",
      },
    ];
  },
};

export default nextConfig;
