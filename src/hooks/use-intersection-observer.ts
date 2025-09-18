import { useEffect, useRef, useState } from "react";

interface UseIntersectionObserverProps {
    threshold?: number;
    rootMargin?: string;
}

export const useIntersectionObserver = ({
    threshold = 0.1,
    rootMargin = "50px",
}: UseIntersectionObserverProps = {}) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // 한 번 보이면 관찰 중단
                }
            },
            { threshold, rootMargin }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [threshold, rootMargin]);

    return { ref, isVisible };
};
