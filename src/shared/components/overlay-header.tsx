import { SettingsIcon } from "lucide-react";

interface OverlayHeaderProps {
    title: string;
    icon?: {
        style: "settings";
        onClick: () => void;
    };
}

export const OverlayHeader = ({ title, icon }: OverlayHeaderProps) => {
    return (
        <div className="p-[16px] flex justify-between items-center">
            <span className="font-p_bold text-[24px] text-c_black">
                {title}
            </span>

            {icon?.style === "settings" && (
                <SettingsIcon
                    className="stroke-c_black"
                    onClick={icon.onClick}
                />
            )}
        </div>
    );
};
