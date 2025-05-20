/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['randomuser.me'],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(pdf|doc|docx|csv)$/,
      use: {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
    });
    return config;
  },
};

module.exports = nextConfig; 