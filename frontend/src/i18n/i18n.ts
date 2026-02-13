//src/i18n/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import huCommon from "./locales/hu/common.json";
import enCommon from "./locales/en/common.json";

import huError from "./locales/hu/error.json";
import enError from "./locales/en/error.json";

import huUser from "./locales/hu/user.json";
import enUser from "./locales/en/user.json";

import huClan from "./locales/hu/clan.json";
import enClan from "./locales/en/clan.json";

const STORAGE_KEY = "nexora_lang";

const saved = localStorage.getItem(STORAGE_KEY);
const initialLng = saved === "hu" || saved === "en" ? saved : "hu";

i18n.use(initReactI18next).init({
    resources: {
        hu: { common: huCommon, error: huError, user:huUser, clan:huClan },
        en: { common: enCommon, error: enError, user:enUser, clan:enClan },
    },
    lng: initialLng,
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common", "error", "user"],
    interpolation: {
        escapeValue: false,
    },
});

export function setLanguage(lng: "hu" | "en") {
    localStorage.setItem(STORAGE_KEY, lng);
    i18n.changeLanguage(lng);
}

export default i18n;
