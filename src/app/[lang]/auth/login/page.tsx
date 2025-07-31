"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CheckIcon } from "lucide-react";
import { useState } from "react";

import { BottomSheet } from "@/shared/components/bottom-sheet";
import { Button } from "@/shared/components/button";
import { Link } from "@/shared/components/link";

import { useBar } from "@/shared/stores/bar.zustand";

import { ReactComponent as KakaoIcon } from "@/assets/kakao/logo.svg";

export default function Login() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const bar = useBar();

    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [isAgree, setIsAgree] = useState(false);

    const handleAgree = () => {
        setIsAgree(true);
        setIsBottomSheetOpen(false);
    };

    const loginFailed =
        typeof window !== "undefined" ? !!searchParams.get("failed") : false;

    console.log(loginFailed);

    return (
        <>
            <div
                className="w-screen h-screen overflow-hidden bg-white"
                style={{
                    paddingTop: `${bar.top}px`,
                    paddingBottom: `${bar.bottom}px`,
                }}
            >
                <div className="h-full flex flex-col justify-between">
                    <div className="flex flex-col gap-[28px]">
                        <div className="p-[36px_16px]">
                            <p className="font-p_semibold text-[32px] text-c_black leading-[39px]">
                                도전하기 전,
                                <br />
                                로그인이 필요해요.
                            </p>
                        </div>

                        <div className="px-[16px] flex flex-col gap-[16px]">
                            <div className="flex-1 flex justify-end animate-[upAnimation_.3s_both_.5s]">
                                <div className="p-[16px_20px] rounded-[32px] rounded-tr-[0] bg-c_primary">
                                    <span className="font-p_medium text-[16px] text-white">
                                        로그인이 필요한 이유?
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 flex justify-start animate-[upAnimation_.3s_both_1.5s]">
                                <div className="p-[16px_20px] rounded-[32px] rounded-tl-[0] bg-[#F1F1F1]">
                                    <span className="font-p_medium text-[16px] text-c_black">
                                        참여 확인과 상품 증정을 위해
                                        <br />
                                        이름과 연락처 정보가 필요해요.
                                    </span>
                                </div>
                            </div>

                            {loginFailed && (
                                <div className="flex-1 flex justify-start animate-[upAnimation_.3s_both_2s]">
                                    <div className="p-[16px_20px] rounded-[32px] rounded-tl-[0] bg-[#F1F1F1]">
                                        <span className="font-p_medium text-[16px] text-c_black">
                                            하지만 지금 로그인이 안되는
                                            상황이네요.
                                            <br />
                                            잠시 후에 다시 시도해 주시겠어요?
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-[10px] pb-[20px] px-[16px] flex flex-col gap-[12px]">
                        <div
                            className="px-[16px] flex items-center gap-[10px]"
                            onClick={() => setIsBottomSheetOpen(true)}
                        >
                            <CheckIcon
                                width={20}
                                height={20}
                                className={
                                    isAgree
                                        ? "stroke-c_black"
                                        : "stroke-[#C5C5C5]"
                                }
                            />

                            <div className="flex items-center gap-[4px]">
                                <span className="font-p_medium text-[14px] text-black">
                                    (필수)
                                </span>

                                <span className="font-p_regular text-[14px] text-c_black">
                                    개인정보 수집 및 이용에 동의합니다.
                                </span>
                            </div>
                        </div>

                        <Button
                            variants={isAgree ? "kakao" : "disabled"}
                            Icon={
                                <KakaoIcon
                                    className={
                                        isAgree
                                            ? "fill-c_kakao_black"
                                            : "fill-[#A9A9A9]"
                                    }
                                />
                            }
                            onClick={() => {
                                const REDIRECT_URL =
                                    "https://xn--p39a9jw03cqmg.com/ko/oauth/kakao";

                                const CLIENT_ID =
                                    "4b441a6d5dd49f091810749329c7ae3c";

                                router.push(
                                    `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}`
                                );
                            }}
                        >
                            카카오 계정으로 계속하기
                        </Button>
                    </div>
                </div>
            </div>

            <BottomSheet
                isOpen={isBottomSheetOpen}
                onClose={() => setIsBottomSheetOpen(false)}
            >
                <div className="p-[24px]">
                    <div className="flex flex-col gap-[12px]">
                        <p className="font-p_semibold text-[18px] text-c_black">
                            다음을 확인해 주세요.
                        </p>

                        <div className="flex flex-wrap items-center gap-[6px]">
                            <span className="font-p_regular text-[16px] text-c_black">
                                로그인 하면
                            </span>

                            <Link text="개인정보처리방침" link="" />

                            <span className="font-p_regular text-[16px] text-c_black">
                                및
                            </span>

                            <Link text="이용약관" link="" />

                            <span className="font-p_regular text-[16px] text-c_black">
                                에 동의한 것으로 간주돼요.
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pt-[10px] pb-[20px] px-[24px] flex flex-col gap-[12px]">
                    <Button
                        variants="primary"
                        Icon={<CheckIcon />}
                        onClick={handleAgree}
                    >
                        확인하기
                    </Button>
                </div>
            </BottomSheet>
        </>
    );
}
