/* eslint-disable @next/next/no-img-element */

"use client";

import { useRouter } from "next/navigation";
import { SaveIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useLocalizedPath } from "@/utils/locale";
import { useBar } from "@/stores/bar.zustand";

import { Header } from "@/components/header";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { useUser } from "@/features/auth/hooks";
import { updateUser } from "@/features/auth/api";

export default function Mypage() {
    const getLocalizedPath = useLocalizedPath();
    const router = useRouter();

    const bar = useBar();

    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async () => {
        setIsPending(true);

        try {
            await updateUser({
                name,
                phoneNumber: phone,
            });
            alert("정보 업데이트에 성공하였습니다.");
            setIsPending(false);
        } catch {
            setIsPending(false);
        }
    };

    const { data: user } = useUser();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        if (!user) return;
        setName(user.data.name);
        setPhone(user.data.phoneNumber);
    }, [user]);

    const isUpdatePossible = useMemo(
        () => /^[가-힣]+$/.test(name) && /^\d{11}$/.test(phone),
        [name, phone]
    );

    return (
        <div
            className="w-full h-full bg-white"
            style={{
                paddingTop: `${bar.top}px`,
                paddingBottom: `${bar.bottom}px`,
            }}
        >
            <Header
                title="내 정보"
                leftIcon={{
                    style: "chevron",
                    onClick: () =>
                        router.push(getLocalizedPath("/game/result")),
                }}
            />

            <div
                className="w-full p-[36px_20px]"
                style={{
                    height: `calc(100% - 86px - 62px - ${bar.bottom}px)`,
                }}
            >
                <div className="flex flex-col items-center gap-[48px]">
                    <div className="flex flex-col items-center gap-[12px]">
                        <img
                            src={user?.data.profileImageUrl}
                            alt="profile"
                            className="w-[100px] h-[100px] rounded-full object-cover"
                        />

                        <div className="flex flex-col items-center gap-[4px]">
                            <span className="font-p_semibold text-[20px] text-c_black">
                                {user?.data.name}
                            </span>

                            <span className="font-p_medium text-[14px] text-c_black">
                                {user?.data.email}
                            </span>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-[24px]">
                        <div className="flex flex-col gap-[6px]">
                            <span className="font-p_regular text-[16px] text-c_black">
                                이름
                            </span>

                            <Input
                                value={name}
                                setValue={setName}
                                placeholder="이름을 입력해 주세요."
                            />
                        </div>

                        <div className="flex flex-col gap-[6px]">
                            <span className="font-p_regular text-[16px] text-c_black">
                                전화번호
                            </span>

                            <Input
                                value={phone}
                                setValue={setPhone}
                                placeholder="전화번호를 입력해 주세요."
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-[10px] pb-[20px] px-[16px]">
                <Button
                    variants={
                        isPending || !isUpdatePossible ? "disabled" : "primary"
                    }
                    Icon={<SaveIcon />}
                    onClick={handleSubmit}
                >
                    저장하기
                </Button>
            </div>
        </div>
    );
}
