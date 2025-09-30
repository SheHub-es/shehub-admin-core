/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  reactStrictMode: true,

  // Rewrites configuration for development environment only
  async rewrites() {
    if (!isDev) {
      
      return [];
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const base = apiUrl.replace(/\/+$/, '');

    return [
      { source: '/auth/:path*', destination: `${base}/auth/:path*` },
      { source: '/admin/:path*', destination: `${base}/admin/:path*` },
      { source: '/api/:path*', destination: `${base}/api/:path*` },
      { source: '/admin-records/:path*', destination: `${base}/admin-records/:path*` },
    ];
  },
};

export default nextConfig;

