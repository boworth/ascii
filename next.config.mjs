/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Remove standalone for Vercel - it handles this automatically
  // output: 'standalone',
}

export default nextConfig
