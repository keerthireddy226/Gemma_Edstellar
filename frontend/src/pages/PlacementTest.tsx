import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Volume2, Mic, Square, CheckCircle2, SkipForward } from "lucide-react";
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
  SKILL_BADGE_CLASS,
  ITEM_TYPE_META,
  getSpokenSegments,
  getVisibleText,
  getOptions,
  getPassageAndQuestion,
} from "@/lib/testItemDisplay";

// Matches the sum of ITEMS_PER_TYPE on the backend (placement/routes.ts) —
// only used for the progress bar, since the adaptive engine doesn't hand
// the client a fixed question list upfront to count directly.
const TOTAL_QUESTIONS = 20;

export function PlacementTest() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { recording, start: startRecording, stop: stopRecording } = useVoiceRecorder();

  const [sessionId, setSessionId] = useState<string | null>(null);
  // Adaptive: this only ever grows by one at a time, appended from each
  // attempt response's `nextItem` — there's no pre-loaded fixed list, and
  // no going back to change an earlier answer (that would invalidate every
  // adaptive choice made after it).
  const [items, setItems] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [hasPlayed, setHasPlayed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pendingAudio, setPendingAudio] = useState<{ base64: string; mimeType: string } | null>(null);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [recordingDurationMs, setRecordingDurationMs] = useState<number | null>(null);
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

  const current = items[items.length - 1];
  const needsAudioFirst = current ? AUDIO_FIRST_TYPES.has(current.itemTypeId) : false;
  const visibleText = useMemo(() => (current && !needsAudioFirst ? getVisibleText(current) : ""), [current, needsAudioFirst]);
  const meta = current ? ITEM_TYPE_META[current.itemTypeId] : undefined;

  // Reset the answer inputs whenever a new question arrives.
  useEffect(() => {
    setAnswerText("");
    setPendingAudio(null);
    setAudioBlobUrl(null);
    setRecordingDurationMs(null);
    setHasPlayed(false);
    setError(null);
  }, [current?.id]);

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

  // Shared by both Submit and Skip once an attempt has been recorded: append
  // whatever question comes next, or finish if the engine says there's
  // nothing left to ask.
  async function advanceOrFinish(nextItem: TestItem | null) {
    if (nextItem) {
      setItems((prev) => [...prev, nextItem]);
      return;
    }
    const result = await completeSession(sessionId!);
    setSummary(result);
  }

  async function handleSubmit() {
    if (!current || !sessionId) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitAttempt(sessionId, {
        itemId: current.id,
        responseText: answerText.trim() || undefined,
        audioBase64: pendingAudio?.base64,
        audioMimeType: pendingAudio?.mimeType,
        durationMs: recordingDurationMs ?? undefined,
      });
      await advanceOrFinish(result.nextItem);
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
      const result = await submitAttempt(sessionId, { itemId: current.id });
      await advanceOrFinish(result.nextItem);
    } catch {
      setError(t("placementTest.submitError"));
    } finally {
      setSubmitting(false);
    }
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
            {summary.failedCount > 0 && (
              <p className="text-sm text-error">{t("placementTest.failedNote", { failed: summary.failedCount })}</p>
            )}
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
            {summary.cefrCappedByGap && (
              <p className="text-xs text-muted mt-1 italic">{t("placementTest.gapCappedNote")}</p>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2.5 w-full">
            {(Object.entries(summary.skillPercents) as [string, number | null][]).map(([skill, pct]) => {
              const entry = summary.skillLevels?.[skill as keyof typeof summary.skillLevels];
              return (
                <div key={skill} className="bg-paper-warm rounded-input p-3">
                  {pct === null ? (
                    <>
                      <div className="text-xs text-muted italic">{t("placementTest.notEnoughAnswered")}</div>
                      <div className="text-xs text-muted mt-0.5">{t(`skills.${skill}`)}</div>
                    </>
                  ) : (
                    <>
                      {entry?.level && <div className="font-display font-bold text-lg text-ink">{entry.level}</div>}
                      <div className="text-xs text-muted mt-0.5">{t(`skills.${skill}`)}</div>
                      {entry?.cappedByGap ? (
                        <div className="text-[10px] text-muted mt-0.5 italic leading-snug">
                          {t("placementTest.gapCappedNote")}
                        </div>
                      ) : (
                        <div className="text-xs text-muted mt-0.5">{pct}%</div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {summary.speakingDelivery && (
            <div className="w-full bg-paper-warm rounded-input p-4 flex flex-col gap-3 text-left">
              <span className="text-xs font-mono uppercase tracking-wide text-muted">
                {t("placementTest.speakingDeliveryTitle")}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {summary.speakingDelivery.averageWordsPerMinute !== null && (
                  <div>
                    <div className="font-display font-bold text-lg text-ink">
                      {summary.speakingDelivery.averageWordsPerMinute}
                    </div>
                    <div className="text-xs text-muted">{t("placementTest.wordsPerMinute")}</div>
                  </div>
                )}
                <div>
                  <div className="font-display font-bold text-lg text-ink">{summary.speakingDelivery.totalFillerCount}</div>
                  <div className="text-xs text-muted">{t("placementTest.fillerWords")}</div>
                </div>
                {summary.speakingDelivery.averagePronunciation !== null && (
                  <div>
                    <div className="font-display font-bold text-lg text-ink">
                      {Math.round(summary.speakingDelivery.averagePronunciation * 100)}%
                    </div>
                    <div className="text-xs text-muted">{t("placementTest.pronunciation")}</div>
                  </div>
                )}
                {summary.speakingDelivery.averageFluency !== null && (
                  <div>
                    <div className="font-display font-bold text-lg text-ink">
                      {Math.round(summary.speakingDelivery.averageFluency * 100)}%
                    </div>
                    <div className="text-xs text-muted">{t("placementTest.fluency")}</div>
                  </div>
                )}
              </div>
              {summary.speakingDelivery.sampleComment && (
                <p className="text-xs text-ink italic">"{summary.speakingDelivery.sampleComment}"</p>
              )}
              <p className="text-[10px] text-muted">
                {t("placementTest.speakingDeliveryBasis", { count: summary.speakingDelivery.basedOnCount })}
              </p>
            </div>
          )}

          {summary.pendingCount > 0 && (
            <p className="text-xs text-muted">{t("placementTest.pendingNote", { pending: summary.pendingCount })}</p>
          )}
          {summary.failedCount > 0 && (
            <p className="text-xs text-error">{t("placementTest.failedNote", { failed: summary.failedCount })}</p>
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

  // A mic answer is submittable once there's a saved recording, whether or
  // not live transcription (or manual typing) produced any text — an empty
  // transcript just falls through to pending/manual review server-side
  // (grading.ts), rather than blocking submission entirely.
  const canSubmit = current.inputMethod === "mic" ? !recording && !!audioBlobUrl : answerText.trim() !== "";
  const questionNumber = items.length;
  const progressPct = Math.round(((questionNumber - 1) / TOTAL_QUESTIONS) * 100);

  return (
    <div className="app-surface min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-surface border border-rule rounded-card p-8 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wide text-ink font-semibold">{meta?.name}</span>
            <span className="text-xs font-mono text-muted">
              {t("placementTest.progress", { current: questionNumber, total: TOTAL_QUESTIONS })}
              {current.timerSeconds ? ` · ${current.timerSeconds}s` : ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {current.skills.map((skill) => (
              <span
                key={skill}
                className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-pill border ${SKILL_BADGE_CLASS[skill]}`}
              >
                {t(`skills.${skill}`)}
              </span>
            ))}
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
          <Button variant="secondary" onClick={handleSkip} disabled={submitting || recording} className="flex-1">
            <span className="flex items-center justify-center gap-2">
              <SkipForward size={16} />
              {t("placementTest.skip")}
            </span>
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || submitting} className="flex-1">
            {submitting ? t("placementTest.submitting") : t("placementTest.next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
