import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import ptBR from "./locales/pt-BR.json"
import enUS from "./locales/en-US.json"
import es from "./locales/es.json"

// Keep the document language in sync for assistive technologies.
i18n.on("languageChanged", (language) => {
    document.documentElement.lang = language
})

void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            "pt-BR": { translation: ptBR },
            "en-US": { translation: enUS },
            es: { translation: es },
        },
        fallbackLng: "pt-BR",
        supportedLngs: ["pt-BR", "en-US", "es"],
        detection: {
            order: ["localStorage"],
            lookupLocalStorage: "helpdesk.language",
            caches: ["localStorage"],
        },
        interpolation: {
            escapeValue: false,
        },
    })

export default i18n
