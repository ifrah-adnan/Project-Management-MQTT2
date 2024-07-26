/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /leaflet\.css$/,
      use: ["ignore-loader"],
    });
    return config;
  },
};

export default nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     domains: ["localhost"],
//   },
//   webpack: (config) => {
//     config.module.rules.push({
//       test: /leaflet\.css$/,
//       use: ["style-loader", "css-loader"],
//     });
//     return config;
//   },
// };

// module.exports = nextConfig;
