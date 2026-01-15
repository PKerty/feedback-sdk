import { translations } from "./translations";
import type { Locale, TranslationKey } from "./translations";

export function t(key: TranslationKey, locale = "en"): string {
    const loc = locale as Locale;
    if (!translations[loc]) {
        throw new Error(`Unsupported locale: ${locale}`);
    }
    const value = translations[loc][key];
    if (value === undefined) {
        throw new Error(`Missing translation for key "${key}" in locale "${locale}"`);
    }
    return value;
}
