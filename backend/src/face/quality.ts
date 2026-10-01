// Quality gate, no model — catches a blurry/backlit/half-turned enrolment
// before it silently breaks every later verification.
import sharp from "sharp";
import type { FaceBox } from "./detect.js";

export const THRESHOLDS = {
  minBlur: 25, // variance of Laplacian; below this the frame is soft.
  // Calibrated against real webcam captures, which measured
  // 41-107 — an initial guess of 60 rejected 7 of 12 visibly
  // sharp frames. Laptop webcams are softer than stills.
  minBrightness: 55, // mean luma 0-255
  maxBrightness: 205,
  maxClipped: 0.12, // fraction of pixels at 0 or 255 — blown highlights/crushed shadows
  minFaceRatio: 0.18, // face height as a fraction of frame height
  // Too close starves MiniFASNet of context; 0.70 only catches the extreme
  // case (measured real captures: 0.27, 0.45, 0.59-0.64 all work fine).
  maxFaceRatio: 0.7,
  maxRollDeg: 15, // head tilt, from the eye line
  maxYawRatio: 0.28, // nose offset from the eye midpoint, relative to eye spacing
};

export interface QualityResult {
  ok: boolean;
  reasons: string[];
  measurements: {
    blur: number;
    brightness: number;
    clippedFraction: number;
    faceRatio: number;
    rollDeg: number;
    yawRatio: number;
  };
}

// Variance of the Laplacian: standard sharpness measure.
function laplacianVariance(gray: Buffer, w: number, h: number): number {
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const v = -4 * gray[i] + gray[i - 1] + gray[i + 1] + gray[i - w] + gray[i + w];
      sum += v;
      sumSq += v * v;
      n++;
    }
  }
  const mean = sum / n;
  return sumSq / n - mean * mean;
}

// Assess one capture; `box` is a detection from detect.ts, or null.
export async function assessQuality(imageBuffer: Buffer, box: FaceBox | null): Promise<QualityResult> {
  const { data, info } = await sharp(imageBuffer).removeAlpha().greyscale().raw().toBuffer({ resolveWithObject: true });

  let sum = 0;
  let clipped = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
    if (data[i] <= 2 || data[i] >= 253) clipped++;
  }
  const brightness = sum / data.length;
  const clippedFraction = clipped / data.length;
  const blur = laplacianVariance(data, info.width, info.height);
  const faceRatio = box ? box.h / info.height : 0;

  // Roll = eye-line angle; yaw = nose offset from eye midpoint / eye span.
  let rollDeg = 0;
  let yawRatio = 0;
  if (box?.landmarks?.length === 5) {
    const [rightEye, leftEye, nose] = box.landmarks;
    rollDeg = Math.abs((Math.atan2(leftEye.y - rightEye.y, leftEye.x - rightEye.x) * 180) / Math.PI);
    if (rollDeg > 90) rollDeg = 180 - rollDeg;
    const eyeMidX = (rightEye.x + leftEye.x) / 2;
    const eyeSpan = Math.hypot(leftEye.x - rightEye.x, leftEye.y - rightEye.y) || 1;
    yawRatio = Math.abs(nose.x - eyeMidX) / eyeSpan;
  }

  // Instructions, not diagnoses. Ordered: framing, then light, then pose.
  const reasons: string[] = [];
  if (!box) reasons.push("No face detected. Sit in front of the camera and look straight at it.");
  if (box && faceRatio < THRESHOLDS.minFaceRatio) reasons.push("You are too far away. Move closer, until your head fills about a third of the frame.");
  if (box && faceRatio > THRESHOLDS.maxFaceRatio) reasons.push("You are too close. Sit back a little so your head and shoulders both fit in the frame.");
  if (brightness < THRESHOLDS.minBrightness) reasons.push("It is too dark. Move somewhere brighter, or turn on a light in front of you.");
  if (brightness > THRESHOLDS.maxBrightness) reasons.push("It is too bright. Move out of direct light.");
  if (clippedFraction > THRESHOLDS.maxClipped) reasons.push("There is strong light behind you. Move away from the window, or turn to face it instead.");
  if (yawRatio > THRESHOLDS.maxYawRatio) reasons.push("You are turned away. Look straight into the camera.");
  if (rollDeg > THRESHOLDS.maxRollDeg) reasons.push("Your head is tilted. Keep it level.");
  if (blur < THRESHOLDS.minBlur) reasons.push("The image is blurry. Hold still for a moment before capturing.");

  return {
    ok: reasons.length === 0,
    reasons,
    measurements: {
      blur: Math.round(blur),
      brightness: Math.round(brightness),
      clippedFraction: Number(clippedFraction.toFixed(4)),
      faceRatio: Number(faceRatio.toFixed(3)),
      rollDeg: Number(rollDeg.toFixed(1)),
      yawRatio: Number(yawRatio.toFixed(3)),
    },
  };
}
