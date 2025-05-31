"use client";

import {
    initReactI18next,
    useTranslation as useTranslationOrg,
} from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { usePathname } from "next/navigation";
import i18next from "i18next";

import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "./settings";

// 클라이언트 측 i18n 초기화
i18next
    .use(initReactI18next)
    .use(
        resourcesToBackend(
            (language: string, namespace: string) =>
                import(`../locales/${language}/${namespace}.json`)
        )
    )
    .init({
        lng: DEFAULT_LOCALE,
        fallbackLng: DEFAULT_LOCALE,
        supportedLngs: SUPPORTED_LOCALES,
        defaultNS: "common",
        fallbackNS: "common",
        react: {
            useSuspense: false,
        },
    });

export function useClientTranslation(namespace: string | string[] = "common") {
    const pathname = usePathname();
    const locale = pathname?.split("/")[1] || DEFAULT_LOCALE;

    // 경로에서 감지된 언어로 i18next 설정 변경
    if (SUPPORTED_LOCALES.includes(locale) && i18next.language !== locale) {
        i18next.changeLanguage(locale);
    }

    return useTranslationOrg(namespace);
}
