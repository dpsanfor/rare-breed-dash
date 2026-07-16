import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BrandShell } from "@/components/brand/BrandShell";
import { readProfile, saveConversation, buildPhase2Context } from "@/lib/profile";
import { sendOSChatMessage, type ChatMessage } from "@/lib/anthropic";
import { getUserAccess } from "@/lib/supabase-profile";
import { PhaseLockedScreen } from "@/components/PhaseLockedScreen";

export const Route = createFileRoute("/ten-x-leap/review")({
  head: () => ({ meta: [{ title: "Talk to Your OS · Rare Breed" }] }),
  component: OSReviewPage,
});

const MODULE_ID = "os-review";

function OSReviewPage() {
  const [access, setAccess] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const p = readProfile();
    return p.conversations?.[MODULE_ID] ?? [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(() => {
    const p = readProfile();
    return !!(p.conversations?.[MODULE_ID]?.length);
  });
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef("");

  useEffect(() => {
    getUserAccess().then((a) => setAccess(a.phase2));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const profile = readProfile();
  const context = buildPhase2Context(profile);

  const completedCount = Object.keys(profile).filter((k) =>
    ["bigger_vision", "release_plan", "constitution", "zone_of_genius", "ten_x_business", "ten_x_calendar", "dream_client_decision", "offer_map", "brand_direction", "operating_manual"].includes(k) && profile[k as keyof typeof profile]
  ).length;

  async function beginSession() {
    setStarted(true);
    setLoading(true);
    try {
      const reply = await sendOSChatMessage({ data: { messages: [], context } });
      const initial: ChatMessage[] = [{ role: "assistant", content: reply }];
      setMessages(initial);
      saveConversation(MODULE_ID, initial);
    } catch {
      setError("Failed to connect. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    if (listening) { recognitionRef.current?.stop(); setListening(false); }
    setInput("");
    const updated: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(updated);
    saveConversation(MODULE_ID, updated);
    setLoading(true);
    setError(null);
    try {
      const reply = await sendOSChatMessage({ data: { messages: updated, context } });
      const withReply: ChatMessage[] = [...updated, { role: "assistant", content: reply }];
      setMessages(withReply);
      saveConversation(MODULE_ID, withReply);
    } catch {
      setError("Something went wrong. Try again.");
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  }

  function clearSession() {
    const raw = localStorage.getItem("rare_breed_profile");
    const p = raw ? JSON.parse(raw) : {};
    if (p.conversations) delete p.conversations[MODULE_ID];
    localStorage.setItem("rare_breed_profile", JSON.stringify(p));
    setMessages([]);
    setStarted(false);
  }

  function toggleMic() {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US"; rec.continuous = true; rec.interimResults = true;
    baseTextRef.current = input;
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) baseTextRef.current = (baseTextRef.current + " " + t).trim();
        else interim += t;
      }
      setInput(interim ? (baseTextRef.current + " " + interim).trim() : baseTextRef.current);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec; rec.start(); setListening(true);
  }

  if (access === null) return null;
  if (!access) return <PhaseLockedScreen phase="10x-leap" />;

  // Pre-session
  if (!started) {
    return (
      <BrandShell hideStickyCta>
        <div className="mb-10 mt-8">
          <div className="relative flex items-center justify-center mb-6">
            <Link
              to="/ten-x-leap"
              className="absolute left-0 font-mono text-[13px] text-[#4A1259]/45 hover:text-[#E0249C] transition-colors"
            >
              ←
            </Link>
            <Link
              to="/ten-x-leap"
              className="font-display text-shimmer hover:opacity-75 transition-opacity"
              style={{ fontSize: "clamp(22px, 5vw, 42px)", letterSpacing: "0.1em" }}
            >
              The 10X Leap™
            </Link>
          </div>
          <h1
            className="font-display text-shimmer leading-[0.92] tracking-wide text-center mb-6"
            style={{ fontSize: "clamp(38px, 8vw, 66px)" }}
          >
            Talk to Your OS
          </h1>
          <p
            className="text-center font-serif italic text-[#4A1259]/70 max-w-xl mx-auto mb-10"
            style={{ fontSize: "clamp(19px, 2.5vw, 22px)" }}
          >
            A free-form coaching conversation where the AI has read all{" "}
            <strong className="not-italic font-semibold text-[#4A1259]/90">
              {completedCount} of your completed elements
            </strong>{" "}
            at once. Review, pressure-test, synthesize, or ask anything about
            your operating system.
          </p>
        </div>

        <div className="mb-10 max-w-2xl mx-auto space-y-4">
          <div
            className="rounded-2xl p-6"
            style={{ background: "white", border: "1px solid rgba(74,18,89,0.12)" }}
          >
            <p className="eyebrow mb-3">What you can do here</p>
            <ul className="space-y-2.5">
              {[
                "Ask how your elements connect or contradict each other",
                "Pressure-test a business decision against your full OS",
                "Explore what your OS is saying about a specific offer, client, or direction",
                "Ask for patterns across your Vision, Zone of Genius, and Dream Client",
                "Get coaching on anything — priced through your actual OS, not generic advice",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#E0249C]" />
                  <span className="font-serif text-[18px] leading-snug text-[#1F1623]/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {completedCount === 0 && (
            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(224,36,156,0.05)", border: "1px solid rgba(224,36,156,0.2)" }}
            >
              <p className="font-serif text-[17px] italic text-[#4A1259]/70">
                You haven't completed any elements yet. The AI will still work with
                you, but it will have less to draw from. Complete a few elements first
                for the most specific coaching.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={beginSession}
            className="inline-flex items-center gap-2 rounded-full px-12 py-5 font-display tracking-[0.14em] text-white"
            style={{
              fontSize: "clamp(16px, 3vw, 20px)",
              background: "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
              boxShadow: "0 8px 32px -8px rgba(224,36,156,0.4)",
            }}
          >
            Begin Review →
          </button>
        </div>
      </BrandShell>
    );
  }

  // Chat session
  return (
    <BrandShell hideStickyCta>
      <div className="mb-8 mt-6">
        <div className="relative flex items-center justify-center mb-5">
          <Link
            to="/ten-x-leap"
            className="absolute left-0 font-mono text-[13px] text-[#4A1259]/45 hover:text-[#E0249C] transition-colors"
          >
            ←
          </Link>
          <Link
            to="/ten-x-leap"
            className="font-display text-shimmer hover:opacity-75 transition-opacity"
            style={{ fontSize: "clamp(20px, 4vw, 36px)", letterSpacing: "0.1em" }}
          >
            The 10X Leap™
          </Link>
        </div>
        <div className="flex items-center justify-center gap-3">
          <div
            className="h-2 w-2 rounded-full"
            style={{ background: "linear-gradient(135deg, #E0249C, #c9a84c)" }}
          />
          <p className="font-mono text-[13px] uppercase tracking-[0.22em] text-[#4A1259]/55">
            OS Review · {completedCount} elements loaded
          </p>
        </div>
      </div>

      <div className="mb-4 max-h-[560px] min-h-[320px] overflow-y-auto rounded-2xl border border-[rgba(74,18,89,0.12)] bg-white/80 p-6">
        {messages.length === 0 && loading && (
          <div className="flex items-center gap-1 text-[#4A1259]/40">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: "150ms" }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: "300ms" }} />
          </div>
        )}
        <div className="space-y-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                style={{ fontSize: "19px" }}
                className={`max-w-[85%] rounded-2xl px-5 py-4 font-serif leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#E0249C]/10 text-[#1F1623]"
                    : "bg-[rgba(74,18,89,0.06)] text-[#1F1623]/90"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && messages.length > 0 && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl bg-[rgba(74,18,89,0.06)] px-5 py-4">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#4A1259]/40" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#4A1259]/40" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#4A1259]/40" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {error && (
        <p className="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
          }}
          placeholder="Ask anything about your OS, a business decision, a pattern you're noticing..."
          rows={3}
          className="flex-1 resize-none rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white/80 px-5 py-3.5 font-serif text-[17px] text-[#1F1623] outline-none placeholder:text-[#4A1259]/30 focus:border-[#E0249C]/40"
        />
        <div className="flex flex-col gap-2">
          <button
            onClick={toggleMic}
            title={listening ? "Stop recording" : "Speak"}
            className="flex items-center justify-center rounded-2xl border px-4 py-2 transition-all"
            style={{
              borderColor: listening ? "#E0249C" : "rgba(74,18,89,0.2)",
              background: listening ? "rgba(224,36,156,0.12)" : "rgba(255,255,255,0.7)",
              boxShadow: listening ? "0 0 0 3px rgba(224,36,156,0.2)" : "none",
            }}
          >
            {listening ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" fill="#E0249C">
                  <animate attributeName="r" values="5;8;5" dur="1s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />
                </circle>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(74,18,89,0.55)" strokeWidth="1.8" strokeLinecap="round">
                <rect x="9" y="2" width="6" height="11" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="9" y1="22" x2="15" y2="22" />
              </svg>
            )}
          </button>
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="rounded-2xl border border-[#E0249C]/30 bg-[#E0249C]/10 px-5 py-2 font-display text-sm tracking-[0.12em] text-[#E0249C] hover:bg-[#E0249C]/20 disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-[rgba(74,18,89,0.08)] pt-6">
        <Link
          to="/ten-x-leap"
          className="font-mono text-[13px] uppercase tracking-[0.22em] text-[#4A1259]/40 hover:text-[#E0249C] transition-colors"
        >
          ← Back to Elements
        </Link>
        <button
          onClick={clearSession}
          className="font-mono text-[13px] uppercase tracking-[0.22em] text-[#4A1259]/35 hover:text-[#E0249C] transition-colors"
        >
          Clear conversation
        </button>
      </div>
    </BrandShell>
  );
}
