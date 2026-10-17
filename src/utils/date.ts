import i18n from "../i18n"

export function formatDateTime(value: string, locale = i18n.resolvedLanguage ?? "pt-BR"): string {
    return new Intl.DateTimeFormat(locale, {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value))
}
