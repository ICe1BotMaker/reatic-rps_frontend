"use client";

import { HelpCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { BottomSheet } from "@/shared/components/bottom-sheet";
import { Button } from "@/shared/components/button";
import { Link } from "@/shared/components/link";

import { useLocalizedPath } from "@/shared/utils/locale";
import { useBar } from "@/shared/stores/bar.zustand";

import { ReactComponent as QuestionMarkIcon } from "@/assets/question_mark.svg";

import { ReactComponent as PlayIcon } from "@/assets/button/play.svg";

export default function Home() {
    const getLocalizedPath = useLocalizedPath();
    const router = useRouter();
    const bar = useBar();

    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

    const handleStart = () => {
        router.push(getLocalizedPath("/auth/login"));
    };

    return (
        <>
            <div
                className="w-screen h-screen overflow-hidden bg-gradient-to-b from-c_primary to-[#5289E8]"
                style={{
                    paddingTop: `${bar.top}px`,
                    paddingBottom: `${bar.bottom}px`,
                }}
            >
                <div className="sticky z-1 h-full flex flex-col justify-between">
                    <div className="p-[36px_16px]">
                        <div className="relative">
                            <p className="font-p_semibold text-[32px] text-white leading-[39px]">
                                상금 10만원에
                                <br />
                                매주 도전해 보세요.
                            </p>

                            <QuestionMarkIcon
                                className="absolute top-[4px] right-[4px]"
                                onClick={() => setIsBottomSheetOpen(true)}
                            />
                        </div>
                    </div>

                    <div className="pt-[10px] pb-[20px] px-[16px] flex flex-col gap-[8px]">
                        <Button
                            variants="white_light"
                            Icon={<HelpCircleIcon size={20} />}
                            onClick={() =>
                                window.open(
                                    "https://www.reaticindustry.com/samgakgame-about",
                                    "_blank"
                                )
                            }
                        >
                            참가 전 삼각게임에 대해 알아보기
                        </Button>

                        <Button
                            variants="white"
                            Icon={<PlayIcon />}
                            onClick={handleStart}
                        >
                            시작하기
                        </Button>
                    </div>
                </div>
            </div>

            <BottomSheet
                isOpen={isBottomSheetOpen}
                onClose={() => setIsBottomSheetOpen(false)}
            >
                <div className="p-[24px] flex flex-col gap-[16px]">
                    <div className="flex flex-col gap-[2px]">
                        <p className="font-p_semibold text-[16px] text-c_black">
                            주최
                        </p>

                        <Link
                            text="리틱인더스트리"
                            link="https://reaticindustry.com"
                        />
                    </div>

                    <div className="flex flex-col gap-[2px]">
                        <p className="font-p_semibold text-[16px] text-c_black">
                            비즈니스 문의
                        </p>

                        <Link
                            text="contact@reaticindustry.com"
                            link="mailto:contact@reaticindustry.com"
                        />
                    </div>
                </div>
            </BottomSheet>
        </>
    );
}
