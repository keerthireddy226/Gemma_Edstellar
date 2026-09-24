import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mic, Square, CheckCircle2, ArrowLeft } from "lucide-react";
import { useVoiceRecorder, blobToBase64 } from "@/hooks/useVoiceRecorder";
import { enrollVoice, verifyVoice, type VoiceCheckPurpose } from "@/api/voiceCheck";
import { Button } from "@/components/Button";

interface VoiceCheckProps {
  mode: "enroll" | "verify";
  purpose?: VoiceCheckPurpose;
  onComplete: (result: { voiceCheckId?: string }) => void;
  // Shows a "Back" link when provided; omitted where there's nowhere to go back to (e.g. placement's verify step).
  onBack?: () => void;
}

// onComplete only fires on a confirmed match; a mismatch blocks in place for re-recording (only a technical failure offers "Skip").
export function VoiceCheck({ mode, purpose, onComplete, onBack }: VoiceCheckProps) {
  const { t } = useTranslation();
  const { recording, start, stop } = useVoiceRecorder();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // A genuine mismatch/no-speech decision (vs. `error`, a technical failure) — blocks and asks for a re-record.
  const [verifyBlocked, setVerifyBlocked] = useState<string | null>(null);
  // True once verified, so a component kept mounted (e.g. beside the voice picker) shows a confirmation, not a stuck "Verifying...".
  const [verified, setVerified] = useState(false);
  // Holds the verify result until the learner taps "Proceed to test" — advancing stays a deliberate action.
  const [pendingVoiceCheckId, setPendingVoiceCheckId] = useState<string | undefined>(undefined);

  async function handleSubmit(blob: Blob, mimeType: string) {
    setSubmitting(true);
    setError(null);
    setVerifyBlocked(null);
    try {
      const audioBase64 = await blobToBase64(blob);
      if (mode === "enroll") {
        await enrollVoice(audioBase64, mimeType);
        onComplete({});
      } else {
        const result = await verifyVoice(purpose!, audioBase64, mimeType);
        if (!result.allowed) {
          setVerifyBlocked(
            result.decision === "error" ? t("voiceCheck.verify.noSpeechError") : t("voiceCheck.verify.mismatchError"),
          );
          setSubmitting(false);
          return;
        }
        setVerified(true);
        setSubmitting(false);
        setPendingVoiceCheckId(result.voiceCheckId);
      }
    } catch {
      setError(t("voiceCheck.record.error"));
      setSubmitting(false);
    }
  }

  async function handleToggleRecord() {
    if (recording) {
      const result = await stop();
      if (result.blob) await handleSubmit(result.blob, result.mimeType);
    } else {
      setError(null);
      setVerifyBlocked(null);
      await start();
    }
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-5 text-center">
      {onBack && (
        <button
          onClick={onBack}
          disabled={submitting}
          className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink transition-colors cursor-pointer self-start disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={16} strokeWidth={1.8} /> {t("voiceCheck.back")}
        </button>
      )}
      <div>
        <h2 className="font-display font-bold text-xl text-ink">
          {mode === "enroll" ? t("voiceCheck.enroll.title") : t("voiceCheck.verify.title")}
        </h2>
        {mode === "verify" && purpose && (
          <p className="text-sm text-muted mt-1.5">{t(`voiceCheck.verify.subtitle.${purpose}`)}</p>
        )}
        <p className="text-sm text-muted mt-1.5">{t("voiceCheck.record.instruction")}</p>
      </div>

      {verified ? (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 size={22} />
            <span className="text-sm font-semibold">{t("voiceCheck.verify.success")}</span>
          </div>
          <Button onClick={() => onComplete({ voiceCheckId: pendingVoiceCheckId })} className="w-full">
            {t("voiceCheck.verify.proceed")}
          </Button>
        </div>
      ) : (
        <>
          {/* Different phrase from enrollment's, so a recording of it can't trivially pass verification. */}
          <p className="w-full bg-paper-warm rounded-card border-l-4 border-navy p-4 text-lg font-semibold text-ink leading-snug">
            &ldquo;{t(mode === "enroll" ? "voiceCheck.record.phraseEnroll" : "voiceCheck.record.phraseVerify")}&rdquo;
          </p>

          <button
            onClick={handleToggleRecord}
            disabled={submitting}
            aria-label={recording ? t("voiceCheck.record.recording") : t("voiceCheck.record.start")}
            className={`h-16 w-16 rounded-full flex items-center justify-center shadow-[0_8px_18px_-8px_rgba(0,0,0,0.3)] transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed ${
              recording ? "bg-error text-white" : "bg-navy text-lime btn-shine"
            }`}
          >
            {recording ? <Square size={24} /> : <Mic size={26} />}
          </button>

          {recording ? (
            <div className="flex items-center gap-2.5">
              <span className="text-base font-bold text-error">{t("voiceCheck.record.recording")}</span>
              <span className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className="recording-dot h-2.5 w-2.5 rounded-full bg-error" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
            </div>
          ) : submitting ? (
            <span className="text-base font-bold text-navy-deep">
              {mode === "enroll" ? t("voiceCheck.record.saving") : t("voiceCheck.record.verifying")}
            </span>
          ) : (
            <span className="text-sm text-muted">{t("voiceCheck.record.start")}</span>
          )}

          {/* No skip here (unlike the technical-error case below) — this is the real gate, re-record until it matches. */}
          {verifyBlocked && <p className="text-sm text-error">{verifyBlocked}</p>}
        </>
      )}

      {error && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-error">{error}</p>
          <Button variant="secondary" onClick={() => onComplete({})} className="!border-2 !border-rule-strong">
            {t("voiceCheck.record.skip")}
          </Button>
        </div>
      )}
    </div>
  );
}
