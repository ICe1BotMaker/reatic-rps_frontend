import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { Storage } from "@/services/storage";
import { DefaultResponse } from "./types";

export class ApiClient {
    private client: AxiosInstance;

    constructor(baseURL: string) {
        this.client = axios.create({
            baseURL,
            timeout: 30000,
            headers: {
                "Content-Type": "application/json",
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        this.client.interceptors.request.use(
            (config) => {
                if (!config.headers?.["skipAuth"]) {
                    const token = Storage.getAccessToken();
                    if (token) config.headers.Authorization = `Bearer ${token}`;
                } else delete config.headers["skipAuth"];

                return config;
            },
            (error) => Promise.reject(error)
        );

        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => Promise.reject(error)
        );
    }

    async get<T>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<DefaultResponse<T>> {
        const response = await this.client.get<DefaultResponse<T>>(url, config);
        return response.data;
    }

    async post<T>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<DefaultResponse<T>> {
        const response = await this.client.post<DefaultResponse<T>>(
            url,
            data,
            config
        );
        return response.data;
    }

    async put<T>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<DefaultResponse<T>> {
        const response = await this.client.put<DefaultResponse<T>>(
            url,
            data,
            config
        );
        return response.data;
    }

    async delete<T>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<DefaultResponse<T>> {
        const response = await this.client.delete<DefaultResponse<T>>(
            url,
            config
        );
        return response.data;
    }

    async patch<T>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<DefaultResponse<T>> {
        const response = await this.client.patch<DefaultResponse<T>>(
            url,
            data,
            config
        );
        return response.data;
    }

    async postFormData<T>(
        url: string,
        data?: FormData,
        config?: AxiosRequestConfig
    ): Promise<DefaultResponse<T>> {
        const formConfig = {
            ...config,
            headers: {
                ...config?.headers,
                "Content-Type": "multipart/form-data",
            },
        };
        const response = await this.client.post<DefaultResponse<T>>(
            url,
            data,
            formConfig
        );
        return response.data;
    }

    async patchFormData<T>(
        url: string,
        data?: FormData,
        config?: AxiosRequestConfig
    ): Promise<DefaultResponse<T>> {
        const formConfig = {
            ...config,
            headers: {
                ...config?.headers,
                "Content-Type": "multipart/form-data",
            },
        };
        const response = await this.client.patch<DefaultResponse<T>>(
            url,
            data,
            formConfig
        );
        return response.data;
    }

    async putFormData<T>(
        url: string,
        data?: FormData,
        config?: AxiosRequestConfig
    ): Promise<DefaultResponse<T>> {
        const formConfig = {
            ...config,
            headers: {
                ...config?.headers,
                "Content-Type": "multipart/form-data",
            },
        };
        const response = await this.client.put<DefaultResponse<T>>(
            url,
            data,
            formConfig
        );
        return response.data;
    }
}

export const apiClient = new ApiClient(
    process.env.NEXT_PUBLIC_BACKEND_URL || ""
);
