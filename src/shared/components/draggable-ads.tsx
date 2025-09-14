"use client";

import { ChevronUpIcon } from "lucide-react";
import { useRef, useCallback, useState, TouchEvent, MouseEvent } from "react";
import { SquareAds } from "./ads";

interface DraggableProps {
    isDragged: boolean;
    onDragged: () => void;
}

export const DraggableAds = ({ isDragged, onDragged }: DraggableProps) => {
    const [translateY, setTranslateY] = useState(0);
    const startYRef = useRef<number | null>(null);
    const isDraggingRef = useRef(false);
    const threshold = 50;

    // 터치 이벤트 핸들러
    const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
        startYRef.current = e.touches[0].clientY;
        isDraggingRef.current = true;
    }, []);

    const handleTouchMove = useCallback(
        (e: TouchEvent<HTMLDivElement>) => {
            if (startYRef.current === null || !isDraggingRef.current) return;
            const currentY = e.touches[0].clientY;
            const deltaY = currentY - startYRef.current;
            setTranslateY(deltaY);

            if (deltaY <= -threshold) {
                onDragged();
                startYRef.current = null;
                isDraggingRef.current = false;
            }
        },
        [onDragged, threshold]
    );

    const handleTouchEnd = useCallback(() => {
        startYRef.current = null;
        isDraggingRef.current = false;
        setTranslateY(0);
    }, []);

    // 마우스 이벤트 핸들러
    const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
        startYRef.current = e.clientY;
        isDraggingRef.current = true;
        e.preventDefault(); // 텍스트 선택 방지
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent<HTMLDivElement>) => {
            if (startYRef.current === null || !isDraggingRef.current) return;
            const currentY = e.clientY;
            const deltaY = currentY - startYRef.current;
            setTranslateY(deltaY);

            if (deltaY <= -threshold) {
                onDragged();
                startYRef.current = null;
                isDraggingRef.current = false;
            }
        },
        [onDragged, threshold]
    );

    const handleMouseUp = useCallback(() => {
        startYRef.current = null;
        isDraggingRef.current = false;
        setTranslateY(0);
    }, []);

    const handleMouseLeave = useCallback(() => {
        // 마우스가 요소를 벗어나면 드래깅 종료
        if (isDraggingRef.current) {
            startYRef.current = null;
            isDraggingRef.current = false;
            setTranslateY(0);
        }
    }, []);

    return (
        <div
            className="flex flex-col gap-[16px] items-center select-none cursor-pointer"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: `translateY(${translateY}px)`,
                transition: translateY === 0 ? "transform 0.1s ease" : "none",
                opacity: isDragged ? "0" : "1",
            }}
        >
            <div className="flex flex-col items-center gap-[6px]">
                <ChevronUpIcon />

                <span className="font-p_regular text-[14px] text-c_black">
                    위로 올려서 순위표 보기
                </span>
            </div>

            <SquareAds />
        </div>
    );
};
