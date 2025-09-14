"use client";

import { useServeAds } from "@/features/ads/hooks";

interface AdSenseProps {
    adType: string;
    style?: React.CSSProperties;
    className?: string;
}

export function AdSense({
    adType,
    style = { display: "block" },
    className,
}: AdSenseProps) {
    const { data: served } = useServeAds({
        adType,
    });

    return (
        <div
            style={style}
            className={`bg-stone-100 flex justify-center items-center ${
                className || ""
            }`}
            onClick={() => window.open(served?.data.clickUrl, "_blank")}
        >
            {served?.data?.googleAds ? (
                <span className="font-p_medium text-[14px] text-white underline">
                    허가되지 않은 Google Ads 광고입니다.
                </span>
            ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={served?.data.adUrl}
                    alt="ads"
                    className="w-full h-full object-contain"
                />
            )}
        </div>
    );
}

export function BannerAds({ className }: { className?: string }) {
    return (
        <AdSense
            adType="banner"
            style={{ width: "100%", height: "180px" }}
            className={className}
        />
    );
}

export function SquareAds({ className }: { className?: string }) {
    return (
        <AdSense
            adType="square"
            style={{ width: "320px", height: "320px" }}
            className={className}
        />
    );
}

export function ResponsiveAds({ className }: { className?: string }) {
    return <AdSense adType="square" className={className} />;
}
