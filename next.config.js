const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // API configuration: only proxy if explicitly configured to external API
  async rewrites() {
    const target = process.env.NEXT_PUBLIC_API_URL
    if (target && /^https?:\/\//i.test(target)) {
      return [
        {
          source: '/api/:path*',
          destination: `${target}/:path*`,
        },
      ]
    }
    return []
  },

  // Image optimization
  images: {
    domains: ['localhost'],
  },
}

module.exports = withNextIntl(nextConfig)
