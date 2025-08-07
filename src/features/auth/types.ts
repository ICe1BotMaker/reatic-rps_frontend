// 회원가입 req, res
export interface SignUpRequest {
    kakaoId: string;
    email: string;
    nickname: string;
    profileImageUrl: string;
    name: string;
    phoneNumber: string;
    gender: string;
    birthDate: string;
}

export interface SignUpResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        kakaoId: string;
        email: string;
        nickname: string;
        profileImageUrl: string;
        name: string;
        phoneNumber: string;
    };
}
