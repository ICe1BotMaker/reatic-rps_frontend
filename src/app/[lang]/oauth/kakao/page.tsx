"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useLocalizedPath } from "@/shared/utils/locale";
import { Storage } from "@/services/storage";

export default function OauthKakao() {
    const getLocalizedPath = useLocalizedPath();
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        if (
            searchParams.get("accessToken") &&
            searchParams.get("refreshToken")
        ) {
            Storage.setAccessToken(searchParams.get("accessToken") as string);
            router.push(getLocalizedPath("/introduce"));
        }
    }, [searchParams, router, getLocalizedPath]);

    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <div className="w-[10px] h-[24px] bg-c_black animate-spin rounded-[100px]" />
        </div>
    );
}
