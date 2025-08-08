"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useLocalizedPath } from "@/shared/utils/locale";
import { Storage } from "@/services/storage";

import { kakaoAdminLogin } from "@/features/auth/api";

export default function OauthKakao() {
    const getLocalizedPath = useLocalizedPath();
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        (async () => {
            if (searchParams.get("code")) {
                try {
                    const response = await kakaoAdminLogin({
                        code: searchParams.get("code") as string,
                    });
                    const user = response.data.user;

                    if (!response.data.accessToken) {
                        router.push(
                            getLocalizedPath(
                                `/auth/signup?kakaoId=${user.kakaoId}&email=${user.email}&nickname=${user.nickname}&profileImageUrl=${user.profileImageUrl}`
                            )
                        );
                        return;
                    }

                    Storage.setAccessToken(response.data.accessToken);
                    router.push(getLocalizedPath("/admin/insight"));
                } catch {
                    router.push(getLocalizedPath("/auth/login?failed=true"));
                }
            }
        })();
    }, [searchParams, router, getLocalizedPath]);

    return (
        <div className="w-screen h-dvh flex justify-center items-center">
            <div className="w-[10px] h-[24px] bg-c_black animate-spin rounded-[100px]" />
        </div>
    );
}
