"use client";

import { useRef, useCallback, useState, TouchEvent } from "react";

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
            className={`w-[320px] h-[320px] bg-gray-100 ${
                isDragged ? "opacity-0" : ""
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
                transform: `translateY(${translateY}px)`,
                transition: translateY === 0 ? "transform 0.2s ease" : "none",
            }}
        />
    );
};
