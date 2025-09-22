"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/button";

import { ReactComponent as KakaoIcon } from "@/assets/kakao/logo.svg";
import Link from "next/link";

const CLIENT_ID = "4b441a6d5dd49f091810749329c7ae3c";

export default function Admin() {
    const router = useRouter();
    const params = useParams();
    const [isRedirecting, setIsRedirecting] = useState(false);

    const localeParam = params?.lang;
    const locale = useMemo(() => {
        const normalized = Array.isArray(localeParam)
            ? localeParam[0]
            : localeParam;

        return normalized || "ko";
    }, [localeParam]);

    const redirectUrl = useMemo(
        () => `https://xn--p39a9jw03cqmg.com/${locale}/oauth/kakao/admin`,
        [locale]
    );

    const kakaoAuthUrl = useMemo(
        () =>
            `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${redirectUrl}`,
        [redirectUrl]
    );

    const handleAdminLogin = () => {
        if (isRedirecting) {
            return;
        }

        setIsRedirecting(true);
        router.push(kakaoAuthUrl);
    };

    return (
        <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-[#05081c] via-[#171f5a] to-[#0c1028]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-[120px] top-[-160px] h-[320px] w-[320px] rounded-full bg-[#4b7bea]/30 blur-3xl" />
                <div className="absolute bottom-[-140px] right-[-100px] h-[360px] w-[360px] rounded-full bg-white/10 blur-3xl" />
                <div className="absolute left-1/2 top-[20%] h-[200px] w-[200px] -translate-x-1/2 rounded-full bg-c_primary_softlight/20 blur-3xl" />
            </div>

            <div className="relative z-[1] h-full flex items-center justify-center px-[24px] py-[40px]">
                <div className="w-full max-w-[420px] space-y-[18px]">
                    <div className="rounded-[24px] border border-white/15 bg-white/5 p-[36px] shadow-[0_40px_120px_-30px_rgba(16,18,45,0.75)] backdrop-blur-xl">
                        <div className="flex flex-col items-center gap-[12px] text-center">
                            <span className="font-p_semibold text-[14px] uppercase tracking-[0.4em] text-white/70">
                                reatic admin
                            </span>

                            <h1 className="font-p_semibold text-[28px] leading-[1.2] text-white">
                                관리자 로그인
                            </h1>

                            <p className="font-p_regular text-[16px] leading-[1.5] text-white/70">
                                운영 지표와 회원 관리를 위해
                                <br />
                                관리자 계정으로 접속해 주세요.
                            </p>
                        </div>

                        <div className="mt-[28px] flex flex-col gap-[12px]">
                            <Button
                                variants={isRedirecting ? "disabled" : "kakao"}
                                Icon={
                                    <KakaoIcon
                                        className={
                                            isRedirecting
                                                ? "fill-[#A9A9A9]"
                                                : "fill-c_kakao_black"
                                        }
                                    />
                                }
                                onClick={handleAdminLogin}
                            >
                                {isRedirecting
                                    ? "카카오로 이동 중..."
                                    : "카카오 계정으로 계속하기"}
                            </Button>

                            <p className="text-center font-p_regular text-[13px] leading-[1.5] text-white/60">
                                운영팀에 등록된 카카오 비즈니스 계정만 접근할 수
                                있어요.
                            </p>
                        </div>
                    </div>

                    <p className="text-center font-p_regular text-[12px] text-white/50">
                        이미 로그인한 상태인가요?{" "}
                        <Link href="/ko/admin/insight" className="underline">
                            관리자 페이지로 이동
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
