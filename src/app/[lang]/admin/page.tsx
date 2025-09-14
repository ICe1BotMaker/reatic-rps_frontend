"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/shared/components/button";

import { ReactComponent as KakaoIcon } from "@/assets/kakao/logo.svg";

// import { createAds } from "@/features/ads/api";

export default function Admin() {
    const router = useRouter();

    return (
        <div className="w-full h-full flex justify-center items-center">
            <div className="w-[400px] flex flex-col gap-[16px]">
                <Button
                    variants="kakao"
                    Icon={<KakaoIcon className="fill-c_kakao_black" />}
                    onClick={() => {
                        const REDIRECT_URL =
                            "https://xn--p39a9jw03cqmg.com/ko/oauth/kakao/admin";

                        const CLIENT_ID = "4b441a6d5dd49f091810749329c7ae3c";

                        router.push(
                            `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}`
                        );
                    }}
                >
                    카카오 계정으로 계속하기
                </Button>

                {/* <Button
                    variants="primary"
                    onClick={async () => {
                        await createAds({
                            adType: "square",
                            advertiser: "카카오페이",
                            advertiserProfile:
                                "https://play-lh.googleusercontent.com/W43xj43ErMIs5BQgCdMKEa0NXCoUUW8DjQc5SxcDfLrC26H8sHDmoFIUWLYmsQahpo0",
                            stake: 80,
                            adUrl: "https://pouch.jumpshare.com/preview/uSzvsJCflsGqNi2MJQ5qHKltAHw33-gqO9qILzbBH7cn-M2TTH3kMe2AW7XUrmBsXW5HADpcCDRMYB-W0aieepNyduOJrV2jn0qTrZZ0PvA",
                        });
                    }}
                >
                    정사각형 광고 하나 만들기
                </Button>

                <Button
                    variants="primary"
                    onClick={async () => {
                        await createAds({
                            adType: "front",
                            advertiser: "카카오페이",
                            advertiserProfile:
                                "https://play-lh.googleusercontent.com/W43xj43ErMIs5BQgCdMKEa0NXCoUUW8DjQc5SxcDfLrC26H8sHDmoFIUWLYmsQahpo0",
                            stake: 80,
                            adUrl: "https://pouch.jumpshare.com/preview/uSzvsJCflsGqNi2MJQ5qHKltAHw33-gqO9qILzbBH7cn-M2TTH3kMe2AW7XUrmBsXW5HADpcCDRMYB-W0aieepNyduOJrV2jn0qTrZZ0PvA",
                        });
                    }}
                >
                    전면 광고 하나 만들기
                </Button> */}
            </div>
        </div>
    );
}
