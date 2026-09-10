// Rubric-based grading for everything that has no single machine-checkable
// correct answer: spoken responses, graded straight from the actual audio
// (gradeSpokenAudio — pronunciation and fluency count, not just the words),
// and free-form writing, graded from the text (gradeWithAI). Calls Gemini
// with a type-specific rubric and asks for a 0-1 score instead of a
// right/wrong verdict, since "how good is this email" or "how well did they
// say this" isn't binary the way "did they say the exact right word" is.
//
// Fails closed: any missing key, network error, or unparseable response
// returns null, and the caller treats that exactly like "no verdict yet" —
// same as this item type before AI grading existed. A grading outage should
// never crash an attempt submission or silently mark someone wrong.

const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export type AiGradeResult = { score: number; reason: string };

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

// Written-response rubrics only — every type that involves actual speech
// (Read Aloud, Open Questions, Story Retelling, Speaking Situations, and the
// rest) is graded from the real recording by gradeSpokenAudio below instead,
// so pronunciation and fluency count, not just the words a transcript came
// back with.
function buildRubric(
  itemTypeId: string,
  content: Record<string, unknown>,
  cefrLevel: string | null,
  minWords: number | null,
): string | null {
  const level = cefrLevel ?? "B1";
  const wordNote = minWords ? ` The task requires at least ${minWords} words.` : "";
  const levelStandard =
    level === "C2" || level === "C1"
      ? `This item is tagged ${level} — hold it to that standard: writing should read as close to native-level, with precise, idiomatic phrasing and no grammar slips. Don't give a high score for merely adequate writing at this level.`
      : level === "B1" || level === "B2"
        ? `This item is tagged ${level} — clear, correct writing is expected, but occasional minor errors are fine and not disqualifying.`
        : `This item is tagged ${level} — basic clarity is enough; simple errors are expected and should not be penalized heavily.`;

  switch (itemTypeId) {
    case "email_writing":
      return `Task: write an email. Situation the email must address: "${str(content.prompt)}".${wordNote} ${levelStandard} Does it address the situation, is the grammar right for that standard, does it meet the length requirement? Score 0 (fails the task) to 1 (fully meets it).`;
    case "passage_reconstruction": {
      const passage = str(content.passage);
      return `The learner read this passage for 30 seconds, then had to reconstruct it from memory in their own words: "${passage}".${wordNote} ${levelStandard} Does the reconstruction capture the key facts/meaning of the original (paraphrasing is expected, not penalized)? Score 0 to 1.`;
    }
    case "summary_and_opinion": {
      const passage = str(content.passage);
      return `Passage: "${passage}". Task: summarize the author's opinion in 25-50 words, then give their own opinion.${wordNote} ${levelStandard} Is the summary accurate, is there a clear own opinion, does it meet the length? Score 0 to 1.`;
    }
    default:
      return null;
  }
}

export async function gradeWithAI(
  itemTypeId: string,
  content: unknown,
  cefrLevel: string | null,
  minWords: number | null,
  responseText: string,
): Promise<AiGradeResult | null> {
  const rubric = buildRubric(itemTypeId, (content ?? {}) as Record<string, unknown>, cefrLevel, minWords);
  if (!rubric) return null;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  let res: Response;
  try {
    res = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${rubric}\n\nLearner's response: "${responseText}"` }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              score: { type: "NUMBER" },
              reason: { type: "STRING" },
            },
            required: ["score", "reason"],
          },
          // An unbounded thinking budget can occasionally spend the entire
          // response on internal reasoning and emit zero output tokens,
          // returning a candidate with no text at all — verified live while
          // building this. Bounding it makes a real answer come back
          // reliably instead of silently failing closed.
          maxOutputTokens: 600,
          thinkingConfig: { thinkingBudget: 200 },
        },
      }),
    });
  } catch (err) {
    console.error("gradeWithAI: request failed:", err);
    return null;
  }
  if (!res.ok) {
    console.error("gradeWithAI: non-OK response:", res.status, await res.text().catch(() => ""));
    return null;
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  try {
    const parsed = JSON.parse(text) as { score?: unknown; reason?: unknown };
    const score = Number(parsed.score);
    if (Number.isNaN(score)) return null;
    return { score: Math.max(0, Math.min(1, score)), reason: String(parsed.reason ?? "") };
  } catch {
    return null;
  }
}

// The 10 item types where the learner actually speaks. Every one of these
// gets graded from the real recording now — content correctness AND
// pronunciation/fluency together — not just a text transcript of the words.
export const MIC_ITEM_TYPES = new Set([
  "repeats",
  "short_answer",
  "sentence_builds",
  "conversations",
  "reading_selective",
  "passage_comprehension",
  "reading",
  "story_retelling",
  "speaking_situations",
  "open_questions",
]);

export type SpokenGradeResult = { transcript: string | null; score: number; reason: string };

function acceptableAnswers(answerSet: Record<string, unknown>): string[] {
  const accepted = [answerSet.exact, answerSet.correct, ...((Array.isArray(answerSet.alternates) ? answerSet.alternates : []) as unknown[]), ...((Array.isArray(answerSet.acceptable_answers) ? answerSet.acceptable_answers : []) as unknown[])];
  return accepted.filter((a): a is string => typeof a === "string");
}

