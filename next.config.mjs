/** @type {import('next').NextConfig} */

const nextConfig = {
  async rewrites() {
    const raw = process.env.BACKEND_BASE_URL || 'http://localhost:8080';
     console.log('🔍 BACKEND_BASE_URL en Vercel:', raw); 
    const base = raw.replace(/\/+$/, '');

    return [
      { source: '/auth/:path*',  destination: `${base}/auth/:path*`  },
      { source: '/admin/:path*', destination: `${base}/admin/:path*` },
      { source: '/api/:path*',   destination: `${base}/api/:path*`   },
    ];
  },
  reactStrictMode: true,
  swcMinify: true,
};
export default nextConfig;