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
