export interface DefaultResponse<T> {
    message: string;
    statusCode: number;
    data: T;
    error?: string;
}

export type AsyncResponse<T> = Promise<DefaultResponse<T>>;
