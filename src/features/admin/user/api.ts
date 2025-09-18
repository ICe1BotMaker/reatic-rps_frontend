import { apiClient } from "@/api/client";
import { AsyncResponse } from "@/api/types";
import { GetMembersResponse } from "./types";

// 회원 목록 조회 api
export const getMembers = async (): AsyncResponse<GetMembersResponse> => {
    return await apiClient.get<GetMembersResponse>(
        "/api/operator/members?page=0&size=30000"
    );
};

// 회원 로그 조회 api
export const getMemberLoginLogs = async ({
    id,
}: {
    id: number;
}): AsyncResponse<{
    content: {
        id: number;
        memberId: number;
        ipAddress: string;
        userAgent: string;
        deviceFingerprint: string;
        loginAt: string;
    }[];
}> => {
    return await apiClient.get<{
        content: {
            id: number;
            memberId: number;
            ipAddress: string;
            userAgent: string;
            deviceFingerprint: string;
            loginAt: string;
        }[];
    }>(`/api/operator/members/member/${id}/login-logs`);
};

// 회원 정지 api
export const banMember = async ({ id }: { id: number }) => {
    return await apiClient.post(`/api/operator/members/ban?memberId=${id}`);
};

// 회원 정지 해제 api
export const unbanMember = async ({ id }: { id: number }) => {
    return await apiClient.post(`/api/operator/members/unban?memberId=${id}`);
};

// 회원 승격 api
export const promoteMember = async ({ id }: { id: number }) => {
    return await apiClient.post(`/api/admin/members/promote?memberId=${id}`);
};

// 회원 강등 api
export const demoteMember = async ({ id }: { id: number }) => {
    return await apiClient.post(`/api/admin/members/demote?memberId=${id}`);
};
