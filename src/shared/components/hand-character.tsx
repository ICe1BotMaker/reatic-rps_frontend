/* eslint-disable @next/next/no-img-element */

"use client";

import React, { useState, useEffect, useMemo } from "react";

import { useImageContext } from "../context/image-context";
import { Actions } from "../types/image";

interface HandCharacterProps {
    action?: Actions;
    className?: string;
    width?: number;
    height?: number;
    onAnimationComplete?: () => void;
}

export const HandCharacter: React.FC<HandCharacterProps> = ({
    action = "main_loop",
    className = "",
    width = 200,
    height = 200,
    onAnimationComplete,
}) => {
    const { getImage, preloadGroup, isInitialized } = useImageContext();
    const [currentFrame, setCurrentFrame] = useState(0);

    // 애니메이션 시퀀스 정의 - 이중 배열 구조 수정
    const animationSequences = useMemo(
        () => ({
            main_loop: Array(121)
                .fill(0)
                .map(
                    (_, i) =>
                        "1_mainloop" +
                        (i < 10 ? `000${i}` : i < 100 ? `00${i}` : `0${i}`)
                ),
            hi: Array(161)
                .fill(0)
                .map(
                    (_, i) =>
                        "3_hi" +
                        (i < 10 ? `000${i}` : i < 100 ? `00${i}` : `0${i}`)
                ),
        }),
        []
    );

    useEffect(() => {
        if (!isInitialized) return;

        const sequence = animationSequences[action];
        if (!sequence || sequence.length === 0) return;

        // 애니메이션 그룹 미리 로딩
        preloadGroup("animations");

        // 애니메이션 시작
        if (sequence.length > 1) {
            let frameIndex = 0;

            const interval = setInterval(() => {
                setCurrentFrame(frameIndex);
                frameIndex++;

                if (frameIndex >= sequence.length) {
                    frameIndex = 0; // 반복
                }
            }, 50); // 200ms 간격으로 프레임 변경

            return () => clearInterval(interval);
        } else {
            setCurrentFrame(0);
        }
    }, [
        action,
        isInitialized,
        preloadGroup,
        onAnimationComplete,
        animationSequences,
    ]);

    if (!isInitialized) {
        return (
            <div
                className={`flex items-center justify-center ${className}`}
                style={{ width, height }}
            >
                <div className="text-white">로딩 중...</div>
            </div>
        );
    }

    const sequence = animationSequences[action];
    if (!sequence || sequence.length === 0) {
        return (
            <div
                className={`flex items-center justify-center ${className}`}
                style={{ width, height }}
            >
                <div className="text-white">애니메이션 시퀀스 없음</div>
            </div>
        );
    }

    // 수정된 부분: currentImageId는 문자열이므로 [0] 제거
    const currentImageId = sequence[currentFrame];
    const imageUrl = getImage(currentImageId);

    if (!imageUrl) {
        return (
            <div
                className={`flex items-center justify-center ${className}`}
                style={{ width, height }}
            >
                <div className="text-white">이미지 로딩 중...</div>
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={`Hand character ${action}`}
            className={className}
            width={width}
            height={height}
            style={{ objectFit: "contain" }}
        />
    );
};
