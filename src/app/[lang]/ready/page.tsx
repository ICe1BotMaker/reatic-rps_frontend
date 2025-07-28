"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import { enterSeason, getActiveSeasons } from "@/features/season/api";
import { start } from "@/features/game/api";

// import { BannerAd } from "@/shared/components/google-ads";
import { Button } from "@/shared/components/button";
import { Hand } from "@/shared/components/hand";

import { useLocalizedPath } from "@/shared/utils/locale";
import { useBar } from "@/shared/stores/bar.zustand";
import { useTimer } from "@/shared/hooks/use-timer";

export default function Ready() {
    const getLocalizedPath = useLocalizedPath();
    const router = useRouter();
    const timer = useTimer(30);
    const bar = useBar();

    const containerVariants = useMemo(
        () => ({
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { duration: 0.3 } },
            exit: { opacity: 0, transition: { duration: 0.3 } },
        }),
        []
    );

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

    const renderButton = useCallback(() => {
        return timer.isStoped ? (
            <Button variants="white" onClick={handleStart}>
                시작하기
            </Button>
        ) : (
            <Button variants="white_disabled">
                {timer.currentTime}초 후 시작
            </Button>
        );
    }, [handleStart, timer.currentTime, timer.isStoped]);

    return (
        <>
            <div
                className="w-screen h-screen overflow-hidden bg-gradient-to-b from-c_primary to-[#5289E8]"
                style={{
                    paddingTop: `${bar.top}px`,
                    paddingBottom: `${bar.bottom}px`,
                }}
            >
                <AnimatePresence mode="popLayout">
                    <motion.div
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-full h-full"
                    >
                        <div className="w-full h-full flex flex-col justify-between">
                            <div className="p-[36px_16px]">
                                <p className="font-p_semibold text-[32px] text-white leading-[39px]">
                                    도전하기 전,
                                    <br />
                                    준비해 주세요.
                                </p>
                            </div>

                            {timer.currentTime > 5 ? (
                                <div className="pb-[16px] h-full flex flex-col justify-center">
                                    {/* <BannerAd adSlot="1356735070" />
                                    <BannerAd adSlot="5406826578" /> */}
                                </div>
                            ) : (
                                <Hand name="5_countdown" />
                            )}

                            <div className="pt-[10px] pb-[20px] px-[16px] flex flex-col gap-[12px] items-center">
                                <a
                                    target="_blank"
                                    href="https://www.reaticindustry.com/samgakgame"
                                    className="font-p_regular text-[14px] text-white underline"
                                >
                                    광고 문의하기
                                </a>

                                {renderButton()}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </>
    );
}
