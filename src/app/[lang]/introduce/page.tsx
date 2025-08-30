"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "lucide-react";

import { BottomSheet } from "@/shared/components/bottom-sheet";
import { Button } from "@/shared/components/button";

import { useLocalizedPath } from "@/shared/utils/locale";
import { useBar } from "@/shared/stores/bar.zustand";

export default function Introduce() {
    const getLocalizedPath = useLocalizedPath();
    const router = useRouter();
    const bar = useBar();

    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsBottomSheetOpen(true);
        }, 1000);

        return () => {
            clearTimeout(timeout);
        };
    }, []);

    const renderHeader = useCallback(() => {
        return (
            <div className="p-[36px_16px]">
                <p className="font-p_semibold text-[32px] text-white leading-[39px]">
                    도전하기 전에
                    <br />
                    다음을 확인해 주세요!
                </p>
            </div>
        );
    }, []);

    const handleAgree = () => {
        setIsBottomSheetOpen(false);
        router.push(getLocalizedPath("/ready"));
    };

    return (
        <>
            <div
                className="w-screen h-dvh overflow-hidden bg-gradient-to-b from-c_primary to-[#5289E8]"
                style={{
                    paddingTop: `${bar.top}px`,
                    paddingBottom: `${bar.bottom}px`,
                }}
            >
                {renderHeader()}
            </div>

            <BottomSheet isOpen={isBottomSheetOpen}>
                <ul className="p-[24px] max-h-[400px] overflow-y-scroll uld">
                    <li className="font-p_regular text-[14px] text-c_black py-[12px]">
                        본 게임은 정해진 기간 내에 가위바위보를 연속으로 이긴
                        횟수가 가장 많은 1인이 우승하고 상금을 받습니다. (단,
                        2인 이상이 동일한 기록을 갖고 있을 경우 먼저 플레이한
                        순서로 우선함)
                    </li>
                    <li className="font-p_regular text-[14px] text-c_black py-[12px]">
                        상금은 매주 이벤트가 갱신되는 시점에 1위를 달성 또는
                        유지한 참가자 1인에게 지급 되며 해당 참가자는 우승이
                        확정된 후 주최 측의 연락을 즉시 받아야 합니다.
                        확정일로부터 3일 내에 응답이 없을 경우 자동으로 2위에게
                        상금이 넘어갑니다.
                    </li>
                    <li className="font-p_regular text-[14px] text-c_black py-[12px]">
                        본 이벤트의 제작진과 관련 인물이 우승하였을 경우
                        무효처리되며 2위에게 상금이 넘어갑니다.
                    </li>
                    <li className="font-p_regular text-[14px] text-c_black py-[12px]">
                        크래킹(해킹), 승부 조작, 대리 참가 등의 부정적인
                        방식으로 참가하여 가위바위보 또는 사이트에 악영향을
                        주었을 경우 피해를 보상해야하고 다시는 참가할 수
                        없습니다.
                    </li>
                    <li className="font-p_regular text-[14px] text-c_black py-[12px]">
                        참가자는 로그인한 소셜 계정 정보에 본인의 정보를 실수
                        없이 입력해야 하며, 오기입 하였을 경우에 벌어지는 결과에
                        대해서는 참가자가 책임을 져야 합니다.
                    </li>
                    <li className="font-p_regular text-[14px] text-c_black py-[12px]">
                        이 가위바위보의 진행 여부와 상관없이 아래
                        &apos;확인했어요&apos; 버튼을 클릭하였을 경우 자동으로
                        참가로 인정되며, 이후 창을 나가거나 컴퓨터 전원을 끄는
                        등 자·타의적으로 참가 중간에 이탈할 경우에는 기회가
                        그대로 소진됩니다.
                    </li>
                    <li className="font-p_regular text-[14px] text-c_black py-[12px]">
                        수집한 개인정보는 상금 지급 및 부정행위 방지 용도 외로는
                        사용되지 않습니다.
                    </li>
                    <li className="font-p_regular text-[14px] text-c_black py-[12px]">
                        아래 &apos;확인했어요&apos; 버튼을 누르는 순간 참가자는
                        이벤트와 위 내용에 대해 모두 이해하고 동의한 것으로
                        간주됩니다.
                    </li>
                </ul>

                <div className="pt-[10px] pb-[20px] px-[24px] flex flex-col gap-[12px]">
                    <Button
                        variants="primary_light"
                        Icon={<CheckIcon />}
                        onClick={handleAgree}
                    >
                        확인했어요
                    </Button>
                </div>
            </BottomSheet>
        </>
    );
}
