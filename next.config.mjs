/** @type {import('next').NextConfig} */

const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const base = raw.replace(/\/+$/, '');

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/auth/:path*', destination: `${base}/auth/:path*` },
      { source: '/admin/:path*', destination: `${base}/admin/:path*` },
      { source: '/api/:path*', destination: `${base}/api/:path*` },
    ];
  },
};

export default nextConfig;


