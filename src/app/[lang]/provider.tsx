"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

import { FrozenRoute } from "./prozen-route";

import { useBar } from "@/stores/bar.zustand";
import { match } from "@/utils/url-match";

export const FramerProvider = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const pathname = usePathname();
    const bar = useBar();

    const [client] = useState(() => new QueryClient());

    return (
        <>
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
        </>
    );
};
