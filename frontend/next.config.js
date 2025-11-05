/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // API configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/:path*`
          : 'http://localhost:8000/:path*',
      },
    ]
  },

  // Image optimization
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
