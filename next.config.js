/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "pdfkit/standalone": "pdfkit/js/pdfkit.standalone.js",
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      stream: false,
      zlib: false,
    };

    return config;
  },
};

module.exports = nextConfig;