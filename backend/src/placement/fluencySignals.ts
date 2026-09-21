// Free fluency signals — computed directly from the transcript and the
// recording length, no AI model and no paid service involved. These are
// deliberately rough (see Grading_Methods_Report.md, Part 12): they measure
// *how* an answer was delivered, as a supplement to content_score (which
// grades *what* was said), never a replacement for either content grading
// or a real pronunciation score.
//
// Pause detection (the third free signal in the report) isn't here yet —
// it needs to analyze the actual audio waveform, not just the transcript,
// which needs either an audio-decoding library or ffmpeg on the server.
// That's a real dependency decision, not something to add silently.

// Unambiguous filler interjections only — words like "like" or "you know"
// are also normal, meaningful words in plenty of sentences ("I like
// apples"), so counting them would produce a noisy, misleading signal.
// These six have no other common meaning as a spoken interjection.
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

  // Under 1.5s is almost certainly a false start or a recording glitch, not
  // a real reading of the rate — better to report "unknown" than a wild
  // number like "3 words in 0.2s = 900 WPM."
  const wordsPerMinute =
    durationMs && durationMs >= 1500 ? Math.round((wordCount / durationMs) * 60000) : null;

  return { wordCount, wordsPerMinute, fillerCount };
}

// Shape actually stored in scores.manner_scores — see placement/routes.ts
// and geminiFluency.ts. Both pieces are optional independently: the free
// signals need a duration to compute WPM, and gemini is only present when
// GEMINI_API_KEY is configured and it didn't fail.
export interface StoredMannerScores {
  wordCount?: number;
  wordsPerMinute?: number | null;
  fillerCount?: number;
  gemini?: { pronunciation: number; fluency: number; comment: string } | null;
}

// A rough, openly-heuristic "reasonable pace" band for read/spoken English —
// not from a validated study, same honest caveat as percentToCefr in
// cefr.ts. Deliberately generous: this should catch someone racing through
// unintelligibly or grinding out one word at a time, not penalize normal
// variation in speaking pace.
const MIN_ACCEPTABLE_WPM = 70;
const MAX_ACCEPTABLE_WPM = 220;

// The single definition of "correct" now used everywhere — the adaptive
// engine's real-time step decision, the per-skill breakdown, and the
// headline level all call this, so they can never disagree with each other.
//
// For anything typed (writing, or a non-mic input method), this is content
// only — unchanged. For a mic answer, content still has to be right, pace
// has to be reasonable (plain arithmetic, words ÷ time), and — as of this
// change — pronunciation and fluency also have to clear the same per-level
// bar as content does, using the same graduated table (60% at A1/A2, up to
// 95% at C2): a C1 question demands near-flawless delivery, an A1 one
// tolerates real roughness, exactly like content correctness already does.
//
// This was deliberately left out before: the exact same silent recording,
// tested six times, got a made-up pronunciation comment four of those six
// times. That's fixed now (see geminiFluency.ts's prompt — it verifies real
// speech is present before scoring anything) and re-verified afterward: 6/6
// correct on silence, consistently and correctly scaled on real recordings.
// Gating on it is a deliberate decision made once that fix held up under
// re-testing, not a default that crept back in.
//
// A signal that's missing (no duration, no Gemini result — e.g. no audio
// sent, or GEMINI_API_KEY not configured) never counts against the
// learner — only a signal that's present and bad does.
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

export interface SpeakingDeliverySummary {
  averageWordsPerMinute: number | null;
  totalFillerCount: number;
  averagePronunciation: number | null;
  averageFluency: number | null;
  sampleComment: string | null;
  // How many spoken answers this is actually based on — shown alongside so
  // one or two answers don't get presented with the same confidence as
  // fifteen would.
  basedOnCount: number;
}

// Rolls up every spoken answer's manner_scores for one session into a single
// results-screen summary. Returns null when there's nothing to summarize at
// all (no mic answers were scored, or none carried any manner_scores —
// e.g. GEMINI_API_KEY isn't configured and every free-signal duration was
// missing too).
export function summarizeSpeakingDelivery(mannerScoresList: (StoredMannerScores | null)[]): SpeakingDeliverySummary | null {
  const entries = mannerScoresList.filter((m): m is StoredMannerScores => m != null);
  if (entries.length === 0) return null;

  const wpmValues = entries.map((e) => e.wordsPerMinute).filter((v): v is number => typeof v === "number");
  const totalFillerCount = entries.reduce((sum, e) => sum + (e.fillerCount ?? 0), 0);

  const geminiEntries = entries.map((e) => e.gemini).filter((g): g is { pronunciation: number; fluency: number; comment: string } => g != null);
  const average = (nums: number[]) => (nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : null);

  if (wpmValues.length === 0 && geminiEntries.length === 0) return null;

  return {
    averageWordsPerMinute: wpmValues.length > 0 ? Math.round(average(wpmValues)!) : null,
    totalFillerCount,
    averagePronunciation: average(geminiEntries.map((g) => g.pronunciation)),
    averageFluency: average(geminiEntries.map((g) => g.fluency)),
    // Last one, not "best" or "worst" — picking a favorable comment out of
    // several would misrepresent the overall result.
    sampleComment: geminiEntries.length > 0 ? geminiEntries[geminiEntries.length - 1].comment : null,
    basedOnCount: entries.length,
  };
}
