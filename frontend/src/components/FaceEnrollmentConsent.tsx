import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/Button";

// Separate from voice consent — face biometric data is a sensitive category (GDPR Art. 9/DPDP/BIPA).
export function FaceEnrollmentConsent({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(false);

  return (
    <div className="w-full max-w-lg mx-auto bg-surface border border-rule rounded-card shadow-sm p-8 flex flex-col gap-5">
      <div className="text-center">
        <h2 className="font-display font-bold text-xl text-ink">{t("faceCheck.enrollmentConsent.title")}</h2>
        <p className="text-sm text-muted mt-1.5">{t("faceCheck.enrollmentConsent.subtitle")}</p>
      </div>
      <p className="text-sm text-ink whitespace-pre-line">{t("faceCheck.enrollmentConsent.body")}</p>
      <label className="flex items-start gap-2.5 rounded-input border border-rule p-3.5 cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-0.5 accent-navy" />
        <span className="text-sm text-ink">{t("faceCheck.enrollmentConsent.checkboxLabel")}</span>
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onAccept} disabled={!checked}>
          {t("faceCheck.enrollmentConsent.submit")}
        </Button>
        <Button variant="secondary" onClick={onDecline}>
          {t("faceCheck.enrollmentConsent.decline")}
        </Button>
      </div>
    </div>
  );
}
