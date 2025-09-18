import { useQuery } from "@tanstack/react-query";
import { getInsight, getInsightWithSeasonId } from "./api";

// 시즌 참여자 목록 조회 query
export const useInsight = () => {
    return useQuery({
        queryKey: ["admin.insight"],
        queryFn: async () => await getInsight(),
        retry: false,
    });
};

// 시즌별 참여자 목록 조회 query
export const useInsightWithSeason = ({ seasonId }: { seasonId: number }) => {
    return useQuery({
        queryKey: ["admin.insight", seasonId],
        queryFn: async () => await getInsightWithSeasonId({ seasonId }),
        retry: false,
        enabled: !!seasonId,
    });
};
