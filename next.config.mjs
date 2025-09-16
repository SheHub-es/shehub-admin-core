/** @type {import('next').NextConfig} */

const dev = process.env.NODE_ENV !== 'production';

const nextConfig = {
  async rewrites() {
    if (dev) {
      return [
        { source: '/auth/:path*',  destination: 'http://localhost:8080/auth/:path*' },
        { source: '/admin/:path*', destination: 'http://localhost:8080/admin/:path*' },
        { source: '/api/:path*',   destination: 'http://localhost:8080/api/:path*' },
      ];
    }
    return []; // en producción no hagas rewrites
  },
  reactStrictMode: true,
};
export default nextConfig;
