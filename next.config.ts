import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.5", "192.168.1.5:3000"],
  output: "standalone",
};

export default nextConfig;
