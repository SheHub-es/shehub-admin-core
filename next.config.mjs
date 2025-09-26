/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || (isDev
      ? 'http://localhost:8080'
      : 'https://shehub.freeddns.org'); 

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

