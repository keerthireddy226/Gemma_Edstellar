import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Camera, CheckCircle2, ArrowLeft } from "lucide-react";
import { useCamera } from "@/hooks/useCamera";
import {
  enrollFace,
  verifyFace,
  requestFaceFallback,
  getFaceFallbackStatus,
  consumeFaceFallback,
  type FaceCheckPurpose,
} from "@/api/faceCheck";
import { Button } from "@/components/Button";

interface FaceCheckProps {
  mode: "enroll" | "verify";
  purpose?: FaceCheckPurpose;
  onComplete: (result: { faceCheckId?: string }) => void;
  onBack?: () => void;
}

// onComplete fires on a confirmed match OR a consumed fallback approval.
// A mismatch blocks in place, offering retry then "Request Alternate Verification".
export function FaceCheck({ mode, purpose, onComplete, onBack }: FaceCheckProps) {
  const { t } = useTranslation();
  const { active, videoRef, start, stop, capture } = useCamera();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [pendingFaceCheckId, setPendingFaceCheckId] = useState<string | undefined>(undefined);
  const [failedResultId, setFailedResultId] = useState<string | null>(null);
  const [fallbackEligible, setFallbackEligible] = useState(false);
  const [fallbackRequestId, setFallbackRequestId] = useState<string | null>(null);
  const [fallbackStatus, setFallbackStatus] = useState<"pending" | "approved" | "denied" | "expired" | null>(null);

  useEffect(() => {
    start().catch(() => setError(t("faceCheck.record.cameraError")));
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polls while a fallback request is pending so the learner isn't stuck
  // staring at a static "waiting" screen with no way to know it resolved.
  useEffect(() => {
    if (!fallbackRequestId || fallbackStatus !== "pending") return;
    const interval = setInterval(async () => {
      const res = await getFaceFallbackStatus(fallbackRequestId).catch(() => null);
      if (!res) return;
      setFallbackStatus(res.status);
      if (res.status === "approved") {
        const consumed = await consumeFaceFallback(fallbackRequestId).catch(() => null);
        if (consumed?.consumed) onComplete({});
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [fallbackRequestId, fallbackStatus, onComplete]);

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
        setFailedResultId(result.retake ? null : result.faceCheckId);
        setFallbackEligible(Boolean(result.fallbackEligible));
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

  async function requestFallback() {
    if (!failedResultId || !purpose) return;
    setSubmitting(true);
    try {
      const result = await requestFaceFallback(purpose, failedResultId);
      setFallbackRequestId(result.fallbackRequestId);
      setFallbackStatus("pending");
    } catch {
      setError(t("faceCheck.record.error"));
    } finally {
      setSubmitting(false);
    }
  }

  if (fallbackStatus) {
    return (
      <div className="app-surface min-h-screen flex items-center justify-center px-4">
        <div className="bg-surface border border-rule rounded-card p-6 max-w-sm w-full flex flex-col items-center gap-4 text-center">
          <h2 className="font-display font-bold text-xl text-ink">{t("faceCheck.fallback.title")}</h2>
          <p className="text-sm text-muted">
            {fallbackStatus === "pending" && t("faceCheck.fallback.pending")}
            {fallbackStatus === "denied" && t("faceCheck.fallback.denied")}
            {fallbackStatus === "expired" && t("faceCheck.fallback.expired")}
          </p>
          {fallbackStatus !== "pending" && onBack && (
            <Button variant="secondary" onClick={onBack}>
              {t("faceCheck.back")}
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="app-surface min-h-screen flex items-center justify-center px-4">
        <div className="bg-surface border border-rule rounded-card p-6 max-w-sm w-full flex flex-col items-center gap-4 text-center">
          <CheckCircle2 size={40} className="text-success" />
          <p className="font-semibold text-ink">{mode === "enroll" ? t("faceCheck.enroll.success") : t("faceCheck.verify.success")}</p>
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
            {fallbackEligible && (
              <Button variant="secondary" onClick={requestFallback} disabled={submitting}>
                {t("faceCheck.fallback.request")}
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
