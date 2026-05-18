import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: {},
  serverExternalPackages: ["@react-pdf/renderer"],
  async redirects() {
    return [
      // Defensive redirects — these routes don't exist but redirect cleanly
      // if someone lands on them via old links, marketing emails, or mis-typing.
      { source: "/landing", destination: "/", permanent: true },
      { source: "/home",    destination: "/", permanent: true },
      { source: "/index",   destination: "/", permanent: true },
    ]
  },
}

export default nextConfig
