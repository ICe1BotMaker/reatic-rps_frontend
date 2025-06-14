"use client";

import React from "react";
import { HandCharacter } from "./hand-character";
import { useIntersectionObserver } from "../hooks/use-intersection-observer";
import { Actions } from "../types/image";

interface LazyHandCharacterProps {
    action?: Actions;
    className?: string;
    width?: number;
    height?: number;
    onAnimationComplete?: () => void;
    style?: React.CSSProperties;
}

export const LazyHandCharacter: React.FC<LazyHandCharacterProps> = (props) => {
    const { ref, isVisible } = useIntersectionObserver();

    return (
        <div
            ref={ref}
            style={{ width: props.width, height: props.height, ...props.style }}
        >
            {isVisible ? (
                <HandCharacter {...props} />
            ) : (
                <div
                    className={`flex items-center justify-center ${props.className}`}
                    style={{ width: props.width, height: props.height }}
                >
                    <div className="text-white">Loading...</div>
                </div>
            )}
        </div>
    );
};
