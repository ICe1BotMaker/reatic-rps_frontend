// 시즌 참여자 타입
export interface SeasonParticipant {
    id: number;
    createdAt: string;
    nickname: string;
    name: string;
    email: string;
    role: "ADMIN" | "USER";
    status: string;
    phoneNumber: string;
    profileImageUrl: string;
}

// 시즌 게임 로그 타입
export interface SeasonLog {
    gameId: number;
    memberEmail: string;
    createdAt: string;
    winningStreak: number;
    active: boolean;
}