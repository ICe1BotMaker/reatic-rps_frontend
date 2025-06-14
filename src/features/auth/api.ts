import { AsyncResponse } from "@/shared/api/types";
import { apiClient } from "@/shared/api/client";

import { SignUpRequest, SignUpResponse } from "./types";

// 회원가입 api
export const signup = async (
    credentials: SignUpRequest
): AsyncResponse<SignUpResponse> => {
    return apiClient.post<SignUpResponse>(
        "/api/members/register",
        credentials,
        {
            headers: { skipAuth: true },
        }
    );
};

// 내 정보 조회 api
export const getUser = async () => {
    return apiClient.get<{
        email: string;
        name: string;
        phoneNumber: string;
        birthDate: string;
        profileImageUrl: string;
    }>("/api/members/myprofile");
};

// 내 정보 수정 api
export const updateUser = async (credentials: {
    name: string;
    phoneNumber: string;
}) => {
    return apiClient.put("/api/members/myprofile", credentials);
};
