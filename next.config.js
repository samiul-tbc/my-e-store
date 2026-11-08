/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/api/download': ['./delivery-private/**/*'],
    },
  },
};
module.exports = nextConfig;
