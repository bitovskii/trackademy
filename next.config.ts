import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,  // Полностью отключаем dev индикаторы
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
};

export default nextConfig;
