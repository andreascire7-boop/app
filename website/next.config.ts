import type { NextConfig } from "next";

// Set only by the GitHub Pages deploy workflow — Pages serves a static
// export from a /app subpath and has no server for the API route.
const forStaticPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(forStaticPages
    ? {
        output: "export",
        basePath: "/app",
        assetPrefix: "/app",
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
