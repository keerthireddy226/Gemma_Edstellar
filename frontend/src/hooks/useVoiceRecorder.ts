import { useCallback, useRef, useState } from "react";

export interface RecordingResult {
  blob: Blob | null;
  mimeType: string;
  transcript: string;
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
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    transcriptRef.current = "";
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
      recognition.onerror = () => {
        // Recording still succeeds without a transcript.
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
        resolve({ blob: null, mimeType: "", transcript: "" });
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
        resolve({ blob, mimeType, transcript: transcriptRef.current });
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
