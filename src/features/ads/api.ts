import { AsyncResponse } from "@/shared/api/types";
import { apiClient } from "@/shared/api/client";

// 전면 광고 인증 api
export const redeemAds = async (credentials: {
    token: string;
}): AsyncResponse<unknown> => {
    return apiClient.post("/api/ads/redeem", credentials);
};

// 광고 배정 api
export const serveAds = async (credentials: {
    adType: string;
    seasonId?: string;
}): AsyncResponse<unknown> => {
    return apiClient.get("/api/ads/serve", {
        params: credentials,
    });
};

// 관리자 광고 리스트 api
export const getAds = async (credentials: {
    adType?: string;
}): AsyncResponse<unknown> => {
    return apiClient.get("/api/admin/ads", {
        params: credentials,
    });
};

// 관리자 광고 추가 api
export const addAds = async (credentials: {
    adType: string;
    advertiser: string;
    advertiserProfile: string;
    stake: number;
    adUrl: string;
}): AsyncResponse<unknown> => {
    return apiClient.post("/api/admin/ads", credentials);
};

// 관리자 광고 지분 수정 api
export const modifyAdsStake = async (credentials: {
    id: string;
    stake: number;
}): AsyncResponse<unknown> => {
    return apiClient.patch(`/api/admin/ads/${credentials.id}/stake`, {
        stake: credentials.stake,
    });
};

// 관리자 광고 삭제 api
export const removeAds = async (credentials: {
    id: string;
}): AsyncResponse<unknown> => {
    return apiClient.delete(`/api/admin/ads/${credentials.id}`);
};
