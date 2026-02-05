import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import hu from "./locales/hu/common.json";
import en from "./locales/en/common.json";

const STORAGE_KEY = "nexora_lang";

const saved = localStorage.getItem(STORAGE_KEY);
const initialLng = saved === "hu" || saved === "en" ? saved : "hu";

i18n
    .use(initReactI18next)
    .init({
        resources: {
            hu: { common: hu },
            en: { common: en },
        },
        lng: initialLng,
        fallbackLng: "en",
        defaultNS: "common",
        ns: ["common"],
        interpolation: {
            escapeValue: false, // React miatt
        },
    });

export function setLanguage(lng: "hu" | "en") {
    localStorage.setItem(STORAGE_KEY, lng);
    i18n.changeLanguage(lng);
}

export default i18n;
