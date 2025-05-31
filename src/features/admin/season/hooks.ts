import { useQuery } from "@tanstack/react-query";
import { getSeasonParticipants, getSeasonLogs } from "./api";

// 시즌 참여자 목록 조회 query
export const useSeasonParticipants = (seasonId: number) => {
    return useQuery({
        queryKey: ["admin.season.participants", seasonId],
        queryFn: async () => await getSeasonParticipants({ id: seasonId }),
        retry: false,
        enabled: !!seasonId,
    });
};

// 시즌 게임 로그 조회 query
export const useSeasonLogs = (seasonId: number) => {
    return useQuery({
        queryKey: ["admin.season.logs", seasonId],
        queryFn: async () => await getSeasonLogs({ id: seasonId }),
        retry: false,
        enabled: !!seasonId,
    });
};