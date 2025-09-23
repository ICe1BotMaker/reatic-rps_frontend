/* eslint-disable @next/next/no-img-element */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CheckIcon } from "lucide-react";
import moment from "moment";

import { useLocalizedPath } from "@/utils/locale";
import { useBar } from "@/stores/bar.zustand";

import { Header } from "@/components/header";
import { Button } from "@/components/button";
import { Input } from "@/components/input";

import { signup } from "@/features/auth/api";

import { Storage } from "@/services/storage";
import { Select } from "@/components/select";

export default function SignUp() {
    const getLocalizedPath = useLocalizedPath();
    const searchParams = useSearchParams();
    const router = useRouter();

    const bar = useBar();

    const [user, setUser] = useState({
        kakaoId: "-",
        email: "-",
        nickname: "-",
        profileImageUrl: "-",

        name: "",
        phone: "",
        birthDate: moment().format("YYYYMMDD"),

        gender: {
            value: "",
            label: "",
        },
    });

    useEffect(() => {
        if (
            searchParams.get("kakaoId") &&
            searchParams.get("email") &&
            searchParams.get("nickname") &&
            searchParams.get("profileImageUrl")
        ) {
            setUser({
                kakaoId: searchParams.get("kakaoId") as string,
                email: searchParams.get("email") as string,
                nickname: searchParams.get("nickname") as string,
                profileImageUrl: searchParams.get("profileImageUrl") as string,

                name: "",
                phone: "",
                birthDate: moment().format("YYYYMMDD"),

                gender: {
                    value: "MALE",
                    label: "남성",
                },
            });
        }
    }, [searchParams]);

    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async () => {
        setIsPending(true);

        try {
            const response = await signup({
                kakaoId: user.kakaoId,
                email: user.email,
                nickname: user.nickname,
                profileImageUrl: user.profileImageUrl,
                name: user.name,
                phoneNumber: user.phone,
                gender: user.gender.value,
                birthDate: user.birthDate.replace(
                    /(\d{4})(\d{2})(\d{2})/,
                    "$1-$2-$3"
                ),
            });

            Storage.setAccessToken(response.data.accessToken);

            router.push(getLocalizedPath("/introduce"));
        } catch {
            setIsPending(false);
        }
    };

    const signUpPossible = useMemo(
        () =>
            /^[가-힣]+$/.test(user.name) &&
            /^\d{11}$/.test(user.phone) &&
            /^\d{8}$/.test(user.birthDate),
        [user]
    );

    return (
        <div
            className="w-full h-full bg-white"
            style={{
                paddingTop: `${bar.top}px`,
                paddingBottom: `${bar.bottom}px`,
            }}
        >
            <Header title="회원가입" />

            <div
                className="w-full p-[36px_20px] overflow-y-scroll"
                style={{
                    height: `calc(100% - 86px - 62px)`,
                }}
            >
                <div className="flex flex-col items-center gap-[48px]">
                    <div className="flex flex-col items-center gap-[12px]">
                        <img
                            src={user.profileImageUrl}
                            alt="profile"
                            className="w-[100px] h-[100px] rounded-full object-cover"
                        />

                        <div className="flex flex-col items-center gap-[4px]">
                            <span className="font-p_semibold text-[20px] text-c_black">
                                {user.nickname}
                            </span>

                            <span className="font-p_medium text-[14px] text-c_black">
                                {user.email}
                            </span>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-[24px]">
                        <div className="flex flex-col gap-[6px]">
                            <span className="font-p_regular text-[16px] text-c_black">
                                이름
                            </span>

                            <Input
                                value={user.name}
                                setValue={(name) =>
                                    setUser((prev) => ({ ...prev, name }))
                                }
                                placeholder="이름을 입력해 주세요."
                            />
                        </div>

                        <div className="flex flex-col gap-[6px]">
                            <span className="font-p_regular text-[16px] text-c_black">
                                생년월일
                            </span>

                            <div className="flex flex-col gap-[14px]">
                                <Input
                                    value={user.birthDate}
                                    setValue={(birthDate) =>
                                        setUser((prev) => ({
                                            ...prev,
                                            birthDate,
                                        }))
                                    }
                                    placeholder="생년월일 8자리를 입력해 주세요."
                                />

                                {/\D/.test(user.birthDate) && (
                                    <span className="font-p_regular text-[14px] text-[#ff0000]">
                                        숫자만 입력해 주세요.
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-[6px]">
                            <span className="font-p_regular text-[16px] text-c_black">
                                전화번호
                            </span>

                            <div className="flex flex-col gap-[14px]">
                                <Input
                                    type="tel"
                                    value={user.phone}
                                    setValue={(phone) =>
                                        setUser((prev) => ({ ...prev, phone }))
                                    }
                                    placeholder="전화번호 11자리를 입력해 주세요."
                                />

                                {/\D/.test(user.phone) && (
                                    <span className="font-p_regular text-[14px] text-[#ff0000]">
                                        숫자만 입력해 주세요.
                                    </span>
                                )}

                                <span className="font-p_regular text-[14px] text-[#ff0000]">
                                    상품 증정을 위해 정확한 전화번호를 입력해
                                    주세요.
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-[6px]">
                            <span className="font-p_regular text-[16px] text-c_black">
                                성별
                            </span>

                            <div className="flex flex-col gap-[14px]">
                                <Select
                                    value={user.gender}
                                    setValue={(gender) =>
                                        setUser((prev) => ({ ...prev, gender }))
                                    }
                                    options={[
                                        {
                                            value: "MALE",
                                            label: "남성",
                                        },
                                        {
                                            value: "FEMALE",
                                            label: "여성",
                                        },
                                    ]}
                                    placeholder="성별을 선택해 주세요."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-[10px] pb-[20px] px-[16px]">
                <Button
                    variants={
                        isPending || !signUpPossible ? "disabled" : "primary"
                    }
                    Icon={<CheckIcon />}
                    onClick={handleSubmit}
                >
                    가입하기
                </Button>
            </div>
        </div>
    );
}
