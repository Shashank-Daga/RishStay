import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com", // replace with your real image host
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // if you use Cloudinary
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // if you use Unsplash
      },
    ],
  },
}

export default nextConfig
