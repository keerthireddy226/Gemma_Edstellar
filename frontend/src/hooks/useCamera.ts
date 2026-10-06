import { useCallback, useRef, useState } from "react";

// Stops every track (not just clearing srcObject) so the camera light
// actually turns off between captures.
export function useCamera() {
  const [active, setActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Guards against StrictMode's double-invoked effects: if stop() (or a newer
  // start()) runs before this call's getUserMedia() resolves, its stream gets
  // shut down immediately instead of silently overwriting the ref and leaking.
  const generationRef = useRef(0);

  const start = useCallback(async () => {
    const generation = ++generationRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 960, facingMode: "user" } });
    if (generation !== generationRef.current) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    streamRef.current = stream;
    if (videoRef.current) videoRef.current.srcObject = stream;
    setActive(true);
  }, []);

  const stop = useCallback(() => {
    generationRef.current++;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }, []);

  // Draws the current video frame to an offscreen canvas and returns it as
  // base64 JPEG — the same shape every face-check endpoint expects.
  const capture = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.92).split(",")[1];
  }, []);

  return { active, videoRef, start, stop, capture };
}
