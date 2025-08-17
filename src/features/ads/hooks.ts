import { useQuery } from "@tanstack/react-query";
import { serveAds, getAds } from "./api";

// 광고 배정 query
export const useServeAds = (credentials: {
    adType: string;
    seasonId?: string;
}) => {
    return useQuery({
        queryKey: ["ads.serve"],
        queryFn: async () => await serveAds(credentials),
        retry: false,
    });
};

// 관리자 광고 리스트 query
export const useAds = (credentials: { adType?: string }) => {
    return useQuery({
        queryKey: ["admin.ads"],
        queryFn: async () => await getAds(credentials),
        retry: false,
    });
};
