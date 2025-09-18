import { AsyncResponse } from "@/api/types";
import { apiClient } from "@/api/client";

// 인사이트 조회 api
export const getInsight = async (): AsyncResponse<{
    ageGroupDistribution: { [age: string]: number };
    genderDistribution: { MALE: number; FEMALE: number };
    totalMembers: number;
    totalParticipations: number;
    totalMembersAtSeason: number;
}> => {
    return await apiClient.get(`/api/admin/insight`);
};

// 시즌별 인사이트 조회 api
export const getInsightWithSeasonId = async ({
    seasonId,
}: {
    seasonId: number;
}): AsyncResponse<{
    ageGroupDistribution: { [age: string]: number };
    genderDistribution: { MALE: number; FEMALE: number };
    totalMembers: number;
    totalParticipations: number;
    totalMembersAtSeason: number;
}> => {
    return await apiClient.get(`/api/admin/insight/season/${seasonId}`);
};
