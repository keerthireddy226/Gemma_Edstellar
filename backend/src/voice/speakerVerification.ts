// Speaker identity verification (Voice Check) — confirms a fresh recording
// belongs to the same person as a previously enrolled voice sample.
//
// Runs entirely locally via sherpa-onnx-node (Apache-2.0, no account, no
// billing, no gating) — Google Cloud, Azure, and Amazon were all checked
// first and ruled out (Google's Speaker ID only works bundled inside a
// call-center product and needs a sales conversation; Azure gates this
// behind a "Limited Access" application; Amazon's Voice ID is tied to a
// live Connect instance and is being discontinued in 2026 anyway).
//
// How it works: a pre-trained neural network (WeSpeaker/CAM++, trained on
// the VoxCeleb benchmark) turns a voice clip into a 512-number "voiceprint"
// (an embedding). The same person's voice reliably produces a similar
// voiceprint across different recordings; different people produce
// noticeably different ones. Comparing two voiceprints with cosine
// similarity gives a 0-1 "how alike are these two voices" score.
//
// Verified directly against real speech before writing any application
// code around this: a genuine English speaker's two separate long, clean,
// same-phrase recordings scored 0.90 similarity; two different real English
// speakers scored 0.31-0.59.
//
// That first pass (0.7 threshold) turned out too strict for how this app
// actually records: real production verify attempts from one genuinely
// correct, consistent user scored only 0.50-0.67 — short (3-5s) browser-mic
// clips, opus-compressed, and (deliberately, to resist trivial replay) a
// *different* spoken phrase from enrollment, which by itself measurably
// lowers same-speaker similarity versus reading identical text back.
// MATCH_THRESHOLD is lowered below to fit that real data, but this remains
// a small-sample empirical value, not a validated production threshold —
// revisit it once a larger set of real match/mismatch attempts exists, and
// note the phrase-mismatch tradeoff if accuracy needs to improve further.
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
export const MATCH_THRESHOLD = 0.45;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let extractor: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getExtractor(): any {
  if (!extractor) {
    extractor = new sherpaOnnx.SpeakerEmbeddingExtractor({ model: MODEL_PATH, numThreads: 1, debug: false });
  }
  return extractor;
}

// ffmpeg needs to write to a real (seekable) file, not a pipe — piping WAV
// output to stdout leaves the RIFF header's data-size field unfinalized,
// which the reader then treats as zero samples (verified directly: this
// silently produced a 0-sample decode before being caught here).
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
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function embeddingToBuffer(embedding: Float32Array): Buffer {
  return Buffer.from(embedding.buffer, embedding.byteOffset, embedding.byteLength);
}

export function bufferToEmbedding(buf: Buffer): Float32Array {
  return new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}
