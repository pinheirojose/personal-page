import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  turbopack: { root: import.meta.dirname },
};

export default config;
