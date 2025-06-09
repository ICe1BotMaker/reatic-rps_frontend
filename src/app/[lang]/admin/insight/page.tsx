import {
    Gamepad2Icon,
    SmileIcon,
    TrendingUpIcon,
    UsersRoundIcon,
    VenusAndMarsIcon,
} from "lucide-react";

import { PieChart } from "@/shared/components/pie-chart";

export default function Insight() {
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
                                9,381명
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
                                72,302번
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
                            data={[
                                {
                                    label: "10대",
                                    value: 128,
                                    color: "#075B5E",
                                },
                                {
                                    label: "20대",
                                    value: 320,
                                    color: "#FF3F33",
                                },
                                {
                                    label: "30대",
                                    value: 47,
                                    color: "#9FC87E",
                                },
                            ]}
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
                                    value: 402,
                                    color: "#0256af",
                                },
                                {
                                    label: "여성",
                                    value: 217,
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
