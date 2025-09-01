"use client";

import { LogOutIcon, SettingsIcon } from "lucide-react";

import { useLocalizedPath } from "../utils/locale";
import { Storage } from "@/services/storage";

interface OverlayHeaderProps {
    title: string;
    icon?: {
        style: "settings";
        onClick: () => void;
    };
    logout?: boolean;
    remainingEntry?: number;
}

export const OverlayHeader = ({
    title,
    icon,
    logout,
    remainingEntry,
}: OverlayHeaderProps) => {
    const getLocalizedPath = useLocalizedPath();

    return (
        <div className="p-[16px] flex justify-between items-center">
            <span className="font-p_bold text-[24px] text-c_black">
                {title}
            </span>

            <div className="flex items-center gap-[16px]">
                {icon?.style === "settings" && (
                    <SettingsIcon
                        className="stroke-c_black"
                        onClick={icon.onClick}
                    />
                )}

                {logout && (
                    <LogOutIcon
                        className="stroke-c_black"
                        onClick={() => {
                            if ((remainingEntry || 0) > 0) {
                                const approved = confirm(
                                    `아직 참여할 수 있는 기회가 ${remainingEntry}번 남아있어요! 로그아웃 하시겠어요?`
                                );

                                if (approved) {
                                    Storage.setAccessToken("");
                                    location.href = getLocalizedPath("/");
                                    return;
                                }
                            }

                            Storage.setAccessToken("");
                            location.href = getLocalizedPath("/");
                        }}
                    />
                )}
            </div>
        </div>
    );
};
