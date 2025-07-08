/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";

export default function Ad() {
    const [adLoaded, setAdLoaded] = useState(false);
    const [adError, setAdError] = useState<string | null>(null);

    useEffect(() => {
        // Google Ad Manager 스크립트 로드 확인
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
                // 실제 광고 단위 ID로 교체하세요
                const adUnitId = "/6355419/Travel/Europe"; // 예시 ID

                const ad = new window.googletag.RewardedInterstitialAd(
                    adUnitId
                );

                // 사용자 정보 가져오기
                const getUserData = () => {
                    return {
                        userId: localStorage.getItem("userId") || "anonymous",
                    };
                };

                const userRewardData = getUserData();

                // 커스텀 타겟팅 설정
                const customTargeting = {
                    user_id: userRewardData.userId,
                    page_type: "reward_ad",
                };

                // 타겟팅 파라미터 설정
                Object.entries(customTargeting).forEach(([key, value]) => {
                    ad.setTargeting(key, value);
                });

                ad.addEventListener("ad_loaded", () => {
                    console.log("리워드 전체화면 광고 로드 완료");
                    console.log("사용자 데이터:", customTargeting);
                    setAdLoaded(true);
                    setAdError(null);

                    // 광고 즉시 표시 (또는 버튼 클릭 시 표시하도록 수정 가능)
                    ad.show();
                });

                ad.addEventListener("rewarded", (event: any) => {
                    console.log("광고 시청 완료! 리워드 지급:", event.reward);

                    // 서버에 리워드 지급 요청
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
                    setAdError("광고 로드에 실패했습니다.");
                    setAdLoaded(false);
                });

                // 광고 로드 시작
                ad.load();
            });
        };

        loadGoogleAdManager();
    }, []);

    // 리워드 지급 처리 함수
    const handleRewardUser = async (rewardData: {
        userId: string;
        reward?: any;
    }) => {
        try {
            const response = await fetch("/api/reward-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(rewardData),
            });

            if (response.ok) {
                console.log("리워드 지급 완료");
                // 성공 알림 표시
                alert("리워드가 지급되었습니다!");
            } else {
                console.error("리워드 지급 실패");
            }
        } catch (error) {
            console.error("리워드 지급 중 오류:", error);
        }
    };

    // 리워드 전체화면 광고는 별도의 HTML 태그가 필요하지 않습니다
    return (
        <div className="reward-ad-container">
            {adLoaded && (
                <p className="text-green-600">광고가 로드되었습니다!</p>
            )}
            {adError && <p className="text-red-600">{adError}</p>}
            <p className="text-gray-600">
                리워드 전체화면 광고를 로드하고 있습니다...
            </p>
        </div>
    );
}
