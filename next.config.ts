import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    position: 'bottom-right',
  },
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Remove HotModuleReplacementPlugin to disable HMR
      config.plugins = config.plugins.filter(
        (plugin: any) => plugin.constructor.name !== 'HotModuleReplacementPlugin'
      );

      // Disable watch mode to prevent automatic reloads via WebSocket
      config.watchOptions = {
        poll: false,
        ignored: /node_modules/,
      };
    }
    return config;
  },
  async headers() {
    if (process.env.NODE_ENV === 'development') {
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
