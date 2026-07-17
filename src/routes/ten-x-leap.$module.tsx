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
  buildPhase2Context,
  type UserProfile,
} from "@/lib/profile";
import {
  sendModuleMessage,
  generateModuleReport,
  generateReleasePlan,
  generateOperatingManual,
  type ChatMessage,
} from "@/lib/anthropic";
import { getUserAccess } from "@/lib/supabase-profile";
import { PhaseLockedScreen } from "@/components/PhaseLockedScreen";

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
      } else if (moduleId === "operating-manual") {
        const ctx = buildPhase2Context(profile);
        result = await generateOperatingManual({ data: { context: ctx } });
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
      return "Your Dead Weight Audit from Phase One and your 10X Vision from this phase. The AI makes the release decision.";
    }
    if (moduleId === "operating-manual") {
      return "Every decision from both phases: identity, beliefs, standards, your Zone of Genius, your 10X Calendar, your Dream Client Decision, your Offer Map, your 10X Vision, your legacy. So that every AI Builder in Delivered already knows who you are before the first question is asked.";
    }
    return "Everything collected across all previous modules.";
  };

  // Prerequisites check for release-80
  if (moduleId === "release-80" && !artifact) {
    const missingDeadWeight = !profile.dead_weight;
    const missingVision = !profile.bigger_vision;
    if (missingDeadWeight || missingVision) {
      return (
        <div className="rounded-2xl border border-[rgba(224,36,156,0.18)] bg-white/80 p-10">
          <p className="eyebrow mb-4 text-[#E0249C]">One thing first</p>
          <p className="font-serif text-[20px] italic leading-relaxed text-[#1F1623]/80 mb-8">
            Your Release Plan is built from two things — your Dead Weight Audit and your 10X Vision. {missingDeadWeight && missingVision ? "Both need to be done first." : missingDeadWeight ? "Your Dead Weight Audit isn't done yet." : "Your 10X Vision isn't done yet."}
          </p>
          <div className="space-y-3">
            {missingDeadWeight && (
              <Link
                to="/prison-break/$module"
                params={{ module: "3" }}
                className="flex items-center justify-between rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white px-6 py-4 hover:-translate-y-0.5 transition-all"
              >
                <div>
                  <p className="font-display text-[17px] tracking-[0.05em] text-[#1F1623]">Dead Weight Audit</p>
                  <p className="font-serif text-[13px] italic text-[#4A1259]/55">Good Girl Prison Break™ · Layer 03</p>
                </div>
                <span className="font-mono text-[13px] uppercase tracking-[0.2em] text-[#E0249C]">Go →</span>
              </Link>
            )}
            {missingVision && (
              <Link
                to="/ten-x-leap/$module"
                params={{ module: "1" }}
                className="flex items-center justify-between rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white px-6 py-4 hover:-translate-y-0.5 transition-all"
              >
                <div>
                  <p className="font-display text-[17px] tracking-[0.05em] text-[#1F1623]">10X Vision</p>
                  <p className="font-serif text-[13px] italic text-[#4A1259]/55">The 10X Leap™ · Element 01</p>
                </div>
                <span className="font-mono text-[13px] uppercase tracking-[0.2em] text-[#E0249C]">Go →</span>
              </Link>
            )}
          </div>
        </div>
      );
    }
  }

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
          <p className="eyebrow mb-4">{outputName} · Designed</p>
          <Markdown
            text={artifact}
            className="prose prose-sm max-w-none font-serif leading-relaxed text-[#1F1623]/85"
          />
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
          <div className="flex items-center gap-4">
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
            <button
              onClick={() => {
                const raw = localStorage.getItem('rare_breed_profile');
                const p = raw ? JSON.parse(raw) : {};
                delete p[outputKey];
                if (p.completed_modules) {
                  p.completed_modules = p.completed_modules.filter((k: string) => k !== `phase2_${moduleId}`);
                }
                localStorage.setItem('rare_breed_profile', JSON.stringify(p));
                setArtifact(null);
              }}
              className="rounded-full border border-[rgba(74,18,89,0.2)] px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.22em] text-[#4A1259]/60 hover:border-[#E0249C]/40 hover:text-[#E0249C] transition-colors"
            >
              Redo this module
            </button>
          </div>
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
  futureUse,
  openingQuestion,
  mission,
  beginCta,
  danasPrinciple,
  nextDecision,
  generatePrompt,
  feedsInto,
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAttach(files: FileList | File[]) {
    const arr = Array.from(files);
    let textAdd = "";
    const existing = readProfile();
    let imgs: { name: string; dataUrl: string }[] = [];
    try {
      imgs = existing.voice_images ? JSON.parse(existing.voice_images) : [];
    } catch {
      imgs = [];
    }
    let imgAdded = 0;
    const skipped: string[] = [];
    for (const file of arr) {
      const read = (as: "text" | "url") =>
        new Promise<string>((res) => {
          const r = new FileReader();
          r.onload = () => res(String(r.result ?? ""));
          if (as === "text") r.readAsText(file);
          else r.readAsDataURL(file);
        });
      if (file.type.startsWith("image/")) {
        imgs.push({ name: file.name, dataUrl: await read("url") });
        imgAdded++;
      } else if (
        file.type.startsWith("text/") ||
        /\.(txt|md|markdown|csv|rtf|vtt|srt|log)$/i.test(file.name)
      ) {
        textAdd += `\n\n[${file.name}]\n${await read("text")}`;
      } else {
        skipped.push(file.name);
      }
    }
    if (skipped.length) {
      setError(
        `Couldn't read: ${skipped.join(", ")}. Word/PDF/Google Drive files aren't readable here yet — paste the text directly, or download them as plain text (.txt) and drop that.`
      );
    } else {
      setError(null);
    }
    if (textAdd) setInput((prev) => (prev + textAdd).trim());
    if (imgAdded) {
      const json = JSON.stringify(imgs);
      if (json.length < 4_000_000) saveArtifact("voice_images", json);
      setInput((prev) =>
        (
          prev +
          `\n\n(Attached ${imgAdded} testimonial screenshot${imgAdded > 1 ? "s" : ""}, saved to my Voice Library.)`
        ).trim()
      );
    }
  }
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
  // The AI can decide it already has enough (often because prior sessions
  // answered the questions) and unlock generation early by emitting [[READY]].
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
      const fullCtx = buildPhase2Context(profile);
      const kickoff = openingQuestion
        ? fullCtx.trim()
          ? `Begin this element. First, in ONE short warm sentence, reference something specific she has already established in her earlier sessions (use her context) so she feels you know her work. Then ask this opening question: "${openingQuestion}"`
          : `Begin this element. Ask this opening question warmly: "${openingQuestion}"`
        : "I'm ready to begin. Reference what I've already established in my earlier sessions where it's relevant.";
      const greeting = await sendModuleMessage({
        data: { moduleId, messages: [{ role: "user", content: kickoff }], context: fullCtx },
      });
      const initial: ChatMessage[] = [{ role: "assistant", content: greeting }];
      setMessages(initial);
      saveConversation(moduleId, initial);
    } catch {
      // Fallback: if the AI can't be reached, still open with the crafted question.
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
        data: { moduleId, messages: apiMessages, context: buildPhase2Context(profile) },
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
        data: { moduleId, messages, generatePrompt, context: buildPhase2Context(profile) },
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

  function resetModule() {
    const raw = localStorage.getItem('rare_breed_profile');
    const p = raw ? JSON.parse(raw) : {};
    delete p[outputKey];
    if (p.completed_modules) {
      p.completed_modules = p.completed_modules.filter((k: string) => k !== `phase2_${moduleId}`);
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
      const result = await generateModuleReport({ data: { moduleId, messages: finalMessages, generatePrompt, context: buildPhase2Context(profile) } });
      saveArtifact(outputKey as keyof UserProfile, result);
      markModuleComplete(`phase2_${moduleId}`);
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
    return (
      <div>
        <div
          className="mb-8 rounded-3xl border-2 p-12 text-center"
          style={{
            borderColor: "rgba(201,168,76,0.5)",
            background:
              "linear-gradient(180deg, rgba(255,253,248,0.95) 0%, rgba(201,168,76,0.06) 100%)",
            boxShadow: "0 20px 60px -20px rgba(201,168,76,0.35)",
          }}
        >
          <p className="eyebrow mb-4" style={{ color: "#c9a84c" }}>
            ✦ Element Complete
          </p>
          <p
            className="font-display tracking-wide text-[#1F1623]"
            style={{ fontSize: "clamp(30px, 6vw, 46px)" }}
          >
            {outputName}
          </p>
          <p
            className="mx-auto mt-5 max-w-lg font-serif italic text-[#4A1259]/80"
            style={{ fontSize: "clamp(18px, 2.8vw, 23px)" }}
          >
            Saved to your 10X Factor Operating Manual™.
          </p>
          <p className="mx-auto mt-4 max-w-md font-serif leading-relaxed text-[#1F1623]/55">
            Every element you design flows into your Operating Manual. You'll see it
            all come together at the end of the Leap, so there's nothing to read here.
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
            Continue to the next element →
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
        <div className="mb-5 rounded-2xl border border-[rgba(74,18,89,0.12)] bg-white/60 p-7">
          <p className="eyebrow mb-2">What You're Building</p>
          <p className="font-display text-[20px] tracking-[0.03em] text-[#1F1623] mb-2">{outputName}</p>
          {futureUse && (
            <p className="font-serif text-[16px] italic leading-relaxed text-[#4A1259]/65">{futureUse}</p>
          )}
        </div>

        {danasPrinciple && (
          <div className="mb-5 rounded-2xl border border-[rgba(74,18,89,0.1)] bg-white/60 p-7">
            <p className="eyebrow mb-3">Rare Breed Principle</p>
            <p className="font-serif text-[27px] italic leading-snug text-[#1F1623]/90">
              "{danasPrinciple}"
            </p>
          </div>
        )}

        {mission && mission.length > 0 && (
          <div className="mb-8 rounded-2xl border border-[rgba(74,18,89,0.1)] bg-white/60 p-7">
            <p className="eyebrow mb-4">Today's Mission</p>
            <p className="mb-4 font-serif text-[17px] text-[#1F1623]/75">
              By the end of this session you'll know:
            </p>
            <ul className="mb-5 space-y-2.5">
              {mission.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#E0249C]" />
                  <span className="font-serif text-[17px] leading-snug text-[#1F1623]/80">{item}</span>
                </li>
              ))}
            </ul>
            <p className="font-serif text-[17px] italic text-[#4A1259]/50">
              This module contributes directly to your 10X Factor Operating Manual™.
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
            to="/ten-x-leap"
            className="inline-flex items-center gap-1.5 font-mono text-[13px] uppercase tracking-[0.22em] text-[#4A1259]/40 hover:text-[#E0249C] transition-colors"
          >
            ← Back to Phase Two
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
          onDrop={(e) => {
            if (e.dataTransfer.files?.length) {
              e.preventDefault();
              handleAttach(e.dataTransfer.files);
            }
          }}
          placeholder="Type, speak, or drop files here (documents, transcripts, testimonial screenshots)..."
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
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Attach files: documents, transcripts, testimonial screenshots"
            className="flex items-center justify-center rounded-2xl border border-[rgba(74,18,89,0.2)] bg-white/70 px-4 py-2 transition-all hover:border-[#E0249C]/40"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(74,18,89,0.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,text/*,.txt,.md,.markdown,.csv,.rtf,.vtt,.srt,.log"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) handleAttach(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {canGenerate && (
        <div className="mt-8 border-t border-[rgba(74,18,89,0.08)] pt-8">
          <p className="mb-5 font-serif text-[22px] italic text-[#4A1259]/70">
            You've given Delivered enough to build the first version of your {outputName}. Generate it now, or keep going to make every recommendation throughout Rare Breed OS™ even more personalized.
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
          to="/ten-x-leap"
          className="inline-flex items-center gap-1.5 font-mono text-[13px] uppercase tracking-[0.22em] text-[#4A1259]/40 hover:text-[#E0249C] transition-colors"
        >
          ← Back to Phase Two
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
            <p className="eyebrow mb-2">Rare Breed Principle</p>
            <p className="font-serif text-base italic text-[#1F1623]/80">
              "{danasPrinciple}"
            </p>
          </div>
        )}
        {constitutionBuilt ? (
          <div className="mb-8 rounded-2xl border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.04)] p-6">
            <p className="eyebrow mb-2 text-[#c9a84c]">Rare Breed Constitution Designed</p>
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
          <p className="eyebrow mb-2">Rare Breed Principle</p>
          <p className="font-serif text-base italic text-[#1F1623]/80">
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
        {alreadyComplete ? "Continue →" : "Begin Designing →"}
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
  const [access, setAccess] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setProfile(readProfile());
    getUserAccess().then((a) => setAccess(a.phase2));
  }, []);

  if (access === null) return null;
  if (!access) return <PhaseLockedScreen phase="10x-leap" />;

  if (!mod) {
    return (
      <BrandShell>
        <div className="py-20 text-center">
          <p className="font-display text-2xl text-[#E0249C]">Module not found.</p>
          <Link to="/ten-x-leap" className="mt-6 inline-block font-mono text-sm text-[#4A1259]/60 hover:text-[#E0249C]">
            Back to Phase Two
          </Link>
        </div>
      </BrandShell>
    );
  }

  const phase = PHASES[1];
  const totalModules = phase.modules.length;
  const isComplete = done || mod.type === "anchor" || isModuleComplete(`phase2_${mod.id}`);
  const nextModule = moduleNumber < totalModules ? moduleNumber + 1 : null;

  function handleComplete() {
    setDone(true);
    setProfile(readProfile());
    if (nextModule) {
      navigate({ to: "/ten-x-leap/$module", params: { module: String(nextModule) } });
    } else {
      navigate({ to: "/dash" });
    }
  }

  return (
    <BrandShell hideStickyCta>
      {/* Header */}
      <div className="mb-12 mt-8">
        {/* Program name — centered with back arrow */}
        <div className="relative flex items-center justify-center mb-6">
          <Link
            to="/ten-x-leap"
            className="absolute left-0 font-mono text-[13px] text-[#4A1259]/45 hover:text-[#E0249C] transition-colors"
            aria-label="Back to The 10X Leap"
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

        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="font-mono text-[17px] tracking-[0.25em] text-[#4A1259]/50">
            Element {mod.number.toString().padStart(2, "0")} / {totalModules.toString().padStart(2, "0")}
          </span>
          {isComplete && (
            <span className="rounded-full border border-[rgba(201,168,76,0.45)] px-3 py-1 font-mono text-[12px] uppercase tracking-[0.2em] text-[#c9a84c]">
              Designed
            </span>
          )}
        </div>

        <h1 className="font-display text-[24px] leading-[1.05] tracking-wide text-shimmer text-center sm:text-[32px] md:text-[40px]">
          {mod.name}
        </h1>
        <p className="mt-4 font-serif text-[36px] font-light italic leading-snug text-[#4A1259]/65 text-center">
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
      {mod.type === "anchor" && (
        <div className="space-y-8">
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: "radial-gradient(120% 120% at 0% 0%, #2A0E33 0%, #170820 55%, #0D0512 100%)",
              border: "1px solid rgba(201,168,76,0.35)",
              boxShadow: "0 24px 80px -24px rgba(201,168,76,0.3)",
            }}
          >
            <div className="p-8 sm:p-10">
              <p className="font-mono text-[12px] uppercase tracking-[0.28em] mb-4" style={{ color: "rgba(201,168,76,0.8)" }}>
                ✦ Your Anchor · From Good Girl Prison Break
              </p>
              {profile.zog_code ? (
                <>
                  <h2 className="font-display text-shimmer-gold mb-6" style={{ fontSize: "clamp(26px, 5vw, 38px)", letterSpacing: "0.04em" }}>
                    Zone of Genius Code
                  </h2>
                  <div
                    className="font-serif leading-relaxed whitespace-pre-wrap"
                    style={{ color: "rgba(245,239,224,0.9)", fontSize: "clamp(17px, 2.2vw, 20px)" }}
                  >
                    {profile.zog_code}
                  </div>
                </>
              ) : (
                <div>
                  <h2 className="font-display mb-4" style={{ fontSize: "clamp(24px, 4vw, 34px)", color: "rgba(255,255,255,0.85)" }}>
                    Zone of Genius Code Not Yet Set
                  </h2>
                  <p className="font-serif italic mb-6" style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(17px, 2.2vw, 20px)" }}>
                    Your Zone of Genius Code is generated in Good Girl Prison Break. Complete Phase One first — then return here and your Code will appear automatically.
                  </p>
                  <Link
                    to="/prison-break"
                    className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-[13px] tracking-[0.18em] text-white"
                    style={{
                      background: "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
                      boxShadow: "0 8px 32px -8px rgba(224,36,156,0.4)",
                    }}
                  >
                    Go to Good Girl Prison Break →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {profile.zog_code && (
            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(74,18,89,0.12)" }}
            >
              <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[#4A1259]/50 mb-3">How your AI uses this</p>
              <p className="font-serif text-[18px] leading-relaxed text-[#1F1623]/80">
                Every element of the 10X Leap runs through this Code. When you drift back toward what you are capable of, your AI will catch it. When your answers come from your genius, your AI will confirm it. This is the lens — everything else is built through it.
              </p>
            </div>
          )}
        </div>
      )}

      {mod.type === "context" && (
        <Phase2ContextRunner
          key={mod.id}
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
        />
      )}

      {mod.type === "synthesis" && (
        <Phase2SynthesisRunner
          key={mod.id}
          moduleId={mod.id}
          outputKey={mod.outputKey!}
          outputName={mod.outputName!}
          nextDecision={mod.nextDecision}
          profile={profile}
          onComplete={handleComplete}
        />
      )}

      {/* Bottom nav — always visible */}
      <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-[rgba(74,18,89,0.08)] pt-10">
        {moduleNumber > 1 && (
          <Link
            to="/ten-x-leap/$module"
            params={{ module: String(moduleNumber - 1) }}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(74,18,89,0.2)] px-6 py-3 font-display text-[13px] tracking-[0.18em] text-[#4A1259]/70 hover:border-[#E0249C]/40 hover:text-[#E0249C] transition-colors"
          >
            ← Element {moduleNumber - 1}
          </Link>
        )}
        {(done || isComplete) && nextModule && (
          <Link
            to="/ten-x-leap/$module"
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
            to="/rare-breed-club"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-[13px] tracking-[0.18em] text-white"
            style={{
              background: "linear-gradient(135deg, #4A1259 0%, #E0249C 100%)",
              boxShadow: "0 8px 32px -8px rgba(74,18,89,0.35)",
            }}
          >
            Operating Manual Complete. Enter Delivered × Rare Breed Club →
          </Link>
        )}
      </div>
    </BrandShell>
  );
}
