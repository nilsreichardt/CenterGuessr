/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms.cdtm.com",
        port: "",
        pathname: "/assets/**",
      },
    ],
  },
  reactStrictMode: true,
  swcMinify: true,
}

export default nextConfig 