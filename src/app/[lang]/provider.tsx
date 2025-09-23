"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

import { FrozenRoute } from "./prozen-route";

import { useBar } from "@/stores/bar.zustand";
import { cn } from "@/lib/utils";
import { match } from "@/utils/url-match";

export const FramerProvider = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const pathname = usePathname();
    const bar = useBar();

    const [client] = useState(() => new QueryClient());

    const isAdminRoute = match(pathname, "/regex:[a-z]{2}/admin/regex:.*");

    return (
        <>
            <div
                className="max-w-[768px] fixed z-20 left-0 w-full h-[6px] bg-transparent"
                style={{
                    top: `${bar.top}px`,
                }}
            >
                <div className="fixed z-20 left-0 animate-[loading_.5s_both] h-[4px] bg-c_primary" />
            </div>

            <div
                className={cn(
                    " min-h-dvh h-dvh w-full overflow-y-auto bg-white",
                    !isAdminRoute &&
                        "md:flex md:items-center md:justify-center md:bg-gradient-to-br md:from-[#f7f7f9] md:via-[#eef2ff] md:to-[#dbeafe] md:px-10 md:py-12"
                )}
            >
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                            "h-full",
                            isAdminRoute
                                ? "min-h-dvh md:h-dvh md:overflow-y-auto"
                                : "h-full mx-auto overflow-hidden max-w-[768px] md:max-w-[500px] md:relative md:top-auto md:max-h-[min(1000px, calc(100dvh-16px))] md:w-full md:flex md:flex-col md:rounded-[16px] md:border md:border-white/60 md:bg-white md:shadow-[0_50px_120px_-40px_rgba(15,23,42,0.45)] sm:h-full"
                        )}
                    >
                        <div className="relative w-full h-full max-h-[100dvh] overflow-y-auto scrollbar-overlay">
                            <QueryClientProvider client={client}>
                                <FrozenRoute>{children}</FrozenRoute>
                            </QueryClientProvider>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </>
    );
};
