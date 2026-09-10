// Rubric-based grading for everything that has no single machine-checkable
// correct answer, using Claude. Every one of these types is graded from
// TEXT — for spoken types, that's the transcript the browser's own
// SpeechRecognition produced (or whatever the learner typed as a fallback).
//
// Claude's API has no audio input at all (verified directly against
// Anthropic's API reference before building this — there is no "audio"
// content block type), so unlike the previous Gemini-based version, this
// cannot listen to the actual recording or judge pronunciation/fluency.
// Only the words are judged, the same limitation every text-only grading
// approach has.
//
// Fails closed: any missing key, network error, or unparseable response
// returns null, and the caller treats that exactly like "no verdict yet."
// A grading outage should never crash an attempt submission or silently
// mark someone wrong.
import Anthropic from "@anthropic-ai/sdk";

const CLAUDE_MODEL = "claude-sonnet-5";

let client: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic();
  return client;
}

export type AiGradeResult = { score: number; reason: string };

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function acceptableAnswers(answerSet: Record<string, unknown>): string[] {
  const accepted = [
    answerSet.exact,
    answerSet.correct,
    ...((Array.isArray(answerSet.alternates) ? answerSet.alternates : []) as unknown[]),
    ...((Array.isArray(answerSet.acceptable_answers) ? answerSet.acceptable_answers : []) as unknown[]),
  ];
  return accepted.filter((a): a is string => typeof a === "string");
}

function levelStandard(cefrLevel: string | null): string {
  const level = cefrLevel ?? "B1";
  if (level === "C2" || level === "C1") {
    return `This item is tagged ${level} — hold it to that standard: content must be precise and complete, and writing/wording should read as close to native-level, with no grammar slips. Don't give a high score for merely adequate work at this level.`;
  }
  if (level === "B1" || level === "B2") {
    return `This item is tagged ${level} — clear, correct content is expected, but occasional minor errors are fine and not disqualifying.`;
  }
  return `This item is tagged ${level} — basic clarity is enough; simple errors are expected and should not be penalized heavily.`;
}

// One task description per AI-graded type, grounded in that item's own
// content/answer key — what counts as "answered it well" is completely
// different for "write an email" than for "retell this story." Types that
// are spoken in the app are graded here from their transcript only (no
// audio) — see the file header for why.
function buildTask(
  itemTypeId: string,
  content: Record<string, unknown>,
  answerSet: Record<string, unknown>,
  minWords: number | null,
): string | null {
  const wordNote = minWords ? ` The task requires at least ${minWords} words.` : "";
  const accepted = acceptableAnswers(answerSet);

  switch (itemTypeId) {
    case "email_writing":
      return `Task: write an email. Situation the email must address: "${str(content.prompt)}".${wordNote} Does it address the situation, is the grammar right for the standard below, does it meet the length requirement?`;
    case "summary_and_opinion":
      return `Passage: "${str(content.passage)}". Task: summarize the author's opinion in 25-50 words, then give their own opinion.${wordNote} Is the summary accurate, is there a clear own opinion, does it meet the length?`;
    case "passage_reconstruction":
      return `The learner read this passage for 30 seconds, then had to reconstruct it from memory in their own words: "${str(content.passage)}".${wordNote} Does the reconstruction capture the key facts/meaning of the original (paraphrasing is expected, not penalized)?`;
    case "repeats":
      return `The learner was asked to repeat this sentence exactly, word for word: "${str(answerSet.exact)}". This is a transcript of what they said.`;
    case "short_answer":
      return `The learner heard this question: "${str(content.question)}". Acceptable answers: ${JSON.stringify(accepted)}. This is a transcript of their spoken answer.`;
    case "sentence_builds":
      return `The learner heard these word groups in random order and had to say them back as one correct sentence: ${JSON.stringify(content.groups)}. A correct sentence: "${str(answerSet.correct)}". This is a transcript of what they said.`;
    case "conversations":
      return `The learner heard this exchange: "${str(content.dialogue)}", then this question: "${str(content.question)}". Acceptable answers: ${JSON.stringify(accepted)}. This is a transcript of their spoken answer.`;
    case "reading_selective":
      return `The learner read this text: "${str(content.text)}", then had to answer: "${str(content.question)}". Acceptable answers: ${JSON.stringify(accepted)}. This is a transcript of their spoken answer.`;
    case "passage_comprehension":
      return `The learner heard this story: "${str(content.story)}", then this question: "${str(content.question)}". Acceptable answers: ${JSON.stringify(accepted)}. This is a transcript of their spoken answer.`;
    case "reading":
      return `The learner was asked to read this passage aloud, as written: "${str(content.text)}". This is a transcript of what they actually said — judge how accurately it matches the target passage (allowing for reasonable speech-recognition noise).`;
    case "story_retelling":
      return `The learner heard this story and had to retell it in their own words (paraphrasing is expected and good): "${str(content.story)}". This is a transcript of their retelling.`;
    case "speaking_situations":
      return `The learner was given this situation and had to respond to it appropriately: "${str(content.situation)}". This is a transcript of their spoken response.`;
    case "open_questions":
      return `The learner was asked this open-ended question, and should give their own genuine answer: "${str(content.prompt)}". This is a transcript of their spoken answer.`;
    default:
      return null;
  }
}

const GRADE_TOOL: Anthropic.Tool = {
  name: "submit_grade",
  description: "Submit the grade for this learner's answer.",
  input_schema: {
    type: "object",
    properties: {
      score: { type: "number", description: "0 to 1, how well the answer meets the task." },
      reason: { type: "string", description: "One short sentence explaining the score." },
    },
    required: ["score", "reason"],
  },
};

export async function gradeWithAI(
  itemTypeId: string,
  content: unknown,
  answerSet: unknown,
  cefrLevel: string | null,
  minWords: number | null,
  responseText: string,
): Promise<AiGradeResult | null> {
  const task = buildTask(itemTypeId, (content ?? {}) as Record<string, unknown>, (answerSet ?? {}) as Record<string, unknown>, minWords);
  if (!task) return null;

  const anthropic = getClient();
  if (!anthropic) return null;

  let message: Anthropic.Message;
  try {
    message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 500,
      tools: [GRADE_TOOL],
      tool_choice: { type: "tool", name: "submit_grade" },
      messages: [
        {
          role: "user",
          content: `${task}\n\n${levelStandard(cefrLevel)}\n\nLearner's response: "${responseText}"\n\nCall submit_grade with a score from 0 (fails the task) to 1 (fully meets it) and a one-sentence reason.`,
        },
      ],
    });
  } catch (err) {
    console.error("gradeWithAI: request failed:", err);
    return null;
  }

  const toolUse = message.content.find((block): block is Anthropic.ToolUseBlock => block.type === "tool_use");
  if (!toolUse) return null;

  const input = toolUse.input as { score?: unknown; reason?: unknown };
  const score = Number(input.score);
  if (Number.isNaN(score)) return null;
  return { score: Math.max(0, Math.min(1, score)), reason: String(input.reason ?? "") };
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

// The 13 types that now go through gradeWithAI above (all of them judged
// from text only — see the file header for why the spoken ones lost
// pronunciation/fluency judgment when this moved off Gemini).
export const AI_GRADED_TYPES = new Set([
  "email_writing",
  "summary_and_opinion",
  "passage_reconstruction",
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
