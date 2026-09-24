import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/Button";

// A real, separately-worded consent for Voice Check — deliberately distinct
// from onboarding's existing "your voice will be recorded during practice
// and tests" consent, since this is a biometric identity use of voice data
// (confirming who is speaking), not a scoring use. Those have different,
// typically stricter, legal requirements (BIPA/GDPR Art. 9/India's DPDP Act
// all treat biometric identifiers as a sensitive category).
export function VoiceEnrollmentConsent({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(false);

  return (
    <div className="w-full max-w-lg mx-auto bg-surface border border-rule rounded-card shadow-sm p-8 flex flex-col gap-5">
      <div className="text-center">
        <h2 className="font-display font-bold text-xl text-ink">{t("voiceCheck.enrollmentConsent.title")}</h2>
        <p className="text-sm text-muted mt-1.5">{t("voiceCheck.enrollmentConsent.subtitle")}</p>
      </div>
      <p className="text-sm text-ink whitespace-pre-line">{t("voiceCheck.enrollmentConsent.body")}</p>
      <label className="flex items-start gap-2.5 rounded-input border border-rule p-3.5 cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-0.5 accent-navy" />
        <span className="text-sm text-ink">{t("voiceCheck.enrollmentConsent.checkboxLabel")}</span>
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onAccept} disabled={!checked}>
          {t("voiceCheck.enrollmentConsent.submit")}
        </Button>
        <Button variant="secondary" onClick={onDecline}>
          {t("voiceCheck.enrollmentConsent.decline")}
        </Button>
      </div>
    </div>
  );
}
