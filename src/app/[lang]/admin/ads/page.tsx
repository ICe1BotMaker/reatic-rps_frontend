"use client";

import { useAds } from "@/features/ads/hooks";

export default function AdminAds() {
    const { data: ads } = useAds({});

    return <div className=""></div>;
}
