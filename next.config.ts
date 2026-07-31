import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Emits `.next/standalone` — a self-contained server plus only the
   * `node_modules` actually traced as reachable. The EC2 box then never has to
   * run `npm install` (let alone a build, which is what would actually strain a
   * small instance): CI ships ~30 MB and PM2 runs `node server.js`.
   *
   * `next start` still works unchanged for local use; this output is additive.
   */
  output: "standalone",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ugmcup.up.railway.app",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
