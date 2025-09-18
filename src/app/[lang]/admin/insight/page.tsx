"use client";

import {
    Gamepad2Icon,
    SmileIcon,
    TrendingUpIcon,
    UsersRoundIcon,
    VenusAndMarsIcon,
} from "lucide-react";
import { useState } from "react";

import { PieChart } from "@/shared/components/pie-chart";

import {
    useInsight,
    useInsightWithSeason,
} from "@/features/admin/insight/hooks";
import { useActiveSeason } from "@/features/season/hooks";

export default function Insight() {
    const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(
        null
    );

    const { data: seasons } = useActiveSeason();
    const { data: insight } = useInsight();
    const { data: seasonInsight } = useInsightWithSeason({
        seasonId: selectedSeasonId!,
    });

    const currentInsight = selectedSeasonId ? seasonInsight : insight;

    return (
        <div className="flex-1 p-[50px]">
            <div className="mb-[20px]">
                <select
                    value={selectedSeasonId || ""}
                    onChange={(e) =>
                        setSelectedSeasonId(
                            e.target.value ? Number(e.target.value) : null
                        )
                    }
                    className="border border-[#d5d5d5] p-[8px] rounded-[8px] font-p_medium text-[14px]"
                >
                    <option value="">전체 시즌</option>
                    {seasons?.data.map((season) => (
                        <option key={season.id} value={season.id}>
                            {season.seasonName}
                        </option>
                    ))}
                </select>
            </div>

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
                                {(
                                    currentInsight?.data?.totalMembers ||
                                    currentInsight?.data
                                        ?.totalMembersAtSeason ||
                                    0
                                ).toLocaleString()}
                                명
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
                                {currentInsight?.data.totalParticipations.toLocaleString()}
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
                                    currentInsight?.data.ageGroupDistribution ||
                                        {}
                                ).map((key, i) => {
                                    const value =
                                        currentInsight?.data
                                            .ageGroupDistribution[key];

                                    return {
                                        label: key,
                                        value,
                                        color: [
                                            "#075B5E",
                                            "#D4A574",
                                            "#8B5A8C",
                                            "#C97064",
                                            "#2E3A59",
                                            "#b14d55ff",
                                            "#9C7A3C",
                                            "#6B5B73",
                                            "#F7931E",
                                            "#5D4E37",
                                        ][i],
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
                                        currentInsight?.data.genderDistribution
                                            .MALE || 0,
                                    color: "#0256af",
                                },
                                {
                                    label: "여성",
                                    value:
                                        currentInsight?.data.genderDistribution
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