// What the learner was actually asked to say, per type — grounded in that
// item's own content/answer key, same principle as the writing rubrics: what
// counts as "said it right" is completely different for "repeat this exact
// sentence" than for "answer this open question."
function buildSpokenTask(itemTypeId: string, content: Record<string, unknown>, answerSet: Record<string, unknown>): string | null {
  const accepted = acceptableAnswers(answerSet);
  switch (itemTypeId) {
    case "repeats":
      return `The learner was asked to repeat this sentence exactly, word for word: "${str(answerSet.exact)}".`;
    case "short_answer":
      return `The learner heard this question: "${str(content.question)}". Acceptable answers: ${JSON.stringify(accepted)}.`;
    case "sentence_builds":
      return `The learner heard these word groups in random order and had to say them back as one correct sentence: ${JSON.stringify(content.groups)}. A correct sentence: "${str(answerSet.correct)}".`;
    case "conversations":
      return `The learner heard this exchange: "${str(content.dialogue)}", then this question: "${str(content.question)}". Acceptable answers: ${JSON.stringify(accepted)}.`;
    case "reading_selective":
      return `The learner read this text: "${str(content.text)}", then had to answer: "${str(content.question)}". Acceptable answers: ${JSON.stringify(accepted)}.`;
    case "passage_comprehension":
      return `The learner heard this story: "${str(content.story)}", then this question: "${str(content.question)}". Acceptable answers: ${JSON.stringify(accepted)}.`;
    case "reading":
      return `The learner was asked to read this passage aloud, as written: "${str(content.text)}".`;
    case "story_retelling":
      return `The learner heard this story and had to retell it in their own words (paraphrasing is expected and good, it does not need to match word for word): "${str(content.story)}".`;
    case "speaking_situations":
      return `The learner was given this situation and had to respond to it appropriately: "${str(content.situation)}".`;
    case "open_questions":
      return `The learner was asked this open-ended question, and should give their own genuine answer: "${str(content.prompt)}".`;
    default:
      return null;
  }
}

// Audio-native grading — sends the actual recording, not a transcript, so
// the model judges pronunciation, fluency, and pacing directly instead of
// only whether the right words got transcribed. One call also returns a
// transcript, so a separate transcription step isn't needed. The pass bar
// is deliberately spelled out per level: content correctness alone isn't
// enough to earn a top level if it doesn't sound like it.
export async function gradeSpokenAudio(
  itemTypeId: string,
  content: unknown,
  answerSet: unknown,
  cefrLevel: string | null,
  audioBase64: string,
  mimeType: string,
): Promise<SpokenGradeResult | null> {
  const task = buildSpokenTask(itemTypeId, (content ?? {}) as Record<string, unknown>, (answerSet ?? {}) as Record<string, unknown>);
  if (!task) return null;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const level = cefrLevel ?? "B1";
  const levelStandard =
    level === "C2" || level === "C1"
      ? `This item is tagged ${level} — hold it to that standard. The content must be fully correct AND the delivery must sound close to fluent/near-native: clear pronunciation, natural pacing, no long hesitations, no major grammar slips. Do not give a high score just for "good effort" — content correctness and strong delivery are both required.`
      : level === "B1" || level === "B2"
        ? `This item is tagged ${level} — the content should be correct, and delivery should be clear and reasonably fluent, but occasional hesitation or a minor accent is fine and not disqualifying.`
        : `This item is tagged ${level} — basic clarity is enough; simple errors, slow pace, and a strong accent are expected and should not be penalized heavily.`;

  const bareMimeType = mimeType.split(";")[0].trim() || "audio/webm";

  let res: Response;
  try {
    res = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${task}\n\nListen to the learner's recording below. Judge two things together as one score: (1) did they say the correct/relevant content, and (2) how clear, fluent, and well-pronounced was their spoken delivery. ${levelStandard} If there is no discernible speech at all, score 0 and set transcript to null. Otherwise include an exact transcript of what they said.`,
              },
              { inline_data: { mime_type: bareMimeType, data: audioBase64 } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              transcript: { type: "STRING", nullable: true },
              score: { type: "NUMBER" },
              reason: { type: "STRING" },
            },
            required: ["score", "reason"],
          },
          maxOutputTokens: 700,
          thinkingConfig: { thinkingBudget: 300 },
        },
      }),
    });
  } catch (err) {
    console.error("gradeSpokenAudio: request failed:", err);
    return null;
  }
  if (!res.ok) {
    console.error("gradeSpokenAudio: non-OK response:", res.status, await res.text().catch(() => ""));
    return null;
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  try {
    const parsed = JSON.parse(text) as { transcript?: unknown; score?: unknown; reason?: unknown };
    const score = Number(parsed.score);
    if (Number.isNaN(score)) return null;
    return {
      transcript: typeof parsed.transcript === "string" && parsed.transcript.trim() ? parsed.transcript.trim() : null,
      score: Math.max(0, Math.min(1, score)),
      reason: String(parsed.reason ?? ""),
    };
  } catch {
    return null;
  }
}

// "Typing" is a copy-the-passage-exactly drill (a typing-speed exercise),
// not open-ended writing — there's a definite target text, so a word-level
// diff is both cheaper and more reliable than asking an AI to "judge" it.
export function scoreTypingAccuracy(target: string, response: string): number {
  const norm = (s: string) => s.trim().toLowerCase().replace(/[.,!?;:]/g, "").replace(/\s+/g, " ");
  const a = norm(target).split(" ").filter(Boolean);
  const b = norm(response).split(" ").filter(Boolean);
  if (a.length === 0) return 0;

  // Word-level Levenshtein distance.
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const distance = dp[a.length][b.length];
  return Math.max(0, 1 - distance / a.length);
}
