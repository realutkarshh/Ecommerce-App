// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com', // Add Cloudinary domain
      'localhost' // Add localhost if you're also serving local images
    ],
  },
}

module.exports = nextConfig
