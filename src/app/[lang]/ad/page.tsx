/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { watchAds } from "@/features/game/api";
import { useEffect } from "react";

export default function Ad() {
    useEffect(() => {
        const loadGoogleAdManager = () => {
            if (typeof window !== "undefined" && !window.googletag) {
                const script = document.createElement("script");
                script.src =
                    "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
                script.async = true;
                document.head.appendChild(script);

                script.onload = () => {
                    initializeAd();
                };
            } else if (window.googletag) {
                initializeAd();
            }
        };

        const initializeAd = () => {
            window.googletag.cmd.push(() => {
                const adUnitId = "ca-app-pub-8406696765705881~8267620170";

                const ad = new window.googletag.RewardedInterstitialAd(
                    adUnitId
                );

                const getUserData = () => {
                    return {
                        userId: localStorage.getItem("userId") || "anonymous",
                    };
                };

                const userRewardData = getUserData();

                const customTargeting = {
                    user_id: userRewardData.userId,
                    page_type: "reward_ad",
                };
                Object.entries(customTargeting).forEach(([key, value]) => {
                    ad.setTargeting(key, value);
                });

                ad.addEventListener("ad_loaded", () => {
                    console.log("리워드 전체화면 광고 로드 완료");
                    console.log("사용자 데이터:", customTargeting);

                    ad.show();
                });

                ad.addEventListener("rewarded", (event: any) => {
                    console.log("광고 시청 완료! 리워드 지급:", event.reward);

                    handleRewardUser({
                        userId: userRewardData.userId,
                        reward: event.reward,
                    });
                });

                ad.addEventListener("ad_closed", () => {
                    console.log("광고 닫힘");
                });

                ad.addEventListener("ad_failed_to_load", (error: any) => {
                    console.error("광고 로드 실패:", error);
                });

                ad.load();
            });
        };

        loadGoogleAdManager();
    }, []);

    const handleRewardUser = async (rewardData: {
        userId: string;
        reward?: any;
    }) => {
        try {
            await watchAds({ rewardUrl: rewardData.reward });
        } catch (error) {
            console.error("리워드 지급 중 오류:", error);
        }
    };

    return <ins className="adsbygoogle" />;
}
