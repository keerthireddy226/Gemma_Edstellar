import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Camera, CheckCircle2, ArrowLeft } from "lucide-react";
import { useCamera } from "@/hooks/useCamera";
import { enrollFace, verifyFace, type FaceCheckPurpose } from "@/api/faceCheck";
import { getPasskeyStatus, verifyPasskeyFallback } from "@/api/passkey";
import { Button } from "@/components/Button";

interface FaceCheckProps {
  mode: "enroll" | "verify";
  purpose?: FaceCheckPurpose;
  onComplete: (result: { faceCheckId?: string }) => void;
  onBack?: () => void;
}

// onComplete fires on a match or a passkey pass. No other fallback — passkey is the only path past a failed check.
export function FaceCheck({ mode, purpose, onComplete, onBack }: FaceCheckProps) {
  const { t } = useTranslation();
  const { active, videoRef, start, stop, capture } = useCamera();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [verifiedViaPasskey, setVerifiedViaPasskey] = useState(false);
  const [pendingFaceCheckId, setPendingFaceCheckId] = useState<string | undefined>(undefined);
  const [failedResultId, setFailedResultId] = useState<string | null>(null);
  const [fallbackEligible, setFallbackEligible] = useState(false);
  const [hasPasskey, setHasPasskey] = useState(false);
  const [confirmingPasskey, setConfirmingPasskey] = useState(false);

  useEffect(() => {
    start().catch(() => setError(t("faceCheck.record.cameraError")));
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stops the camera the instant verification succeeds — not just on unmount,
  // which otherwise leaves it running through the whole success screen.
  useEffect(() => {
    if (verified) stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verified]);

  async function submitVerify() {
    const imageBase64 = capture();
    if (!imageBase64) {
      setError(t("faceCheck.record.error"));
      return;
    }
    setSubmitting(true);
    setError(null);
    setBlocked(null);
    try {
      const result = await verifyFace(purpose!, imageBase64);
      if (!result.allowed) {
        setBlocked(result.reason ?? t("faceCheck.verify.mismatchError"));
        setFailedResultId(result.fallbackEligible ? result.faceCheckId : null);
        setFallbackEligible(Boolean(result.fallbackEligible));
        if (result.fallbackEligible) getPasskeyStatus().then((r) => setHasPasskey(r.registered)).catch(() => setHasPasskey(false));
        setSubmitting(false);
        return;
      }
      setVerified(true);
      setSubmitting(false);
      setPendingFaceCheckId(result.faceCheckId);
    } catch {
      setError(t("faceCheck.record.error"));
      setSubmitting(false);
    }
  }

  async function submitEnrollment() {
    const imageBase64 = capture();
    if (!imageBase64) {
      setError(t("faceCheck.record.error"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await enrollFace(imageBase64);
      if (result.status !== "enrolled") {
        setBlocked(result.reasons?.[0] ?? t("faceCheck.record.tooShort"));
        setSubmitting(false);
        return;
      }
      setVerified(true);
      setSubmitting(false);
    } catch {
      setError(t("faceCheck.record.error"));
      setSubmitting(false);
    }
  }

  async function verifyWithPasskey() {
    if (!failedResultId) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await verifyPasskeyFallback(failedResultId);
      if (result.allowed) {
        setVerified(true);
        setVerifiedViaPasskey(true);
        setPendingFaceCheckId(result.faceCheckId);
      }
    } catch {
      setError(t("faceCheck.record.error"));
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmingPasskey) {
    return (
      <div className="app-surface min-h-screen flex items-center justify-center px-4">
        <div className="bg-surface border border-rule rounded-card p-6 max-w-sm w-full flex flex-col items-center gap-4 text-center">
          <h2 className="font-display font-bold text-xl text-ink">{t("faceCheck.fallback.confirmTitle")}</h2>
          <p className="text-sm text-muted -mt-2">{t("faceCheck.fallback.confirmSubtitle")}</p>
          <div className="flex gap-3 w-full">
            <Button variant="secondary" onClick={() => setConfirmingPasskey(false)} disabled={submitting} className="flex-1">
              {t("faceCheck.back")}
            </Button>
            <Button
              onClick={() => {
                setConfirmingPasskey(false);
                verifyWithPasskey();
              }}
              disabled={submitting}
              className="flex-1"
            >
              {t("faceCheck.fallback.confirmContinue")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="app-surface min-h-screen flex items-center justify-center px-4">
        <div className="bg-surface border border-rule rounded-card p-6 max-w-sm w-full flex flex-col items-center gap-4 text-center">
          <CheckCircle2 size={40} className="text-success" />
          <p className="font-semibold text-ink">
            {mode === "enroll" ? t("faceCheck.enroll.success") : verifiedViaPasskey ? t("faceCheck.fallback.passkeySuccess") : t("faceCheck.verify.success")}
          </p>
          <p className="text-sm text-muted -mt-2">
            {mode === "enroll" ? t("faceCheck.enroll.successSubtitle") : t("faceCheck.verify.successSubtitle")}
          </p>
          <Button onClick={() => onComplete({ faceCheckId: pendingFaceCheckId })}>
            {mode === "enroll" ? t("faceCheck.enroll.proceed") : t("faceCheck.verify.proceed")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-surface min-h-screen flex items-center justify-center px-4">
      <div className="bg-surface border border-rule rounded-card p-6 max-w-sm w-full flex flex-col items-center gap-4 text-center">
        {onBack && (
          <button onClick={onBack} className="self-start flex items-center gap-1 text-sm text-muted hover:text-ink cursor-pointer">
            <ArrowLeft size={16} /> {t("faceCheck.back")}
          </button>
        )}
        <h2 className="font-display font-bold text-xl text-ink">
          {mode === "enroll" ? t("faceCheck.enroll.title") : t("faceCheck.verify.title")}
        </h2>
        <p className="text-sm text-muted -mt-2">
          {mode === "enroll" ? t("faceCheck.enroll.subtitle") : t(`faceCheck.verify.subtitle.${purpose ?? "placement"}`)}
        </p>
        <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-card bg-ink aspect-[4/3] object-cover" />
        {error && <p className="text-sm text-error">{error}</p>}
        {blocked && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-error">{blocked}</p>
            {fallbackEligible && hasPasskey && (
              <Button variant="secondary" onClick={() => setConfirmingPasskey(true)} disabled={submitting}>
                {t("faceCheck.fallback.passkey")}
              </Button>
            )}
          </div>
        )}
        <Button onClick={mode === "enroll" ? submitEnrollment : submitVerify} disabled={!active || submitting}>
          <Camera size={16} className="inline mr-1.5" />
          {submitting ? t("faceCheck.record.checking") : t("faceCheck.record.capture")}
        </Button>
      </div>
    </div>
  );
}
