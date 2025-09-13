import { FramerProvider } from "@/app/[lang]/provider";

import "@/shared/styles/globals.css";
import "@/shared/styles/fonts.css";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
                />
                <meta
                    name="naver-site-verification"
                    content="a501d2c85e968ab7d03ecd30ef0dfe3a663e1f98"
                />

                <title>삼각게임</title>
                <meta property="og:description" content="samgakgame" />
            </head>

            <body>
                <FramerProvider>{children}</FramerProvider>
            </body>
        </html>
    );
}
