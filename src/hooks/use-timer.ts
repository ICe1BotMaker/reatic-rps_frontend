import { useEffect, useState } from "react";

export const useTimer = (time: number, delay: number = 1000) => {
    const [currentTime, setCurrentTime] = useState(time);
    const [isStoped, setIsStoped] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime((prev) => {
                if (prev === 1) {
                    setIsStoped(true);
                    clearInterval(interval);
                    return 0;
                }

                return prev - 1;
            });
        }, delay);

        return () => {
            clearInterval(interval);
        };
    }, [delay]);

    return {
        currentTime,
        setCurrentTime,
        time,
        isStoped,
    };
};
