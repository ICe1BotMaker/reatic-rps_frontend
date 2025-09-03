"use client";

import { CheckIcon } from "lucide-react";
import { useState } from "react";

import { useBar } from "../stores/bar.zustand";
import { BottomSheet } from "./bottom-sheet";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    value?: SelectOption;
    setValue: (e: SelectOption) => void;
    options: SelectOption[];
    placeholder?: string;
}

export const Select = ({
    value,
    setValue,
    options,
    placeholder,
}: SelectProps) => {
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const bar = useBar();

    return (
        <>
            <div
                className="w-full p-[16px_18px] bg-white border border-[#E9E9E9] rounded-[6px] font-p_regular"
                onClick={() => setIsBottomSheetOpen(true)}
            >
                {value ? value.label : placeholder}
            </div>

            <BottomSheet
                isOpen={isBottomSheetOpen}
                onClose={() => setIsBottomSheetOpen(false)}
            >
                <div
                    className="p-[24px] flex flex-col gap-[16px]"
                    style={{
                        paddingBottom: `${bar.bottom + 24}px`,
                    }}
                >
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className="w-full flex justify-between items-center font-p_regular"
                            onClick={() => {
                                setIsBottomSheetOpen(false);
                                setValue(option);
                            }}
                        >
                            {option.label}

                            {option.value === value?.value && (
                                <CheckIcon size={16} />
                            )}
                        </div>
                    ))}
                </div>
            </BottomSheet>
        </>
    );
};
