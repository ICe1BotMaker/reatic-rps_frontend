/* eslint-disable @next/next/no-img-element */

"use client";

import { useBar } from "@/shared/stores/bar.zustand";

import { Button } from "@/shared/components/button";

export default function GameAlarm() {
    const bar = useBar();

    return (
        <div
            className="w-screen h-screen overflow-hidden bg-white"
            style={{
                paddingTop: `${bar.top}px`,
                paddingBottom: `${bar.bottom}px`,
            }}
        >
            <div className="w-full h-full flex flex-col justify-between">
                <div className="p-[36px_16px]">
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
                    <Button variants="black">알림 설정</Button>
                </div>
            </div>
        </div>
    );
}
