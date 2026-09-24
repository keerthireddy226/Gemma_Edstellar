import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Volume2, Mic, CheckCircle2, ArrowLeft, Clock, Headphones, BookOpen, PenLine, ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/Button";
import { ProgressRing } from "@/components/ProgressRing";
import { SKILL_TINT_CLASSES, SKILL_RING_COLOR } from "@/lib/skillTints";
import {
  getAvailability,
  getUnits,
  getSets,
  startPracticeSession,
  submitPracticeAttempt,
  completePracticeSession,
  type PracticeSummary,
  type SkillAvailability,
  type PracticeUnit,
  type PracticeSet,
} from "@/api/practiceSession";
import type { TestItem, SkillTag } from "@/api/testSession";
import { useVoiceRecorder, blobToBase64 } from "@/hooks/useVoiceRecorder";
import { playSpokenAudio } from "@/lib/playSpokenAudio";
import { VoiceCheck } from "@/components/VoiceCheck";
import { getVoiceEnrollmentStatus } from "@/api/voiceCheck";
import { AnswerInputControl } from "@/components/AnswerInputControl";
import {
  AUDIO_FIRST_TYPES,
  SKILL_BADGE_CLASS,
  ITEM_TYPE_META,
  getSpokenSegments,
  getVisibleText,
  getPassageAndQuestion,
} from "@/lib/testItemDisplay";

// Fallback reading time for a two-phase item with no server-set duration.
const DEFAULT_TWO_PHASE_READ_SECONDS = 30;

const SKILL_ICONS: Record<SkillTag, typeof Headphones> = {
  listening: Headphones,
  speaking: Mic,
  reading: BookOpen,
  writing: PenLine,
};

const SKILL_EMOJI: Record<SkillTag, string> = {
  listening: "🎧",
  speaking: "🗣️",
  reading: "📖",
  writing: "✍️",
};

// Spelled out per skill rather than derived from ITEM_TYPE_META.skills — that doesn't always match item_types.skills in the DB (e.g. open_questions is speaking-only there).
const SKILL_TYPES: Record<SkillTag, string[]> = {
  listening: [
    "conversations",
    "dictation",
    "passage_comprehension",
    "reading_selective",
    "repeats",
    "response_selection",
    "sentence_builds",
    "short_answer",
    "story_retelling",
  ],
  speaking: [
    "conversations",
    "open_questions",
    "passage_comprehension",
    "reading",
    "reading_selective",
    "repeats",
    "sentence_builds",
    "short_answer",
    "speaking_situations",
    "story_retelling",
  ],
  reading: ["passage_reconstruction", "reading", "reading_comprehension", "reading_selective", "speaking_situations", "summary_and_opinion"],
  // free_writing exists in the DB's item_types but has no ITEM_TYPE_META
  // entry and zero approved content — left out until it's actually usable.
  writing: ["dictation", "email_writing", "passage_reconstruction", "sentence_completion", "summary_and_opinion", "typing"],
};

// Colors the CEFR code in a unit name ("A1 - Beginner") as a difficulty ramp, reusing existing per-skill color tokens.
const CEFR_TINT_CLASSES: Record<string, string> = {
  A1: "bg-listening/15 text-listening",
  A2: "bg-reading/15 text-reading",
  B1: "bg-speaking/15 text-speaking",
  B2: "bg-speaking/25 text-navy-deep",
  C1: "bg-writing/20 text-writing",
  C2: "bg-writing/30 text-navy-deep",
};

function cefrTint(unitName: string): string {
  const code = unitName.match(/^[ABC][12]/)?.[0];
  return (code && CEFR_TINT_CLASSES[code]) || "bg-paper text-navy-deep";
}

// A little growth motif (sprout -> tree) matching the difficulty ramp above.
const CEFR_EMOJI: Record<string, string> = {
  A1: "🥉",
  A2: "🥈",
  B1: "🥇",
  B2: "🥇",
  C1: "💎",
  C2: "💎",
};

