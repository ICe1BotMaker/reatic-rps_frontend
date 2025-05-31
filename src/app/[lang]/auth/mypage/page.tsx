/* eslint-disable @next/next/no-img-element */

"use client";

import { useRouter } from "next/navigation";
import { SaveIcon } from "lucide-react";
import { useState } from "react";

import { useLocalizedPath } from "@/shared/utils/locale";
import { useBar } from "@/shared/stores/bar.zustand";

import { Header } from "@/shared/components/header";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";

export default function Mypage() {
    const getLocalizedPath = useLocalizedPath();
    const router = useRouter();

    const bar = useBar();

    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async () => {
        setIsPending(true);

        try {
        } catch {
            setIsPending(false);
        }
    };

    return (
        <div
            className="w-screen h-screen overflow-hidden bg-white"
            style={{
                paddingTop: `${bar.top}px`,
                paddingBottom: `${bar.bottom}px`,
            }}
        >
            <Header
                title="내 정보"
                leftIcon={{
                    style: "chevron",
                    onClick: () =>
                        router.push(getLocalizedPath("/game/result")),
                }}
            />

            <div
                className="w-full p-[36px_16px]"
                style={{
                    height: `calc(100% - 86px - 42px - ${bar.bottom}px)`,
                }}
            >
                <div className="flex flex-col items-center gap-[48px]">
                    <div className="flex flex-col items-center gap-[12px]">
                        <img
                            src=""
                            alt="profile"
                            className="w-[100px] h-[100px] rounded-full object-cover"
                        />

                        <div className="flex flex-col items-center gap-[4px]">
                            <span className="font-semibold text-[20px] text-c_black">
                                고서온님
                            </span>

                            <span className="font-medium text-[14px] text-c_black">
                                ice1github@gmail.com
                            </span>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-[24px]">
                        <div className="flex flex-col gap-[6px]">
                            <span className="font-regular text-[16px] text-c_black">
                                이름
                            </span>

                            <Input
                                value="고서온"
                                setValue={() => {}}
                                placeholder="이름을 입력해 주세요."
                            />
                        </div>

                        <div className="flex flex-col gap-[6px]">
                            <span className="font-regular text-[16px] text-c_black">
                                전화번호
                            </span>

                            <Input
                                value="01064339443"
                                setValue={() => {}}
                                placeholder="전화번호를 입력해 주세요."
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-[10px] pb-[20px] px-[16px]">
                <Button
                    variants={isPending ? "disabled" : "primary"}
                    Icon={<SaveIcon />}
                    onClick={handleSubmit}
                >
                    저장하기
                </Button>
            </div>
        </div>
    );
}
