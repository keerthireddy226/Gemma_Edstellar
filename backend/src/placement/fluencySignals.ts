// Free heuristic fluency signals (transcript/duration only, no AI or paid
// service) — supplement content_score, never replace it. Pause detection is
// deferred: it needs real audio-waveform analysis, not just the transcript.

// Unambiguous filler interjections only — words like "like" are also normal
// ("I like apples"), so including them would be a noisy signal.
const FILLER_WORDS = ["um", "umm", "uh", "uhh", "erm", "hmm"];
const FILLER_REGEX = new RegExp(`\\b(${FILLER_WORDS.join("|")})\\b`, "gi");

export interface FluencySignals {
  wordCount: number;
  wordsPerMinute: number | null;
  fillerCount: number;
}

export function computeFluencySignals(responseText: string, durationMs: number | null | undefined): FluencySignals {
  const words = responseText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const fillerCount = (responseText.match(FILLER_REGEX) ?? []).length;

  // Under 1.5s is likely a false start, not a real rate — report unknown
  // rather than a wild number (e.g. "3 words in 0.2s = 900 WPM").
  const wordsPerMinute =
    durationMs && durationMs >= 1500 ? Math.round((wordCount / durationMs) * 60000) : null;

  return { wordCount, wordsPerMinute, fillerCount };
}

// Shape stored in scores.manner_scores (see routes.ts/geminiFluency.ts) —
// both pieces are optional independently.
export interface StoredMannerScores {
  wordCount?: number;
  wordsPerMinute?: number | null;
  fillerCount?: number;
  gemini?: { pronunciation: number; fluency: number; comment: string } | null;
}

// Rough, unvalidated "reasonable pace" band (same caveat as cefr.ts) —
// generous, just catches unintelligibly fast/slow, not normal variation.
const MIN_ACCEPTABLE_WPM = 70;
const MAX_ACCEPTABLE_WPM = 220;

// Single definition of "correct" used everywhere (adaptive engine, skill
// breakdown, headline level). Typed answers: content only. Mic answers:
// content + pace + pronunciation/fluency all clear the same per-level bar —
// safe to gate on since geminiFluency.ts's audio-presence check fixed a
// hallucination bug (was 4/6 false positives on silence, now 0/6). A
// missing signal (no duration/no Gemini result) never counts against the
// learner — only a present, bad one does.
export function isTrulyCorrect(
  contentScore: number | null,
  cefrLevel: string | null,
  inputMethod: string,
  mannerScores: StoredMannerScores | null | undefined,
  passThresholdForLevel: (level: string | null) => number,
): boolean {
  if (contentScore == null) return false;
  const bar = passThresholdForLevel(cefrLevel);
  const contentOk = contentScore >= bar;
  if (inputMethod !== "mic" || !contentOk) return contentOk;

  const wpm = mannerScores?.wordsPerMinute;
  if (typeof wpm === "number" && (wpm < MIN_ACCEPTABLE_WPM || wpm > MAX_ACCEPTABLE_WPM)) return false;

  const gemini = mannerScores?.gemini;
  if (gemini && (gemini.pronunciation < bar || gemini.fluency < bar)) return false;

  return true;
}

