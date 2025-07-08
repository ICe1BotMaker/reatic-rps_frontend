"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/shared/components/button";

import { ReactComponent as KakaoIcon } from "@/assets/kakao/logo.svg";

export default function Admin() {
    const router = useRouter();

    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <div className="w-[400px]">
                <Button
                    variants="kakao"
                    Icon={<KakaoIcon className="fill-c_kakao_black" />}
                    onClick={() => {
                        const REDIRECT_URL =
                            "http://api.samgakgame.com/api/members/login/callback";

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
