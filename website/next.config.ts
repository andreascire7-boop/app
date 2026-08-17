import type { NextConfig } from "next";

// Set only by the GitHub Pages deploy workflow — Pages serves a static
// export from a /app subpath and has no server for the API route.
const forStaticPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  // Exposed to the client so hand-written asset paths (e.g. the hero photo's
  // <Image src>) can be prefixed too — next/image doesn't do it automatically
  // when images are unoptimized.
  env: { NEXT_PUBLIC_BASE_PATH: forStaticPages ? "/app" : "" },
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
