/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect } from "react";

export default function Ad() {
    useEffect(() => {
        if (typeof window !== "undefined" && window.googletag) {
            window.googletag.cmd.push(() => {
                const ad = new window.googletag.RewardedInterstitialAd(
                    "YOUR_AD_UNIT_ID"
                );

                ad.addEventListener("ad_loaded", () => {
                    console.log("리워드 전체화면 광고 로드 완료");
                    ad.show();
                });

                ad.addEventListener("rewarded", (event: any) => {
                    console.log("광고 시청 완료! 리워드 지급:", event.reward);
                });

                ad.addEventListener("ad_closed", () => {
                    console.log("광고 닫힘");
                });

                ad.load();
            });
        }
    }, []);

    return <ins className="adsbygoogle" />;
}
