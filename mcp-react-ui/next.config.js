/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    esmExternals: true,
  },
  transpilePackages: ["@modelcontextprotocol/sdk"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@modelcontextprotocol/sdk': '@modelcontextprotocol/sdk'
      });
    }
    return config;
  },
};

export default config;
