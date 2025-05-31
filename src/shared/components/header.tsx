import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export type IconStyle = "chevron";

interface HeaderProps {
    leftIcon?: {
        style: IconStyle;
        onClick: () => void;
    };
    rightIcon?: {
        style: IconStyle;
        onClick: () => void;
    };
    title?: string;
}

export const Header = ({ leftIcon, rightIcon, title }: HeaderProps) => {
    return (
        <div className="w-full p-[16px] flex justify-between items-center">
            <div className="w-[24px] h-[24px] shrink-0">
                {leftIcon?.style === "chevron" && (
                    <ChevronLeftIcon onClick={leftIcon.onClick} />
                )}
            </div>

            <span className="font-semibold text-[20px] text-c_black">
                {title}
            </span>

            <div className="w-[24px] h-[24px] shrink-0">
                {rightIcon?.style === "chevron" && (
                    <ChevronRightIcon onClick={rightIcon.onClick} />
                )}
            </div>
        </div>
    );
};
