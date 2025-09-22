/* eslint-disable @next/next/no-img-element */

"use client";

import { useRouter } from "next/navigation";

import { useLocalizedPath } from "@/utils/locale";
import { useBar } from "@/stores/bar.zustand";

import { Button } from "@/components/button";
import { Header } from "@/components/header";

import { ReactComponent as KakaoIcon } from "@/assets/kakao/logo.svg";

export default function GameAlarm() {
    const getLocalizedPath = useLocalizedPath();
    const router = useRouter();
    const bar = useBar();

    return (
        <div
            className="w-full h-full  bg-white"
            style={{
                paddingTop: `${bar.top}px`,
                paddingBottom: `${bar.bottom}px`,
            }}
        >
            <Header
                title="알림"
                leftIcon={{
                    style: "chevron",
                    onClick: () =>
                        router.push(getLocalizedPath("/game/result")),
                }}
            />

            <div
                className="w-full flex flex-col justify-between"
                style={{
                    height: `calc(100% - 62px)`,
                }}
            >
                <div className="p-[36px_20px]">
                    <p className="font-p_semibold text-[32px] text-c_black leading-[39px]">
                        새 시즌이 시작될 때<br />
                        알림을 받을 수 있어요.
                    </p>
                </div>

                <div className="pb-[144px] flex justify-center items-center">
                    <img
                        src="https://cdn3d.iconscout.com/3d/premium/thumb/alarm-clock-3d-icon-download-in-png-blend-fbx-gltf-file-formats--time-education-pack-school-icons-5191668.png"
                        alt="clock"
                        className="size-[140px]"
                    />
                </div>

                <div className="pt-[10px] pb-[20px] px-[16px]">
                    <Button
                        variants="black"
                        Icon={<KakaoIcon className="fill-white" />}
                        onClick={() => {
                            window.open(
                                "https://pf.kakao.com/_MKgFn",
                                "_blank"
                            );
                            router.push(getLocalizedPath("/game/result"));
                        }}
                    >
                        카카오톡 친구 추가하기
                    </Button>
                </div>
            </div>
        </div>
    );
}
