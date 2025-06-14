// 시즌 목록 조회 res
export type SeasonsResponse = {
    active: boolean;
    createdAt: string;
    endDateTime: string;
    id: number;
    paused: boolean;
    seasonName: string;
    startDateTime: string;
}[];

// 시즌 생성 req
export interface CreateSeasonRequest {
    seasonName: string;
    startDateTime: string;
    endDateTime: string;
}

// 시즌 참가 신청 req
export interface EnterSeasonRequest {
    seasonId: number;
}

// 시즌 TOP10 조회 req, res
export interface GetSeasonTopTenRequest {
    id: number;
}

export type GetSeasonTopTenResponse = {
    rank: number;
    nickname: string;
    score: number;
    me: boolean;
}[];

// 시즌 상세 조회 req, res
export interface GetSeasonDetailRequest {
    id: number;
}

export interface GetSeasonDetailResponse {
    id: number;
    createdAt: string;
    seasonName: string;
    startDateTime: string;
    endDateTime: string;
    active: boolean;
    paused: boolean;
}
