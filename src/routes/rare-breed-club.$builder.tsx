import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BrandShell } from "@/components/brand/BrandShell";
import { Markdown } from "@/components/Markdown";
import { BrandMoodBoard } from "@/components/BrandMoodBoard";
import { BrandPhotoshoot } from "@/components/BrandPhotoshoot";
import { PHASES } from "@/lib/program-data";
import {
  readProfile,
  saveArtifact,
  saveConversation,
  markModuleComplete,
  isModuleComplete,
  buildStudioContext,
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
  const [loadingElapsed, setLoadingElapsed] = useState(0);
  const [showArtifact, setShowArtifact] = useState(false);
  const [artifact, setArtifact] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [refining, setRefining] = useState(false);
  const [listening, setListening] = useState(false);
  const [access, setAccess] = useState<boolean | null>(null);
  const [pendingImages, setPendingImages] = useState<{ name: string; dataUrl: string }[]>([]);
  const [brandImages, setBrandImages] = useState<{ name: string; dataUrl: string }[]>([]);
  const [imgNote, setImgNote] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef("");
  const brandFileRef = useRef<HTMLInputElement>(null);

  const isBrand = mod?.id === "brand";

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
  }, []);

  // Count seconds while the AI is working, so we can reassure her during long
  // Studio generations instead of showing a silent spinner.
  useEffect(() => {
    if (!loading) {
      setLoadingElapsed(0);
      return;
    }
    const t = setInterval(() => setLoadingElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [loading]);

  // Reload state whenever the Studio changes — otherwise the previous
  // Studio's artifact and conversation stay on screen.
  useEffect(() => {
    const p = readProfile();
    setProfile(p);
    setArtifact(null);
    setMessages([]);
    setError(null);
    setDone(false);
    setRefining(false);
    setInput("");
    setPendingImages([]);
    setImgNote(null);
    try {
      setBrandImages(p.brand_images ? JSON.parse(p.brand_images) : []);
    } catch {
      setBrandImages([]);
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [builderNumber]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (access === null) return null;
  if (!access) return <PhaseLockedScreen phase="rare-breed-club" />;

  async function initConversation(p: UserProfile, moduleId: string) {
    setLoading(true);
    try {
      const ctx = buildStudioContext(p, moduleId);
      const kickoff =
        moduleId === "brand"
          ? "I'm ready to begin my brand mood board. Don't recap what you've read. Read my Operating Manual and Zone of Genius quietly, then start the guided interview: open warmly from the core of what I give people at an identity level (name it back to me from my Manual), and ask me your first question. One question at a time, always with examples or a starting point. We'll get to metaphors, the brick-and-mortar test, and gathering reference images."
          : ctx.trim()
            ? "I'm ready to begin. Everything you need is already in your context — don't ask me to paste anything, and don't recap or announce what you've read. Open by naming the one specific input this Studio builds on, then GENERATE my options and first-pass draft now, built from my actual conclusions. Keep this first pass tight — options I can react to, not the whole finished playbook. Then let me choose and refine."
            : "I'm ready to begin. Note: I haven't finished designing my business in the 10X Leap yet, so tell me exactly what to complete first rather than asking me to paste anything.";
      const greeting = await sendModuleMessage({
        data: {
          moduleId,
          messages: [{ role: "user", content: kickoff }],
          context: ctx,
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

  // Drop from the "complete" view back into the chat to refine — but seed the
  // conversation with the saved output so the AI actually has it to work on.
  function refineWithAI() {
    if (!mod) return;
    const saved = artifact ?? (readProfile()[mod.outputKey as keyof UserProfile] as string | undefined) ?? "";
    const existingConvo = readProfile().conversations?.[mod.id] ?? [];
    const alreadyHasDoc =
      !!saved && existingConvo.some((m) => m.role === "assistant" && m.content.trim() === saved.trim());
    const seeded: ChatMessage[] =
      alreadyHasDoc || !saved
        ? [...existingConvo]
        : [
            ...existingConvo,
            {
              role: "user",
              content: `Here's the ${mod.outputName} you generated for me. I want to refine it — keep everything that's working and only change what I ask for.`,
            },
            { role: "assistant", content: saved },
          ];
    setMessages(seeded);
    saveConversation(mod.id, seeded);
    setRefining(true);
    setShowArtifact(false);
    setDone(false);
    setArtifact(null);
  }

  async function restartConversation() {
    if (!mod) return;
    const raw = localStorage.getItem('rare_breed_profile');
    const p = raw ? JSON.parse(raw) : {};
    if (p.conversations) delete p.conversations[mod.id];
    localStorage.setItem('rare_breed_profile', JSON.stringify(p));
    setMessages([]);
    setInput("");
    initConversation(readProfile(), mod.id);
  }

  if (!mod) {
    return (
      <BrandShell>
        <div className="py-20 text-center">
          <p className="font-display text-2xl text-[#E0249C]">Builder not found.</p>
          <Link to="/rare-breed-club" className="mt-6 inline-block font-mono text-sm text-[#4A1259]/60 hover:text-[#E0249C]">
            Back to Club
          </Link>
        </div>
      </BrandShell>
    );
  }

  const userTurns = messages.filter((m) => m.role === "user").length;
  const aiReady = messages.some(
    (m) => m.role === "assistant" && m.content.includes("[[READY]]")
  );
  const canGenerate = (aiReady || userTurns >= 3 || refining) && !artifact;
  const isComplete = done || isModuleComplete(`phase3_${mod.id}`);
  const nextBuilder = builderNumber < phase3.modules.length ? builderNumber + 1 : null;

  function readAsDataURL(file: File): Promise<string> {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result ?? ""));
      r.onerror = () => rej(r.error);
      r.readAsDataURL(file);
    });
  }

  // Add reference images: keep them for the next send (so the AI sees them) and
  // save them to the brand library for future reference.
  async function addBrandImages(files: FileList | File[]) {
    setImgNote(null);
    const imgs = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!imgs.length) return;
    const loaded: { name: string; dataUrl: string }[] = [];
    for (const f of imgs) loaded.push({ name: f.name, dataUrl: await readAsDataURL(f) });
    const nextPending = [...pendingImages, ...loaded];
    setPendingImages(nextPending);
    const nextLibrary = [...brandImages, ...loaded];
    const json = JSON.stringify(nextLibrary);
    if (json.length > 3_500_000) {
      setImgNote("That's a lot of image data to store. These are attached for this analysis, but add fewer or smaller images if you want them saved to your library.");
      return;
    }
    setBrandImages(nextLibrary);
    saveArtifact("brand_images", json);
  }

  function removePendingImage(idx: number) {
    setPendingImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function send() {
    const text = input.trim();
    const hasImages = pendingImages.length > 0;
    if ((!text && !hasImages) || loading) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    }
    setInput("");
    const outgoingImages = pendingImages.map((i) => i.dataUrl);
    setPendingImages([]);
    const userContent = text || `Here are ${outgoingImages.length} reference image${outgoingImages.length > 1 ? "s" : ""} for my brand. Read them and tell me what you see.`;
    const updated: ChatMessage[] = [...messages, { role: "user", content: userContent }];
    setMessages(updated);
    saveConversation(mod!.id, updated);
    setLoading(true);
    try {
      const reply = await sendModuleMessage({ data: { moduleId: mod!.id, messages: updated, context: buildStudioContext(readProfile(), mod!.id), images: outgoingImages.length ? outgoingImages : undefined } });
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
        data: { moduleId: mod!.id, messages, generatePrompt: mod!.generatePrompt, context: buildStudioContext(readProfile(), mod!.id) },
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
        {/* Program name — centered with back arrow */}
        <div className="relative flex items-center justify-center mb-6">
          <Link
            to="/rare-breed-club"
            className="absolute left-0 font-mono text-[13px] text-[#4A1259]/45 hover:text-[#E0249C] transition-colors"
            aria-label="Back to Delivered × Rare Breed Club"
          >
            ←
          </Link>
          <Link
            to="/rare-breed-club"
            className="font-display text-shimmer hover:opacity-75 transition-opacity"
            style={{ fontSize: "clamp(18px, 4vw, 32px)", letterSpacing: "0.06em" }}
          >
            Delivered × Rare Breed Club
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="font-mono text-[17px] tracking-[0.25em] text-[#4A1259]/50">
            Builder {mod.number.toString().padStart(2, "0")} / {phase3.modules.length.toString().padStart(2, "0")}
          </span>
          {isComplete && (
            <span className="rounded-full border border-[rgba(201,168,76,0.45)] px-3 py-1 font-mono text-[12px] uppercase tracking-[0.2em] text-[#c9a84c]">
              Complete
            </span>
          )}
        </div>
        <h1 className="font-display text-[24px] leading-[1.05] tracking-wide text-shimmer text-center sm:text-[32px] md:text-[40px]">
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

      {!artifact && nextBuilder && (
        <div className="mb-8 flex flex-col items-center gap-1">
          <Link
            to="/rare-breed-club/$builder"
            params={{ builder: String(nextBuilder) }}
            className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#4A1259]/45 transition-colors hover:text-[#E0249C]"
          >
            Skip this Studio for now →
          </Link>
          <span className="font-serif text-[13px] italic text-[#4A1259]/35">
            You can come back and build it anytime. Nothing after it is locked.
          </span>
        </div>
      )}

      {artifact ? (
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
              ✦ Studio Complete
            </p>
            <p
              className="font-display tracking-wide text-[#1F1623]"
              style={{ fontSize: "clamp(28px, 6vw, 44px)" }}
            >
              {mod.outputName}
            </p>
            <p
              className="mx-auto mt-5 max-w-lg font-serif italic text-[#4A1259]/80"
              style={{ fontSize: "clamp(18px, 2.6vw, 22px)" }}
            >
              Saved. Every Studio after this reads it before writing a word.
            </p>
            <p className="mx-auto mt-4 max-w-md font-serif leading-relaxed text-[#1F1623]/55">
              It lives here in this Studio, so you can open it to read or edit it, or
              refine it with the AI, anytime.
            </p>
          </div>

          {isBrand && (
            <div className="mb-6">
              <div className="mb-5 flex items-center gap-4">
                <span className="font-mono text-[13px] uppercase tracking-[0.35em] text-[#4A1259]/40">Brand Assets</span>
                <div className="flex-1 border-t border-[rgba(74,18,89,0.08)]" />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <BrandMoodBoard artifact={artifact} images={brandImages} />
                <BrandPhotoshoot brandArtifact={artifact} />
              </div>
            </div>
          )}

          <div className="mb-6 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowArtifact((v) => !v)}
              className="rounded-full border border-[rgba(74,18,89,0.25)] bg-white/70 px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.22em] text-[#4A1259]/70 hover:border-[#E0249C]/40 hover:text-[#E0249C] transition-colors"
            >
              {showArtifact ? "Hide it" : "Open / edit it"}
            </button>
            <button
              onClick={refineWithAI}
              className="rounded-full border border-[rgba(224,36,156,0.4)] bg-[rgba(224,36,156,0.06)] px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.22em] text-[#E0249C] hover:bg-[rgba(224,36,156,0.12)] transition-colors"
            >
              Refine with the AI
            </button>
          </div>

          {showArtifact && (
            <div className="mb-8 rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white/90 p-6">
              <p className="eyebrow mb-3">{mod.outputName} · edit freely, it saves as you type</p>
              <textarea
                value={artifact}
                onChange={(e) => {
                  setArtifact(e.target.value);
                  saveArtifact(mod.outputKey as keyof UserProfile, e.target.value);
                }}
                rows={20}
                className="w-full resize-y rounded-xl border border-[rgba(74,18,89,0.15)] bg-white/80 px-4 py-3 font-serif text-[16px] leading-relaxed text-[#1F1623] outline-none focus:border-[#E0249C]/40"
              />
            </div>
          )}

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
                to="/rare-breed-club"
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
                <p className="font-mono text-[13px] uppercase tracking-[0.25em] text-[#E0249C]/70">
                  Reading your Rare Breed Operating Manual...
                </p>
                <div className="flex items-center gap-1 text-[#4A1259]/40">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: "300ms" }} />
                </div>
                {loadingElapsed >= 5 && (
                  <p className="font-serif text-sm italic text-[#4A1259]/60">
                    {loadingElapsed < 25
                      ? "This is a big build. It reads your whole business first, then writes from it, so give it a moment..."
                      : "Still working. A full generation from everything you've built takes a little longer, hang tight, it's coming..."}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-5">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div style={{ fontSize: "20px" }} className={`max-w-[86%] rounded-2xl px-5 py-3.5 font-serif leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#E0249C]/10 text-[#1F1623]"
                      : "bg-[rgba(74,18,89,0.06)] text-[#1F1623]/90"
                  }`}>
                    {(() => {
                      const stripped = m.content.replace(/\[\[READY\]\]/g, "").trim();
                      if (m.role !== "assistant") return stripped;
                      return stripped ? (
                        <Markdown
                          text={stripped}
                          className="prose prose-sm max-w-none [&_h3]:text-lg [&_h3]:mt-5 [&_h3]:mb-1"
                        />
                      ) : (
                        <span className="italic text-[#4A1259]/75">
                          Locked in. Hit Generate below to save this and continue.
                        </span>
                      );
                    })()}
                  </div>
                </div>
              ))}
              {loading && messages.length > 0 && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-3 rounded-2xl bg-[rgba(74,18,89,0.06)] px-5 py-3.5">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#4A1259]/40" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#4A1259]/40" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#4A1259]/40" style={{ animationDelay: "300ms" }} />
                    </span>
                    {loadingElapsed >= 4 && (
                      <span className="font-serif text-sm italic text-[#4A1259]/60">
                        {loadingElapsed < 12
                          ? "This is a big build — writing the full thing for you. Give it a moment..."
                          : "Still going. Long, detailed outputs take a little longer — hang tight..."}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {error && (
            <p className="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
          )}

          {isBrand && (
            <div className="mb-3">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.length) addBrandImages(e.dataTransfer.files);
                }}
                className="rounded-2xl border border-dashed border-[rgba(74,18,89,0.25)] bg-white/50 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => brandFileRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-full border border-[#E0249C]/30 bg-[#E0249C]/[0.08] px-4 py-2 font-mono text-[12px] uppercase tracking-[0.2em] text-[#E0249C] hover:bg-[#E0249C]/[0.15]"
                  >
                    + Add reference images
                  </button>
                  <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#4A1259]/40">
                    {pendingImages.length > 0
                      ? `${pendingImages.length} attached · sends with your next message`
                      : brandImages.length > 0
                        ? `${brandImages.length} saved to your brand library`
                        : "Pinterest, screenshots, your own shots"}
                  </span>
                </div>
                {pendingImages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {pendingImages.map((img, i) => (
                      <div key={i} className="relative">
                        <img
                          src={img.dataUrl}
                          alt={img.name}
                          className="h-16 w-16 rounded-lg border border-[rgba(74,18,89,0.15)] object-cover"
                        />
                        <button
                          onClick={() => removePendingImage(i)}
                          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#4A1259] text-[13px] leading-none text-white"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {imgNote && (
                  <p className="mt-2 font-serif text-[13px] italic text-[#E0249C]/80">{imgNote}</p>
                )}
              </div>
              <input
                ref={brandFileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) addBrandImages(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
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
              className="flex-1 resize-none rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white/80 px-5 py-3.5 font-serif text-[18px] leading-relaxed text-[#1F1623] outline-none placeholder:text-[#4A1259]/30 focus:border-[#E0249C]/40"
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
                disabled={(!input.trim() && pendingImages.length === 0) || loading}
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

          <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.2em] text-[#4A1259]/40">
            {userTurns} {userTurns === 1 ? "response" : "responses"} recorded
            {!canGenerate && ` · ${3 - userTurns} more before generate unlocks`}
          </p>

          <div className="mt-10 flex items-center justify-between gap-4 border-t border-[rgba(74,18,89,0.08)] pt-8">
            <button
              onClick={restartConversation}
              disabled={loading}
              className="font-mono text-[13px] uppercase tracking-[0.22em] text-[#4A1259]/40 hover:text-[#E0249C] transition-colors disabled:opacity-40"
            >
              ↻ Start this element over
            </button>
            <Link
              to="/rare-breed-club"
              className="inline-flex items-center gap-1.5 font-mono text-[13px] uppercase tracking-[0.22em] text-[#4A1259]/40 hover:text-[#E0249C] transition-colors"
            >
              ← Back to Club
            </Link>
          </div>
        </div>
      )}
    </BrandShell>
  );
}
