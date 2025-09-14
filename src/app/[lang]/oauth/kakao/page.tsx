"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useLocalizedPath } from "@/shared/utils/locale";
import { Storage } from "@/services/storage";

import { getActiveSeasons } from "@/features/season/api";
import { kakaoLogin } from "@/features/auth/api";
import { getEntry } from "@/features/game/api";

export default function OauthKakao() {
    const getLocalizedPath = useLocalizedPath();
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        (async () => {
            if (searchParams.get("code")) {
                try {
                    const response = await kakaoLogin({
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

                    setTimeout(async () => {
                        const response = await getActiveSeasons();

                        if (response.data.length === 0) {
                            alert("활성화된 시즌이 없습니다.");
                            return;
                        }

                        try {
                            const newSeasonId =
                                response.data[response.data.length - 1].id;
                            const entry = await getEntry({
                                seasonId: newSeasonId,
                            });
                            if (
                                !(
                                    (entry?.data.shareEntryCount || 0) < 3 ||
                                    (entry?.data.adEntryCount || 0) < 3
                                )
                            ) {
                                router.push(getLocalizedPath("/game/result"));
                                return;
                            }

                            router.push(getLocalizedPath("/introduce"));
                        } catch {
                            router.push(getLocalizedPath("/introduce"));
                        }
                    }, 500);
                } catch {
                    router.push(getLocalizedPath("/auth/login?failed=true"));
                }
            }
        })();
    }, [searchParams, router, getLocalizedPath]);

    return (
        <div className="w-full h-full flex justify-center items-center">
            <div className="w-[10px] h-[24px] bg-c_black animate-spin rounded-[100px]" />
        </div>
    );
}
