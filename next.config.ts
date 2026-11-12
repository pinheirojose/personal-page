import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  turbopack: { root: import.meta.dirname },
  // The whole stylesheet is ~20 KB; inlining it removes render-blocking requests.
  experimental: { inlineCss: true },
};

export default config;
