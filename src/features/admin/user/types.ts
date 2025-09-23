// 회원 목록 조회 res
export interface GetMembersResponse {
    content: {
        id: number;
        createdAt: string;
        nickname: string;
        name: string;
        email: string;
        role: "ADMIN" | "MEMBER";
        status: string; // ACTIVE
        phoneNumber: string;
        profileImageUrl: string;
        latestSeasonBestStreak: number;
        latestSeasonRank: string;
    }[];
}
