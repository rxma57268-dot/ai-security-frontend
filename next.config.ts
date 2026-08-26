import type { NextConfig } from "next";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "https://ai-security-saas.onrender.com";

const nextConfig: NextConfig = {
  experimental: {
    // 执行接口要调两次 LLM，耗时常超过 dev 代理默认的 30s 超时
    proxyTimeout: 120_000,
  },
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
