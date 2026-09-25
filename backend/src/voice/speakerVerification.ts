// Voice Check: confirms a recording matches an enrolled voiceprint, via
// sherpa-onnx-node (free/local — Google/Azure/Amazon ruled out, see plan doc),
// comparing embedding vectors by cosine similarity.
//
// Model: NVIDIA NeMo TitaNet-Large (CC-BY-4.0, free incl. commercial use,
// requires attribution). Replaced WeSpeaker CAM++ (2026-09-25) after real
// testing found CAM++ barely separated two different real speakers with
// similar vocal pitch (measured 0.752 vs a genuine same-speaker score of
// 0.755 — essentially unusable). TitaNet-Large measured meaningfully better
// on the same real audio (0.730 vs 0.873) — a real improvement, not a
// perfect fix; telling apart two similar-sounding real voices from a few
// seconds of casual speech remains genuinely hard for any free local model.
//
// Output dimension is model-specific (512 for CAM++, 192 for TitaNet) — see
// getEmbeddingDim(). A stored embedding from a since-replaced model is
// silently treated as no-enrollment-on-file (see voice/routes.ts), not
// compared byte-for-byte against a different-dimension vector, so swapping
// models again later can't produce a garbage comparison.
import { spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import { writeFile } from "node:fs/promises";
// sherpa-onnx-node ships JSDoc types, not a .d.ts, and is a plain CommonJS
// module — createRequire avoids fighting the bundler/module-resolution
// over a package with no real type declarations.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sherpaOnnx = require("sherpa-onnx-node");

const MODEL_PATH = path.join(process.cwd(), "models", "speaker-embedding.onnx");
// Provisional — set from only 2 real comparisons (a genuine same-speaker
// score of 0.873, and a genuine different-speaker score of 0.730, both
// against the same real enrolled voiceprint), not a validated production
// value. Sits roughly midway, biased toward the stricter side since a false
// accept is the worse failure mode here. MUST be revisited once real
// same-speaker/different-speaker data has accumulated under this model.
export const MATCH_THRESHOLD = 0.8;
// Below this, the embedding itself gets unreliable (see the equivalent
// finding against the previous model, in this file's git history). The
// frontend enforces a stricter minimum (longer phrases, ~8-10s of natural
// speech) before ever recording this far; this is a server-side backstop
// only (a bypassed client, or a truncated upload), not the real reliability gate.
export const MIN_AUDIO_DURATION_SECONDS = 4;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let extractor: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getExtractor(): any {
  if (!extractor) {
    extractor = new sherpaOnnx.SpeakerEmbeddingExtractor({ model: MODEL_PATH, numThreads: 1, debug: false });
  }
  return extractor;
}

// The current model's embedding size, in floats (192 for TitaNet-Large) —
// used to detect a stored embedding left over from a since-replaced model
// (see the header comment above) before ever comparing it.
export function getEmbeddingDim(): number {
  return getExtractor().dim;
}

// A stored embedding from a since-replaced model (different output size)
// isn't just less accurate — comparing it against a current-model embedding
// would read past its own bounds and produce a meaningless similarity
// (silently, since bufferToEmbedding doesn't know which model wrote it).
// Callers treat an incompatible embedding the same as no enrollment at all.
export function isCompatibleEmbedding(embedding: Buffer): boolean {
  return embedding.byteLength === getEmbeddingDim() * Float32Array.BYTES_PER_ELEMENT;
}

// Must write to a real file, not a pipe — piping left the WAV header's data-size unfinalized, decoding as 0 samples.
async function convertToWav(audioBuffer: Buffer, sourceExt: string): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "voice-check-"));
  const inputPath = path.join(dir, `input.${sourceExt}`);
  const outputPath = path.join(dir, "output.wav");
  await writeFile(inputPath, audioBuffer);
  const result = spawnSync(ffmpegPath as unknown as string, ["-y", "-i", inputPath, "-ar", "16000", "-ac", "1", outputPath]);
  if (result.status !== 0) {
    await rm(dir, { recursive: true, force: true });
    throw new Error(`ffmpeg conversion failed: ${result.stderr?.toString().slice(-500)}`);
  }
  return outputPath;
}

export async function computeEmbedding(audioBuffer: Buffer, sourceExt: string): Promise<Float32Array | null> {
  let wavPath: string | null = null;
  try {
    wavPath = await convertToWav(audioBuffer, sourceExt);
    const wave = sherpaOnnx.readWave(wavPath);
    if (!wave.samples.length) return null;
    if (wave.samples.length / wave.sampleRate < MIN_AUDIO_DURATION_SECONDS) return null;
    const stream = getExtractor().createStream();
    stream.acceptWaveform({ sampleRate: wave.sampleRate, samples: wave.samples });
    return getExtractor().compute(stream);
  } catch (err) {
    console.error("computeEmbedding: failed:", err);
    return null;
  } finally {
    if (wavPath) await rm(path.dirname(wavPath), { recursive: true, force: true });
  }
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  // A degenerate all-zero embedding (shouldn't happen for real audio) would
  // otherwise divide by zero into NaN — 0 similarity reads the same way
  // downstream (below any real threshold) but is honest about what it is.
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Enrollment averages 2 separate takes into one voiceprint — cancels out
// noise/idiosyncrasy from any single recording (nerves, mic position, a
// momentary noise), rather than permanently trusting whichever one take
// happened to be recorded at setup.
export function averageEmbeddings(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = (a[i] + b[i]) / 2;
  return out;
}

export function embeddingToBuffer(embedding: Float32Array): Buffer {
  return Buffer.from(embedding.buffer, embedding.byteOffset, embedding.byteLength);
}

export function bufferToEmbedding(buf: Buffer): Float32Array {
  return new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}
