"use client";

import { useRouter } from "next/navigation";
import { XIcon } from "lucide-react";
import { useCallback } from "react";

import { useLocalizedPath } from "@/shared/utils/locale";
import { useTimer } from "@/shared/hooks/use-timer";

import { enterSeason, getActiveSeasons } from "@/features/season/api";
import { useServeAds } from "@/features/ads/hooks";
import { redeemAds } from "@/features/ads/api";
import { start } from "@/features/game/api";

export default function Ads() {
    const router = useRouter();
    const getLocalizedPath = useLocalizedPath();

    const seasonId =
        typeof window !== "undefined"
            ? Number(localStorage.getItem("seasonId"))
            : 0;

    const { data: served } = useServeAds({
        adType: "front",
        seasonId,
    });

    const adTimer = useTimer(30);
    const progress = adTimer.currentTime ? (adTimer.currentTime / 30) * 100 : 0;

    const startGame = async (id: number) => {
        const { currentRound, seasonId } = (
            await start({
                seasonId: id,
            })
        ).data;

        localStorage.setItem("currentRound", String(currentRound));
        localStorage.setItem("seasonId", String(seasonId));
    };

    const handleStart = useCallback(async () => {
        const response = await getActiveSeasons();

        if (response.data.length === 0) {
            alert("활성화된 시즌이 없습니다.");
            return;
        }

        try {
            await startGame(response.data[response.data.length - 1].id);
            router.push(getLocalizedPath("/game"));
        } catch {
            try {
                await enterSeason({
                    seasonId: response.data[response.data.length - 1].id,
                });
                await startGame(response.data[response.data.length - 1].id);
                router.push(getLocalizedPath("/game"));
            } catch {
                alert("기회가 모두 소진되었습니다");
            }
        }
    }, [getLocalizedPath, router]);

    const handleSubmit = async () => {
        if (!served) return;

        try {
            await redeemAds({
                token: served?.data.token,
            });

            await handleStart();
        } catch {
            alert("오류가 발생하였습니다");
            router.push(getLocalizedPath("/game/result"));
        }
    };

    return (
        <div className="relative w-dvw h-dvh flex justify-center items-center">
            {!adTimer.isStoped ? (
                served?.data.googleAds ? (
                    <span className="font-p_medium text-[14px] text-c_black underline">
                        허가되지 않은 Google Ads 광고입니다.
                    </span>
                ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={served?.data.adUrl}
                        alt="ads"
                        className="w-full h-full object-contain"
                    />
                )
            ) : (
                <>
                    <div
                        className="absolute top-[16px] right-[16px] animate-[upAnimation_.3s_both_0s]"
                        onClick={handleSubmit}
                    >
                        <XIcon />
                    </div>

                    <div className="flex flex-col items-center gap-[14px]">
                        <div className="size-[128px] rounded-[8px] overflow-hidden animate-[upAnimation_.3s_both_.2s]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={served?.data.advertiserProfile}
                                alt="ads"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <span className="font-p_bold text-[18px] text-c_black animate-[upAnimation_.3s_both_.4s]">
                            {served?.data.advertiser}
                        </span>
                    </div>
                </>
            )}

            {!adTimer.isStoped && (
                <div className="absolute bottom-0 left-0 w-full h-[4px] bg-white">
                    <div
                        className="h-full bg-c_black transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
}
