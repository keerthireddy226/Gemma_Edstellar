import { useTranslation } from "react-i18next";

export function Tutor() {
  const { t } = useTranslation();
  return (
    <div className="max-w-2xl mx-auto bg-surface border border-rule rounded-card p-6">
      <h2 className="font-display font-bold text-xl text-ink">{t("nav.tutor")}</h2>
      <p className="text-sm text-muted mt-2">{t("comingSoon.tutorBody")}</p>
    </div>
  );
}
