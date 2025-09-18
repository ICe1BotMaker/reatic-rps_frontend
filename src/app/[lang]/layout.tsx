import { Metadata } from "next";

import { FramerProvider } from "@/app/[lang]/provider";

import "@/styles/globals.css";
import "@/styles/fonts.css";

export const metadata: Metadata = {
    title: {
        template: "%s | 삼각게임",
        default: "삼각게임",
    },
    description: "게임을 통해 10만원을 쟁취하세요!",
    openGraph: {
        siteName: "삼각게임",
    },
    twitter: {
        title: "삼각게임",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
                />
                <meta
                    name="naver-site-verification"
                    content="a501d2c85e968ab7d03ecd30ef0dfe3a663e1f98"
                />
            </head>

            <body>
                <FramerProvider>{children}</FramerProvider>
            </body>
        </html>
    );
}
