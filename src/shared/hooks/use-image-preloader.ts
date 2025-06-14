"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ImageAsset } from "../types/image";

interface UseImagePreloaderReturn {
    loadedImages: Map<string, string>;
    loadingProgress: number;
    isLoading: boolean;
    preloadImages: (images: ImageAsset[]) => Promise<void>;
    getImageUrl: (id: string) => string | undefined;
    preloadImageGroup: (groupName: string) => Promise<void>;
}

export const useImagePreloader = (): UseImagePreloaderReturn => {
    const [loadedImages, setLoadedImages] = useState<Map<string, string>>(
        new Map()
    );
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const loadingQueue = useRef<Set<string>>(new Set());
    const abortController = useRef<AbortController>(null);

    const preloadImage = useCallback(
        async (asset: ImageAsset): Promise<void> => {
            if (
                loadedImages.has(asset.id) ||
                loadingQueue.current.has(asset.id)
            ) {
                return;
            }

            loadingQueue.current.add(asset.id);

            try {
                const response = await fetch(asset.src, {
                    signal: abortController.current?.signal,
                });

                if (!response.ok) {
                    throw new Error(`Failed to load image: ${asset.src}`);
                }

                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);

                setLoadedImages((prev) => {
                    const newMap = new Map(prev);
                    newMap.set(asset.id, objectUrl);
                    return newMap;
                });

                // 이미지 객체로 프리로딩하여 브라우저 캐시에 저장
                const img = new Image();
                img.src = objectUrl;
            } catch (error) {
                if (error instanceof Error && error.name !== "AbortError") {
                    console.error(
                        `Failed to preload image ${asset.id}:`,
                        error
                    );
                }
            } finally {
                loadingQueue.current.delete(asset.id);
            }
        },
        [loadedImages]
    );

    const preloadImages = useCallback(
        async (images: ImageAsset[]): Promise<void> => {
            if (images.length === 0) return;

            setIsLoading(true);
            abortController.current = new AbortController();

            // 우선순위별로 정렬
            const sortedImages = [...images].sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });

            let loadedCount = 0;
            const totalImages = sortedImages.length;

            // 동시 로딩 제한 (너무 많은 요청을 동시에 보내지 않도록)
            const concurrencyLimit = 5;
            const chunks = [];

            for (let i = 0; i < sortedImages.length; i += concurrencyLimit) {
                chunks.push(sortedImages.slice(i, i + concurrencyLimit));
            }

            for (const chunk of chunks) {
                const promises = chunk.map(async (image) => {
                    await preloadImage(image);
                    loadedCount++;
                    setLoadingProgress((loadedCount / totalImages) * 100);
                });

                await Promise.allSettled(promises);
            }

            setIsLoading(false);
        },
        [preloadImage]
    );

    const getImageUrl = useCallback(
        (id: string): string | undefined => {
            return loadedImages.get(id);
        },
        [loadedImages]
    );

    const preloadImageGroup = useCallback(
        async (groupName: string): Promise<void> => {
            // 이 함수는 ImageProvider에서 구현됩니다
            console.log(`Preloading group: ${groupName}`);
        },
        []
    );

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            abortController.current?.abort();
            // Object URLs 정리하여 메모리 누수 방지
            loadedImages.forEach((url) => {
                URL.revokeObjectURL(url);
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        loadedImages,
        loadingProgress,
        isLoading,
        preloadImages,
        getImageUrl,
        preloadImageGroup,
    };
};
