import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BrandShell } from "@/components/brand/BrandShell";
import { Markdown } from "@/components/Markdown";
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
  generateDeclaration,
  type ChatMessage,
} from "@/lib/anthropic";
import { getUserAccess } from "@/lib/supabase-profile";
import { PhaseLockedScreen } from "@/components/PhaseLockedScreen";

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
  autoAdvance,
}: {
  moduleId: string;
  outputKey: string;
  outputName: string;
  nextDecision?: string;
  profile: UserProfile;
  onComplete: () => void;
  autoAdvance?: boolean;
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
      } else if (moduleId === "declaration") {
        const ctx = buildPhase1Context(profile);
        result = await generateDeclaration({ data: { phase1Context: ctx } });
      } else {
        setError("Unknown synthesis module.");
        setGenerating(false);
        return;
      }
      saveArtifact(outputKey as keyof UserProfile, result);
      markModuleComplete(`phase1_${moduleId}`);
      if (autoAdvance) {
        onComplete();
        return;
      }
      setArtifact(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  const complete = !!artifact;
  const isDeclaration = moduleId === "declaration";

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

      {artifact && !isDeclaration && (
        <div className="mb-10 rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white/90 p-10">
          <p className="eyebrow mb-4">{outputName} · Saved to your progress</p>
          <Markdown
            text={artifact}
            className="prose prose-sm max-w-none font-serif leading-relaxed text-[#1F1623]/85"
          />
        </div>
      )}

      {artifact && isDeclaration && (
        <div>
          {/* The Declaration, presented as a declaration */}
          <div
            className="mb-10 rounded-3xl border-2 p-12 text-center"
            style={{
              borderColor: "rgba(201,168,76,0.5)",
              background:
                "linear-gradient(180deg, rgba(255,253,248,0.95) 0%, rgba(201,168,76,0.06) 100%)",
              boxShadow: "0 20px 60px -20px rgba(201,168,76,0.35)",
            }}
          >
            <p className="eyebrow mb-6" style={{ color: "#c9a84c" }}>
              Your Prison Break Declaration
            </p>
            <Markdown
              text={artifact}
              className="mx-auto max-w-2xl font-serif text-2xl italic leading-relaxed text-[#1F1623]"
            />
            <div className="mt-10 flex items-center justify-center gap-3">
              <span className="h-px w-12" style={{ background: "rgba(201,168,76,0.5)" }} />
              <span
                className="font-mono text-[13px] uppercase tracking-[0.28em]"
                style={{ color: "rgba(201,168,76,0.85)" }}
              >
                Declared. Signed. Yours.
              </span>
              <span className="h-px w-12" style={{ background: "rgba(201,168,76,0.5)" }} />
            </div>
          </div>

          {/* Reveal trigger, leads to the Zone of Genius Code page */}
          <Link
            to={"/zone-of-genius-code" as any}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-6 font-display tracking-[0.14em] text-white transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            style={{
              fontSize: "clamp(20px, 4vw, 30px)",
              background:
                "linear-gradient(135deg, #4A1259 0%, #E0249C 50%, #c9a84c 100%)",
              boxShadow: "0 16px 50px -12px rgba(224,36,156,0.55)",
            }}
          >
            Get My Zone of Genius Code →
          </Link>
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
          {generating
            ? autoAdvance ? "Locking it in..." : "Analyzing..."
            : autoAdvance ? "Lock It In + Continue →" : `Generate ${outputName}`}
        </button>
      )}

      {complete && !isDeclaration && (
        <div className="mt-8">
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
  autoAdvance,
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
  autoAdvance?: boolean;
  feedsInto?: string;
  profile: UserProfile;
  onComplete: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const p = readProfile();
    return p.conversations?.[moduleId] ?? [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [artifact, setArtifact] = useState<string | null>(() => {
    const p = readProfile();
    return (p[outputKey as keyof UserProfile] as string | undefined) ?? null;
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [started, setStarted] = useState(() => {
    const p = readProfile();
    const saved = p.conversations?.[moduleId];
    const art = p[outputKey as keyof UserProfile] as string | undefined;
    return !!(saved?.length || art);
  });
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

  const userTurns = messages.filter((m) => m.role === "user").length;
  // The AI can decide it already has enough and unlock generation early by
  // emitting [[READY]] (e.g. when prior sessions answered the questions).
  const aiReady = messages.some(
    (m) => m.role === "assistant" && m.content.includes("[[READY]]")
  );
  const canGenerate = (aiReady || userTurns >= 8) && !artifact;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function initConversation() {
    setLoading(true);
    try {
      const fullCtx = buildPhase1Context(profile);
      const kickoff = openingQuestion
        ? fullCtx.trim()
          ? `Begin this element. First, in ONE short warm sentence, reference something specific she has already surfaced in her earlier sessions (use her context) so she feels you know her work. Then ask this opening question: "${openingQuestion}"`
          : `Begin this element. Ask this opening question warmly: "${openingQuestion}"`
        : "I'm ready to begin. Reference what I've already surfaced in my earlier sessions where it's relevant.";
      const greeting = await sendModuleMessage({
        data: { moduleId, messages: [{ role: "user", content: kickoff }], context: fullCtx },
      });
      const initial: ChatMessage[] = [{ role: "assistant", content: greeting }];
      setMessages(initial);
      saveConversation(moduleId, initial);
    } catch {
      if (openingQuestion) {
        const initial: ChatMessage[] = [{ role: "assistant", content: openingQuestion }];
        setMessages(initial);
        saveConversation(moduleId, initial);
      } else {
        setError("Failed to start conversation.");
      }
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
        data: { moduleId, messages: apiMessages, context: buildPhase1Context(profile) },
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
        data: { moduleId, messages, generatePrompt, context: buildPhase1Context(profile) },
      });
      saveArtifact(outputKey as keyof UserProfile, result);
      markModuleComplete(`phase1_${moduleId}`);
      if (autoAdvance) {
        onComplete();
        return;
      }
      setArtifact(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  function resetModule() {
    const raw = localStorage.getItem('rare_breed_profile');
    const p = raw ? JSON.parse(raw) : {};
    delete p[outputKey];
    if (p.completed_modules) {
      p.completed_modules = p.completed_modules.filter((k: string) => k !== `phase1_${moduleId}`);
    }
    localStorage.setItem('rare_breed_profile', JSON.stringify(p));
    setArtifact(null);
  }

  async function restartConversation() {
    const raw = localStorage.getItem('rare_breed_profile');
    const p = raw ? JSON.parse(raw) : {};
    if (p.conversations) delete p.conversations[moduleId];
    localStorage.setItem('rare_breed_profile', JSON.stringify(p));
    setMessages([]);
    setInput("");
    await initConversation();
  }

  function looksLikeQuestion(text: string): boolean {
    const t = text.trim();
    return t.length < 700 && t.includes('?') && !t.includes('##');
  }

  async function generateWithOptionalAnswer() {
    setGenerating(true);
    setError(null);
    const raw = localStorage.getItem('rare_breed_profile');
    const p = raw ? JSON.parse(raw) : {};
    delete p[outputKey];
    localStorage.setItem('rare_breed_profile', JSON.stringify(p));
    try {
      const extra = followUpAnswer.trim();
      let finalMessages = messages;
      if (extra) {
        finalMessages = [...messages, { role: "user" as const, content: extra }];
        setMessages(finalMessages);
        saveConversation(moduleId, finalMessages);
      }
      const result = await generateModuleReport({ data: { moduleId, messages: finalMessages, generatePrompt, context: buildPhase1Context(profile) } });
      saveArtifact(outputKey as keyof UserProfile, result);
      markModuleComplete(`phase1_${moduleId}`);
      if (autoAdvance) {
        onComplete();
        return;
      }
      setArtifact(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  // ── Synthesis view ──────────────────────────────────────────────────────────
  if (artifact && looksLikeQuestion(artifact)) {
    const questionLine = artifact.trim().split('\n').filter(l => l.includes('?'))[0] ?? artifact;
    return (
      <div>
        {error && <p className="mb-4 rounded-xl bg-red-50 px-5 py-3 text-sm text-red-600">{error}</p>}
        <div className="mb-6 rounded-2xl border border-[rgba(74,18,89,0.12)] bg-white/80 p-8">
          <p className="font-mono text-[12px] uppercase tracking-[0.25em] text-[#E0249C] mb-4">
            Optional — add this before generating
          </p>
          <p className="font-serif text-[22px] italic leading-relaxed text-[#1F1623]/85 mb-6">
            {questionLine}
          </p>
          <textarea
            value={followUpAnswer}
            onChange={(e) => setFollowUpAnswer(e.target.value)}
            placeholder="Your answer — or leave blank and generate now"
            rows={4}
            className="w-full resize-none rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white px-5 py-3.5 font-serif text-[17px] text-[#1F1623] outline-none placeholder:text-[#4A1259]/30 focus:border-[#E0249C]/40"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={generateWithOptionalAnswer}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-[13px] tracking-[0.18em] text-white disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)", boxShadow: "0 8px 32px -8px rgba(224,36,156,0.4)" }}
          >
            {generating ? "Generating..." : `Generate ${outputName} →`}
          </button>
          <button
            onClick={resetModule}
            className="rounded-full border border-[rgba(74,18,89,0.2)] px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.22em] text-[#4A1259]/60 hover:border-[#E0249C]/40 hover:text-[#E0249C] transition-colors"
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  if (artifact) {
    const doneCount = (readProfile().completed_modules ?? []).filter((k) =>
      k.startsWith("phase1_")
    ).length;
    const total = PHASES[0].modules.length;
    const pct = Math.round((doneCount / total) * 100);
    return (
      <div>
        <style>{`
          @keyframes ggShimmer {0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
          .gg-iridescent{background:linear-gradient(90deg,#E0249C,#c9a84c,#6EE7F9,#A78BFA,#F472B6,#E0249C);background-size:300% 300%;animation:ggShimmer 6s ease infinite;}
        `}</style>
        <div
          className="mb-8 rounded-3xl border-2 p-12 text-center"
          style={{
            borderColor: "rgba(224,36,156,0.4)",
            background:
              "linear-gradient(180deg, rgba(255,253,248,0.95) 0%, rgba(224,36,156,0.05) 100%)",
            boxShadow: "0 20px 60px -20px rgba(224,36,156,0.35)",
          }}
        >
          <p className="eyebrow mb-4" style={{ color: "#E0249C" }}>
            ✦ Layer Decoded
          </p>
          <p
            className="font-display tracking-wide text-[#1F1623]"
            style={{ fontSize: "clamp(28px, 6vw, 44px)" }}
          >
            Another Piece of Your Code Recovered
          </p>
          <div
            className="mx-auto mt-8 h-3 w-full max-w-lg overflow-hidden rounded-full"
            style={{ background: "rgba(74,18,89,0.1)" }}
          >
            <div
              className="gg-iridescent h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-4 font-mono text-[13px] uppercase tracking-[0.22em] text-[#4A1259]/50">
            {doneCount} of {total} layers decoded · saved to your Zone of Genius Code
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={onComplete}
            className="inline-flex items-center gap-2 rounded-full px-10 py-5 font-display tracking-[0.14em] text-white transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            style={{
              fontSize: "clamp(18px, 3vw, 20px)",
              background: "linear-gradient(135deg, #4A1259 0%, #E0249C 55%, #c9a84c 100%)",
              boxShadow: "0 16px 50px -12px rgba(224,36,156,0.5)",
            }}
          >
            Continue to the next layer →
          </button>
          <button
            onClick={resetModule}
            className="rounded-full border border-[rgba(74,18,89,0.2)] px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.22em] text-[#4A1259]/60 hover:border-[#E0249C]/40 hover:text-[#E0249C] transition-colors"
          >
            Redo this element
          </button>
        </div>
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
              This module contributes directly to your 1010X Factor Operating Manual™.
            </p>
          </div>
        )}

        <button
          onClick={beginSession}
          className="inline-flex items-center gap-2 rounded-full px-10 py-5 font-display text-[17px] tracking-[0.18em] text-white"
          style={{
            background: "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
            boxShadow: "0 12px 40px -8px rgba(224,36,156,0.45)",
          }}
        >
          {beginCta ?? "Begin Session"} →
        </button>

        <div className="mt-10 pt-8 border-t border-[rgba(74,18,89,0.08)]">
          <Link
            to="/prison-break"
            className="inline-flex items-center gap-1.5 font-mono text-[13px] uppercase tracking-[0.22em] text-[#4A1259]/40 hover:text-[#E0249C] transition-colors"
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
        <p className="font-mono text-[13px] uppercase tracking-[0.22em] text-[#4A1259]/55">
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
                {m.content.replace(/\[\[READY\]\]/g, "").trim()}
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
          <p className="mb-5 font-serif text-[22px] italic text-[#4A1259]/70">
            {autoAdvance
              ? "Delivered has what it needs from this one. Lock it in and keep moving, or keep going to make everything downstream even more personalized."
              : `You've given Delivered enough to build the first version of your ${outputName}. Generate it now, or keep going to make every recommendation throughout Rare Breed OS™ even more personalized.`}
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
            {generating
              ? autoAdvance ? "Locking it in..." : "Generating..."
              : autoAdvance ? "Lock It In + Continue →" : `Generate ${outputName} →`}
          </button>
          <div className="mt-6 rounded-2xl border border-[rgba(74,18,89,0.08)] bg-white/50 px-6 py-5">
            <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#4A1259]/40 mb-2">Or keep going</p>
            <p className="font-serif text-[18px] leading-relaxed text-[#1F1623]/70">
              The more you share, the more specific your {outputName} becomes. Keep answering to go deeper — the AI will use everything. <span className="text-[#E0249C]/70 not-italic">Sweet spot: 8–12 responses.</span> Past that, you have more than enough.
            </p>
          </div>
        </div>
      )}

      <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.2em] text-[#4A1259]/40">
        {userTurns} {userTurns === 1 ? "response" : "responses"} recorded
        {!canGenerate && ` · ${8 - userTurns} more before generate unlocks`}
      </p>

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-[rgba(74,18,89,0.08)] pt-8">
        <Link
          to="/prison-break"
          className="inline-flex items-center gap-1.5 font-mono text-[13px] uppercase tracking-[0.22em] text-[#4A1259]/40 hover:text-[#E0249C] transition-colors"
        >
          ← Back to Phase One
        </Link>
        <button
          onClick={restartConversation}
          disabled={loading}
          className="font-mono text-[13px] uppercase tracking-[0.22em] text-[#4A1259]/40 hover:text-[#E0249C] transition-colors disabled:opacity-40"
        >
          ↻ Start this element over
        </button>
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
  const [access, setAccess] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setProfile(readProfile());
    getUserAccess().then((a) => setAccess(a.phase1));
  }, []);

  if (access === null) return null;
  if (!access) return <PhaseLockedScreen phase="prison-break" />;

  if (!mod) {
    return (
      <BrandShell>
        <div className="py-20 text-center">
          <p className="font-display text-2xl text-[#E0249C]">Module not found.</p>
          <Link to="/prison-break" className="mt-6 inline-block font-mono text-sm text-[#4A1259]/60 hover:text-[#E0249C]">
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
  // Intermediate reports generate silently and flow to the next module.
  // Only the real deliverables pause to be seen.
  const showsDeliverable = ["good-girl-os", "the-escape", "declaration"].includes(mod.id);
  const completedNow = phase.modules.filter((m) =>
    isModuleComplete(`phase1_${m.id}`)
  ).length;

  function handleComplete() {
    setDone(true);
    setProfile(readProfile());
    if (nextModule) {
      navigate({ to: "/prison-break/$module", params: { module: String(nextModule) } });
    } else {
      navigate({ to: "/dash" });
    }
  }

  return (
    <BrandShell hideStickyCta>
      {/* Header */}
      <div className="mb-10 mt-8">
        {/* Program name — centered with back arrow */}
        <div className="relative flex items-center justify-center mb-6">
          <Link
            to="/prison-break"
            className="absolute left-0 font-mono text-[13px] text-[#4A1259]/45 hover:text-[#E0249C] transition-colors"
            aria-label="Back to Good Girl Prison Break"
          >
            ←
          </Link>
          <Link
            to="/prison-break"
            className="font-display text-shimmer hover:opacity-75 transition-opacity"
            style={{ fontSize: "clamp(22px, 5vw, 42px)", letterSpacing: "0.1em" }}
          >
            Good Girl Prison Break™
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="font-mono text-[17px] tracking-[0.25em] text-[#4A1259]/50">
            Layer {mod.number.toString().padStart(2, "0")} / {totalModules.toString().padStart(2, "0")}
          </span>
          {isComplete && (
            <span className="rounded-full border border-[rgba(201,168,76,0.45)] px-3 py-1 font-mono text-[12px] uppercase tracking-[0.2em] text-[#c9a84c]">
              Decoded
            </span>
          )}
        </div>

        <h1 className="font-display text-[24px] leading-[1.05] tracking-wide text-shimmer text-center sm:text-[32px] md:text-[40px]">
          {mod.name}
        </h1>
        <p className="mt-4 font-serif text-[40px] font-light italic leading-snug text-[#4A1259]/80 text-center">
          {mod.tagline}
        </p>
      </div>

      {/* Progress toward her Zone of Genius Code™ */}
      <div className="mb-2 flex items-baseline justify-between">
        <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-[#4A1259]/50">
          {completedNow} of {totalModules} complete
        </p>
        <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-[#E0249C]">
          → your Zone of Genius Code™
        </p>
      </div>
      <div
        className="mb-12 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${totalModules}, minmax(0, 1fr))` }}
      >
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
          key={mod.id}
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
          feedsInto={mod.feedsInto}
          profile={profile}
          onComplete={handleComplete}
          autoAdvance={!showsDeliverable}
        />
      )}

      {mod.type === "synthesis" && (
        <SynthesisRunner
          key={mod.id}
          moduleId={mod.id}
          outputKey={mod.outputKey!}
          outputName={mod.outputName!}
          nextDecision={mod.nextDecision}
          profile={profile}
          onComplete={handleComplete}
          autoAdvance={!showsDeliverable}
        />
      )}

      {/* Bottom nav — always visible */}
      <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-[rgba(74,18,89,0.08)] pt-10">
        {moduleNumber > 1 && (
          <Link
            to="/prison-break/$module"
            params={{ module: String(moduleNumber - 1) }}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(74,18,89,0.2)] px-6 py-3 font-display text-[13px] tracking-[0.18em] text-[#4A1259]/70 hover:border-[#E0249C]/40 hover:text-[#E0249C] transition-colors"
          >
            ← Layer {moduleNumber - 1}
          </Link>
        )}
        {(done || isComplete) && nextModule && (
          <Link
            to="/prison-break/$module"
            params={{ module: String(nextModule) }}
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-[13px] tracking-[0.18em] text-white"
            style={{
              background: "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
              boxShadow: "0 8px 32px -8px rgba(224,36,156,0.4)",
            }}
          >
            Continue Building →
          </Link>
        )}
        {(done || isComplete) && !nextModule && (
          <Link
            to="/ten-x-leap/$module"
            params={{ module: "1" }}
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-[13px] tracking-[0.18em] text-white"
            style={{
              background: "linear-gradient(135deg, #4A1259 0%, #E0249C 100%)",
              boxShadow: "0 8px 32px -8px rgba(74,18,89,0.35)",
            }}
          >
            Enter Phase Two →
          </Link>
        )}
      </div>
    </BrandShell>
  );
}
