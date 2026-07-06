import { useVoiceInput } from "@/hooks/useVoiceInput";

/**
 * A tappable microphone that dictates speech into a text field.
 * Renders nothing if the browser doesn't support speech recognition.
 */
export function MicButton({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const { listening, toggle, supported } = useVoiceInput(value, onChange);
  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={listening ? "Stop dictation" : "Dictate your answer"}
      title={listening ? "Stop dictation" : "Speak your answer"}
      className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all ${className}`}
      style={{
        background: listening
          ? "linear-gradient(135deg, #E0249C 0%, #ec4899 100%)"
          : "rgba(74,18,89,0.06)",
        color: listening ? "#fff" : "#4A1259",
        boxShadow: listening ? "0 0 0 4px rgba(224,36,156,0.18)" : "none",
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </button>
  );
}
