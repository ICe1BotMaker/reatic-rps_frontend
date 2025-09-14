"use client";

import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import React, { useContext, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useBar } from "@/shared/stores/bar.zustand";
import Script from "next/script";

export const FrozenRoute = ({
    children,
}: {
    children: Readonly<React.ReactNode>;
}) => {
    const context = useContext(LayoutRouterContext);
    const frozen = useRef(context).current;

    const bar = useBar();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const localTop = window.localStorage.getItem("top");
            const top = localTop ? parseInt(localTop) : 0;

            const localBottom = window.localStorage.getItem("bottom");
            const bottom = localBottom ? parseInt(localBottom) : 0;

            bar.set(top, bottom);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const win = window as unknown as {
                setBarHeights: (top: number, bottom: number) => void;
            };

            win.setBarHeights = (top, bottom) => {
                window.localStorage.setItem("top", String(top));
                window.localStorage.setItem("bottom", String(bottom));
            };
        }
    }, []);

    const containerVariants = useMemo(
        () => ({
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { duration: 0.3 } },
            exit: { opacity: 0, transition: { duration: 0.3 } },
        }),
        []
    );

    return (
        <LayoutRouterContext.Provider value={frozen}>
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="relative bg-white w-full h-full"
                >
                    {children}

                    <Script
                        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
                        integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
                        crossOrigin="anonymous"
                        strategy="lazyOnload"
                        onLoad={() => {
                            console.log("loadend event: kakao-sdk");
                        }}
                    />
                </motion.div>
            </AnimatePresence>
        </LayoutRouterContext.Provider>
    );
};
