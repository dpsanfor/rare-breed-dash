import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandShell } from "@/components/brand/BrandShell";
import {
  type ChatMessage,
  generateConstitution,
  sendInterviewMessage,
} from "@/lib/anthropic";

export const Route = createFileRoute("/leap/constitution")({
  head: () => ({
    meta: [{ title: "Rare Breed Constitution™ · OS Builder" }],
  }),
  component: ConstitutionPage,
});

type Phase = "intro" | "interview" | "generating" | "constitution";

interface ConstitutionSection {
  number: string;
  title: string;
  content: string;
}

function parseConstitution(text: string): ConstitutionSection[] {
  const parts = text.split(/(?=^## \d)/m).filter((p) => p.trim());
  return parts
    .map((part) => {
      const lines = part.trim().split("\n");
      const header = lines[0].replace(/^## /, "").trim();
      const match = header.match(/^(\d+)\.\s+(.+)$/);
      return {
        number: match?.[1] ?? "",
        title: match?.[2] ?? header,
        content: lines.slice(1).join("\n").trim(),
      };
    })
    .filter((s) => s.number);
}

function ConstitutionSection({
  section,
  index,
}: {
  section: ConstitutionSection;
  index: number;
}) {
  const lines = section.content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div
      className="rounded-2xl border border-[rgba(74,18,89,0.12)] bg-white/80 p-8"
      style={{
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div className="mb-5 flex items-baseline gap-4">
        <span className="font-mono text-[11px] tracking-[0.3em] text-[#E0249C]/60">
          {section.number.padStart(2, "0")}
        </span>
        <h3 className="font-display text-3xl tracking-wide text-shimmer md:text-4xl">
          {section.title}
        </h3>
      </div>
      <div className="space-y-2">
        {lines.map((line, i) => (
          <p
            key={i}
            className="font-serif text-base leading-relaxed text-[#1F1623]/80"
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function ConstitutionPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [constitutionText, setConstitutionText] = useState("");
  const [sections, setSections] = useState<ConstitutionSection[]>([]);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedConstitution, setSavedConstitution] = useState<string | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const userMessages = messages.filter((m) => m.role === "user").length;
  const canGenerate = userMessages >= 6;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    if (phase === "interview") {
      inputRef.current?.focus();
    }
  }, [phase]);

  useEffect(() => {
    const saved = localStorage.getItem("rb_constitution");
    if (saved) setSavedConstitution(saved);
  }, []);

  async function startInterview() {
    setPhase("interview");
    setSending(true);
    try {
      const reply = await sendInterviewMessage({ data: { messages: [] } });
      setMessages([{ role: "assistant", content: reply }]);
    } catch {
      setMessages([
        {
          role: "assistant",
          content:
            "Something went wrong connecting to the interview. Check that your ANTHROPIC_API_KEY is set in Vercel.",
        },
      ]);
    }
    setSending(false);
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setSending(true);
    try {
      const reply = await sendInterviewMessage({ data: { messages: updated } });
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Try again.",
        },
      ]);
    }
    setSending(false);
  }

  async function handleGenerate() {
    setPhase("generating");
    try {
      const text = await generateConstitution({ data: { messages } });
      setConstitutionText(text);
      setSections(parseConstitution(text));
      localStorage.setItem("rb_constitution", text);
      setPhase("constitution");
    } catch {
      setConstitutionText(
        "Something went wrong generating your constitution. Try again."
      );
      setPhase("constitution");
    }
  }

  async function saveToSupabase() {
    try {
      await supabase.from("leap_constitution").insert({
        constitution_text: constitutionText,
        messages: messages,
      });
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(constitutionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <BrandShell hideStickyCta>
        <div className="mx-auto max-w-2xl">
          <div className="mt-8">
            <p className="eyebrow mb-6">Rare Breed OS™ · Installation 04</p>
            <h1 className="font-display text-6xl leading-[1.05] tracking-wide text-shimmer md:text-7xl">
              Build Your Rare Breed Constitution™
            </h1>
            <p className="mt-8 font-serif text-xl font-light italic leading-relaxed text-[#4A1259]/65">
              This is a guided AI interview. You'll be asked questions about
              your worldview, identity, decision-making, standards, zone of
              genius, and legacy.
            </p>
            <p className="mt-4 font-serif text-xl font-light italic leading-relaxed text-[#4A1259]/65">
              At the end, you'll receive a personalized Rare Breed Constitution
              that becomes the living document behind every decision you make.
            </p>

            {savedConstitution && (
              <div className="mt-10 rounded-2xl border border-[rgba(74,18,89,0.12)] bg-white/70 p-6">
                <p className="label-soft mb-3">You have a saved Constitution</p>
                <p className="font-serif text-sm italic text-[#4A1259]/60">
                  You can view your existing constitution or start a new
                  interview to generate an updated version.
                </p>
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => {
                      const parsed = parseConstitution(savedConstitution);
                      setConstitutionText(savedConstitution);
                      setSections(parsed);
                      setPhase("constitution");
                    }}
                    className="rounded-full border border-[rgba(74,18,89,0.25)] px-5 py-2.5 font-display text-[13px] tracking-[0.15em] text-[#4A1259] hover:border-[#E0249C]/40"
                  >
                    View Saved Constitution
                  </button>
                </div>
              </div>
            )}

            <div className="mt-12">
              <button
                onClick={startInterview}
                className="inline-flex items-center gap-3 rounded-full px-10 py-5 font-display text-[16px] tracking-[0.2em] text-white transition-transform hover:-translate-y-0.5 active:scale-95"
                style={{
                  background:
                    "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
                  boxShadow: "0 12px 48px -10px rgba(224,36,156,0.45)",
                }}
              >
                Begin the Interview →
              </button>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                "Worldview",
                "Identity",
                "Decision-Making",
                "Standards",
                "Zone of Genius",
                "Legacy",
              ].map((cat, i) => (
                <div
                  key={cat}
                  className="rounded-xl border border-[rgba(74,18,89,0.1)] bg-white/50 px-4 py-3"
                >
                  <span className="font-mono text-[9px] text-[#E0249C]/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-1 font-serif text-sm italic text-[#1F1623]/70">
                    {cat}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </BrandShell>
    );
  }

  // ── GENERATING ─────────────────────────────────────────────────────────────
  if (phase === "generating") {
    return (
      <BrandShell hideStickyCta>
        <div className="mx-auto max-w-xl text-center">
          <div className="mt-24">
            <p className="eyebrow mb-8">Generating</p>
            <div className="mb-10 font-mono text-sm text-[#4A1259]/40">
              <p>Extracting patterns...</p>
              <p className="mt-2">Building your Constitution...</p>
              <p className="mt-2">████████████████ Installing...</p>
            </div>
            <h2 className="font-display text-5xl leading-[1.05] tracking-wide text-shimmer md:text-6xl">
              Your Rare Breed Constitution™
            </h2>
            <p className="mt-6 font-serif text-lg font-light italic text-[#4A1259]/55">
              This takes about 30 seconds.
            </p>
          </div>
        </div>
      </BrandShell>
    );
  }

  // ── CONSTITUTION ───────────────────────────────────────────────────────────
  if (phase === "constitution") {
    return (
      <BrandShell hideStickyCta>
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-14 mt-8">
            <p className="eyebrow mb-6">Rare Breed OS™ · Your Document</p>
            <h1 className="font-display text-6xl leading-[1.05] tracking-wide text-shimmer md:text-7xl">
              Rare Breed Constitution™
            </h1>
            <p className="mt-5 font-serif text-lg font-light italic text-[#4A1259]/55">
              This is your living document. Return to it when clarity breaks
              down.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={copyToClipboard}
                className="rounded-full border border-[rgba(74,18,89,0.2)] bg-white/60 px-5 py-2.5 font-display text-[12px] tracking-[0.15em] text-[#4A1259]/70 hover:border-[#E0249C]/40 hover:text-[#E0249C]"
              >
                {copied ? "Copied" : "Copy Text"}
              </button>
              <button
                onClick={saveToSupabase}
                disabled={saved}
                className={`rounded-full border px-5 py-2.5 font-display text-[12px] tracking-[0.15em] transition ${
                  saved
                    ? "border-[#E0249C]/40 text-[#E0249C]/70"
                    : "border-[rgba(74,18,89,0.2)] bg-white/60 text-[#4A1259]/70 hover:border-[#E0249C]/40 hover:text-[#E0249C]"
                }`}
              >
                {saved ? "Saved to OS" : "Save to OS"}
              </button>
              <button
                onClick={() => {
                  setMessages([]);
                  setConstitutionText("");
                  setSections([]);
                  setSaved(false);
                  setPhase("intro");
                }}
                className="rounded-full border border-[rgba(74,18,89,0.12)] bg-white/40 px-5 py-2.5 font-display text-[12px] tracking-[0.15em] text-[#4A1259]/40 hover:text-[#4A1259]/70"
              >
                New Interview
              </button>
            </div>
          </div>

          {/* Sections */}
          {sections.length > 0 ? (
            <div className="space-y-5">
              {sections.map((section, i) => (
                <ConstitutionSection key={i} section={section} index={i} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[rgba(74,18,89,0.12)] bg-white/80 p-8">
              <p className="font-serif italic text-[#4A1259]/60">
                {constitutionText}
              </p>
            </div>
          )}

          <div className="mt-12 rounded-2xl border border-[rgba(74,18,89,0.12)] bg-[rgba(224,36,156,0.04)] p-8 text-center">
            <p className="font-serif text-base italic text-[#4A1259]/60">
              This document was built from your words. Return to it when you
              need to remember who you are.
            </p>
          </div>
        </div>
      </BrandShell>
    );
  }

  // ── INTERVIEW ──────────────────────────────────────────────────────────────
  return (
    <BrandShell hideStickyCta>
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-10 mt-8 flex items-center justify-between">
          <div>
            <p className="eyebrow">OS Builder · Interview</p>
            <p className="mt-1 font-mono text-[11px] text-[#4A1259]/40">
              {userMessages} responses recorded
            </p>
          </div>
          {canGenerate && (
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-display text-[13px] tracking-[0.18em] text-white transition-transform hover:-translate-y-0.5 active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
                boxShadow: "0 8px 32px -8px rgba(224,36,156,0.4)",
              }}
            >
              Generate Constitution →
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="space-y-6 pb-6">
          {messages.map((msg, i) =>
            msg.role === "assistant" ? (
              <div key={i}>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#E0249C]/50">
                  Rare Breed OS
                </p>
                <div className="rounded-2xl border-l-2 border-[#E0249C]/30 bg-white/70 px-6 py-5">
                  <p className="font-serif text-lg leading-relaxed text-[#1F1623]">
                    {msg.content}
                  </p>
                </div>
              </div>
            ) : (
              <div key={i} className="flex justify-end">
                <div className="max-w-lg rounded-2xl bg-[rgba(74,18,89,0.06)] px-6 py-4">
                  <p className="font-serif text-base leading-relaxed text-[#4A1259]">
                    {msg.content}
                  </p>
                </div>
              </div>
            )
          )}

          {/* Typing indicator */}
          {sending && (
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#E0249C]/50">
                Rare Breed OS
              </p>
              <div className="rounded-2xl border-l-2 border-[#E0249C]/30 bg-white/70 px-6 py-5">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="inline-block h-2 w-2 rounded-full bg-[#E0249C]/40"
                      style={{
                        animation: "pulse 1.4s ease-in-out infinite",
                        animationDelay: `${dot * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-8 mt-4">
          <div className="rounded-2xl border border-[rgba(74,18,89,0.15)] bg-[rgba(245,239,224,0.95)] p-1.5 shadow-[0_8px_40px_-12px_rgba(74,18,89,0.15)] backdrop-blur-xl">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Your answer..."
              rows={3}
              className="w-full resize-none rounded-xl bg-transparent px-4 py-3 font-serif text-base italic leading-relaxed text-[#1F1623] outline-none placeholder:text-[#4A1259]/30"
            />
            <div className="flex items-center justify-between px-3 pb-2">
              <p className="font-mono text-[10px] text-[#4A1259]/30">
                Enter to send · Shift+Enter for new line
              </p>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="rounded-full border border-[#E0249C]/30 bg-[#E0249C]/10 px-4 py-1.5 font-display text-[11px] tracking-[0.15em] text-[#E0249C] hover:bg-[#E0249C]/20 disabled:opacity-40"
              >
                Send →
              </button>
            </div>
          </div>

          {!canGenerate && userMessages > 0 && (
            <p className="mt-3 text-center font-mono text-[10px] text-[#4A1259]/35">
              {6 - userMessages} more{" "}
              {6 - userMessages === 1 ? "response" : "responses"} before you
              can generate your Constitution
            </p>
          )}
        </div>
      </div>
    </BrandShell>
  );
}
