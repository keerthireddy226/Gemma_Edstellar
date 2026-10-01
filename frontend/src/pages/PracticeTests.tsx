import { useTranslation } from "react-i18next";
import { ClipboardCheck, Lock } from "lucide-react";

// Reuses onboarding's exam-preference list/copy. No backend content yet — every card is a disabled preview.
const EXAMS = ["versant", "ielts", "toefl", "pte", "cambridge", "other"] as const;

export function PracticeTests() {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="h-12 w-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
          <ClipboardCheck size={22} strokeWidth={2} />
        </span>
        <div>
          <h1 className="font-display font-bold text-xl text-ink">{t("nav.practiceTests")}</h1>
          <p className="text-xs text-muted">{t("practiceTests.subtitle")}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {EXAMS.map((exam) => (
          <div key={exam} className="relative bg-surface border border-rule rounded-card p-4 flex flex-col gap-2.5">
            <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wide text-muted bg-paper-warm px-2 py-0.5 rounded-pill">
              {t("practiceTests.comingSoon")}
            </span>
            <span className="h-10 w-10 rounded-2xl bg-paper flex items-center justify-center text-muted">
              <Lock size={16} strokeWidth={2} />
            </span>
            <span className="font-display font-semibold text-sm text-ink">{t(`onboarding.wizard.examGoal.exam.${exam}`)}</span>
            <span className="text-xs text-muted">{t(`onboarding.wizard.examGoal.exam.${exam}Desc`)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
