import { apiClient } from "@/shared/api/client";

// 인사이트 조회 api
export const getInsight = async () => {
    return await apiClient.patch(`/api/admin/insight`);
};
