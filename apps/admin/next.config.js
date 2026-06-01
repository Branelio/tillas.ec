/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'media.tillas.ec' },
      { protocol: 'http', hostname: 'localhost', port: '9000' },
      { protocol: 'https', hostname: '**.nip.io' },
      { protocol: 'https', hostname: 'media.**.nip.io' },
    ],
  },
};

module.exports = nextConfig;
