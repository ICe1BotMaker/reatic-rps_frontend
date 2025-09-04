import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: "https://삼각게임.com/ko",
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
    ];
}
