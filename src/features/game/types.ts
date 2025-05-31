// -----
export type TypeRPS = "ROCK" | "SCISSORS" | "PAPER";
export type TypeRPSKorea = "바위" | "가위" | "보";
// -----

// 게임 시작 req, res
export interface StartGameRequest {
    seasonId: number;
}

export interface StartGameResponse {
    gameId: number;
    seasonId: number;
    createdAt: string;
    winningStreak: number;
    currentRound: number;
    active: boolean;
}

// 게임 플레이 req, res
export interface PlayRequest {
    id?: number;
    choice: TypeRPSKorea;
    roundNumber: number;
}

export interface PlayResponse {
    roundNumber: number;
    createdAt: string;
    userChoice: TypeRPS;
    computerChoice: TypeRPSKorea;
    result: string;
    winningStreak: number;
    nextRoundAvailable: boolean;
    ipAddress: string;
    userAgent: string;
    deviceFingerprint: string;
}
