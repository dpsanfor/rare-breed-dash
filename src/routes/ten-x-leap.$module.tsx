import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
  buildPhase2Context,
  type UserProfile,
} from "@/lib/profile";
import {
  sendModuleMessage,
  generateModuleReport,
  generateReleasePlan,
  generateZoneOfGenius,
  generateBusinessBlueprint,
  type ChatMessage,
} from "@/lib/anthropic";

export const Route = createFileRoute("/ten-x-leap/$module")({
  component: PhaseTwoModule,
});

// ─── SYNTHESIS RUNNER (Phase 2) ───────────────────────────────────────────────

function Phase2SynthesisRunner({
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

      if (moduleId === "release-80") {
        result = await generateReleasePlan({
          data: {
            deadWeight: profile.dead_weight ?? "",
            biggerVision: profile.bigger_vision ?? "",
          },
        });
      } else if (moduleId === "zone-of-genius") {
        const ctx = buildPhase2Context(profile);
        result = await generateZoneOfGenius({ data: { context: ctx } });
      } else if (moduleId === "business-blueprint") {
        const ctx = buildPhase2Context(profile);
        result = await generateBusinessBlueprint({ data: { context: ctx } });
      } else {
        setError("Unknown synthesis module.");
        setGenerating(false);
        return;
      }

      saveArtifact(outputKey as keyof UserProfile, result);
      markModuleComplete(`phase2_${moduleId}`);
      setArtifact(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  const getSynthesisDescription = () => {
    if (moduleId === "release-80") {
      return "Your Dead Weight Audit from Phase One and your Bigger Vision from this phase. The AI makes the release decision.";
    }
    if (moduleId === "zone-of-genius") {
      return "Every artifact from Phase One and Phase Two synthesized into one clear definition of where you are irreplaceable.";
    }
    if (moduleId === "business-blueprint") {
      return "Everything. Every artifact, every conversation, every artifact across both phases. This is the final synthesis.";
    }
    return "Everything collected across all previous modules.";
  };

  return (
    <div>
      {!artifact && (
        <div className="mb-10 rounded-2xl border border-[rgba(74,18,89,0.12)] bg-white/80 p-10">
          <p className="eyebrow mb-4">What gets synthesized</p>
          <p className="font-serif text-lg leading-relaxed text-[#1F1623]/75 italic">
            {getSynthesisDescription()}
          </p>
        </div>
      )}

      {artifact && (
        <div className="mb-10 rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white/90 p-10">
          <p className="eyebrow mb-4">{outputName} · Installed</p>
          <div className="prose prose-sm max-w-none font-serif leading-relaxed text-[#1F1623]/85">
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
          {generating ? "Synthesizing..." : `Generate ${outputName} →`}
        </button>
      )}

      {artifact && (
        <div className="mt-8">
          {nextDecision && (
            <div className="mb-6 rounded-2xl border border-[rgba(74,18,89,0.1)] bg-white/60 p-6">
              <p className="eyebrow mb-2">Decision Installed</p>
              <p className="font-serif text-base italic text-[#1F1623]/80">
                {nextDecision}
              </p>
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
      )}
    </div>
  );
}

// ─── CONVERSATION RUNNER (Phase 2) ────────────────────────────────────────────

function Phase2ConversationRunner({
  moduleId,
  outputKey,
  outputName,
  danasPrinciple,
  nextDecision,
  generatePrompt,
  profile,
  onComplete,
}: {
  moduleId: string;
  outputKey: string;
  outputName: string;
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
  const bottomRef = useRef<HTMLDivElement>(null);

  const existingArtifact = profile[outputKey as keyof UserProfile] as string | undefined;
  const existingConvo = profile.conversations?.[moduleId];
  const userTurns = messages.filter((m) => m.role === "user").length;
  const canGenerate = userTurns >= 4 && !artifact;

  useEffect(() => {
    if (existingArtifact) setArtifact(existingArtifact);
    if (existingConvo && existingConvo.length > 0) {
      setMessages(existingConvo);
    } else {
      initConversation();
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function initConversation() {
    setLoading(true);
    try {
      // Pass Phase 1 context into opening message for Phase 2 modules that need it
      const phase1Ctx = buildPhase1Context(profile);
      const openingNote =
        phase1Ctx.trim()
          ? `I'm ready to begin. Here's what's been established so far:\n\n${phase1Ctx.slice(0, 800)}`
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
      setError("Failed to start conversation.");
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const updated: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(updated);
    setLoading(true);
    try {
      const reply = await sendModuleMessage({
        data: { moduleId, messages: updated },
      });
      const withReply: ChatMessage[] = [
        ...updated,
        { role: "assistant", content: reply },
      ];
      setMessages(withReply);
      saveConversation(moduleId, withReply);
    } catch {
      setError("Something went wrong. Try again.");
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
      markModuleComplete(`phase2_${moduleId}`);
      setArtifact(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  if (artifact) {
    return (
      <div>
        <div className="mb-10 rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white/90 p-10">
          <p className="eyebrow mb-4">{outputName} · Installed</p>
          <div className="prose prose-sm max-w-none font-serif leading-relaxed text-[#1F1623]/85">
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
        {nextDecision && (
          <div className="mb-6 rounded-2xl border border-[rgba(74,18,89,0.1)] bg-white/60 p-6">
            <p className="eyebrow mb-2">Decision Installed</p>
            <p className="font-serif text-base italic text-[#1F1623]/80">
              {nextDecision}
            </p>
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

  return (
    <div>
      {danasPrinciple && (
        <div className="mb-6 rounded-2xl border border-[rgba(74,18,89,0.1)] bg-white/60 p-6">
          <p className="eyebrow mb-2">Dana's Principle</p>
          <p className="font-serif text-base italic text-[#1F1623]/80">
            "{danasPrinciple}"
          </p>
        </div>
      )}

      <div className="mb-4 max-h-[480px] min-h-[280px] overflow-y-auto rounded-2xl border border-[rgba(74,18,89,0.12)] bg-white/80 p-6">
        {messages.length === 0 && loading && (
          <div className="flex items-center gap-1 text-[#4A1259]/40">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: "150ms" }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: "300ms" }} />
          </div>
        )}
        <div className="space-y-5">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-5 py-3.5 font-serif text-sm leading-relaxed ${
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
        <p className="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Reply here..."
          rows={3}
          className="flex-1 resize-none rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white/80 px-5 py-3.5 font-serif text-sm text-[#1F1623] outline-none placeholder:text-[#4A1259]/30 focus:border-[#E0249C]/40"
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="rounded-2xl border border-[#E0249C]/30 bg-[#E0249C]/10 px-5 font-display text-sm tracking-[0.12em] text-[#E0249C] hover:bg-[#E0249C]/20 disabled:opacity-40"
        >
          Send
        </button>
      </div>

      {canGenerate && (
        <div className="mt-8 border-t border-[rgba(74,18,89,0.08)] pt-8">
          <p className="mb-3 font-serif text-sm italic text-[#4A1259]/60">
            Ready to generate your {outputName}?
          </p>
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
            {generating ? "Generating..." : `Generate ${outputName} →`}
          </button>
        </div>
      )}

      {!canGenerate && userTurns > 0 && (
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#4A1259]/30">
          {4 - userTurns} more {4 - userTurns === 1 ? "response" : "responses"} before report unlocks
        </p>
      )}
    </div>
  );
}

// ─── CONTEXT RUNNER (Phase 2) ─────────────────────────────────────────────────

function Phase2ContextRunner({
  purpose,
  danasPrinciple,
  nextDecision,
  outputKey,
  outputName,
  moduleId,
  profile,
  onComplete,
}: {
  purpose: string;
  danasPrinciple?: string;
  nextDecision?: string;
  outputKey?: string;
  outputName?: string;
  moduleId: string;
  profile: UserProfile;
  onComplete: () => void;
}) {
  const alreadyComplete = isModuleComplete(`phase2_${moduleId}`);

  function handleContinue() {
    markModuleComplete(`phase2_${moduleId}`);
    onComplete();
  }

  // Constitution module (phase2) links out to /leap/constitution
  if (moduleId === "constitution") {
    const constitutionBuilt = !!profile.constitution;
    return (
      <div>
        <div className="mb-8 rounded-2xl border border-[rgba(74,18,89,0.12)] bg-white/80 p-10">
          <p className="font-serif text-xl leading-relaxed text-[#1F1623]/80 italic">
            {purpose}
          </p>
        </div>
        {danasPrinciple && (
          <div className="mb-8 rounded-2xl border border-[rgba(74,18,89,0.1)] bg-white/60 p-6">
            <p className="eyebrow mb-2">Dana's Principle</p>
            <p className="font-serif text-base italic text-[#1F1623]/80">
              "{danasPrinciple}"
            </p>
          </div>
        )}
        {constitutionBuilt ? (
          <div className="mb-8 rounded-2xl border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.04)] p-6">
            <p className="eyebrow mb-2 text-[#c9a84c]">Constitution Installed</p>
            <p className="font-serif text-sm italic text-[#4A1259]/60">
              Your Rare Breed Constitution™ has been generated. It's now the AI's primary reference for everything that follows.
            </p>
          </div>
        ) : (
          <Link
            to="/leap/constitution"
            className="mb-8 inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-[13px] tracking-[0.18em] text-white"
            style={{
              background:
                "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
              boxShadow: "0 8px 32px -8px rgba(224,36,156,0.4)",
            }}
          >
            Build Your Constitution →
          </Link>
        )}
        {constitutionBuilt && (
          <button
            onClick={handleContinue}
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-[13px] tracking-[0.18em] text-white"
            style={{
              background: "linear-gradient(135deg, #4A1259 0%, #E0249C 100%)",
              boxShadow: "0 8px 32px -8px rgba(74,18,89,0.35)",
            }}
          >
            Continue →
          </button>
        )}
      </div>
    );
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
          <p className="eyebrow mb-2">Dana's Principle</p>
          <p className="font-serif text-base italic text-[#1F1623]/80">
            "{danasPrinciple}"
          </p>
        </div>
      )}
      {nextDecision && (
        <div className="mb-8 rounded-2xl border border-[rgba(74,18,89,0.1)] bg-white/60 p-6">
          <p className="eyebrow mb-2">Decision to Hold</p>
          <p className="font-serif text-base italic text-[#1F1623]/80">
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

function PhaseTwoModule() {
  const { module: moduleParam } = Route.useParams();
  const moduleNumber = parseInt(moduleParam, 10);
  const mod = getModule("ten-x-leap", moduleNumber);
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
          <Link to="/ten-x-leap/" className="mt-6 inline-block font-mono text-sm text-[#4A1259]/60 hover:text-[#E0249C]">
            Back to Phase Two
          </Link>
        </div>
      </BrandShell>
    );
  }

  const phase = PHASES[1];
  const totalModules = phase.modules.length;
  const isComplete = done || isModuleComplete(`phase2_${mod.id}`);
  const nextModule = moduleNumber < totalModules ? moduleNumber + 1 : null;

  function handleComplete() {
    setDone(true);
    setProfile(readProfile());
  }

  return (
    <BrandShell hideStickyCta>
      {/* Header */}
      <div className="mb-12 mt-8">
        <div className="mb-4 flex items-center gap-4">
          <Link
            to="/ten-x-leap/"
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#4A1259]/35 hover:text-[#E0249C] transition-colors"
          >
            Phase Two
          </Link>
          <span className="font-mono text-[10px] text-[#4A1259]/25">/</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#4A1259]/35">
            Module {mod.number}
          </span>
        </div>

        <div className="mb-2 flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.3em] text-[#E0249C]/60">
            {mod.number.toString().padStart(2, "0")} / {totalModules.toString().padStart(2, "0")}
          </span>
          {isComplete && (
            <span className="rounded-full border border-[rgba(201,168,76,0.4)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#c9a84c]">
              Installed
            </span>
          )}
        </div>

        <h1 className="font-display text-[40px] leading-[1.05] tracking-wide text-shimmer sm:text-[56px] md:text-[72px]">
          {mod.name}
        </h1>
        <p className="mt-3 font-serif text-lg font-light italic text-[#4A1259]/65">
          {mod.tagline}
        </p>
      </div>

      {/* Progress strip */}
      <div className="mb-12 grid grid-cols-7 gap-1">
        {phase.modules.map((m) => {
          const complete = isModuleComplete(`phase2_${m.id}`);
          const current = m.number === moduleNumber;
          return (
            <Link
              key={m.id}
              to="/ten-x-leap/$module"
              params={{ module: String(m.number) }}
              title={`Module ${m.number}: ${m.name}`}
              className="h-1.5 rounded-full transition-all"
              style={{
                background: complete
                  ? "#E0249C"
                  : current
                    ? "rgba(224,36,156,0.4)"
                    : "rgba(74,18,89,0.1)",
              }}
            />
          );
        })}
      </div>

      {/* Module content */}
      {mod.type === "context" && (
        <Phase2ContextRunner
          purpose={mod.purpose}
          danasPrinciple={mod.danasPrinciple}
          nextDecision={mod.nextDecision}
          outputKey={mod.outputKey}
          outputName={mod.outputName}
          moduleId={mod.id}
          profile={profile}
          onComplete={handleComplete}
        />
      )}

      {mod.type === "conversation" && (
        <Phase2ConversationRunner
          moduleId={mod.id}
          outputKey={mod.outputKey!}
          outputName={mod.outputName!}
          danasPrinciple={mod.danasPrinciple}
          nextDecision={mod.nextDecision}
          generatePrompt={mod.generatePrompt}
          profile={profile}
          onComplete={handleComplete}
        />
      )}

      {mod.type === "synthesis" && (
        <Phase2SynthesisRunner
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
              to="/ten-x-leap/$module"
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
              to="/dash/"
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-[13px] tracking-[0.18em] text-white"
              style={{
                background:
                  "linear-gradient(135deg, #4A1259 0%, #E0249C 100%)",
                boxShadow: "0 8px 32px -8px rgba(74,18,89,0.35)",
              }}
            >
              OS Installed. Return to Dashboard →
            </Link>
          )}
          <Link
            to="/ten-x-leap/"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#4A1259]/40 hover:text-[#E0249C]"
          >
            All Modules
          </Link>
        </div>
      )}
    </BrandShell>
  );
}
