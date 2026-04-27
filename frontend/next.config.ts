import type { NextConfig } from 'next';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://taskveer.onrender.com';

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/**',
      },
    ],
  },

  // Proxy all /api/* requests through the Next.js server so the browser
  // sees cookies on the SAME origin — fixes cross-domain cookie blocking.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
