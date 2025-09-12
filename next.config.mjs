/** @type {import('next').NextConfig} */
const nextConfig = {
 async rewrites() {
  return [
    { source: "/auth/:path*",  destination: "http://localhost:8080/auth/:path*" },
      // { source: "/admin/:path*", destination: "http://localhost:8080/admin/:path*" },
      // { source: "/api/:path*",   destination: "http://localhost:8080/api/:path*" },
    { source: '/admin/:path*', destination: 'http://localhost:8080/admin/:path*' },
    { source: '/api/:path*',   destination: 'http://localhost:8080/api/:path*' },
  ];
  
},

};
export default nextConfig;
