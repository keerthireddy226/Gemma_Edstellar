import { useTranslation } from "react-i18next";
import { Mic } from "lucide-react";
import { Mascot } from "@/components/Mascot";

// Preview only — there's a real `coach_turns` table already in the schema
// (session_id, turn_index, speaker learner|agent, audio_uri, transcript),
// but no backend route reads or writes it yet. These sample turns just
// show what a real conversation will look like; the input row is disabled
// rather than pretending to be a working chat.
export function Tutor() {
  const { t } = useTranslation();
  const sampleTurns: { speaker: "agent" | "learner"; text: string }[] = [
    { speaker: "agent", text: t("tutor.sampleAgent1") },
    { speaker: "learner", text: t("tutor.sampleLearner1") },
    { speaker: "agent", text: t("tutor.sampleAgent2") },
  ];

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Mascot variant="coach" size={56} />
        <div>
          <h1 className="font-display font-bold text-xl text-ink">{t("nav.tutor")}</h1>
          <p className="text-xs text-muted">{t("tutor.subtitle")}</p>
        </div>
      </div>

      <div className="bg-surface border border-rule rounded-card p-4 flex flex-col gap-3 min-h-[280px]">
        {sampleTurns.map((turn, i) => (
          <div key={i} className={`flex ${turn.speaker === "learner" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-card px-4 py-2.5 text-sm leading-relaxed ${
                turn.speaker === "learner" ? "bg-accent/15 text-ink" : "bg-paper-warm text-ink"
              }`}
            >
              {turn.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 bg-surface border border-rule rounded-card px-4 py-3 opacity-60">
        <input
          disabled
          placeholder={t("tutor.inputPlaceholder")}
          className="flex-1 bg-transparent text-sm text-muted focus:outline-none disabled:cursor-not-allowed"
        />
        <button disabled className="h-9 w-9 rounded-full bg-navy text-lime flex items-center justify-center shrink-0 disabled:cursor-not-allowed">
          <Mic size={16} strokeWidth={2} />
        </button>
      </div>
      <p className="text-xs text-muted text-center">{t("tutor.comingSoon")}</p>
    </div>
  );
}
