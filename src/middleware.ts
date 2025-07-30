import { NextRequest, NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "./i18n/settings";

function getLocale(request: NextRequest) {
    const negotiatorHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
    const languages = new Negotiator({
        headers: negotiatorHeaders,
    }).languages();
    return match(languages, SUPPORTED_LOCALES, DEFAULT_LOCALE);
}

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const search = request.nextUrl.searchParams;

    // ads.txt, robots.txt 등은 리다이렉션 제외
    if (pathname === "/ads.txt") {
        return NextResponse.next();
    }

    // 이미 언어 경로가 있는지 확인
    const pathnameHasLocale = SUPPORTED_LOCALES.some(
        (locale) =>
            pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) return;

    // 사용자 기본 설정 언어 가져오기
    const locale = getLocale(request);

    // 언어별 경로로 리다이렉트
    const newUrl = new URL(
        `/${locale}${pathname}?${search.toString()}`,
        request.url
    );
    return NextResponse.redirect(newUrl);
}

export const config = {
    matcher: [
        // ads.txt, robots.txt 제외
        "/((?!api|_next/static|_next/image|favicon.ico|ads.txt|robots.txt).*)",
    ],
};
