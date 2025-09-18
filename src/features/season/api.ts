import { AsyncResponse } from "@/api/types";
import { apiClient } from "@/api/client";

import {
    CreateSeasonRequest,
    EnterSeasonRequest,
    GetSeasonDetailRequest,
    GetSeasonDetailResponse,
    GetSeasonTopTenRequest,
    GetSeasonTopTenResponse,
    SeasonsResponse,
} from "./types";

// 시즌 목록 조회 api
export const getSeasons = async (): AsyncResponse<SeasonsResponse> => {
    return apiClient.get<SeasonsResponse>("/api/game/seasons/all");
};

// 활성화된 시즌 목록 조회 api
export const getActiveSeasons = async (): AsyncResponse<SeasonsResponse> => {
    return apiClient.get<SeasonsResponse>("/api/game/seasons/active");
};

// 시즌 생성 api
export const createSeason = async (credentials: CreateSeasonRequest) => {
    return apiClient.post("/api/admin/seasons/create", credentials);
};

// 시즌 참가 신청 api
export const enterSeason = async (credentials: EnterSeasonRequest) => {
    return apiClient.post("/api/game/seasons/participate", credentials);
};

// 시즌 TOP10 조회 api
export const getSeasonTopTen = async (credentials: GetSeasonTopTenRequest) => {
    return apiClient.get<GetSeasonTopTenResponse>(
        `/api/game/ranking/${credentials.id}`
    );
};

// 시즌 상세 조회 api
export const getSeasonDetail = async (credentials: GetSeasonDetailRequest) => {
    return apiClient.get<GetSeasonDetailResponse>(
        `/api/game/seasons/${credentials.id}`
    );
};
