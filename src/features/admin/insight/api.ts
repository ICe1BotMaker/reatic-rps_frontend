import { AsyncResponse } from "@/shared/api/types";
import { apiClient } from "@/shared/api/client";

// 인사이트 조회 api
export const getInsight = async (): AsyncResponse<{
    ageGroupDistribution: { [age: string]: number };
    genderDistribution: { MALE: number; FEMALE: number };
    totalMembers: number;
    totalParticipations: number;
}> => {
    return await apiClient.get(`/api/admin/insight`);
};
