"use client";

import React from "react";

import { useImageContext } from "../context/image-context";

export const LoadingIndicator: React.FC = () => {
    const { loadingProgress, isLoading, isInitialized } = useImageContext();

    if (isInitialized && !isLoading) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50">
            <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-sm text-gray-700">
                    이미지 로딩 중... {Math.round(loadingProgress)}%
                </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }}
                ></div>
            </div>
        </div>
    );
};
