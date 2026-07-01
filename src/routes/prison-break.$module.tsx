import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BrandShell } from "@/components/brand/BrandShell";
import { getModule, PHASES } from "@/lib/program-data";
import {
  readProfile,
  saveArtifact,
  saveConversation,
  markModuleComplete,
  isModuleComplete,
  buildPhase1Context,
  type UserProfile,
} from "@/lib/profile";
import {
  sendModuleMessage,
  generateModuleReport,
  generateLanguageReport,
  generateGoodGirlOS,
  type ChatMessage,
} from "@/lib/anthropic";

export const Route = createFileRoute("/prison-break/$module")({
  component: PhaseOneModule,
});

// ─── SYNTHESIS MODULE RUNNER ──────────────────────────────────────────────────

function SynthesisRunner({
  moduleId,
  outputKey,
  outputName,
  nextDecision,
  profile,
  onComplete,
}: {
  moduleId: string;
  outputKey: string;
  outputName: string;
  nextDecision?: string;
  profile: UserProfile;
  onComplete: () => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [artifact, setArtifact] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const existing = profile[outputKey as keyof UserProfile] as string | undefined;

  useEffect(() => {
    if (existing) setArtifact(existing);
  }, [existing]);

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      let result = "";
      if (moduleId === "language-detection") {
        const conversations = profile.conversations ?? {};
        const allUserText = Object.entries(conversations)
          .flatMap(([id, msgs]) =>
            msgs
              .filter((m) => m.role === "user")
              .map((m) => `[${id}]: ${m.content}`)
          )
          .join("\n\n");
        result = await generateLanguageReport({ data: { previousText: allUserText } });
      } else if (moduleId === "good-girl-os") {
        const ctx = buildPhase1Context(profile);
        result = await generateGoodGirlOS({ data: { phase1Context: ctx } });
      } else {
        setError("Unknown synthesis module.");
        setGenerating(false);
        return;
      }
      saveArtifact(outputKey as keyof UserProfile, result);
      markModuleComplete(`phase1_${moduleId}`);
      setArtifact(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  const complete = !!artifact;

  return (
    <div>
      {!artifact && (
        <div className="mb-10 rounded-2xl border border-[rgba(74,18,89,0.12)] bg-white/80 p-10">
          <p className="eyebrow mb-4">What gets synthesized</p>
          <p className="font-serif text-lg leading-relaxed text-[#1F1623]/75 italic">
            {moduleId === "language-detection"
              ? "Every response you've given across all previous modules. The AI reads your words, not your intentions, and surfaces the patterns. So that you see what you've actually been saying, not just what you meant to say."
              : "Every artifact, every conversation, every answer from Phase One. This is the synthesis of everything you've revealed."}
          </p>
        </div>
      )}

      {artifact && (
        <div className="mb-10 rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white/90 p-10">
          <p className="eyebrow mb-4">{outputName}</p>
          <div className="prose prose-sm max-w-none font-serif text-[#1F1623]/85 leading-relaxed">
            {artifact.split("\n").map((line, i) => {
              if (line.startsWith("## ")) {
                return (
                  <h3
                    key={i}
                    className="font-display mt-8 mb-2 text-xl tracking-wide text-[#1F1623]"
                  >
                    {line.replace("## ", "")}
                  </h3>
                );
              }
              if (line.trim() === "") return <br key={i} />;
              return (
                <p key={i} className="mb-2">
                  {line}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-5 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {!artifact && (
        <button
          onClick={generate}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-[13px] tracking-[0.18em] text-white disabled:opacity-60"
          style={{
            background:
              "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
            boxShadow: "0 8px 32px -8px rgba(224,36,156,0.4)",
          }}
        >
          {generating ? "Analyzing..." : `Generate ${outputName}`}
        </button>
      )}

      {complete && (
        <div className="mt-8">
          {nextDecision && (
            <div className="mb-6 rounded-2xl border border-[rgba(74,18,89,0.1)] bg-white/60 p-6">
              <p className="eyebrow mb-2">Decision Installed</p>
              <p className="font-serif text-[18px] italic text-[#1F1623]/90">
                {nextDecision}
              </p>
            </div>
          )}
          <button
            onClick={onComplete}
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-[13px] tracking-[0.18em] text-white"
            style={{
              background:
                "linear-gradient(135deg, #4A1259 0%, #E0249C 100%)",
              boxShadow: "0 8px 32px -8px rgba(74,18,89,0.35)",
            }}
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── CONVERSATION MODULE RUNNER ───────────────────────────────────────────────

const PHASE1_SAVED_TO = ["Good Girl Prison Break™", "The 10X Leap™", "Rare Breed Operating Manual™"];

function ConversationRunner({
  moduleId,
  outputKey,
  outputName,
  futureUse,
  openingQuestion,
  mission,
  beginCta,
  danasPrinciple,
  nextDecision,
  generatePrompt,
  profile,
  onComplete,
}: {
  moduleId: string;
  outputKey: string;
  outputName: string;
  futureUse?: string;
  openingQuestion?: string;
  mission?: string[];
  beginCta?: string;
  danasPrinciple?: string;
  nextDecision?: string;
  generatePrompt?: string;
  profile: UserProfile;
  onComplete: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [artifact, setArtifact] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef("");

  function toggleMic() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    baseTextRef.current = input;
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
      setInput(interim ? (baseTextRef.current + " " + interim).trim() : baseTextRef.current);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }

  const existingArtifact = profile[outputKey as keyof UserProfile] as string | undefined;
  const existingConvo = profile.conversations?.[moduleId];
  const userTurns = messages.filter((m) => m.role === "user").length;
  const canGenerate = userTurns >= 4 && !artifact;

  useEffect(() => {
    if (existingArtifact) {
      setArtifact(existingArtifact);
      setStarted(true);
    } else if (existingConvo && existingConvo.length > 0) {
      setMessages(existingConvo);
      setStarted(true);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function initConversation() {
    if (openingQuestion) {
      const initial: ChatMessage[] = [{ role: "assistant", content: openingQuestion }];
      setMessages(initial);
      saveConversation(moduleId, initial);
      return;
    }
    setLoading(true);
    try {
      const greeting = await sendModuleMessage({
        data: { moduleId, messages: [{ role: "user", content: "I'm ready to begin." }] },
      });
      const initial: ChatMessage[] = [{ role: "assistant", content: greeting }];
      setMessages(initial);
      saveConversation(moduleId, initial);
    } catch {
      setError("Failed to start conversation.");
    } finally {
      setLoading(false);
    }
  }

  async function beginSession() {
    setStarted(true);
    await initConversation();
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    }
    setInput("");
    const updated: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(updated);
    saveConversation(moduleId, updated);
    setLoading(true);
    try {
      const apiMessages: ChatMessage[] =
        updated[0]?.role === "assistant"
          ? [{ role: "user", content: "I'm ready to begin." }, ...updated]
          : updated;
      const reply = await sendModuleMessage({
        data: { moduleId, messages: apiMessages },
      });
      const withReply: ChatMessage[] = [
        ...updated,
        { role: "assistant", content: reply },
      ];
      setMessages(withReply);
      saveConversation(moduleId, withReply);
    } catch (e) {
      const msg = e instanceof Error ? e.message : typeof e === "object" ? JSON.stringify(e) : String(e);
      setError(msg || "Something went wrong. Try again.");
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const result = await generateModuleReport({
        data: { moduleId, messages, generatePrompt },
      });
      saveArtifact(outputKey as keyof UserProfile, result);
      markModuleComplete(`phase1_${moduleId}`);
      setArtifact(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  // ── Synthesis view ──────────────────────────────────────────────────────────
  if (artifact) {
    return (
      <div>
        <div className="mb-10 rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white/90 p-10">
          <p className="eyebrow mb-3">{outputName}</p>
          <div className="prose prose-sm max-w-none font-serif leading-relaxed text-[#1F1623]/85">
            {artifact.split("\n").map((line, i) => {
              if (line.startsWith("## ")) {
                return (
                  <h3 key={i} className="font-display mt-8 mb-2 text-xl tracking-wide text-[#1F1623]">
                    {line.replace("## ", "")}
                  </h3>
                );
              }
              if (line.trim() === "") return <br key={i} />;
              return <p key={i} className="mb-2">{line}</p>;
            })}
          </div>

          <div className="mt-10 border-t border-[rgba(74,18,89,0.08)] pt-8">
            <p className="eyebrow mb-4">Saved To</p>
            <div className="space-y-2.5">
              {PHASE1_SAVED_TO.map((dest) => (
                <div key={dest} className="flex items-center gap-3">
                  <span className="font-mono text-[#c9a84c]">✓</span>
                  <span className="font-serif text-[15px] text-[#4A1259]/70">{dest}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {nextDecision && (
          <div className="mb-6 rounded-2xl border border-[rgba(74,18,89,0.1)] bg-white/60 p-6">
            <p className="eyebrow mb-2">Decision Installed</p>
            <p className="font-serif text-[18px] italic text-[#1F1623]/90">{nextDecision}</p>
          </div>
        )}

        <button
          onClick={onComplete}
          className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-[13px] tracking-[0.18em] text-white"
          style={{
            background: "linear-gradient(135deg, #4A1259 0%, #E0249C 100%)",
            boxShadow: "0 8px 32px -8px rgba(74,18,89,0.35)",
          }}
        >
          Continue →
        </button>
      </div>
    );
  }

  // ── Pre-session view ────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div>
        <div className="mb-5 rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white/70 p-8">
          <p className="eyebrow mb-3">What You'll Walk Away With</p>
          <p className="font-display text-[32px] leading-tight tracking-[0.03em] text-[#1F1623] mb-3">{outputName}</p>
          {futureUse && (
            <p className="font-serif text-[22px] italic leading-relaxed text-[#4A1259]/65">{futureUse}</p>
          )}
        </div>

        {danasPrinciple && (
          <div className="mb-5 rounded-2xl border border-[rgba(74,18,89,0.1)] bg-white/60 p-7">
            <p className="eyebrow mb-3">Rare Breed Principle</p>
            <p className="font-serif text-[20px] italic leading-snug text-[#1F1623]/90">
              "{danasPrinciple}"
            </p>
          </div>
        )}

        {mission && mission.length > 0 && (
          <div className="mb-8 rounded-2xl border border-[rgba(74,18,89,0.1)] bg-white/60 p-7">
            <p className="eyebrow mb-4">Today's Mission</p>
            <p className="mb-4 font-serif text-[21px] text-[#1F1623]/75">
              By the end of this session you'll know:
            </p>
            <ul className="mb-5 space-y-3">
              {mission.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#E0249C]" />
                  <span className="font-serif text-[21px] leading-snug text-[#1F1623]/80">{item}</span>
                </li>
              ))}
            </ul>
            <p className="font-serif text-[18px] italic text-[#4A1259]/50">
              This module contributes directly to your Rare Breed Operating Manual™.
            </p>
          </div>
        )}

        <button
          onClick={beginSession}
          className="inline-flex items-center gap-2 rounded-full px-10 py-5 font-display text-[15px] tracking-[0.18em] text-white"
          style={{
            background: "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
            boxShadow: "0 12px 40px -8px rgba(224,36,156,0.45)",
          }}
        >
          {beginCta ?? "Begin Session"} →
        </button>

        <div className="mt-10 pt-8 border-t border-[rgba(74,18,89,0.08)]">
          <Link
            to="/prison-break/"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#4A1259]/40 hover:text-[#E0249C] transition-colors"
          >
            ← Back to Phase One
          </Link>
        </div>
      </div>
    );
  }

  // ── Chat view ───────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{ background: "linear-gradient(135deg, #E0249C, #c9a84c)" }}
        />
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#4A1259]/55">
          Rare Breed AI
        </p>
      </div>

      <div className="mb-4 max-h-[520px] min-h-[280px] overflow-y-auto rounded-2xl border border-[rgba(74,18,89,0.12)] bg-white/80 p-6">
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
                style={{ fontSize: "21px" }}
                className={`max-w-[82%] rounded-2xl px-5 py-3.5 font-serif leading-relaxed ${
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
              <div className="flex items-center gap-1 rounded-2xl bg-[rgba(74,18,89,0.06)] px-5 py-3.5">
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
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Your answer..."
          rows={3}
          className="flex-1 resize-none rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white/80 px-5 py-3.5 font-serif text-[17px] text-[#1F1623] outline-none placeholder:text-[#4A1259]/30 focus:border-[#E0249C]/40"
        />
        <div className="flex flex-col gap-2">
          <button
            onClick={toggleMic}
            title={listening ? "Stop recording" : "Speak your answer"}
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
            Continue
          </button>
        </div>
      </div>

      {canGenerate && (
        <div className="mt-8 border-t border-[rgba(74,18,89,0.08)] pt-8">
          <p className="mb-3 font-serif text-[16px] italic text-[#4A1259]/60">
            You've given the AI enough to build your {outputName}. Ready when you are.
          </p>
          <button
            onClick={generate}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-[13px] tracking-[0.18em] text-white disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
              boxShadow: "0 8px 32px -8px rgba(224,36,156,0.4)",
            }}
          >
            {generating ? "Generating..." : `Generate ${outputName} →`}
          </button>
        </div>
      )}

      {!canGenerate && userTurns > 0 && (
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#4A1259]/30">
          {4 - userTurns} more {4 - userTurns === 1 ? "response" : "responses"} before report unlocks
        </p>
      )}

      <div className="mt-10 pt-8 border-t border-[rgba(74,18,89,0.08)]">
        <Link
          to="/prison-break/"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#4A1259]/40 hover:text-[#E0249C] transition-colors"
        >
          ← Back to Phase One
        </Link>
      </div>
    </div>
  );
}

// ─── CONTEXT MODULE RUNNER ────────────────────────────────────────────────────

function ContextRunner({
  purpose,
  danasPrinciple,
  nextDecision,
  moduleId,
  onComplete,
}: {
  purpose: string;
  danasPrinciple?: string;
  nextDecision?: string;
  moduleId: string;
  onComplete: () => void;
}) {
  const alreadyComplete = isModuleComplete(`phase1_${moduleId}`);

  function handleContinue() {
    markModuleComplete(`phase1_${moduleId}`);
    onComplete();
  }

  return (
    <div>
      <div className="mb-8 rounded-2xl border border-[rgba(74,18,89,0.12)] bg-white/80 p-10">
        <p className="font-serif text-xl leading-relaxed text-[#1F1623]/80 italic">
          {purpose}
        </p>
      </div>
      {danasPrinciple && (
        <div className="mb-8 rounded-2xl border border-[rgba(74,18,89,0.1)] bg-white/60 p-6">
          <p className="eyebrow mb-2">Rare Breed Principle</p>
          <p className="font-serif text-[18px] italic text-[#1F1623]/90">
            "{danasPrinciple}"
          </p>
        </div>
      )}
      {nextDecision && (
        <div className="mb-8 rounded-2xl border border-[rgba(74,18,89,0.1)] bg-white/60 p-6">
          <p className="eyebrow mb-2">Decision to Hold</p>
          <p className="font-serif text-[18px] italic text-[#1F1623]/90">
            {nextDecision}
          </p>
        </div>
      )}
      <button
        onClick={handleContinue}
        className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-[13px] tracking-[0.18em] text-white"
        style={{
          background:
            "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
          boxShadow: "0 8px 32px -8px rgba(224,36,156,0.4)",
        }}
      >
        {alreadyComplete ? "Continue →" : "Begin Installation →"}
      </button>
    </div>
  );
}

// ─── MAIN ROUTE ───────────────────────────────────────────────────────────────

function PhaseOneModule() {
  const { module: moduleParam } = Route.useParams();
  const moduleNumber = parseInt(moduleParam, 10);
  const mod = getModule("prison-break", moduleNumber);
  const [profile, setProfile] = useState<UserProfile>({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    setProfile(readProfile());
  }, []);

  if (!mod) {
    return (
      <BrandShell>
        <div className="py-20 text-center">
          <p className="font-display text-2xl text-[#E0249C]">Module not found.</p>
          <Link to="/prison-break/" className="mt-6 inline-block font-mono text-sm text-[#4A1259]/60 hover:text-[#E0249C]">
            Back to Phase One
          </Link>
        </div>
      </BrandShell>
    );
  }

  const phase = PHASES[0];
  const totalModules = phase.modules.length;
  const isComplete = done || isModuleComplete(`phase1_${mod.id}`);
  const nextModule = moduleNumber < totalModules ? moduleNumber + 1 : null;

  function handleComplete() {
    setDone(true);
    setProfile(readProfile());
  }

  return (
    <BrandShell hideStickyCta>
      {/* Header */}
      <div className="mb-10 mt-8">
        <div className="mb-5 flex items-center gap-3">
          <Link
            to="/prison-break/"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#4A1259]/55 hover:text-[#E0249C] transition-colors"
          >
            ← Back
          </Link>
          <span className="font-mono text-[11px] text-[#4A1259]/25">/</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#4A1259]/40">
            Module {mod.number}
          </span>
        </div>

        <div className="mb-4 flex items-center gap-4">
          <span className="font-mono text-[16px] tracking-[0.22em] text-[#E0249C]">
            {mod.number.toString().padStart(2, "0")} / {totalModules.toString().padStart(2, "0")}
          </span>
          {isComplete && (
            <span className="rounded-full border border-[rgba(201,168,76,0.55)] px-3 py-1 font-mono text-[12px] uppercase tracking-[0.2em] text-[#c9a84c]">
              Installed
            </span>
          )}
        </div>

        <h1 className="font-display text-[24px] leading-[1.05] tracking-wide text-shimmer sm:text-[32px] md:text-[40px]">
          {mod.name}
        </h1>
        <p className="mt-4 font-serif text-[20px] font-light italic text-[#4A1259]/80">
          {mod.tagline}
        </p>
      </div>

      {/* Progress strip */}
      <div className="mb-12 grid grid-cols-7 gap-2">
        {phase.modules.map((m) => {
          const complete = isModuleComplete(`phase1_${m.id}`);
          const current = m.number === moduleNumber;
          return (
            <Link
              key={m.id}
              to="/prison-break/$module"
              params={{ module: String(m.number) }}
              title={`Module ${m.number}: ${m.name}`}
              className="group relative h-3 rounded-full transition-all hover:opacity-80"
              style={{
                background: complete
                  ? "#E0249C"
                  : current
                    ? "rgba(224,36,156,0.45)"
                    : "rgba(74,18,89,0.12)",
              }}
            />
          );
        })}
      </div>

      {/* Module content — context modules auto-redirect, never render here */}
      {mod.type === "conversation" && (
        <ConversationRunner
          moduleId={mod.id}
          outputKey={mod.outputKey!}
          outputName={mod.outputName!}
          futureUse={mod.futureUse}
          openingQuestion={mod.openingQuestion}
          mission={mod.mission}
          beginCta={mod.beginCta}
          danasPrinciple={mod.danasPrinciple}
          nextDecision={mod.nextDecision}
          generatePrompt={mod.generatePrompt}
          profile={profile}
          onComplete={handleComplete}
        />
      )}

      {mod.type === "synthesis" && (
        <SynthesisRunner
          moduleId={mod.id}
          outputKey={mod.outputKey!}
          outputName={mod.outputName!}
          nextDecision={mod.nextDecision}
          profile={profile}
          onComplete={handleComplete}
        />
      )}

      {/* Post-completion nav */}
      {(done || isComplete) && (
        <div className="mt-12 flex items-center gap-6 border-t border-[rgba(74,18,89,0.08)] pt-10">
          {nextModule ? (
            <Link
              to="/prison-break/$module"
              params={{ module: String(nextModule) }}
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-[13px] tracking-[0.18em] text-white"
              style={{
                background:
                  "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
                boxShadow: "0 8px 32px -8px rgba(224,36,156,0.4)",
              }}
            >
              Next: Module {nextModule} →
            </Link>
          ) : (
            <Link
              to="/ten-x-leap/$module"
              params={{ module: "1" }}
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-[13px] tracking-[0.18em] text-white"
              style={{
                background:
                  "linear-gradient(135deg, #4A1259 0%, #E0249C 100%)",
                boxShadow: "0 8px 32px -8px rgba(74,18,89,0.35)",
              }}
            >
              Enter Phase Two →
            </Link>
          )}
          <Link
            to="/prison-break/"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#4A1259]/40 hover:text-[#E0249C]"
          >
            All Modules
          </Link>
        </div>
      )}
    </BrandShell>
  );
}
