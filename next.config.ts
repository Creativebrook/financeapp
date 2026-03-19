import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // Permitir acesso do Google AI Studio durante desenvolvimento
  experimental: {
    allowedOrigins: isDev ? [
      'ais-dev-r4oyowwew4onrp62igz7aw-400522084455.europe-west2.run.app',
      '*.europe-west2.run.app', // Wildcards para outros servidores
      '*.run.app', // Todos os domínios do Google Cloud Run
    ] : [],
  },

  // Headers CORS permissivos apenas em desenvolvimento
  async headers() {
    if (isDev) {
      return [
        {
          source: '/:path*',
          headers: [
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
            { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          ],
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
