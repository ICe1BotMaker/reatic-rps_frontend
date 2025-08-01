import { AsyncResponse } from "@/shared/api/types";
import { apiClient } from "@/shared/api/client";

import {
    PlayRequest,
    PlayResponse,
    StartGameRequest,
    StartGameResponse,
} from "./types";

// 게임 시작 api
export const start = async (
    credentials: StartGameRequest
): AsyncResponse<StartGameResponse> => {
    return apiClient.post<StartGameResponse>("/api/game/start", credentials);
};

// 게임 플레이 api
export const play = async (
    credentials: PlayRequest
): AsyncResponse<PlayResponse> => {
    return apiClient.post<PlayResponse>(
        `/api/game/play/${credentials.id}`,
        (() => {
            delete credentials.id;
            return credentials;
        })()
    );
};

// 공유 및 횟수 증가 api
export const share = async () => {
    return apiClient.post("/api/game/seasons/entry/share");
};

// 광고 시청 및 횟수 증가 api
export const watchAds = async (credentials: { rewardUrl: string }) => {
    return apiClient.post(
        `/api/game/seasons/entry/ad/verify?rewardUrl=${credentials.rewardUrl}`
    );
};

// 남은 횟수 조회 api
export const getEntry = async (credentials: {
    seasonId: number;
}): AsyncResponse<{
    remainingEntry: number;
    totalGivenEntry: number;
    adEntryCount: number;
    shareEntryCount: number;
}> => {
    return apiClient.get(`/api/game/seasons/${credentials.seasonId}/me`);
};

// 게임 진행 중 여부 api
export const getPlaying = async (credentials: {
    seasonId: number;
}): AsyncResponse<{
    isPlaying: boolean;
}> => {
    return apiClient.get(`/api/game/seasons/${credentials.seasonId}/isPlaying`);
};