function cefrEmoji(unitName: string): string {
  const code = unitName.match(/^[ABC][12]/)?.[0];
  return (code && CEFR_EMOJI[code]) || "📘";
}

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
            const exhausted = remaining === 0;
            const percent = total > 0 ? Math.round(((total - remaining) / total) * 100) : 0;
            return (
              <button
                key={skill}
                onClick={() => !exhausted && onStart(skill)}
                disabled={starting || exhausted}
                className="group text-left flex items-center gap-4 bg-surface border border-rule rounded-card px-4 py-4 transition-all cursor-pointer hover:border-rule-strong hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-14px_rgba(0,0,0,0.28)] disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                <ProgressRing percent={percent} size={52} strokeWidth={4} colorClass={SKILL_RING_COLOR[skill]}>
                  <span
                    className={`h-9 w-9 rounded-2xl flex items-center justify-center text-lg transition-transform group-hover:scale-110 ${SKILL_TINT_CLASSES[skill]}`}
                  >
                    {SKILL_EMOJI[skill]}
                  </span>
                </ProgressRing>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-lg text-ink">{t(`skills.${skill}`)}</div>
                  <div className="text-xs text-muted">
                    {exhausted ? t("modules.allDone") : t("modules.remainingItems", { count: remaining, total })}
                  </div>
                </div>
                {!exhausted && (
                  <ChevronRight size={20} className="text-muted shrink-0 transition-transform group-hover:translate-x-1" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// One card per question type in the picked skill; navigation layer only, reuses existing content.
function TypePicker({ skill, starting, onBack, onSelect }: { skill: SkillTag; starting: boolean; onBack: () => void; onSelect: (typeId: string) => void }) {
  const { t } = useTranslation();
  const Icon = SKILL_ICONS[skill];
  const types = SKILL_TYPES[skill];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink transition-colors cursor-pointer self-start"
      >
        <ArrowLeft size={16} strokeWidth={1.8} /> {t("modules.backToSkills")}
      </button>

      <div className="flex items-center gap-3">
        <span className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl ${SKILL_TINT_CLASSES[skill]}`}>
          {SKILL_EMOJI[skill]}
        </span>
        <div>
          <h1 className="font-display font-bold text-xl text-ink">{t(`skills.${skill}`)} Practice</h1>
          <p className="text-xs text-muted">{t("modules.pickTypeSubtitle")}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {types.map((typeId) => {
          const meta = ITEM_TYPE_META[typeId];
          if (!meta) return null;
          return (
            <button
              key={typeId}
              onClick={() => onSelect(typeId)}
              disabled={starting}
              className="group text-left bg-surface border border-rule rounded-card p-4 transition-all cursor-pointer flex flex-col gap-3 disabled:opacity-60 disabled:cursor-not-allowed hover:border-rule-strong hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-14px_rgba(0,0,0,0.28)]"
            >
              <span
                className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 text-xl transition-transform group-hover:scale-110 ${SKILL_TINT_CLASSES[skill]}`}
              >
                <Icon size={20} strokeWidth={2} />
              </span>
              <span className="font-display font-semibold text-sm text-ink">{meta.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Shown only if the picked type has units — types without any skip straight to the old count-based start.
function UnitPicker({
  units,
  loading,
  onBack,
  onSelect,
}: {
  units: PracticeUnit[];
  loading: boolean;
  onBack: () => void;
  onSelect: (unit: PracticeUnit) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink transition-colors cursor-pointer self-start"
      >
        <ArrowLeft size={16} strokeWidth={1.8} /> {t("modules.backToTypes")}
      </button>
      <h1 className="font-display font-bold text-xl text-ink">{t("modules.pickUnitTitle")}</h1>
      {loading ? (
        <p className="text-sm text-muted">{t("modules.loadingAvailability")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {units.map((unit) => {
            const percent = unit.setCount > 0 ? Math.round((unit.completedCount / unit.setCount) * 100) : 0;
            const done = unit.setCount > 0 && unit.completedCount === unit.setCount;
            return (
              <button
                key={unit.id}
                onClick={() => onSelect(unit)}
                className="group text-left flex items-center gap-4 bg-surface border border-rule rounded-card px-4 py-4 transition-all cursor-pointer hover:border-rule-strong hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-14px_rgba(0,0,0,0.28)]"
              >
                <ProgressRing percent={percent} size={52} strokeWidth={4} colorClass={done ? "text-success" : "text-navy"}>
                  <span
                    className={`h-9 w-9 rounded-2xl flex items-center justify-center text-lg transition-transform group-hover:scale-110 ${cefrTint(unit.name)}`}
                  >
                    {done ? <CheckCircle2 size={18} /> : cefrEmoji(unit.name)}
                  </span>
                </ProgressRing>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-base text-ink">{unit.name}</div>
                  <div className="text-xs text-muted">
                    {done ? t("modules.unitComplete") : t("modules.setsProgress", { done: unit.completedCount, total: unit.setCount })}
                  </div>
                </div>
                <ChevronRight size={20} className="text-muted shrink-0 transition-transform group-hover:translate-x-1" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Shown after picking a unit — one card per set, with a checkmark if this
// learner already completed it. Selecting a set starts a fixed, ordered
// mini-lesson (POST /practice/session with setId) instead of the old
// spread/adaptive sample.
function SetPicker({
  unitName,
  sets,
  loading,
  onBack,
  onSelect,
}: {
  unitName: string;
  sets: PracticeSet[];
  loading: boolean;
  onBack: () => void;
  onSelect: (setId: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink transition-colors cursor-pointer self-start"
      >
        <ArrowLeft size={16} strokeWidth={1.8} /> {t("modules.backToUnits")}
      </button>
      <h1 className="font-display font-bold text-xl text-ink">{unitName}</h1>
      {loading ? (
        <p className="text-sm text-muted">{t("modules.loadingAvailability")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sets.map((set, i) => (
            <button
              key={set.id}
              onClick={() => onSelect(set.id)}
              className="group text-left flex items-center gap-4 bg-surface border border-rule rounded-card px-4 py-4 transition-all cursor-pointer hover:border-rule-strong hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-14px_rgba(0,0,0,0.28)]"
            >
              <span
                className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 font-display font-bold text-base transition-transform group-hover:scale-110 ${
                  set.completed ? "bg-success/15 text-success" : "bg-accent/15 text-accent"
                }`}
              >
                {set.completed ? <CheckCircle2 size={20} /> : i + 1}
              </span>
              <span className="flex-1 text-base font-semibold text-ink">{set.name}</span>
              {set.completed ? (
                <span className="text-xs font-semibold text-success shrink-0">{t("modules.setCompleted")}</span>
              ) : (
                <ChevronRight size={20} className="text-muted shrink-0 transition-transform group-hover:translate-x-1" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Modules() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { recording, start: startRecording, stop: stopRecording } = useVoiceRecorder();

  const [availability, setAvailability] = useState<SkillAvailability[] | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  // A skill picked but no type chosen yet — shows TypePicker instead of
  // starting a session immediately.
  const [pickerSkill, setPickerSkill] = useState<SkillTag | null>(null);
  // A type picked — shows UnitPicker next, unless that type turns out to
  // have no units at all, in which case the fetch effect below skips
  // straight to the old count-based pendingStart automatically.
  const [pickerType, setPickerType] = useState<{ skill: SkillTag; itemTypeId: string } | null>(null);
  const [units, setUnits] = useState<PracticeUnit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  // A unit picked — shows SetPicker next.
  const [pickerUnit, setPickerUnit] = useState<{ skill: SkillTag; itemTypeId: string; unitId: string; unitName: string } | null>(
    null,
  );
  const [sets, setSets] = useState<PracticeSet[]>([]);
  const [loadingSets, setLoadingSets] = useState(false);
  // A start requested (from the auto-start effect, TypePicker's no-units
  // fallback, or SetPicker) but not yet actually begun — the Voice Check
  // gate below renders while this is set, and only calls the real
  // handleStart once it completes.
  const [pendingStart, setPendingStart] = useState<{ skill: SkillTag; count?: number; itemTypeId?: string; setId?: string } | null>(
    null,
  );

  useEffect(() => {
    if (!pickerType) return;
    let cancelled = false;
    setLoadingUnits(true);
    getUnits(pickerType.itemTypeId)
      .then((res) => {
        if (cancelled) return;
        if (res.units.length === 0) {
          // No units authored for this type yet — fall straight back to the
          // old count-based session start, same as before this feature.
          setPendingStart({ skill: pickerType.skill, itemTypeId: pickerType.itemTypeId });
          setPickerType(null);
        } else {
          setUnits(res.units);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPendingStart({ skill: pickerType.skill, itemTypeId: pickerType.itemTypeId });
          setPickerType(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingUnits(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pickerType]);

  useEffect(() => {
    if (!pickerUnit) return;
    let cancelled = false;
    setLoadingSets(true);
    getSets(pickerUnit.unitId)
      .then((res) => {
        if (!cancelled) setSets(res.sets);
      })
      .catch(() => {
        if (!cancelled) setSets([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSets(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pickerUnit]);
  // Same robustness fix as PlacementTest.tsx: if there's no enrollment on
  // file yet when a start is actually requested, redirect to enroll (with
  // consent) first, rather than only ever showing the verify step — this
  // page has no upstream "Placement.tsx"-style gate of its own to rely on.
  const [voiceEnrolled, setVoiceEnrolled] = useState<boolean | null>(null);
  useEffect(() => {
    getVoiceEnrollmentStatus()
      .then((res) => setVoiceEnrolled(res.enrolled))
      .catch(() => setVoiceEnrolled(true));
  }, []);
  useEffect(() => {
    if (pendingStart && voiceEnrolled === false) {
      navigate(ROUTES.VOICE_ENROLLMENT, { state: { next: `${location.pathname}${location.search}` } });
    }
  }, [pendingStart, voiceEnrolled, navigate, location.pathname, location.search]);

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
  const twoPhaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getAvailability()
      .then((res) => setAvailability(res.availability))
      .catch(() => setAvailability(null))
      .finally(() => setLoadingAvailability(false));
  }, []);

  async function handleStart(skill: SkillTag, count?: number, itemTypeId?: string, voiceCheckId?: string, setId?: string) {
    setStarting(true);
    setError(null);
    try {
      const res = await startPracticeSession(skill, count, itemTypeId, voiceCheckId, setId);
      setSessionId(res.sessionId);
      setItems(res.items);
      // Resuming an in-progress session returns every item with its own
      // `attempted` flag — land on the first one that isn't, instead of
      // always rewinding to index 0 (that used to make "Continue where you
      // left off" on Overview show already-answered question 1 again).
      const firstUnattempted = res.items.findIndex((item) => !item.attempted);
      setIndex(firstUnattempted === -1 ? 0 : firstUnattempted);
      setAnswers(
        Object.fromEntries(
          res.items.flatMap((item, i) => (item.attempted ? [[i, { responseText: item.responseText ?? "" }]] : [])),
        ),
      );
      setSummary(null);
    } catch {
      setError(t("modules.startError"));
    } finally {
      setStarting(false);
    }
  }

  // ?skill= alone shows the type picker; ?skill=+?type= (from Today's Tasks)
  // skips straight to that type. Re-runs on any URL change, not just mount —
  // guarded by the last-processed query string so StrictMode's double-invoke
  // only acts once, but a genuine navigation (e.g. a Sidebar skill link)
  // still goes through, fixing a bug where it got stuck on the first skill.
  const lastAutoStart = useRef<string | null>(null);
  useEffect(() => {
    const raw = searchParams.toString();
    if (lastAutoStart.current === raw) return;
    lastAutoStart.current = raw;
    const skill = searchParams.get("skill");
    const count = searchParams.get("count");
    const itemTypeId = searchParams.get("type");
    if (skill === "listening" || skill === "speaking" || skill === "reading" || skill === "writing") {
      // A skill link always wins over what's showing, even mid-session — attempts save per item, so nothing's lost.
      setSessionId(null);
      setItems([]);
      setSummary(null);
      setPickerType(null);
      setPickerUnit(null);
      if (itemTypeId) {
        setPendingStart({ skill, count: count ? Number(count) : undefined, itemTypeId });
      } else {
        setPendingStart(null);
        setPickerSkill(skill);
      }
    }
  }, [searchParams]);

  const current = items[index];
  const needsAudioFirst = current ? AUDIO_FIRST_TYPES.has(current.itemTypeId) : false;
  const visibleText = current && !needsAudioFirst ? getVisibleText(current) : "";
  const meta = current ? ITEM_TYPE_META[current.itemTypeId] : undefined;

  useEffect(() => {
    // A pending two-phase read timer belongs to the question it was started
    // on — moving away (Skip/Back) before it fires must not let it force a
    // *different*, still-idle two-phase question straight to writing later.
    if (twoPhaseTimeoutRef.current !== null) {
      clearTimeout(twoPhaseTimeoutRef.current);
      twoPhaseTimeoutRef.current = null;
    }
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
    const readSeconds = current.twoPhaseReadSeconds ?? DEFAULT_TWO_PHASE_READ_SECONDS;
    twoPhaseTimeoutRef.current = setTimeout(() => {
      twoPhaseTimeoutRef.current = null;
      setTwoPhaseStage("writing");
    }, readSeconds * 1000);
  }

  async function handlePlay() {
    if (!current) return;
    setPlaying(true);
    await playSpokenAudio(current, getSpokenSegments(current));
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

  // No active or just-finished session — show the skill picker, or the
  // type picker if a skill's already been chosen but no specific type yet.
  if (!sessionId && !starting) {
    // A start was requested but we don't know enrollment status yet, or
    // we're about to redirect to enroll (per the effect above) — show
    // nothing rather than flash the picker screens behind it.
    if (pendingStart && !voiceEnrolled) {
      return null;
    }
    if (pendingStart && voiceEnrolled) {
      return (
        <VoiceCheck
          mode="verify"
          purpose="practice"
          onBack={() => setPendingStart(null)}
          onComplete={(result) => {
            const { skill, count, itemTypeId, setId } = pendingStart;
            setPendingStart(null);
            handleStart(skill, count, itemTypeId, result.voiceCheckId, setId);
          }}
        />
      );
    }
    if (pickerUnit) {
      return (
        <SetPicker
          unitName={pickerUnit.unitName}
          sets={sets}
          loading={loadingSets}
          onBack={() => setPickerUnit(null)}
          onSelect={(setId) => setPendingStart({ skill: pickerUnit.skill, itemTypeId: pickerUnit.itemTypeId, setId })}
        />
      );
    }
    if (pickerType) {
      return <UnitPicker units={units} loading={loadingUnits} onBack={() => setPickerType(null)} onSelect={(unit) => setPickerUnit({ ...pickerType, unitId: unit.id, unitName: unit.name })} />;
    }
    if (pickerSkill) {
      return (
        <TypePicker
          skill={pickerSkill}
          starting={starting}
          onBack={() => setPickerSkill(null)}
          onSelect={(typeId) => setPickerType({ skill: pickerSkill, itemTypeId: typeId })}
        />
      );
    }
    return (
      <SkillPicker availability={availability} loading={loadingAvailability} starting={starting} onStart={(skill) => setPickerSkill(skill)} />
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

      {/* Fixed (not max-) height — the same for every question — so the
          Back/Skip/Next footer always lands at the same place. Content is
          centered inside this fixed box instead of pinned to its top, so a
          short question's leftover space splits above and below it rather
          than collecting in one visible gap. Only a genuinely long passage
          scrolls, via the overflow-y-auto on the inner content div. */}
      <div
        className="relative w-full bg-surface border border-rule rounded-card shadow-sm overflow-hidden flex flex-col"
        style={{ height: "calc(100vh - 240px)" }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: `var(--color-${(meta?.skills ?? current.skills)[0]})` }}
        />
        <div className="flex-1 p-8 pt-8 flex flex-col justify-center gap-5 overflow-y-auto">
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

      {current.inputMethod === "two-phase" ? (
        twoPhaseStage === "writing" && (
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder={t("placementTest.answerPlaceholder")}
            className="w-full rounded-card border border-rule bg-surface px-4 py-3 text-sm text-ink shadow-sm focus:border-navy focus:outline-none transition-colors"
            rows={4}
          />
        )
      ) : (
        <AnswerInputControl
          item={current}
          answerText={answerText}
          onAnswerTextChange={setAnswerText}
          recording={recording}
          onToggleRecord={handleToggleRecord}
          audioBlobUrl={audioBlobUrl}
          needsAudioFirst={needsAudioFirst}
          hasPlayed={hasPlayed}
          playing={playing}
          stopIconSize={18}
          textareaRows={4}
        />
      )}

          {error && <p className="text-sm text-error text-center">{error}</p>}
        </div>

        <div className="shrink-0 border-t border-rule px-8 py-4 flex items-center gap-3">
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
  );
}
