import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "@/locales/en/translation.json";
// import hi from "@/locales/hi/translation.json";
// import te from "@/locales/te/translation.json";
import es from "@/locales/es/translation.json";
import fr from "@/locales/fr/translation.json";

// Exam item content is never translated; this only ever covers UI chrome.
const resources = {
  en: { translation: en },
  // hi: { translation: hi },
  // te: { translation: te },
  es: { translation: es },
  fr: { translation: fr },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  })
  .then(() => {
    // Self-heals a stale cached language from an earlier session (e.g. a
    // language that's since been disabled, like hi/te above) — without this,
    // i18next silently falls back to English for the actual text, but
    // `i18n.language` itself keeps reporting the stale, no-longer-active
    // code, which throws off anything that compares against it (like the
    // switcher's "currently selected" highlight).
    if (!Object.keys(resources).includes(i18n.language)) {
      i18n.changeLanguage("en");
    }
  });

export default i18n;
