"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
    CircleArrowRightIcon,
    ListCheckIcon,
    MousePointerClickIcon,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ConfettiEffect from "@/components/confetti-particle";
import { Button } from "@/components/button";

import { useLocalizedPath } from "@/utils/locale";
import { useBar } from "@/stores/bar.zustand";

import { ReactComponent as ScissorsIcon } from "@/assets/game/scissors.svg";
import { ReactComponent as RockIcon } from "@/assets/game/rock.svg";
import { ReactComponent as PaperIcon } from "@/assets/game/paper.svg";

import { TypeRPS, TypeRPSKorea } from "@/features/game/types";
import { usePlaying } from "@/features/game/hooks";
import { play } from "@/features/game/api";

export default function Game() {
    const getLocalizedPath = useLocalizedPath();
    const router = useRouter();
    const bar = useBar();

    const seasonId =
        typeof window !== "undefined"
            ? Number(localStorage.getItem("seasonId"))
            : 0;

    const { data: playing } = usePlaying({ seasonId });

    const converter = (name: TypeRPS) =>
        name === "PAPER" ? "보" : name === "ROCK" ? "바위" : "가위";
    const reversedConverter = (name: TypeRPSKorea) =>
        name === "보" ? "PAPER" : name === "바위" ? "ROCK" : "SCISSORS";

    const [selected, setSelected] = useState<TypeRPS | null>(null);

    const [rpsState, setRpsState] = useState<"WIN" | "DRAW" | "LOSE" | null>(
        null
    );
    const [isRoundFinished, setIsRoundFinished] = useState(false);
    const [aiSelected, setAiSelected] = useState<TypeRPS | null>(null);

    const containerVariants = useMemo(
        () => ({
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { duration: 0.3 } },
            exit: { opacity: 0, transition: { duration: 0.3 } },
        }),
        []
    );

    const [winningStack, setWinningStack] = useState(0);

    const handleSubmit = useCallback(async () => {
        if (!selected) return;

        const roundNumber = localStorage.getItem("currentRound");
        if (!seasonId || !roundNumber) return;

        const { winningStreak, computerChoice } = (
            await play({
                id: seasonId,
                choice: converter(selected),
                roundNumber: Number(roundNumber),
            })
        ).data;

        setWinningStack(winningStreak);

        setIsRoundFinished(true);
        setAiSelected(reversedConverter(computerChoice));

        if (selected === reversedConverter(computerChoice)) setRpsState("DRAW");
        else if (selected === "PAPER" && computerChoice === "바위")
            setRpsState("WIN");
        else if (selected === "PAPER" && computerChoice === "가위")
            setRpsState("LOSE");
        else if (selected === "ROCK" && computerChoice === "보")
            setRpsState("LOSE");
        else if (selected === "ROCK" && computerChoice === "가위")
            setRpsState("WIN");
        else if (selected === "SCISSORS" && computerChoice === "보")
            setRpsState("WIN");
        else if (selected === "SCISSORS" && computerChoice === "바위")
            setRpsState("LOSE");
    }, [seasonId, selected]);

    const handleResult = useCallback(() => {
        router.push(getLocalizedPath("/game/result"));
    }, [getLocalizedPath, router]);

    const handleNextRound = useCallback(() => {
        setSelected(null);
        setRpsState(null);
        setIsRoundFinished(false);
        setAiSelected(null);
    }, []);

    const renderButton = useCallback(() => {
        if (isRoundFinished) {
            if (rpsState === "LOSE") {
                return (
                    <Button
                        variants="white"
                        Icon={<ListCheckIcon />}
                        onClick={handleResult}
                    >
                        결과 보기
                    </Button>
                );
            }

            return (
                <Button
                    variants="white"
                    Icon={<CircleArrowRightIcon />}
                    onClick={handleNextRound}
                >
                    다음 라운드로
                </Button>
            );
        }

        return (
            selected && (
                <Button
                    variants="white"
                    Icon={<MousePointerClickIcon />}
                    onClick={handleSubmit}
                >
                    확정하기
                </Button>
            )
        );
    }, [
        handleNextRound,
        handleResult,
        handleSubmit,
        isRoundFinished,
        rpsState,
        selected,
    ]);

    const renderRpsState = useCallback(() => {
        switch (rpsState) {
            case "WIN":
                return "이겼어요! ;)";
            case "DRAW":
                return "비겼어요 :|";
            case "LOSE":
                return "아쉽게 졌어요 :(";
        }
    }, [rpsState]);

    const RPS_OPTIONS: {
        type: TypeRPS;
        Icon: React.FC<React.SVGProps<SVGSVGElement>>;
        containerStyle: string;
    }[] = useMemo(
        () => [
            {
                type: "SCISSORS",
                Icon: ScissorsIcon,
                containerStyle: "absolute top-0 left-[50%] -translate-x-[50%]",
            },
            {
                type: "ROCK",
                Icon: RockIcon,
                containerStyle:
                    "absolute top-0 left-[22.5%] -translate-x-[22.5%] translate-y-[100%]",
            },
            {
                type: "PAPER",
                Icon: PaperIcon,
                containerStyle:
                    "absolute top-0 left-[77.5%] -translate-x-[77.5%] translate-y-[100%]",
            },
        ],
        []
    );

    const renderRps = useCallback(() => {
        return (
            <div className="py-[36px]">
                <div className="relative flex justify-center">
                    {RPS_OPTIONS.map(({ type, Icon, containerStyle }) => {
                        const isActive =
                            selected === type ||
                            selected === null ||
                            aiSelected === type;

                        return (
                            <div
                                key={type}
                                className={`${containerStyle} flex justify-center items-center w-[120px] h-[120px] rounded-full bg-white shadow-[inset_0_0_32px_#0013ff7f,_0_4px_0_#0000003f] transition-all duration-[.2s] active:scale-95 ${
                                    aiSelected === type && rpsState !== "DRAW"
                                        ? "border border-[#934545] !shadow-[inset_0_0_32px_#9123b27d,_0_4px_0_#952828]"
                                        : ""
                                }`}
                                style={{ opacity: isActive ? "1" : "0.5" }}
                                onClick={() =>
                                    !isRoundFinished && setSelected(type)
                                }
                            >
                                <Icon />

                                {aiSelected === type && rpsState !== "DRAW" && (
                                    <span className="absolute bottom-[14px] font-p_bold text-[14px] text-[#3454AF]">
                                        AI
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }, [RPS_OPTIONS, aiSelected, isRoundFinished, rpsState, selected]);

    const renderFlow = useCallback(() => {
        if (!playing?.data.isPlaying) {
            return (
                <div className="w-full h-full flex flex-col justify-between">
                    <div className="p-[36px_20px]">
                        <p className="font-p_semibold text-[32px] text-white leading-[39px]">
                            지금은
                            <br />
                            게임 중이 아니에요.
                        </p>
                    </div>

                    <div className="pt-[10px] pb-[20px] px-[16px]">
                        <Button
                            variants="white"
                            onClick={() =>
                                router.push(getLocalizedPath("/game/result"))
                            }
                        >
                            순위표로 돌아가기
                        </Button>
                    </div>
                </div>
            );
        }

        if (isRoundFinished) {
            return (
                <div className="w-full h-full flex flex-col justify-between">
                    <div className="p-[36px_20px] flex flex-col gap-[36px]">
                        <p className="font-p_semibold text-[32px] text-white leading-[39px]">
                            {renderRpsState()}
                        </p>

                        <div className="flex">
                            <div className="flex-1 flex flex-col">
                                <span className="font-p_regular text-[18px] text-white">
                                    연속 우승
                                </span>

                                <span className="font-p_bold text-[32px] text-white">
                                    {winningStack}회
                                </span>
                            </div>

                            <div className="flex-1 flex flex-col">
                                <span className="font-p_regular text-[18px] text-white">
                                    확률
                                </span>

                                <span className="font-p_bold text-[32px] text-white">
                                    {winningStack === 0
                                        ? 33.33
                                        : (33.33 / winningStack).toFixed(2)}
                                    %
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-full">
                        <div className="w-full h-[70px] invisible" />

                        {renderRps()}
                    </div>

                    <div className="pt-[10px] pb-[20px] px-[16px]">
                        {renderButton()}
                    </div>
                </div>
            );
        }

        return (
            <div className="w-full h-full flex flex-col justify-between">
                <div className="p-[36px_20px] animate-[upper_1s_1s_both]">
                    <p className="font-p_semibold text-[32px] text-white leading-[39px]">
                        AI가 가위바위보를
                        <br />
                        시작했어요!
                    </p>
                </div>

                <div className="w-full h-full animate-[upper_1s_1.2s_both]">
                    <div className="w-full h-[140px]" />

                    {renderRps()}
                </div>

                <div className="pt-[10px] pb-[20px] px-[16px] animate-[upper_1s_1.4s_both]">
                    {renderButton()}
                </div>
            </div>
        );
    }, [
        playing?.data.isPlaying,
        isRoundFinished,
        renderRps,
        renderButton,
        router,
        getLocalizedPath,
        renderRpsState,
        winningStack,
    ]);

    return (
        <>
            <div
                className="w-full h-full  bg-gradient-to-b from-c_primary to-[#5289E8]"
                style={{
                    paddingTop: `${bar.top}px`,
                    paddingBottom: `${bar.bottom}px`,
                }}
            >
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={isRoundFinished ? "finished" : "playing"}
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-full h-full"
                    >
                        {renderFlow()}
                    </motion.div>
                </AnimatePresence>

                {winningStack > 0 && <ConfettiEffect key={winningStack} />}
            </div>
        </>
    );
}
