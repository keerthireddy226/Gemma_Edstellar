import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Volume2, Mic, Square, CheckCircle2, ArrowLeft, Clock, Headphones, BookOpen, PenLine } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/Button";
import {
  getAvailability,
  startPracticeSession,
  submitPracticeAttempt,
  completePracticeSession,
  type PracticeSummary,
  type SkillAvailability,
} from "@/hooks/usePracticeSession";
import type { TestItem, SkillTag } from "@/hooks/useTestSession";
import { useVoiceRecorder, blobToBase64, speak } from "@/hooks/useVoiceRecorder";
import {
  AUDIO_FIRST_TYPES,
  SKILL_BADGE_CLASS,
  ITEM_TYPE_META,
  getSpokenSegments,
  getVisibleText,
  getOptions,
  getPassageAndQuestion,
} from "@/lib/testItemDisplay";

const SKILL_ICONS: Record<SkillTag, typeof Headphones> = {
  listening: Headphones,
  speaking: Mic,
  reading: BookOpen,
  writing: PenLine,
};

interface CachedAnswer {
  responseText: string;
  audioBase64?: string;
  audioMimeType?: string;
  audioBlobUrl?: string;
  durationMs?: number;
}

function SkillPicker({
  availability,
  loading,
  starting,
  onStart,
}: {
  availability: SkillAvailability[] | null;
  loading: boolean;
  starting: boolean;
  onStart: (skill: SkillTag) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">{t("modules.title")}</h1>
        <p className="text-sm text-muted mt-1">{t("modules.subtitle")}</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted">{t("modules.loadingAvailability")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {(availability ?? []).map(({ skill, remaining, total }) => {
            const Icon = SKILL_ICONS[skill];
            const exhausted = remaining === 0;
            return (
              <div key={skill} className="flex items-center gap-3 bg-surface border border-rule rounded-card px-4 py-3.5">
                <span className="h-10 w-10 rounded-input bg-paper flex items-center justify-center shrink-0">
                  <Icon size={22} strokeWidth={1.8} className="text-navy-deep" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-ink">{t(`skills.${skill}`)}</div>
                  <div className="text-xs text-muted">
                    {exhausted ? t("modules.allDone") : t("modules.remainingItems", { count: remaining, total })}
                  </div>
                </div>
                <Button onClick={() => onStart(skill)} disabled={starting || exhausted} className="shrink-0">
                  {t("modules.start")}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Modules() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { recording, start: startRecording, stop: stopRecording } = useVoiceRecorder();

  const [availability, setAvailability] = useState<SkillAvailability[] | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [items, setItems] = useState<TestItem[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, CachedAnswer>>({});
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [hasPlayed, setHasPlayed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pendingAudio, setPendingAudio] = useState<{ base64: string; mimeType: string } | null>(null);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [recordingDurationMs, setRecordingDurationMs] = useState<number | null>(null);
  const [summary, setSummary] = useState<PracticeSummary | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  // "two-phase" items (Passage Reconstruction): show the passage, then hide
  // it and switch to a blank textarea — testing recall, not copying.
  const [twoPhaseStage, setTwoPhaseStage] = useState<"idle" | "reading" | "writing">("idle");

  useEffect(() => {
    getAvailability()
      .then((res) => setAvailability(res.availability))
      .catch(() => setAvailability(null))
      .finally(() => setLoadingAvailability(false));
  }, []);

  async function handleStart(skill: SkillTag, count?: number, itemTypeId?: string) {
    setStarting(true);
    setError(null);
    try {
      const res = await startPracticeSession(skill, count, itemTypeId);
      setSessionId(res.sessionId);
      setItems(res.items);
      setIndex(0);
      setAnswers({});
      setSummary(null);
    } catch {
      setError(t("modules.startError"));
    } finally {
      setStarting(false);
    }
  }

  // Arriving from the Dashboard's "Start Practice" button passes ?skill= (and
  // optionally ?count=); arriving from a "Today's Tasks" row also passes
  // ?type= to practice just that one exercise type — auto-start instead of
  // showing the picker.
  //
  // Guarded with a ref (not just the empty dep array) because StrictMode's
  // dev-mode double-invoke otherwise fires this twice back to back — two
  // concurrent POST /practice/session calls race before the first one's
  // session row commits, so the second one's "resume in-progress session"
  // check misses it and a duplicate session gets created instead of resumed.
  const autoStarted = useRef(false);
  useEffect(() => {
    if (autoStarted.current) return;
    const skill = searchParams.get("skill");
    const count = searchParams.get("count");
    const itemTypeId = searchParams.get("type");
    if (skill === "listening" || skill === "speaking" || skill === "reading" || skill === "writing") {
      autoStarted.current = true;
      handleStart(skill, count ? Number(count) : undefined, itemTypeId ?? undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = items[index];
  const needsAudioFirst = current ? AUDIO_FIRST_TYPES.has(current.itemTypeId) : false;
  const visibleText = current && !needsAudioFirst ? getVisibleText(current) : "";
  const meta = current ? ITEM_TYPE_META[current.itemTypeId] : undefined;

  useEffect(() => {
    const cached = answersRef.current[index];
    setAnswerText(cached?.responseText ?? "");
    setPendingAudio(cached?.audioBase64 ? { base64: cached.audioBase64, mimeType: cached.audioMimeType ?? "" } : null);
    setAudioBlobUrl(cached?.audioBlobUrl ?? null);
    setRecordingDurationMs(cached?.durationMs ?? null);
    setHasPlayed(!!cached);
    setTwoPhaseStage(cached ? "writing" : "idle");
    setError(null);
  }, [index]);

  // Live countdown, display-only (mirrors PlacementTest.tsx) — doesn't gate
  // or auto-submit anything.
  useEffect(() => {
    if (!current?.timerSeconds) {
      setRemainingSeconds(null);
      return;
    }
    setRemainingSeconds(current.timerSeconds);
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => (prev === null ? null : Math.max(0, prev - 1)));
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, current?.timerSeconds]);

  function handleStartReading() {
    if (!current) return;
    setTwoPhaseStage("reading");
    const readSeconds = current.twoPhaseReadSeconds ?? 30;
    setTimeout(() => setTwoPhaseStage("writing"), readSeconds * 1000);
  }

  async function handlePlay() {
    if (!current) return;
    setPlaying(true);
    await speak(getSpokenSegments(current));
    setPlaying(false);
    setHasPlayed(true);
  }

  async function handleToggleRecord() {
    setError(null);
    if (!recording) {
      try {
        await startRecording();
      } catch {
        setError(t("placementTest.micError"));
      }
      return;
    }
    const { blob, mimeType, transcript, durationMs } = await stopRecording();
    if (transcript) setAnswerText(transcript);
    if (blob) {
      const base64 = await blobToBase64(blob);
      setPendingAudio({ base64, mimeType });
      setAudioBlobUrl(URL.createObjectURL(blob));
      setRecordingDurationMs(durationMs);
    }
  }

  function cacheCurrentAnswer() {
    setAnswers((prev) => ({
      ...prev,
      [index]: {
        responseText: answerText,
        audioBase64: pendingAudio?.base64,
        audioMimeType: pendingAudio?.mimeType,
        audioBlobUrl: audioBlobUrl ?? undefined,
        durationMs: recordingDurationMs ?? undefined,
      },
    }));
  }

  async function finishOrAdvance() {
    if (index + 1 < items.length) {
      setIndex(index + 1);
    } else if (sessionId) {
      const result = await completePracticeSession(sessionId);
      setSummary(result);
      getAvailability()
        .then((res) => setAvailability(res.availability))
        .catch(() => {});
    }
  }

  async function handleSubmit() {
    if (!current || !sessionId) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitPracticeAttempt(sessionId, {
        itemId: current.id,
        responseText: answerText.trim() || undefined,
        audioBase64: pendingAudio?.base64,
        audioMimeType: pendingAudio?.mimeType,
        durationMs: recordingDurationMs ?? undefined,
      });
      cacheCurrentAnswer();
      await finishOrAdvance();
    } catch {
      setError(t("placementTest.submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSkip() {
    if (!current || !sessionId) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitPracticeAttempt(sessionId, { itemId: current.id });
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
      await finishOrAdvance();
    } catch {
      setError(t("placementTest.submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    if (index === 0) return;
    cacheCurrentAnswer();
    setIndex(index - 1);
  }

  function resetToPicker() {
    setSessionId(null);
    setItems([]);
    setSummary(null);
  }

  // No active or just-finished session — show the skill picker.
  if (!sessionId && !starting) {
    return (
      <SkillPicker availability={availability} loading={loadingAvailability} starting={starting} onStart={(skill) => handleStart(skill)} />
    );
  }

  if (starting && !sessionId) {
    return <p className="text-sm text-muted">{t("modules.starting")}</p>;
  }

  if (summary) {
    return (
      <div className="max-w-lg mx-auto bg-surface border border-rule rounded-card shadow-sm p-8 flex flex-col gap-5 items-center text-center">
        <div className="h-14 w-14 rounded-full bg-navy text-lime flex items-center justify-center">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="font-display font-bold text-2xl text-ink">{t("modules.sessionComplete")}</h1>
        <p className="text-sm text-muted">
          {t("placementTest.resultsSummary", {
            correct: summary.correctCount,
            graded: summary.gradedCount,
            pending: summary.pendingCount,
          })}
        </p>
        {summary.failedCount > 0 && (
          <p className="text-sm text-error">{t("placementTest.failedNote", { failed: summary.failedCount })}</p>
        )}
        <div className="flex items-center gap-3 w-full">
          <Button variant="secondary" onClick={resetToPicker} className="flex-1">
            {t("modules.practiceAgain")}
          </Button>
          <Button onClick={() => navigate(ROUTES.DASHBOARD)} className="flex-1">
            {t("modules.backToDashboard")}
          </Button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  // A mic answer is submittable once there's a saved recording, whether or
  // not live transcription produced any text — an empty transcript falls
  // through to pending/manual review server-side, rather than blocking
  // submission entirely.
  const canSubmit = current.inputMethod === "mic" ? !recording && !!audioBlobUrl : answerText.trim() !== "";
  const progressPct = Math.round((index / items.length) * 100);

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-3">
      <div className="flex items-center justify-end px-1">
        <span className="text-xs font-mono text-muted">
          {t("placementTest.progress", { current: index + 1, total: items.length })}
        </span>
      </div>

      <div className="relative w-full bg-surface border border-rule rounded-card shadow-sm overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: `var(--color-${(meta?.skills ?? current.skills)[0]})` }}
        />
        <div className="p-8 flex flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wide text-ink font-semibold">{meta?.name}</span>
              {remainingSeconds !== null ? (
                <span
                  className={`flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-pill border transition-colors ${
                    remainingSeconds <= 5 ? "text-error border-error/30 bg-error/10" : "text-navy-deep border-navy/20 bg-navy/10"
                  }`}
                >
                  <Clock size={16} />
                  {String(Math.floor(remainingSeconds / 60)).padStart(1, "0")}:{String(remainingSeconds % 60).padStart(2, "0")}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-1.5">
              {(meta?.skills ?? current.skills).map((skill) => (
                <span
                  key={skill}
                  className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-pill border ${SKILL_BADGE_CLASS[skill]}`}
                >
                  {t(`skills.${skill}`)}
                </span>
              ))}
            </div>
            <div className="h-2 rounded-pill bg-paper-warm overflow-hidden">
              <div className="h-full bg-navy rounded-pill transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <h2 className="font-display font-bold text-lg text-ink text-center leading-snug">{current.questionInstruction}</h2>

      {current.inputMethod === "two-phase" ? (
        twoPhaseStage === "idle" ? (
          <div className="flex justify-center">
            <Button variant="secondary" onClick={handleStartReading}>
              {t("modules.startReading")}
            </Button>
          </div>
        ) : twoPhaseStage === "reading" ? (
          <p
            className="text-sm text-ink bg-paper-warm rounded-card border-l-4 p-4 leading-relaxed shadow-sm"
            style={{ borderLeftColor: `var(--color-${(meta?.skills ?? current.skills)[0]})` }}
          >
            {getVisibleText(current)}
          </p>
        ) : (
          <p className="text-sm text-muted italic text-center">{t("modules.passageHidden")}</p>
        )
      ) : needsAudioFirst ? (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handlePlay}
            disabled={playing || recording}
            className="h-14 w-14 rounded-full bg-navy text-lime btn-shine flex items-center justify-center shadow-[0_8px_18px_-8px_rgba(0,0,0,0.3)] transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed"
          >
            <Volume2 size={22} />
          </button>
          <span className="text-xs text-muted">
            {playing ? t("placementTest.playing") : hasPlayed ? t("placementTest.playAgain") : t("placementTest.play")}
          </span>
        </div>
      ) : getPassageAndQuestion(current) ? (
        <div className="flex flex-col gap-2.5">
          <p
            className="text-sm text-ink bg-paper-warm rounded-card border-l-4 p-4 whitespace-pre-wrap leading-relaxed shadow-sm"
            style={{ borderLeftColor: `var(--color-${(meta?.skills ?? current.skills)[0]})` }}
          >
            {getPassageAndQuestion(current)!.passage}
          </p>
          <p className="text-sm font-semibold text-ink px-1">{getPassageAndQuestion(current)!.question}</p>
        </div>
      ) : (
        <p
          className="text-sm text-ink bg-paper-warm rounded-card border-l-4 p-4 leading-relaxed shadow-sm"
          style={{ borderLeftColor: `var(--color-${(meta?.skills ?? current.skills)[0]})` }}
        >
          {visibleText}
        </p>
      )}

      {current.inputMethod === "radio" ? (
        <div className="flex flex-col gap-2.5">
          {getOptions(current).map((option, i) => {
            const letter = String.fromCharCode(65 + i);
            const selected = answerText === String(i);
            return (
              <button
                key={i}
                onClick={() => setAnswerText(String(i))}
                className={`flex items-center gap-3 text-left rounded-card border-2 px-4 py-3 text-sm font-medium transition-all cursor-pointer ${
                  selected ? "border-accent bg-accent/10 text-ink shadow-sm" : "border-rule hover:border-rule-strong hover:bg-paper-warm/60"
                }`}
              >
                <span
                  className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                    selected ? "bg-accent text-white" : "bg-paper-warm text-muted"
                  }`}
                >
                  {letter}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      ) : current.inputMethod === "two-phase" ? (
        twoPhaseStage === "writing" && (
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder={t("placementTest.answerPlaceholder")}
            className="w-full rounded-card border border-rule bg-surface px-4 py-3 text-sm text-ink shadow-sm focus:border-navy focus:outline-none transition-colors"
            rows={4}
          />
        )
      ) : current.inputMethod === "mic" ? (
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleToggleRecord}
            disabled={playing || (needsAudioFirst && !hasPlayed)}
            className={`h-14 w-14 rounded-full flex items-center justify-center shadow-[0_8px_18px_-8px_rgba(0,0,0,0.3)] transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed ${
              recording ? "bg-error text-white" : "bg-navy text-lime btn-shine"
            }`}
          >
            {recording ? <Square size={18} /> : <Mic size={22} />}
          </button>

          {recording ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-error">{t("placementTest.stopRecording")}</span>
              <span className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className="recording-dot h-2 w-2 rounded-full bg-error" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
            </div>
          ) : (
            <span className="text-sm font-medium text-muted">
              {audioBlobUrl ? t("placementTest.recordAgain") : t("placementTest.record")}
            </span>
          )}

          {audioBlobUrl && !recording && (
            <div className="flex flex-col items-center gap-2 w-full">
              <span className="flex items-center gap-1.5 text-sm text-success">
                <CheckCircle2 size={18} />
                {t("placementTest.audioSaved")}
              </span>
              <audio controls src={audioBlobUrl} className="w-full h-9" />
            </div>
          )}
        </div>
      ) : current.inputMethod === "textarea" ? (
        <textarea
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder={t("placementTest.answerPlaceholder")}
          className="w-full rounded-card border border-rule bg-surface px-4 py-3 text-sm text-ink shadow-sm focus:border-navy focus:outline-none transition-colors"
          rows={4}
        />
      ) : (
        <input
          type="text"
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder={t("placementTest.answerPlaceholder")}
          className="w-full rounded-card border border-rule bg-surface px-4 py-3 text-sm text-ink shadow-sm focus:border-navy focus:outline-none transition-colors"
        />
      )}

          {error && <p className="text-sm text-error text-center">{error}</p>}

          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleBack} disabled={index === 0 || submitting || recording} className="!px-3.5">
              <ArrowLeft size={20} />
            </Button>
            <button
              onClick={handleSkip}
              disabled={submitting || recording}
              className="text-sm font-medium text-muted hover:text-ink transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed px-1"
            >
              {t("placementTest.skip")}
            </button>
            <Button onClick={handleSubmit} disabled={!canSubmit || submitting} className="flex-1">
              {submitting ? t("placementTest.submitting") : index + 1 < items.length ? t("placementTest.next") : t("placementTest.finish")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
