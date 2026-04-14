/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.tillas.ec' },
      { protocol: 'http', hostname: 'localhost', port: '9000' },
    ],
  },
};

module.exports = nextConfig;
