import { createTranslation } from "./server";
import { i18n, TFunction } from "i18next";

interface TranslationResult {
    t: TFunction;
    i18n: i18n;
}

export async function useTranslation(
    lang: string,
    namespace: string = "common"
): Promise<TranslationResult> {
    const { t, i18n } = await createTranslation(lang, namespace);
    return { t, i18n };
}

export { useClientTranslation } from "./client";
