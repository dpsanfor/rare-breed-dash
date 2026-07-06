import { useCallback, useRef, useState } from "react";

/**
 * Voice-to-text input via the browser SpeechRecognition API.
 * Appends dictated speech to the current text value through the provided
 * onChange setter. Returns whether it's supported, whether it's currently
 * listening, and a toggle to start/stop.
 */
export function useVoiceInput(value: string, onChange: (v: string) => void) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef("");
  const valueRef = useRef(value);
  valueRef.current = value;

  const supported =
    typeof window !== "undefined" &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const toggle = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    baseTextRef.current = valueRef.current;
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          baseTextRef.current = (baseTextRef.current + " " + t).trim();
        } else {
          interim += t;
        }
      }
      onChange(
        interim ? (baseTextRef.current + " " + interim).trim() : baseTextRef.current
      );
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }, [listening, onChange]);

  return { listening, toggle, supported };
}
