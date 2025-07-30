import { FramerProvider } from "@/app/[lang]/provider";

import "@/shared/styles/globals.css";
import "@/shared/styles/fonts.css";

export const metadata = {
    title: "삼각게임",
    description: "samgakgame",
};

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
                    name="google-adsense-account"
                    content="ca-pub-8406696765705881"
                />
            </head>

            <body>
                <FramerProvider>{children}</FramerProvider>
            </body>
        </html>
    );
}
