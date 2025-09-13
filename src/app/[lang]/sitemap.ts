import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: "https://삼각게임.com/ko",
            changeFrequency: "weekly",
            priority: 1,
        },
    ];
}
