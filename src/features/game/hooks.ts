import { useQuery } from "@tanstack/react-query";
import { getEntry, getPlaying } from "./api";

// 남은 횟수 조회 query
export const useEntry = (credentials: { seasonId: number }) => {
    return useQuery({
        queryKey: ["entry"],
        queryFn: async () => await getEntry(credentials),
        retry: false,
    });
};

// 게임 진행 중 여부 query
export const usePlaying = (credentials: { seasonId: number }) => {
    return useQuery({
        queryKey: ["playing"],
        queryFn: async () => await getPlaying(credentials),
        retry: false,
    });
};
