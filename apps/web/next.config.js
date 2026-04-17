/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@temperament/tests',
    '@temperament/scoring',
    '@temperament/ai',
    '@temperament/db',
    '@temperament/shared',
  ],
}

module.exports = nextConfig
