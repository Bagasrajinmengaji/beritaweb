import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Izinkan akses dev / HMR dari IP lokal jaringan (misal diakses dari HP atau device lain)
  allowedDevOrigins: [
    '172.16.7.131',
    'localhost',
    '127.0.0.1',
  ],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "172.16.7.131",
        port: "8000",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
