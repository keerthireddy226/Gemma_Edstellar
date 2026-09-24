import { useCallback, useRef, useState } from "react";

interface RecordingResult {
  blob: Blob | null;
  mimeType: string;
  transcript: string;
  // SpeechRecognition's raw error (e.g. "network", "no-speech") — a separate pipeline from the recording itself, so it can fail independently (most commonly a blocked network).
  recognitionError: string | null;
  // Wall-clock length of the recording. Used server-side for a free speech-
  // rate (words-per-minute) signal — see fluencySignals.ts.
  durationMs: number;
}

// Live transcription is a progressive enhancement (Chrome/Edge-only) — elsewhere the recording still works, just with an empty transcript.
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
        // "no-speech" is the ordinary silent-mic case (handled elsewhere); anything else (usually "network") is a real recognizer failure, surfaced separately.
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
      const finish = () => {
        const mimeType = recorder?.mimeType ?? "";
        const blob = recorder ? new Blob(chunksRef.current, { type: mimeType }) : null;
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
      // MediaRecorder.stop() throws if it's already inactive — the track
      // ending on its own (permission revoked, mic unplugged mid-recording)
      // stops it before this is ever called, and there's nothing left to
      // request a stop for, so just finalize with whatever was captured.
      if (!recorder || recorder.state === "inactive") {
        finish();
        return;
      }
      recorder.onstop = finish;
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
