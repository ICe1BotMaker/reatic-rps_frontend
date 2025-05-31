import { usePathname } from "next/navigation";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "@/i18n/settings";

/**
 * 현재 URL에서 언어 코드를 추출하는 함수
 * @returns 현재 언어 코드 또는 기본 언어
 */
export function useCurrentLocale(): string {
    const pathname = usePathname();
    const locale = pathname?.split("/")[1] || "";

    return SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
}

/**
 * 현재 언어를 유지하면서 새 경로를 생성하는 함수
 * @param path 언어 코드를 제외한 경로 (예: '/login', '/dashboard')
 * @returns 현재 언어가 포함된 전체 경로 (예: '/ko/login', '/en/dashboard')
 */
export function useLocalizedPath() {
    const locale = useCurrentLocale();

    return (path: string) => {
        // 경로가 이미 '/'로 시작하는지 확인하고, 그렇지 않으면 추가
        const normalizedPath = path.startsWith("/") ? path : `/${path}`;
        return `/${locale}${normalizedPath}`;
    };
}
