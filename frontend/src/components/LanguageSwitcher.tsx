import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "te", label: "తెలుగు" },
] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="flex gap-3 justify-center text-xs text-muted">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => i18n.changeLanguage(code)}
          className={i18n.language === code ? "text-ink font-medium underline" : "hover:text-ink underline"}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
