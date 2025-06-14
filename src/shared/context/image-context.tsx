"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { useImagePreloader } from "../hooks/use-image-preloader";
import { ImageAsset, ImageGroup } from "../types/image";

interface ImageContextType {
    getImage: (id: string) => string | undefined;
    preloadGroup: (groupName: string) => Promise<void>;
    loadingProgress: number;
    isLoading: boolean;
    isInitialized: boolean;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

// 이미지 설정 - 실제 프로젝트에서는 별도 파일로 분리
const IMAGE_GROUPS: ImageGroup = {
    // 높은 우선순위 - 즉시 로딩
    essential: [],
    // 중간 우선순위 - 첫 로딩 후
    interactions: [],
    // 낮은 우선순위 - 필요시 로딩
    animations: [
        ...(Array(121)
            .fill(0)
            .map((_, i) => ({
                id:
                    "1_mainloop" +
                    (i < 10 ? `000${i}` : i < 100 ? `00${i}` : `0${i}`),
                src: `/ko/rsp/1_mainloop/${
                    "1_mainloop" +
                    (i < 10 ? `000${i}` : i < 100 ? `00${i}` : `0${i}`)
                }.png`,
                priority: "medium",
                preloaded: true,
            })) as ImageAsset[]),
        ...(Array(161)
            .fill(0)
            .map((_, i) => ({
                id:
                    "3_hi" +
                    (i < 10 ? `000${i}` : i < 100 ? `00${i}` : `0${i}`),
                src: `/ko/rsp/3_hi/${
                    "3_hi" + (i < 10 ? `000${i}` : i < 100 ? `00${i}` : `0${i}`)
                }.png`,
                priority: "medium",
                preloaded: true,
            })) as ImageAsset[]),
    ],
};

interface ImageProviderProps {
    children: React.ReactNode;
}

export const ImageProvider: React.FC<ImageProviderProps> = ({ children }) => {
    const { loadingProgress, isLoading, preloadImages, getImageUrl } =
        useImagePreloader();
    const [isInitialized, setIsInitialized] = useState(false);
    const [loadedGroups, setLoadedGroups] = useState<Set<string>>(new Set());

    // 초기 로딩 - 필수 이미지들
    useEffect(() => {
        const initializeImages = async () => {
            try {
                // 높은 우선순위 이미지들 먼저 로딩
                await preloadImages(IMAGE_GROUPS.essential);
                setLoadedGroups((prev) => new Set([...prev, "essential"]));

                // 백그라운드에서 중간 우선순위 이미지들 로딩
                setTimeout(() => {
                    preloadImages(IMAGE_GROUPS.interactions).then(() => {
                        setLoadedGroups(
                            (prev) => new Set([...prev, "interactions"])
                        );
                    });
                }, 1000);

                setIsInitialized(true);
            } catch (error) {
                console.error("Failed to initialize images:", error);
                setIsInitialized(true); // 에러가 있어도 앱 사용은 가능하도록
            }
        };

        initializeImages();
    }, [preloadImages]);

    const preloadGroup = async (groupName: string): Promise<void> => {
        if (loadedGroups.has(groupName)) {
            return; // 이미 로딩된 그룹
        }

        const group = IMAGE_GROUPS[groupName];
        if (!group) {
            console.warn(`Image group '${groupName}' not found`);
            return;
        }

        await preloadImages(group);
        setLoadedGroups((prev) => new Set([...prev, groupName]));
    };

    const getImage = (id: string): string | undefined => {
        return getImageUrl(id);
    };

    const contextValue: ImageContextType = {
        getImage,
        preloadGroup,
        loadingProgress,
        isLoading,
        isInitialized,
    };

    return (
        <ImageContext.Provider value={contextValue}>
            {children}
        </ImageContext.Provider>
    );
};

export const useImageContext = (): ImageContextType => {
    const context = useContext(ImageContext);
    if (!context) {
        throw new Error("useImageContext must be used within an ImageProvider");
    }
    return context;
};
