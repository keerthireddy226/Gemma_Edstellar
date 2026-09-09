import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Volume2, Mic, Square, CheckCircle2, ArrowLeft, SkipForward, Headphones, BookOpen, PenLine } from "lucide-react";
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
  SKILL_TEXT_CLASS,
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
                  <Icon size={18} strokeWidth={1.8} className="text-navy-deep" />
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
  const [summary, setSummary] = useState<PracticeSummary | null>(null);
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
    setHasPlayed(!!cached);
    setTwoPhaseStage(cached ? "writing" : "idle");
    setError(null);
  }, [index]);

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
    const { blob, mimeType, transcript } = await stopRecording();
    if (transcript) setAnswerText(transcript);
    if (blob) {
      const base64 = await blobToBase64(blob);
      setPendingAudio({ base64, mimeType });
      setAudioBlobUrl(URL.createObjectURL(blob));
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
      <div className="max-w-lg mx-auto bg-surface border border-rule rounded-card p-8 flex flex-col gap-5 items-center text-center">
        <div className="h-14 w-14 rounded-full bg-navy text-lime flex items-center justify-center">
          <CheckCircle2 size={26} />
        </div>
        <h1 className="font-display font-bold text-2xl text-ink">{t("modules.sessionComplete")}</h1>
        <p className="text-sm text-muted">
          {t("placementTest.resultsSummary", {
            correct: summary.correctCount,
            graded: summary.gradedCount,
            pending: summary.pendingCount,
          })}
        </p>
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

  const canSubmit = current.inputMethod === "mic" ? !recording && (answerText.trim() !== "" || !!pendingAudio) : answerText.trim() !== "";
  const progressPct = Math.round((index / items.length) * 100);

  return (
    <div className="max-w-xl mx-auto bg-surface border border-rule rounded-card p-8 flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wide text-ink font-semibold">{meta?.name}</span>
            {meta?.skills.map((skill) => (
              <span key={skill} className={`text-[10px] font-mono uppercase tracking-wide ${SKILL_TEXT_CLASS[skill]}`}>
                {t(`skills.${skill}`)}
              </span>
            ))}
          </div>
          <span className="text-xs font-mono text-muted">
            {t("placementTest.progress", { current: index + 1, total: items.length })}
            {current.timerSeconds ? ` · ${current.timerSeconds}s` : ""}
          </span>
        </div>
        <div className="h-1.5 rounded-pill bg-paper-warm overflow-hidden">
          <div className="h-full bg-navy rounded-pill transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <p className="text-sm text-ink">{current.questionInstruction}</p>

      {current.inputMethod === "two-phase" ? (
        twoPhaseStage === "idle" ? (
          <Button variant="secondary" onClick={handleStartReading}>
            {t("modules.startReading")}
          </Button>
        ) : twoPhaseStage === "reading" ? (
          <p className="text-base text-ink bg-paper-warm rounded-input p-4">{getVisibleText(current)}</p>
        ) : (
          <p className="text-sm text-muted italic">{t("modules.passageHidden")}</p>
        )
      ) : needsAudioFirst ? (
        <Button variant="secondary" onClick={handlePlay} disabled={playing || recording}>
          <span className="flex items-center justify-center gap-2">
            <Volume2 size={16} />
            {playing ? t("placementTest.playing") : hasPlayed ? t("placementTest.playAgain") : t("placementTest.play")}
          </span>
        </Button>
      ) : getPassageAndQuestion(current) ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink bg-paper-warm rounded-input p-4 whitespace-pre-wrap">
            {getPassageAndQuestion(current)!.passage}
          </p>
          <p className="text-sm font-semibold text-ink">{getPassageAndQuestion(current)!.question}</p>
        </div>
      ) : (
        <p className="text-base text-ink bg-paper-warm rounded-input p-4">{visibleText}</p>
      )}

      {current.inputMethod === "radio" ? (
        <div className="flex flex-col gap-2">
          {getOptions(current).map((option, i) => (
            <button
              key={i}
              onClick={() => setAnswerText(String(i))}
              className={`text-left rounded-input border px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                answerText === String(i) ? "border-accent bg-accent/10 text-ink" : "border-rule hover:border-rule-strong"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      ) : current.inputMethod === "two-phase" ? (
        twoPhaseStage === "writing" && (
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder={t("placementTest.answerPlaceholder")}
            className="w-full rounded-input border border-rule bg-paper px-3.5 py-2.5 text-sm text-ink"
            rows={4}
          />
        )
      ) : current.inputMethod === "mic" ? (
        <div className="flex flex-col gap-3">
          <Button
            variant={recording ? "primary" : "secondary"}
            onClick={handleToggleRecord}
            disabled={playing || (needsAudioFirst && !hasPlayed)}
          >
            <span className="flex items-center justify-center gap-2">
              {recording ? <Square size={16} /> : <Mic size={16} />}
              {recording ? t("placementTest.stopRecording") : audioBlobUrl ? t("placementTest.recordAgain") : t("placementTest.record")}
            </span>
          </Button>

          {audioBlobUrl && !recording && (
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-1.5 text-sm text-success">
                <CheckCircle2 size={15} />
                {t("placementTest.audioSaved")}
              </span>
              <audio controls src={audioBlobUrl} className="w-full h-9" />
            </div>
          )}

          {answerText && (
            <div>
              <label className="text-xs font-mono uppercase tracking-wide text-muted">{t("placementTest.transcript")}</label>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                className="w-full rounded-input border border-rule bg-paper px-3.5 py-2.5 text-sm text-ink mt-1"
                rows={2}
              />
            </div>
          )}
        </div>
      ) : current.inputMethod === "textarea" ? (
        <textarea
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder={t("placementTest.answerPlaceholder")}
          className="w-full rounded-input border border-rule bg-paper px-3.5 py-2.5 text-sm text-ink"
          rows={4}
        />
      ) : (
        <input
          type="text"
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder={t("placementTest.answerPlaceholder")}
          className="w-full rounded-input border border-rule bg-paper px-3.5 py-2.5 text-sm text-ink"
        />
      )}

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={handleBack} disabled={index === 0 || submitting || recording} className="!px-3.5">
          <ArrowLeft size={16} />
        </Button>
        <Button variant="secondary" onClick={handleSkip} disabled={submitting || recording} className="flex-1">
          <span className="flex items-center justify-center gap-2">
            <SkipForward size={16} />
            {t("placementTest.skip")}
          </span>
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit || submitting} className="flex-1">
          {submitting ? t("placementTest.submitting") : index + 1 < items.length ? t("placementTest.next") : t("placementTest.finish")}
        </Button>
      </div>
    </div>
  );
}
