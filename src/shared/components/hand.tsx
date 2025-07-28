"use client";

import { useBar } from "../stores/bar.zustand";

export const Hand = ({ name }: { name: string }) => {
    const bar = useBar();

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={`/ko/images/${name}.gif`}
            alt="mainloop_compressed"
            style={{
                position: "absolute",
                bottom: bar.bottom,
            }}
        />
    );
};
