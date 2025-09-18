import { useQuery } from "@tanstack/react-query";
import { getActiveSeasons, getSeasonDetail, getSeasonTopTen } from "./api";
import { GetSeasonDetailRequest, GetSeasonTopTenRequest } from "./types";

// 시즌 TOP10 조회 query
export const useSeasonTopTen = (credentials: GetSeasonTopTenRequest) => {
    return useQuery({
        queryKey: ["season.top10"],
        queryFn: async () => await getSeasonTopTen(credentials),
        retry: false,
    });
};

// 시즌 상세 조회 query
export const useSeasonDetail = (credentials: GetSeasonDetailRequest) => {
    return useQuery({
        queryKey: ["season.?"],
        queryFn: async () => await getSeasonDetail(credentials),
        retry: false,
    });
};

// 활성화된 시즌 목록 조회 query
export const useActiveSeason = () => {
    return useQuery({
        queryKey: ["seasons"],
        queryFn: async () => await getActiveSeasons(),
        retry: false,
    });
};
