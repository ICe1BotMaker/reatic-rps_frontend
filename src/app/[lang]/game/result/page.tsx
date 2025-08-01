"use client";

import { ClapperboardIcon, Share2Icon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";

import { useLocalizedPath } from "@/shared/utils/locale";
import { useBar } from "@/shared/stores/bar.zustand";

import { OverlayHeader } from "@/shared/components/overlay-header";
import { DraggableAD } from "@/shared/components/draggable-ad";
import { Button } from "@/shared/components/button";

import { useSeasonDetail, useSeasonTopTen } from "@/features/season/hooks";
import { enterSeason, getActiveSeasons } from "@/features/season/api";
import { share, start } from "@/features/game/api";
import { useEntry } from "@/features/game/hooks";

export default function GameResult() {
    const getLocalizedPath = useLocalizedPath();
    const router = useRouter();
    const bar = useBar();

    const [isAdDragged, setIsAdDragged] = useState(false);

    const seasonId =
        typeof window !== "undefined"
            ? Number(localStorage.getItem("seasonId"))
            : 0;

    const { data } = useSeasonTopTen({
        id: seasonId,
    });

    const { data: detail } = useSeasonDetail({
        id: seasonId,
    });

    const { data: entry } = useEntry({
        seasonId,
    });

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

    const renderFooter = useCallback(() => {
        return (
            <div className="pt-[10px] pb-[20px] px-[16px] flex flex-col gap-[12px] items-center">
                <span
                    className="font-p_regular text-[14px] text-c_white_light underline"
                    onClick={() => router.push(getLocalizedPath("/game/alarm"))}
                >
                    새로운 시즌 시작시 알림 받기
                </span>

                {(entry?.data.shareEntryCount || 0) <= 3 ||
                (entry?.data.adEntryCount || 0) <= 3 ? (
                    <div className="w-full flex flex-col gap-[6px]">
                        {(entry?.data.shareEntryCount || 0) <= 3 && (
                            <Button
                                variants="primary_light"
                                Icon={<Share2Icon size={20} />}
                                onClick={async () => {
                                    if (typeof window === "undefined") return;

                                    const { Kakao } = window as unknown as {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        Kakao: any;
                                    };

                                    Kakao.cleanup();
                                    Kakao.init(
                                        process.env.NEXT_PUBLIC_JAVASCRIPT_KEY
                                    );

                                    if (Kakao.isInitialized) {
                                        await Kakao.Share.sendCustom({
                                            templateId: 121362,
                                        });

                                        await share();
                                        await handleStart();
                                    } else {
                                        alert("카카오 SDK 오류 발생");
                                    }
                                }}
                            >
                                공유하고 한판 더하기
                            </Button>
                        )}

                        {(entry?.data.adEntryCount || 0) <= 3 && (
                            <Button
                                variants="primary"
                                Icon={<ClapperboardIcon size={20} />}
                                onClick={() =>
                                    router.push(getLocalizedPath("/ad"))
                                }
                            >
                                광고보고 한판 더하기 (3회 남음)
                            </Button>
                        )}
                    </div>
                ) : (
                    <Button variants="primary_light">
                        기회가 모두 소진되었습니다.
                    </Button>
                )}
            </div>
        );
    }, [entry, getLocalizedPath, handleStart, router]);

    const renderFlow = useCallback(() => {
        if (isAdDragged) {
            return (
                <div className="h-full flex flex-col justify-between">
                    <div className="flex flex-col">
                        <OverlayHeader
                            title="순위표"
                            icon={{
                                style: "settings",
                                onClick: () =>
                                    router.push(
                                        getLocalizedPath("/auth/mypage")
                                    ),
                            }}
                        />

                        <div className="p-[16px] flex">
                            <div className="flex-1 flex flex-col">
                                <span className="font-p_regular text-[18px] text-c_black">
                                    연속 우승
                                </span>

                                <span className="font-p_bold text-[32px] text-c_black">
                                    {data?.data[0].score}회
                                </span>
                            </div>

                            <div className="flex-1 flex flex-col">
                                <span className="font-p_regular text-[18px] text-c_black">
                                    확률
                                </span>

                                <span className="font-p_bold text-[32px] text-c_black">
                                    {data?.data[0].score
                                        ? (33.33 / data?.data[0].score).toFixed(
                                              2
                                          )
                                        : 33.33}
                                    %
                                </span>
                            </div>
                        </div>

                        <div className="p-[16px] flex flex-col gap-[8px] overflow-y-scroll">
                            {data?.data.map((user, i) => (
                                <div
                                    key={user.nickname}
                                    className="p-[8px] flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-[14px]">
                                        {i === 0 ? (
                                            <div className="p-[2px_10px] rounded-[4px] bg-[rgba(239,68,82,.12)]">
                                                <span className="font-p_semibold text-[14px] text-[#EF4452]">
                                                    {user.rank}위
                                                </span>
                                            </div>
                                        ) : i === 1 ? (
                                            <div className="p-[2px_10px] rounded-[4px] bg-[rgba(76,123,233,.12)]">
                                                <span className="font-p_semibold text-[14px] text-[#4C7BE9]">
                                                    {user.rank}위
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="p-[2px_10px] rounded-[4px] bg-[rgba(174,180,192,.12)]">
                                                <span className="font-p_semibold text-[14px] text-[#626276]">
                                                    {user.rank}위
                                                </span>
                                            </div>
                                        )}

                                        <span className="font-p_semibold text-[20px] text-c_black">
                                            {user.nickname}
                                        </span>
                                    </div>

                                    {i === 0 ? (
                                        <span className="font-p_semibold text-[20px] text-[#EF4452]">
                                            {user.score}회
                                        </span>
                                    ) : i === 1 ? (
                                        <span className="font-p_semibold text-[20px] text-[#4C7BE9]">
                                            {user.score}회
                                        </span>
                                    ) : (
                                        <span className="font-p_semibold text-[20px] text-[#626276]">
                                            {user.score}회
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="pt-[36px] w-full flex flex-col items-center gap-[24px]">
                            <div className="flex gap-[4px]">
                                <div className="size-[8px] rounded-full bg-[#ECECF1]" />
                                <div className="size-[8px] rounded-full bg-[#ECECF1]" />
                                <div className="size-[8px] rounded-full bg-[#ECECF1]" />
                            </div>

                            <div className="flex flex-col items-center">
                                <span className="font-p_semibold text-[15px] text-[#808899]">
                                    1위 확정 및 다음 시즌까지
                                </span>

                                <span className="font-p_bold text-[32px] text-c_black">
                                    D-
                                    {moment(
                                        detail?.data.endDateTime || ""
                                    ).format("D")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {renderFooter()}
                </div>
            );
        }

        return (
            <div className="h-full flex flex-col justify-between">
                <div className="p-[36px_16px]">
                    <p className="font-p_semibold text-[32px] text-c_black leading-[39px]">
                        최종 순위는
                        <br />
                        {data?.data.find((x) => x.me)?.rank}위 입니다.
                    </p>
                </div>

                <div className="relative pb-[16px] w-full h-full flex justify-center items-center">
                    <DraggableAD
                        isDragged={isAdDragged}
                        onDragged={() => setIsAdDragged(true)}
                    />
                </div>

                {renderFooter()}
            </div>
        );
    }, [
        data?.data,
        detail?.data.endDateTime,
        getLocalizedPath,
        isAdDragged,
        renderFooter,
        router,
    ]);

    const containerVariants = useMemo(
        () => ({
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { duration: 0.3 } },
            exit: { opacity: 0, transition: { duration: 0.3 } },
        }),
        []
    );

    return (
        <div
            className="w-screen h-screen overflow-hidden"
            style={{
                paddingTop: `${bar.top}px`,
                paddingBottom: `${bar.bottom}px`,
            }}
        >
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={isAdDragged ? "rank" : "ad"}
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="w-full h-full"
                >
                    {renderFlow()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
