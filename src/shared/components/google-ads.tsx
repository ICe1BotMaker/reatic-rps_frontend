"use client";

interface AdSenseProps {
    adSlot: string;
    adFormat?: string;
    fullWidthResponsive?: boolean;
    style?: React.CSSProperties;
    className?: string;
}

declare global {
    interface Window {
        adsbygoogle: object[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        googletag: any;
    }
}

export function AdSense({
    adSlot,
    adFormat = "auto",
    fullWidthResponsive = true,
    style = { display: "block" },
    className = "",
}: AdSenseProps) {
    return (
        <ins
            className={`adsbygoogle ${className}`}
            style={style}
            data-ad-client="ca-pub-8406696765705881"
            data-ad-slot={adSlot}
            data-ad-format={adFormat}
            data-full-width-responsive={fullWidthResponsive.toString()}
        ></ins>
    );
}

// 다양한 광고 타입별 컴포넌트
export function BannerAd({
    adSlot,
    className,
}: {
    adSlot: string;
    className?: string;
}) {
    return (
        <AdSense
            adSlot={adSlot}
            adFormat="horizontal"
            style={{ display: "block", width: "100%", height: "180px" }}
            className={className}
        />
    );
}

export function SquareAd({
    adSlot,
    className,
}: {
    adSlot: string;
    className?: string;
}) {
    return (
        <AdSense
            adSlot={adSlot}
            adFormat="rectangle"
            style={{ display: "block", width: "320px", height: "320px" }}
            className={className}
        />
    );
}

export function ResponsiveAd({
    adSlot,
    className,
}: {
    adSlot: string;
    className?: string;
}) {
    return (
        <AdSense
            adSlot={adSlot}
            adFormat="auto"
            style={{ display: "block" }}
            className={className}
        />
    );
}
