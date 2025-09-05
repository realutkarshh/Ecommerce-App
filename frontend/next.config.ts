// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',
      'localhost',
    ],
  },
  eslint: {
    // ⚠️ Warning: This allows production builds to succeed
    // even if there are ESLint errors.
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
