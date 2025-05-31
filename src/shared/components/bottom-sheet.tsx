"use client";

import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useEffect } from "react";

import { HapticRunner } from "@/shared/javascripts/haptic.runner";
import { useBar } from "../stores/bar.zustand";

interface BottomSheetProps {
    isOpen: boolean;
    onClose?: () => void;
    children?: React.ReactNode;
}

const threshold = 100;

export const BottomSheet = ({
    isOpen,
    onClose,
    children,
}: BottomSheetProps) => {
    const bar = useBar();

    useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const handleDragEnd = (
        _: MouseEvent | TouchEvent | PointerEvent,
        info: PanInfo
    ) => info.offset.y > threshold && onClose?.();

    useEffect(() => {
        if (isOpen) HapticRunner.run();
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed z-[1000] inset-0 bg-black bg-opacity-50"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    />

                    <motion.div
                        className="fixed z-[1001] inset-x-[16px] bg-white rounded-t-[20px] rounded-b-[8px]"
                        style={{
                            bottom: `${bar.bottom + 16}px`,
                        }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        onDragEnd={handleDragEnd}
                        initial={{ y: "150%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "150%" }}
                        transition={{
                            type: "spring",
                            damping: 50,
                            stiffness: 400,
                        }}
                    >
                        <div className="py-[10px] flex justify-center items-center">
                            <div className="w-[70px] h-[4px] bg-[#dcdcdc] rounded-[100px]" />
                        </div>

                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
