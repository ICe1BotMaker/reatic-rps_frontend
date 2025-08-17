"use client";

import { ChevronUpIcon } from "lucide-react";
import { useRef, useCallback, useState, TouchEvent } from "react";
import { SquareAd } from "./ads";

interface DraggableProps {
    isDragged: boolean;
    onDragged: () => void;
}

export const DraggableAD = ({ isDragged, onDragged }: DraggableProps) => {
    const [translateY, setTranslateY] = useState(0);
    const touchStartYRef = useRef<number | null>(null);
    const threshold = 150;

    const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
        touchStartYRef.current = e.touches[0].clientY;
    }, []);

    const handleTouchMove = useCallback(
        (e: TouchEvent<HTMLDivElement>) => {
            if (touchStartYRef.current === null) return;
            const currentY = e.touches[0].clientY;
            const deltaY = currentY - touchStartYRef.current;
            setTranslateY(deltaY);

            if (deltaY <= -threshold) {
                onDragged();
                touchStartYRef.current = null;
            }
        },
        [onDragged]
    );

    const handleTouchEnd = useCallback(() => {
        touchStartYRef.current = null;
        setTranslateY(0);
    }, []);

    return (
        <div
            className="flex flex-col gap-[16px] items-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
                transform: `translateY(${translateY}px)`,
                transition: translateY === 0 ? "transform 0.2s ease" : "none",
                opacity: isDragged ? "0" : "1",
            }}
        >
            <div className="flex flex-col items-center gap-[6px]">
                <ChevronUpIcon />

                <span className="font-p_regular text-[14px] text-c_black">
                    위로 올려서 순위표 보기
                </span>
            </div>

            <SquareAd />
        </div>
    );
};
