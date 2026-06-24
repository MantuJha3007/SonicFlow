/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Use BACKEND_URL from environment if available, otherwise default to local backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000'
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
