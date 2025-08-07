"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/shared/components/button";

import { ReactComponent as KakaoIcon } from "@/assets/kakao/logo.svg";

export default function Admin() {
    const router = useRouter();

    return (
        <div className="w-screen h-dvh flex justify-center items-center">
            <div className="w-[400px]">
                <Button
                    variants="kakao"
                    Icon={<KakaoIcon className="fill-c_kakao_black" />}
                    onClick={() => {
                        const REDIRECT_URL =
                            "https://xn--p39a9jw03cqmg.com/ko/oauth/kakao?admin=1";

                        const CLIENT_ID = "4b441a6d5dd49f091810749329c7ae3c";

                        router.push(
                            `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}`
                        );
                    }}
                >
                    카카오 계정으로 계속하기
                </Button>
            </div>
        </div>
    );
}
