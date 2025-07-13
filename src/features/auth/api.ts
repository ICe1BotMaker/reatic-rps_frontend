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

// 카카오 로그인 api
export const kakaoLogin = async (credentials: {
    code: string;
}): AsyncResponse<{
    refreshToken: string;
    accessToken: string;
    user: {
        id: string;
        kakaoId: string;
        email: string;
        nickname: string;
        profileImageUrl: string;
        name: string;
        phoneNumber: string;
        birthDate: string;
        gender: "FEMAIL" | "MALE";
    };
}> => {
    return apiClient.get("/api/members/login", {
        headers: { skipAuth: true },
        params: credentials,
    });
};
