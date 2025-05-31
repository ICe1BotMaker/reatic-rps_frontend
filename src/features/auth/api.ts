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
