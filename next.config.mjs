/** @type {import('next').NextConfig} */
const nextConfig = {
 async rewrites() {
  return [
    { source: '/admin/:path*', destination: 'http://localhost:8080/admin/:path*' },
    { source: '/api/:path*',   destination: 'http://localhost:8080/api/:path*' },
  ];
},

};
export default nextConfig;
