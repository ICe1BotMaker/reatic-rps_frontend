import { useQuery } from "@tanstack/react-query";
import { getInsight } from "./api";

// 시즌 참여자 목록 조회 query
export const useInsight = () => {
    return useQuery({
        queryKey: ["admin.insight"],
        queryFn: async () => await getInsight(),
        retry: false,
    });
};
