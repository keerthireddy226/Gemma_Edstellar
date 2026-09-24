// Voice Check: confirms a recording matches an enrolled voiceprint, via
// sherpa-onnx-node (free/local — Google/Azure/Amazon ruled out, see plan doc),
// comparing 512-number embeddings by cosine similarity. MATCH_THRESHOLD is
// empirical (real attempts scored 0.50-0.67), not a validated production value.
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

export function embeddingToBuffer(embedding: Float32Array): Buffer {
  return Buffer.from(embedding.buffer, embedding.byteOffset, embedding.byteLength);
}

export function bufferToEmbedding(buf: Buffer): Float32Array {
  return new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}
