"use client";

import {
    Gamepad2Icon,
    SmileIcon,
    TrendingUpIcon,
    UsersRoundIcon,
    VenusAndMarsIcon,
} from "lucide-react";

import { PieChart } from "@/shared/components/pie-chart";

import { useInsight } from "@/features/admin/insight/hooks";

export default function Insight() {
    const { data: insight } = useInsight();

    return (
        <div className="flex-1 p-[50px]">
            <div className="w-full grid grid-cols-2 gap-[20px]">
                <div className="border border-[#d5d5d5] p-[20px] rounded-[16px]">
                    <div className="flex flex-col gap-[8px]">
                        <div className="flex items-center gap-[6px]">
                            <UsersRoundIcon size={14} />

                            <span className="font-p_medium text-[14px] text-c_black">
                                총 방문자수
                            </span>
                        </div>

                        <div className="flex items-center gap-[8px]">
                            <TrendingUpIcon />

                            <span className="font-p_bold text-[28px] text-c_black">
                                {insight?.data.totalMembers.toLocaleString()}명
                            </span>
                        </div>
                    </div>
                </div>

                <div className="border border-[#d5d5d5] p-[20px] rounded-[16px]">
                    <div className="flex flex-col gap-[8px]">
                        <div className="flex items-center gap-[6px]">
                            <Gamepad2Icon size={14} />

                            <span className="font-p_medium text-[14px] text-c_black">
                                총 참가 횟수
                            </span>
                        </div>

                        <div className="flex items-center gap-[8px]">
                            <TrendingUpIcon />

                            <span className="font-p_bold text-[28px] text-c_black">
                                {insight?.data.totalParticipations.toLocaleString()}
                                번
                            </span>
                        </div>
                    </div>
                </div>

                <div className="border border-[#d5d5d5] p-[20px] rounded-[16px]">
                    <div className="flex flex-col gap-[8px]">
                        <div className="flex items-center gap-[6px]">
                            <SmileIcon size={14} />

                            <span className="font-p_medium text-[14px] text-c_black">
                                연령
                            </span>
                        </div>

                        <PieChart
                            data={
                                Object.keys(
                                    insight?.data.ageGroupDistribution || {}
                                ).map((key) => {
                                    const value =
                                        insight?.data.ageGroupDistribution[key];

                                    return {
                                        label: key,
                                        value,
                                        color: "#075B5E",
                                    };
                                }) as unknown as {
                                    label: string;
                                    value: number;
                                    color: string;
                                }[]
                            }
                            width={300}
                            height={300}
                        />
                    </div>
                </div>

                <div className="border border-[#d5d5d5] p-[20px] rounded-[16px]">
                    <div className="flex flex-col gap-[8px]">
                        <div className="flex items-center gap-[6px]">
                            <VenusAndMarsIcon size={14} />

                            <span className="font-p_medium text-[14px] text-c_black">
                                성별
                            </span>
                        </div>

                        <PieChart
                            data={[
                                {
                                    label: "남성",
                                    value:
                                        insight?.data.genderDistribution.MALE ||
                                        0,
                                    color: "#0256af",
                                },
                                {
                                    label: "여성",
                                    value:
                                        insight?.data.genderDistribution
                                            .FEMALE || 0,
                                    color: "#bb1563",
                                },
                            ]}
                            width={300}
                            height={300}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
