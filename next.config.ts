import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        // 이미지 최적화 설정
        formats: ["image/webp", "image/avif"],
        minimumCacheTTL: 31536000,
        domains: ["k.kakaocdn.net"],
    },
    // 정적 파일 캐싱 설정
    async headers() {
        return [
            {
                source: "/images/:path*",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=31536000, immutable",
                    },
                ],
            },
        ];
    },
    // 이미지 압축 설정
    compress: true,
    // 트레이드오프: 빌드 시간 vs 런타임 성능
    swcMinify: true,
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
