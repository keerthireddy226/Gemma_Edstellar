import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Volume2, Mic, Square, CheckCircle2, ArrowLeft, SkipForward } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/Button";
import {
  startSession,
  submitAttempt,
  completeSession,
  type TestItem,
  type SessionSummary,
} from "@/hooks/useTestSession";
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

interface CachedAnswer {
  responseText: string;
  audioBase64?: string;
  audioMimeType?: string;
  audioBlobUrl?: string;
}

export function PlacementTest() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { recording, start: startRecording, stop: stopRecording } = useVoiceRecorder();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [items, setItems] = useState<TestItem[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, CachedAnswer>>({});
  // Read inside the index-change effect below without making it re-fire
  // every time an answer is cached — it should only run when the question
  // itself changes.
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [hasPlayed, setHasPlayed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pendingAudio, setPendingAudio] = useState<{ base64: string; mimeType: string } | null>(null);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);

  useEffect(() => {
    startSession()
      .then((res) => {
        setSessionId(res.sessionId);
        setItems(res.items);
      })
      .catch(() => setError(t("placementTest.loadError")))
      .finally(() => setLoading(false));
  }, [t]);

  const current = items[index];
  const needsAudioFirst = current ? AUDIO_FIRST_TYPES.has(current.itemTypeId) : false;
  const visibleText = useMemo(() => (current && !needsAudioFirst ? getVisibleText(current) : ""), [current, needsAudioFirst]);
  const meta = current ? ITEM_TYPE_META[current.itemTypeId] : undefined;

  // Restore whatever was already answered for this question (going Back
  // shouldn't lose it), or start fresh for a question visited for the first time.
  useEffect(() => {
    const cached = answersRef.current[index];
    setAnswerText(cached?.responseText ?? "");
    setPendingAudio(cached?.audioBase64 ? { base64: cached.audioBase64, mimeType: cached.audioMimeType ?? "" } : null);
    setAudioBlobUrl(cached?.audioBlobUrl ?? null);
    setHasPlayed(!!cached);
    setError(null);
  }, [index]);

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

  async function handleSubmit() {
    if (!current || !sessionId) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitAttempt(sessionId, {
        itemId: current.id,
        responseText: answerText.trim() || undefined,
        audioBase64: pendingAudio?.base64,
        audioMimeType: pendingAudio?.mimeType,
      });
      cacheCurrentAnswer();
      if (index + 1 < items.length) {
        setIndex(index + 1);
      } else {
        const result = await completeSession(sessionId);
        setSummary(result);
      }
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
      await submitAttempt(sessionId, { itemId: current.id });
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
      if (index + 1 < items.length) {
        setIndex(index + 1);
      } else {
        const result = await completeSession(sessionId);
        setSummary(result);
      }
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

  if (loading) {
    return (
      <div className="app-surface min-h-screen flex items-center justify-center px-4">
        <p className="text-sm text-muted">{t("placementTest.loading")}</p>
      </div>
    );
  }

  if (summary) {
    if (!summary.cefrLevel || !summary.skillPercents) {
      // Nothing could be scored at all (e.g. the item bank is fully
      // open-ended right now) — no level to show, just the raw tally.
      return (
        <div className="app-surface min-h-screen flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-lg bg-surface border border-rule rounded-card p-8 flex flex-col gap-4 items-center text-center">
            <h1 className="font-display font-bold text-2xl text-ink">{t("placementTest.resultsTitle")}</h1>
            <p className="text-sm text-muted">
              {t("placementTest.resultsSummary", {
                correct: summary.correctCount,
                graded: summary.gradedCount,
                pending: summary.pendingCount,
              })}
            </p>
            <Button onClick={() => navigate(ROUTES.DASHBOARD)}>{t("placementTest.done")}</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="app-surface min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg bg-surface border border-rule rounded-card p-8 flex flex-col gap-5 items-center text-center">
          <div className="h-14 w-14 rounded-full bg-navy text-lime flex items-center justify-center">
            <CheckCircle2 size={26} />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-ink">
              {t("placementTest.yourLevel", { level: summary.cefrLevel })}
            </h1>
            <p className="text-xs text-muted mt-2">{t("placementTest.levelDisclaimer")}</p>
          </div>

          <div className="grid grid-cols-4 gap-2.5 w-full">
            {(Object.entries(summary.skillPercents) as [string, number][]).map(([skill, pct]) => (
              <div key={skill} className="bg-paper-warm rounded-input p-3">
                <div className="font-display font-bold text-lg text-ink">{pct}%</div>
                <div className="text-xs text-muted mt-0.5">{t(`skills.${skill}`)}</div>
              </div>
            ))}
          </div>

          {summary.pendingCount > 0 && (
            <p className="text-xs text-muted">{t("placementTest.pendingNote", { pending: summary.pendingCount })}</p>
          )}

          <Button onClick={() => navigate(ROUTES.ROADMAP)} className="w-full">
            {t("placementTest.goToRoadmap")}
          </Button>
        </div>
      </div>
    );
  }

  if (error && !current) {
    return (
      <div className="app-surface min-h-screen flex items-center justify-center px-4">
        <p className="text-sm text-error">{error}</p>
      </div>
    );
  }

  if (!current) return null;

  const canSubmit = current.inputMethod === "mic" ? !recording && (answerText.trim() !== "" || !!pendingAudio) : answerText.trim() !== "";
  const progressPct = Math.round((index / items.length) * 100);

  return (
    <div className="app-surface min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-surface border border-rule rounded-card p-8 flex flex-col gap-5">
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

        {needsAudioFirst ? (
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
    </div>
  );
}
