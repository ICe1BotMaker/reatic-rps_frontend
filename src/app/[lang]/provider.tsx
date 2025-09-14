"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import moment from "moment";

import { FrozenRoute } from "./prozen-route";

import { useBar } from "@/shared/stores/bar.zustand";
import { match } from "@/shared/utils/url-match";

import { ReactComponent as WifiIcon } from "@/assets/test/wifi.svg";
import { ReactComponent as SignIcon } from "@/assets/test/sign.svg";
import { ReactComponent as BatteryIcon } from "@/assets/test/battery.svg";

export const FramerProvider = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const pathname = usePathname();
    const bar = useBar();

    const isTest =
        process.env.NEXT_PUBLIC_TEST === "true" &&
        !match(pathname, "/regex:^[a-z]{2}$/admin/regex:^[a-z]+$");

    const [client] = useState(() => new QueryClient());

    return (
        <>
            {isTest && (
                <>
                    <div
                        className="fixed z-[10000] top-0 left-0 w-full flex justify-between items-center px-[18px]"
                        style={{ height: `${bar.top}px` }}
                    >
                        <span className="font-p_medium text-[14px] text-black px-[14px]">
                            {moment().format("h:mm")}
                        </span>

                        <div className="flex items-center gap-[5px]">
                            <WifiIcon className="fill-black" />
                            <SignIcon className="fill-black" />
                            <BatteryIcon className="fill-black" />
                        </div>
                    </div>

                    <div className="w-[110px] h-[32px] fixed z-[10000] top-[6px] left-[50%] translate-x-[-50%] bg-black rounded-[24px] flex justify-center items-center" />
                </>
            )}

            <div
                className="max-w-[500px] fixed z-20 left-0 w-full h-[6px] bg-transparent"
                style={{
                    top: `${bar.top}px`,
                }}
            >
                <div className="fixed z-20 left-0 animate-[loading_.5s_both] h-[4px] bg-c_primary" />
            </div>

            <AnimatePresence mode="popLayout">
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        position: "fixed",
                    }}
                    className={
                        match(pathname, "/regex:[a-z]{2}/admin/regex:.*")
                            ? "w-dvh"
                            : "w-full max-w-[500px] h-[100%] max-h-[1002px]"
                    }
                >
                    <QueryClientProvider client={client}>
                        <FrozenRoute>{children}</FrozenRoute>
                    </QueryClientProvider>
                </motion.div>
            </AnimatePresence>

            {isTest && (
                <div className="fixed z-[10000] bottom-0 left-0 w-full h-[24px] flex justify-center items-center">
                    <div className="w-[134px] h-[4px] bg-black rounded-[100px]" />
                </div>
            )}
        </>
    );
};
