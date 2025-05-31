import { ArrowUpRightIcon } from "lucide-react";

interface LinkProps {
    text: string;
    link: string;
}

export const Link = ({ text, link }: LinkProps) => {
    return (
        <div className="flex items-center gap-[2px] p-[4px_6px] rounded-[6px] bg-[#f3f3f3] w-fit">
            <a
                className="font-p_medium text-[14px] text-c_black"
                href={link}
                target="_blank"
            >
                {text}
            </a>

            <ArrowUpRightIcon strokeWidth={1} width={16} height={16} />
        </div>
    );
};
