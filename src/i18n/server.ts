// i18n/server.ts
import { initReactI18next } from "react-i18next/initReactI18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { createInstance } from "i18next";

import { SUPPORTED_LOCALES } from "./settings";

export async function createTranslation(lang: string, namespace = "common") {
    const i18nInstance = createInstance();
    await i18nInstance
        .use(initReactI18next)
        .use(
            resourcesToBackend(
                (language: string, ns: string) =>
                    import(`../locales/${language}/${ns}.json`)
            )
        )
        .init({
            lng: lang,
            fallbackLng: "ko",
            supportedLngs: SUPPORTED_LOCALES,
            defaultNS: "common",
            fallbackNS: "common",
        });

    return {
        t: i18nInstance.getFixedT(lang, namespace),
        i18n: i18nInstance,
    };
}
