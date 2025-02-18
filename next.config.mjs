/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Ensures that React runs in strict mode, catching potential issues
  experimental: {
    appDir: true, // Enables the new App Router feature with `src/app`
  },
  images: {
    domains: ["example.com"], // If you use external image sources, specify their domains here
  },
  env: {
    // You can specify environment variables here
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    FMP_API_KEY: process.env.FMP_API_KEY,
    REDIS_URL: process.env.REDIS_URL,
  },
};

export default nextConfig;
