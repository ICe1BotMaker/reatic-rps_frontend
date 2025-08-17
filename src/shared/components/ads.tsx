"use client";

interface AdSenseProps {
    style?: React.CSSProperties;
    className?: string;
}

export function AdSense({
    style = { display: "block" },
    className,
}: AdSenseProps) {
    return (
        <div
            style={style}
            className={`bg-c_primary_softlight ${className || ""}`}
        />
    );
}

export function BannerAd({ className }: { className?: string }) {
    return (
        <AdSense
            style={{ display: "block", width: "100%", height: "180px" }}
            className={className}
        />
    );
}

export function SquareAd({ className }: { className?: string }) {
    return (
        <AdSense
            style={{ display: "block", width: "320px", height: "320px" }}
            className={className}
        />
    );
}

export function ResponsiveAd({ className }: { className?: string }) {
    return <AdSense style={{ display: "block" }} className={className} />;
}
