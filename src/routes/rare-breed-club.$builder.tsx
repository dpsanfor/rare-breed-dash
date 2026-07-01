import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BrandShell } from "@/components/brand/BrandShell";
import { PHASES } from "@/lib/program-data";
import {
  readProfile,
  saveArtifact,
  saveConversation,
  markModuleComplete,
  isModuleComplete,
  buildPhase2Context,
  type UserProfile,
} from "@/lib/profile";
import { sendModuleMessage, generateModuleReport, type ChatMessage } from "@/lib/anthropic";
import { getUserAccess } from "@/lib/supabase-profile";
import { PhaseLockedScreen } from "@/components/PhaseLockedScreen";

export const Route = createFileRoute("/rare-breed-club/$builder")({
  component: RareBreedClubBuilder,
});

function RareBreedClubBuilder() {
  const { builder: builderParam } = Route.useParams();
  const builderNumber = parseInt(builderParam, 10);
  const phase3 = PHASES[2];
  const mod = phase3.modules.find((m) => m.number === builderNumber);
  const [profile, setProfile] = useState<UserProfile>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [artifact, setArtifact] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [listening, setListening] = useState(false);
  const [access, setAccess] = useState<boolean | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    getUserAccess().then((a) => setAccess(a.phase3));
    const p = readProfile();
    setProfile(p);
    if (!mod) return;
    const existingArtifact = p[mod.outputKey as keyof UserProfile] as string | undefined;
    const existingConvo = p.conversations?.[mod.id];
    if (existingArtifact) {
      setArtifact(existingArtifact);
    } else if (existingConvo && existingConvo.length > 0) {
      setMessages(existingConvo);
    } else {
      initConversation(p, mod.id);
    }
  }, []);

  if (access === null) return null;
  if (!access) return <PhaseLockedScreen phase="rare-breed-club" />;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function initConversation(p: UserProfile, moduleId: string) {
    setLoading(true);
    try {
      const ctx = buildPhase2Context(p);
      const openingNote = ctx.trim()
        ? `I'm ready to begin. Here is my complete Rare Breed Operating Manual and all previous artifacts:\n\n${ctx.slice(0, 3000)}`
        : "I'm ready to begin.";
      const greeting = await sendModuleMessage({
        data: {
          moduleId,
          messages: [{ role: "user", content: openingNote }],
        },
      });
      const initial: ChatMessage[] = [
        { role: "user", content: "I'm ready to begin." },
        { role: "assistant", content: greeting },
      ];
      setMessages(initial);
      saveConversation(moduleId, initial);
    } catch {
      setError("Failed to start builder.");
    } finally {
      setLoading(false);
    }
  }

  if (!mod) {
    return (
      <BrandShell>
        <div className="py-20 text-center">
          <p className="font-display text-2xl text-[#E0249C]">Builder not found.</p>
          <Link to="/rare-breed-club/" className="mt-6 inline-block font-mono text-sm text-[#4A1259]/60 hover:text-[#E0249C]">
            Back to Club
          </Link>
        </div>
      </BrandShell>
    );
  }

  const userTurns = messages.filter((m) => m.role === "user").length;
  const canGenerate = userTurns >= 3 && !artifact;
  const isComplete = done || isModuleComplete(`phase3_${mod.id}`);
  const nextBuilder = builderNumber < phase3.modules.length ? builderNumber + 1 : null;

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    }
    setInput("");
    const updated: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(updated);
    saveConversation(mod!.id, updated);
    setLoading(true);
    try {
      const reply = await sendModuleMessage({ data: { moduleId: mod!.id, messages: updated } });
      const withReply: ChatMessage[] = [...updated, { role: "assistant", content: reply }];
      setMessages(withReply);
      saveConversation(mod!.id, withReply);
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
        data: { moduleId: mod!.id, messages, generatePrompt: mod!.generatePrompt },
      });
      saveArtifact(mod!.outputKey as keyof UserProfile, result);
      markModuleComplete(`phase3_${mod!.id}`);
      setArtifact(result);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <BrandShell hideStickyCta>
      <div className="mb-12 mt-8">
        <div className="mb-4 flex items-center gap-4">
          <Link
            to="/rare-breed-club/"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.3em] text-[#4A1259]/55 hover:text-[#E0249C] transition-colors"
          >
            ← Back
          </Link>
          <span className="font-mono text-[11px] text-[#4A1259]/25">/</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#4A1259]/55">
            {mod.outputName}
          </span>
        </div>
        <div className="mb-2 flex items-center gap-3">
          <span className="font-mono tracking-[0.3em] text-[#E0249C]/70" style={{ fontSize: "25px" }}>
            {mod.number.toString().padStart(2, "0")} / {phase3.modules.length.toString().padStart(2, "0")}
          </span>
          {isComplete && (
            <span className="rounded-full border border-[rgba(201,168,76,0.4)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#c9a84c]">
              Complete
            </span>
          )}
        </div>
        <h1 className="font-display text-[24px] leading-[1.05] tracking-wide text-shimmer sm:text-[32px] md:text-[40px]">
          {mod.name}
        </h1>
        <p className="mt-3 font-serif text-lg font-light italic text-[#4A1259]/65">
          {mod.tagline}
        </p>
      </div>

      {!artifact && (
        <div className="mb-6 rounded-2xl border border-[rgba(74,18,89,0.1)] bg-white/60 p-6">
          <p className="eyebrow mb-4" style={{ fontSize: "21px" }}>What this builder produces</p>
          <p className="font-serif italic leading-snug" style={{ fontSize: "21px", color: "rgba(74,18,89,0.95)" }}>{mod.purpose}</p>
          <p className="mt-4 font-mono uppercase tracking-[0.2em]" style={{ fontSize: "15px", color: "rgba(74,18,89,0.65)" }}>
            Reads: your Operating Manual + all previous artifacts
          </p>
        </div>
      )}

      {artifact ? (
        <div>
          <div className="mb-10 rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white/90 p-10">
            <p className="eyebrow mb-4">{mod.outputName} · Complete</p>
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
          </div>
          <div className="flex items-center gap-6">
            {nextBuilder ? (
              <Link
                to="/rare-breed-club/$builder"
                params={{ builder: String(nextBuilder) }}
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-[13px] tracking-[0.18em] text-white"
                style={{
                  background: "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
                  boxShadow: "0 8px 32px -8px rgba(224,36,156,0.4)",
                }}
              >
                Next Builder →
              </Link>
            ) : (
              <Link
                to="/rare-breed-club/"
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-[13px] tracking-[0.18em] text-white"
                style={{
                  background: "linear-gradient(135deg, #4A1259 0%, #E0249C 100%)",
                  boxShadow: "0 8px 32px -8px rgba(74,18,89,0.35)",
                }}
              >
                Business Complete. View HQ →
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4 max-h-[480px] min-h-[280px] overflow-y-auto rounded-2xl border border-[rgba(74,18,89,0.12)] bg-white/80 p-6">
            {messages.length === 0 && loading && (
              <div className="flex flex-col items-start gap-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#E0249C]/70">
                  Reading your Rare Breed Operating Manual...
                </p>
                <div className="flex items-center gap-1 text-[#4A1259]/40">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div className="space-y-5">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div style={{ fontSize: "21px" }} className={`max-w-[82%] rounded-2xl px-5 py-3.5 font-serif leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#E0249C]/10 text-[#1F1623]"
                      : "bg-[rgba(74,18,89,0.06)] text-[#1F1623]/90"
                  }`}>
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
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder="Reply here..."
              rows={3}
              className="flex-1 resize-none rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white/80 px-5 py-3.5 font-serif text-sm text-[#1F1623] outline-none placeholder:text-[#4A1259]/30 focus:border-[#E0249C]/40"
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
                Send
              </button>
            </div>
          </div>

          {canGenerate && (
            <div className="mt-8 border-t border-[rgba(74,18,89,0.08)] pt-8">
              <p className="mb-3 font-serif text-sm italic text-[#4A1259]/60">
                Ready to generate your {mod.outputName}?
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
                {generating ? "Building..." : `Generate ${mod.outputName} →`}
              </button>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-[rgba(74,18,89,0.08)]">
            <Link
              to="/rare-breed-club/"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#4A1259]/40 hover:text-[#E0249C] transition-colors"
            >
              ← Back to Rare Breed Club
            </Link>
          </div>
        </div>
      )}
    </BrandShell>
  );
}
