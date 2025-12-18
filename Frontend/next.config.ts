import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 reactStrictMode: true,
  images: {
    domains: ['books.google.com'], // thêm hostname này
  },
};

export default nextConfig;
