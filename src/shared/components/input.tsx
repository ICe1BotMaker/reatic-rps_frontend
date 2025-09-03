import { HTMLInputTypeAttribute } from "react";

import { ReactComponent as XIcon } from "@/assets/input/x.svg";

interface InputProps {
    type?: HTMLInputTypeAttribute;
    value: string;
    setValue: (e: string) => void;
    placeholder?: string;
}

export const Input = ({
    value,
    setValue,
    placeholder,
    type = "text",
}: InputProps) => {
    return (
        <div className="w-full relative">
            <input
                type={type}
                className="w-full p-[16px_18px] bg-white border border-[#E9E9E9] rounded-[6px] font-p_medium"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
            />

            {value && (
                <div
                    className="absolute top-[18px] right-[18px]"
                    onClick={() => setValue("")}
                >
                    <XIcon />
                </div>
            )}
        </div>
    );
};
