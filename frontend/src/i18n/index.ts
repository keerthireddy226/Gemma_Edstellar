import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "@/locales/en/translation.json";

// Language files beyond `en` are auto-generated later, once there's more UI to
// translate — see the project notes on translation timing. Exam item content
// is never translated; this only ever covers UI chrome.
const resources = { en: { translation: en } };

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
