import { useCallback, useRef, useState } from "react";

export interface RecordingResult {
  blob: Blob | null;
  mimeType: string;
  transcript: string;
  // Only set when SpeechRecognition itself reported an error (its raw
  // `event.error` string — e.g. "network", "not-allowed", "service-not-
  // allowed", "no-speech"). SpeechRecognition is a completely separate
  // pipeline from the audio recording — it streams the mic to the
  // browser's own speech service over the network — so it can fail for
  // reasons that have nothing to do with the recording itself (most
  // commonly a blocked/unreachable network on a locked-down machine). Null
  // means either it succeeded, or the browser doesn't support it at all.
  recognitionError: string | null;
  // Wall-clock length of the recording. Used server-side for a free speech-
  // rate (words-per-minute) signal — see fluencySignals.ts.
  durationMs: number;
}

// Live transcription is a progressive enhancement — SpeechRecognition is
// Chrome/Edge-only today, so on browsers without it the recording still
// works, it just comes back with an empty transcript (submitted with only
// the audio, which the backend already treats as "pending review").
export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const recognitionErrorRef = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef(0);

  const start = useCallback(async () => {
    transcriptRef.current = "";
    recognitionErrorRef.current = null;
    startedAtRef.current = Date.now();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
    const recorder = new MediaRecorder(stream, { mimeType });
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorderRef.current = recorder;
    recorder.start();

    const SpeechRecognitionCtor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionCtor) {
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.onresult = (event: any) => {
        let text = "";
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        transcriptRef.current = text.trim();
      };
      recognition.onerror = (event: any) => {
        // "no-speech" just means the recognizer genuinely heard nothing —
        // that's the ordinary silent-mic case already handled elsewhere,
        // not a failure of the recognizer itself. Anything else (most
        // commonly "network" — this API streams audio to the browser's own
        // speech service over the internet, so it fails outright on a
        // blocked/unreachable network, independent of the recording, mic,
        // or volume all being fine) gets surfaced so the UI can tell the
        // two apart instead of showing the same generic message for both.
        if (event?.error && event.error !== "no-speech") {
          recognitionErrorRef.current = event.error;
        }
      };
      recognitionRef.current = recognition;
      recognition.start();
    }

    setRecording(true);
  }, []);

  const stop = useCallback((): Promise<RecordingResult> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder) {
        resolve({ blob: null, mimeType: "", transcript: "", recognitionError: null, durationMs: 0 });
        return;
      }
      recorder.onstop = () => {
        const mimeType = recorder.mimeType;
        const blob = new Blob(chunksRef.current, { type: mimeType });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        try {
          recognitionRef.current?.stop();
        } catch {
          // already stopped
        }
        setRecording(false);
        resolve({
          blob,
          mimeType,
          transcript: transcriptRef.current,
          recognitionError: recognitionErrorRef.current,
          durationMs: Date.now() - startedAtRef.current,
        });
      };
      recorder.stop();
    });
  }, []);

  return { recording, start, stop };
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function speak(segments: string[]): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window) || segments.length === 0) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    let i = 0;
    function next() {
      if (i >= segments.length) {
        resolve();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(segments[i]);
      utterance.rate = 0.95;
      utterance.onend = () => {
        i += 1;
        next();
      };
      utterance.onerror = () => {
        i += 1;
        next();
      };
      window.speechSynthesis.speak(utterance);
    }
    next();
  });
}
