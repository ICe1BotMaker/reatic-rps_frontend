import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    webpack: (config) => {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack", "url-loader"],
        });

        return config;
    },
    reactStrictMode: true,
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
