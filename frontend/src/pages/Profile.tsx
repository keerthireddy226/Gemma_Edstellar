import { useTranslation } from "react-i18next";
import { VoiceSection } from "@/components/VoiceSection";

export function Profile() {
  const { t } = useTranslation();
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="bg-surface border border-rule rounded-card p-6">
        <h2 className="font-display font-bold text-xl text-ink">{t("nav.profile")}</h2>
        <p className="text-sm text-muted mt-2">{t("comingSoon.profileBody")}</p>
      </div>

      <div className="bg-surface border border-rule rounded-card p-6">
        <VoiceSection />
      </div>
    </div>
  );
}
