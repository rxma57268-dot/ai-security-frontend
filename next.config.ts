import type { NextConfig } from "next";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "https://ai-security-saas.onrender.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/tasks",
        destination: `${apiUrl}/tasks`,
      },
      {
        source: "/api/tasks/:path*",
        destination: `${apiUrl}/tasks/:path*`,
      },
      {
        source: "/api/patterns",
        destination: `${apiUrl}/patterns`,
      },
    ];
  },
};

export default nextConfig;
