import { apiClient } from "@/api/client";
import { AsyncResponse } from "@/api/types";

// 시즌 일시중지 api
export const pauseSeason = async ({ id }: { id: number }) => {
    return await apiClient.patch(`/api/admin/seasons/${id}/pause`);
};

// 시즌 재개 api
export const resumeSeason = async ({ id }: { id: number }) => {
    return await apiClient.patch(`/api/admin/seasons/${id}/resume`);
};

// 시즌 참여자 목록 api
export const getSeasonParticipants = async ({
    id,
}: {
    id: number;
}): AsyncResponse<{
    content: {
        id: number;
        createdAt: string;
        nickname: string;
        name: string;
        email: string;
        role: "ADMIN" | "USER";
        status: string;
        phoneNumber: string;
        profileImageUrl: string;
    }[];
}> => {
    return await apiClient.get(
        `/api/operator/game/season/${id}/participants?page=0&size=30000`
    );
};

// 시즌 게임 로그 api
export const getSeasonLogs = async ({
    id,
}: {
    id: number;
}): AsyncResponse<{
    content: {
        gameId: number;
        memberEmail: string;
        createdAt: string;
        winningStreak: number;
        active: boolean;
    }[];
}> => {
    return await apiClient.get(
        `/api/operator/game/season/${id}/logs?page=0&size=30000`
    );
};
