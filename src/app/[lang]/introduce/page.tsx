"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckIcon } from "lucide-react";

import { BottomSheet } from "@/shared/components/bottom-sheet";
import { Button } from "@/shared/components/button";
import { Link } from "@/shared/components/link";

import { useLocalizedPath } from "@/shared/utils/locale";
import { useBar } from "@/shared/stores/bar.zustand";

export default function Introduce() {
    const getLocalizedPath = useLocalizedPath();
    const router = useRouter();
    const bar = useBar();

    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [flow, setFlow] = useState<"FIRST" | "SECOND">("FIRST");

    useEffect(() => {
        const timeout = setTimeout(() => {
            setFlow("SECOND");
            setIsBottomSheetOpen(true);
        }, 3000);

        return () => {
            clearTimeout(timeout);
        };
    }, []);

    const containerVariants = useMemo(
        () => ({
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { duration: 0.3 } },
            exit: { opacity: 0, transition: { duration: 0.3 } },
        }),
        []
    );

    const renderHeader = useCallback(() => {
        if (flow === "FIRST") {
            return (
                <div className="p-[36px_16px]">
                    <p className="font-p_semibold text-[32px] text-white leading-[39px]">
                        안녕하세요!
                        <br />
                        저는 &lsquo;손&lsquo; 이에요 :)
                    </p>
                </div>
            );
        }

        return (
            <div className="p-[36px_16px]">
                <p className="font-p_semibold text-[32px] text-white leading-[39px]">
                    도전하기 전에
                    <br />
                    다음을 확인해 주세요!
                </p>
            </div>
        );
    }, [flow]);

    const handleAgree = () => {
        setIsBottomSheetOpen(false);
        router.push(getLocalizedPath("/ready"));
    };

    return (
        <>
            <div
                className="w-screen h-screen overflow-hidden bg-gradient-to-b from-c_primary to-[#5289E8]"
                style={{
                    paddingTop: `${bar.top}px`,
                    paddingBottom: `${bar.bottom}px`,
                }}
            >
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={flow}
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        {renderHeader()}
                    </motion.div>
                </AnimatePresence>
            </div>

            <BottomSheet isOpen={isBottomSheetOpen}>
                <div className="p-[24px]">
                    <Link text="바로가기" link="" />
                </div>

                <div className="pt-[10px] pb-[20px] px-[24px] flex flex-col gap-[12px]">
                    <Button
                        variants="primary_light"
                        Icon={<CheckIcon />}
                        onClick={handleAgree}
                    >
                        확인했어요
                    </Button>
                </div>
            </BottomSheet>
        </>
    );
}
