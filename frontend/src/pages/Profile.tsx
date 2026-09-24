import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";
import { VoiceSection } from "@/components/VoiceSection";
import { Button } from "@/components/Button";
import { getVoiceEnrollmentStatus } from "@/hooks/useVoiceCheck";
import { ROUTES } from "@/constants/routes";

function IdentityCheckSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [enrolled, setEnrolled] = useState<boolean | null>(null);

  useEffect(() => {
    getVoiceEnrollmentStatus()
      .then((res) => setEnrolled(res.enrolled))
      .catch(() => setEnrolled(false));
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-mono text-[11px] font-medium tracking-[.24em] uppercase text-muted">{t("profile.identityCheck.title")}</h3>
      <p className="text-sm text-muted -mt-1">{t("profile.identityCheck.subtitle")}</p>
      <div className="flex items-center gap-3 rounded-card border border-rule px-4 py-3.5">
        <span
          className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
            enrolled ? "bg-success/15 text-success" : "bg-paper-warm text-muted"
          }`}
        >
          <ShieldCheck size={18} strokeWidth={1.8} />
        </span>
        <span className="flex-1 min-w-0 text-sm font-semibold text-ink">
          {enrolled === null ? t("profile.identityCheck.loading") : enrolled ? t("profile.identityCheck.enrolled") : t("profile.identityCheck.notEnrolled")}
        </span>
        <Button variant="secondary" onClick={() => navigate(ROUTES.VOICE_ENROLLMENT, { state: { next: ROUTES.PROFILE } })}>
          {enrolled ? t("profile.identityCheck.reenroll") : t("profile.identityCheck.enroll")}
        </Button>
      </div>
    </div>
  );
}

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

      <div className="bg-surface border border-rule rounded-card p-6">
        <IdentityCheckSection />
      </div>
    </div>
  );
}
