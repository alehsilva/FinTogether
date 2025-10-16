import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  // Otimizações de performance
  reactStrictMode: true,

  // Compressão
  compress: true,

  // Otimização de imagens (caso adicione futuramente)
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Headers de segurança e performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/favicon.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

};

// Configuração do PWA
export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  sw: 'sw.js',
  // Use a custom service worker source (injectManifest) so we can ensure
  // the worker handles SKIP_WAITING messages and claims clients on activate.
  // Next PWA will inject the precache manifest into this file during build.
  // swSrc is not in the typed PWAConfig so cast to any to avoid TS error at build
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  swSrc: 'src/sw.js',
  buildExcludes: [/middleware-manifest\.json$/],
} as any)(nextConfig);
