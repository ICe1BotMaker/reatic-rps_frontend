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
    logoutMessage?: string;
}

export const OverlayHeader = ({
    title,
    icon,
    logout,
    logoutMessage,
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
                            const approved = confirm(logoutMessage);

                            if (approved) {
                                Storage.setAccessToken("");
                                location.href = getLocalizedPath("/");
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
};
