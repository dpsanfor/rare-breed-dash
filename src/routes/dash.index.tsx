import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandShell } from "@/components/brand/BrandShell";
import { PHASES } from "@/lib/program-data";
import { readProfile, type UserProfile } from "@/lib/profile";
import { getUserAccess } from "@/lib/supabase-profile";

export const Route = createFileRoute("/dash/")({
  head: () => ({
    meta: [{ title: "Rare Breed OS™" }],
  }),
  component: DashHome,
});

const P1 = PHASES[0].modules;
const P2 = PHASES[1].modules;
const P3 = PHASES[2].modules;

function completedCount(ids: string[], prefix: string, profile: UserProfile) {
  const c = profile.completed_modules ?? [];
  return ids.filter((id) => c.includes(`${prefix}_${id}`)).length;
}

function allDone(ids: string[], prefix: string, profile: UserProfile) {
  return completedCount(ids, prefix, profile) === ids.length;
}

function nextModuleIndex(modules: typeof P1, prefix: string, profile: UserProfile) {
  const c = profile.completed_modules ?? [];
  const idx = modules.findIndex((m) => !c.includes(`${prefix}_${m.id}`));
  return idx === -1 ? modules.length - 1 : idx;
}

const PHASE_ACCENTS = {
  p1: {
    color: "#E0249C",
    bg: "linear-gradient(160deg, rgba(224,36,156,0.11) 0%, rgba(236,72,153,0.05) 100%)",
    border: "rgba(224,36,156,0.35)",
    shadow: "0 12px 48px -12px rgba(224,36,156,0.35)",
  },
  p2: {
    color: "#4A1259",
    bg: "linear-gradient(160deg, rgba(74,18,89,0.12) 0%, rgba(192,132,252,0.06) 100%)",
    border: "rgba(74,18,89,0.28)",
    shadow: "0 12px 48px -12px rgba(74,18,89,0.28)",
  },
  p3: {
    color: "#a07830",
    bg: "rgba(201,168,76,0.07)",
    border: "rgba(201,168,76,0.28)",
    shadow: "0 8px 40px -12px rgba(201,168,76,0.25)",
  },
};

// ── STANDARD PHASE CARD (P1 + P2) ───────────────────────────────────────────
function PhaseCard({
  phaseNum,
  name,
  descriptor,
  result,
  status,
  completed,
  total,
  accent,
  continueTo,
  continueParams,
}: {
  phaseNum: string;
  name: string;
  descriptor: string;
  result: string;
  status: "complete" | "active";
  completed: number;
  total: number;
  accent: { color: string; bg: string; border: string; shadow: string };
  continueTo?: string;
  continueParams?: Record<string, string>;
}) {
  const isComplete = status === "complete";
  const isActive = status === "active";
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      className="flex flex-col rounded-2xl p-6 h-full"
      style={{
        minHeight: "clamp(420px, 60vh, 640px)",
        background: isComplete ? "rgba(201,168,76,0.06)" : accent.bg,
        border: `1.5px solid ${isComplete ? "rgba(201,168,76,0.25)" : accent.border}`,
        boxShadow: isActive ? accent.shadow : "none",
      }}
    >
      {/* Phase label + status */}
      <div className="flex items-center justify-between mb-5">
        <p
          className="font-mono text-[11px] uppercase tracking-[0.28em] font-semibold"
          style={{ color: isComplete ? "rgba(201,168,76,0.8)" : accent.color }}
        >
          Phase {phaseNum}
        </p>
        {isComplete && (
          <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "#c9a84c" }}>
            ✦ Done
          </p>
        )}
        {isActive && completed > 0 && (
          <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: accent.color }}>
            ○ Active
          </p>
        )}
      </div>

      {/* Phase name */}
      <p
        className="font-display leading-[0.88] tracking-[0.02em] mb-6"
        style={{ fontSize: "clamp(32px, 7.5vw, 46px)", color: "#1F1623" }}
      >
        {name}
      </p>

      {/* Descriptor */}
      <p
        className="font-serif italic leading-[1.25] mb-5"
        style={{
          fontSize: "clamp(16px, 3.75vw, 21px)",
          color: isComplete ? "rgba(74,18,89,0.6)" : "#1F1623",
        }}
      >
        {descriptor}
      </p>

      {/* Result */}
      <p
        className="font-serif italic leading-[1.3] flex-1 mb-6"
        style={{
          fontSize: "clamp(16px, 3.75vw, 21px)",
          color: isComplete ? "rgba(74,18,89,0.4)" : "#1F1623",
        }}
      >
        {result}
      </p>

      {/* Progress + CTA */}
      {isActive && (
        <div className="mt-auto">
          <div className="flex gap-[5px] mb-2 flex-wrap">
            {Array.from({ length: Math.min(total, 8) }).map((_, i) => (
              <div
                key={i}
                className="h-[7px] w-[7px] rounded-full flex-shrink-0"
                style={{ background: i < completed ? accent.color : "rgba(74,18,89,0.12)" }}
              />
            ))}
            {total > 8 && (
              <span className="font-mono text-[10px]" style={{ color: "rgba(74,18,89,0.4)" }}>
                +{total - 8}
              </span>
            )}
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] mb-4" style={{ color: "rgba(74,18,89,0.5)" }}>
            {completed}/{total} · {pct}%
          </p>
          {continueTo && (
            <Link
              to={continueTo as any}
              params={continueParams as any}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full py-3 font-display text-[14px] tracking-[0.12em] text-white transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${accent.color} 0%, #c9a84c 100%)`,
                boxShadow: accent.shadow,
              }}
            >
              Continue →
            </Link>
          )}
        </div>
      )}

      {isComplete && (
        <div className="mt-auto">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-4" style={{ color: "rgba(201,168,76,0.7)" }}>
            ✦ {total}/{total} installed
          </p>
          {continueTo && (
            <Link
              to={continueTo as any}
              params={continueParams as any}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full py-3 font-display text-[14px] tracking-[0.12em] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              style={{
                color: "#1F1623",
                border: "1.5px solid rgba(201,168,76,0.5)",
                background: "rgba(201,168,76,0.08)",
              }}
            >
              Revisit →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// ── FEATURED RBC CARD (Phase 03) ────────────────────────────────────────────
function FeaturedCard({
  descriptor,
  result,
  status,
  completed,
  total,
  continueTo,
  continueParams,
  locked,
}: {
  descriptor: string;
  result: string;
  status: "complete" | "active";
  completed: number;
  total: number;
  continueTo?: string;
  continueParams?: Record<string, string>;
  locked?: boolean;
}) {
  const isComplete = status === "complete";
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      className="flex flex-col rounded-2xl p-6 h-full relative overflow-hidden"
      style={{
        minHeight: "clamp(420px, 60vh, 640px)",
        background: isComplete
          ? "rgba(201,168,76,0.08)"
          : "linear-gradient(160deg, rgba(224,36,156,0.42) 0%, rgba(192,132,252,0.52) 28%, rgba(217,70,239,0.58) 52%, rgba(192,132,252,0.52) 76%, rgba(224,36,156,0.42) 100%)",
        border: "1.5px solid rgba(224,36,156,0.45)",
        boxShadow: "0 16px 70px -12px rgba(224,36,156,0.45), 0 0 0 1px rgba(224,36,156,0.1) inset",
      }}
    >
      {/* Iridescent shimmer overlays */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 10%, rgba(217,70,239,0.35) 0%, transparent 45%), radial-gradient(ellipse at 15% 90%, rgba(192,132,252,0.3) 0%, transparent 45%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[50px] rounded-l-2xl"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.55) 25%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0.55) 75%, transparent 100%)",
          filter: "blur(8px)",
          animation: "rb-side-shimmer 3.2s ease-in-out infinite",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[10px] rounded-l-2xl"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.5) 70%, transparent 100%)",
          animation: "rb-side-shimmer 3.2s ease-in-out infinite",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-[50px] rounded-r-2xl"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.5) 25%, rgba(255,255,255,0.72) 50%, rgba(255,255,255,0.5) 75%, transparent 100%)",
          filter: "blur(8px)",
          animation: "rb-side-shimmer 3.2s ease-in-out infinite 1.6s",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-[10px] rounded-r-2xl"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.45) 28%, rgba(255,255,255,0.65) 52%, rgba(255,255,255,0.45) 74%, transparent 100%)",
          animation: "rb-side-shimmer 3.2s ease-in-out infinite 1.6s",
        }}
      />
      {[
        { top: "14%", delay: "0s", size: "11px" },
        { top: "38%", delay: "0.7s", size: "8px" },
        { top: "62%", delay: "1.3s", size: "10px" },
        { top: "84%", delay: "0.4s", size: "7px" },
      ].map((s, i) => (
        <span key={`sl-${i}`} className="pointer-events-none absolute select-none" style={{ top: s.top, left: "6px", fontSize: s.size, color: i % 2 === 0 ? "#E0249C" : "#c9a84c", animation: `rb-twinkle 2.2s ease-in-out infinite ${s.delay}`, lineHeight: 1 }}>✦</span>
      ))}
      {[
        { top: "22%", delay: "1.1s", size: "9px" },
        { top: "46%", delay: "0.3s", size: "11px" },
        { top: "70%", delay: "1.6s", size: "8px" },
        { top: "90%", delay: "0.8s", size: "10px" },
      ].map((s, i) => (
        <span key={`sr-${i}`} className="pointer-events-none absolute select-none" style={{ top: s.top, right: "6px", fontSize: s.size, color: i % 2 === 0 ? "#c9a84c" : "#D946EF", animation: `rb-twinkle 2.2s ease-in-out infinite ${s.delay}`, lineHeight: 1 }}>✦</span>
      ))}

      {/* Phase label + badge */}
      <div className="flex items-center justify-between mb-5 relative">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] font-semibold" style={{ color: "rgba(31,22,35,0.6)" }}>
          Phase 03 · Build
        </p>
        {isComplete ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "#c9a84c" }}>
            ✦ Installed
          </p>
        ) : (
          <p
            className="font-mono text-[9px] uppercase tracking-[0.2em] rounded-full px-2 py-0.5"
            style={{
              color: "#fff",
              background: "linear-gradient(135deg, #E0249C, #D946EF)",
              border: "1px solid rgba(224,36,156,0.4)",
              boxShadow: "0 2px 10px -2px rgba(217,70,239,0.4)",
            }}
          >
            ✦ Flagship
          </p>
        )}
      </div>

      {/* Phase name — shimmer */}
      <p
        className="font-display text-shimmer leading-[0.88] tracking-[0.02em] mb-6 relative"
        style={{ fontSize: "clamp(32px, 7.5vw, 46px)" }}
      >
        Delivered × Rare Breed Club
      </p>

      {/* Descriptor */}
      <p
        className="font-serif italic leading-[1.25] mb-5 relative"
        style={{
          fontSize: "clamp(16px, 3.75vw, 21px)",
          color: isComplete ? "rgba(74,18,89,0.6)" : "#1F1623",
        }}
      >
        {descriptor}
      </p>

      {/* Result */}
      <p
        className="font-serif font-bold italic leading-[1.3] flex-1 mb-6 relative"
        style={{
          fontSize: "clamp(16px, 3.75vw, 21px)",
          color: isComplete ? "rgba(74,18,89,0.4)" : "rgba(31,22,35,0.82)",
        }}
      >
        {result}
      </p>

      {/* Progress + CTA */}
      <div className="mt-auto relative">
        {locked ? (
          <div className="flex flex-col gap-3">
            <Link
              to={continueTo as any}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full py-3.5 font-display text-[14px] tracking-[0.12em] text-white transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #D946EF 0%, #E0249C 50%, #c9a84c 100%)",
                boxShadow: "0 8px 36px -8px rgba(217,70,239,0.55)",
              }}
            >
              Learn More →
            </Link>
            <Link
              to={"/login" as any}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full py-3.5 font-display text-[14px] tracking-[0.12em] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              style={{
                color: "#1F1623",
                border: "1.5px solid rgba(255,255,255,0.5)",
                background: "rgba(255,255,255,0.25)",
              }}
            >
              Log In →
            </Link>
          </div>
        ) : (
          <>
            <div className="flex gap-[5px] mb-2 flex-wrap">
              {Array.from({ length: Math.min(total, 8) }).map((_, i) => (
                <div
                  key={i}
                  className="h-[7px] w-[7px] rounded-full flex-shrink-0"
                  style={{ background: i < completed ? "#c9a84c" : "rgba(201,168,76,0.2)" }}
                />
              ))}
              {total > 8 && (
                <span className="font-mono text-[10px]" style={{ color: "rgba(31,22,35,0.7)" }}>
                  +{total - 8}
                </span>
              )}
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] mb-4" style={{ color: "rgba(31,22,35,0.65)" }}>
              {completed}/{total} · {pct}%
            </p>
            {continueTo && !isComplete && (
              <Link
                to={continueTo as any}
                params={continueParams as any}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-full py-3.5 font-display text-[14px] tracking-[0.12em] text-white transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #D946EF 0%, #E0249C 50%, #c9a84c 100%)",
                  boxShadow: "0 8px 36px -8px rgba(217,70,239,0.55)",
                }}
              >
                {completed === 0 ? "Enter Phase Three →" : "Continue →"}
              </Link>
            )}
            {isComplete && (
              <>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-4" style={{ color: "#c9a84c" }}>
                  ✦ {total}/{total} installed
                </p>
                {continueTo && (
                  <Link
                    to={continueTo as any}
                    params={continueParams as any}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-full py-3.5 font-display text-[14px] tracking-[0.12em] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                    style={{
                      color: "#1F1623",
                      border: "1.5px solid rgba(201,168,76,0.5)",
                      background: "rgba(201,168,76,0.1)",
                    }}
                  >
                    Revisit →
                  </Link>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── LOCKED PHASE CARD (no access purchased yet) ──────────────────────────────
function LockedPhaseCard({
  phaseNum,
  name,
  tagline,
  accent,
  enterTo,
}: {
  phaseNum: string;
  name: string;
  tagline: string;
  accent: { color: string; bg: string; border: string; shadow: string };
  enterTo: string;
}) {
  return (
    <div
      className="flex flex-col rounded-2xl p-6 h-full"
      style={{
        minHeight: "clamp(420px, 60vh, 640px)",
        background: accent.bg,
        border: `1.5px solid ${accent.border}`,
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <p
          className="font-mono text-[11px] uppercase tracking-[0.28em] font-semibold"
          style={{ color: accent.color }}
        >
          Phase {phaseNum}
        </p>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] rounded-full px-2 py-0.5" style={{ color: accent.color, border: `1px solid ${accent.border}` }}>
          Not enrolled
        </p>
      </div>

      <p
        className="font-display leading-[0.88] tracking-[0.02em] mb-6"
        style={{ fontSize: "clamp(32px, 7.5vw, 46px)", color: "#1F1623" }}
      >
        {name}
      </p>

      <p className="font-serif italic leading-[1.3] mb-6 text-[#4A1259]/70" style={{ fontSize: "clamp(16px, 3.75vw, 20px)" }}>
        {tagline}
      </p>

      <div className="flex-1 space-y-4 mb-8">
        <p className="font-serif text-[17px] leading-relaxed text-[#1F1623]">
          Five AI-guided design phases that transform your Zone of Genius into a complete business blueprint — your Rare Breed Operating Manual™.
        </p>
        <p className="font-serif text-[17px] leading-relaxed text-[#1F1623]">
          Every future offer, client, launch, and piece of content built from the same foundation.
        </p>
        <p className="font-serif text-[17px] font-semibold text-[#1F1623]">
          Not another strategy. A business designed around you.
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <Link
          to={enterTo as any}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full py-3 font-display text-[14px] tracking-[0.12em] text-white transition-all hover:-translate-y-0.5"
          style={{
            background: `linear-gradient(135deg, ${accent.color} 0%, #c9a84c 100%)`,
            boxShadow: accent.shadow,
          }}
        >
          Learn More →
        </Link>
        <Link
          to={"/login" as any}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full py-3 font-display text-[14px] tracking-[0.12em] transition-all hover:-translate-y-0.5"
          style={{
            color: accent.color,
            border: `1.5px solid ${accent.border}`,
            background: "rgba(255,255,255,0.5)",
          }}
        >
          Log In →
        </Link>
      </div>
    </div>
  );
}

function DashHome() {
  const [profile, setProfile] = useState<UserProfile>({});
  const [mounted, setMounted] = useState(false);
  const [access, setAccess] = useState<{ phase1: boolean; phase2: boolean; phase3: boolean } | null>(null);

  useEffect(() => {
    setProfile(readProfile());
    setMounted(true);
    getUserAccess().then(setAccess);
  }, []);

  const p1Ids = P1.map((m) => m.id);
  const p2Ids = P2.map((m) => m.id);
  const p3Ids = P3.map((m) => m.id);

  const p1Count = completedCount(p1Ids, "phase1", profile);
  const p2Count = completedCount(p2Ids, "phase2", profile);
  const p3Count = completedCount(p3Ids, "phase3", profile);

  const p1Done = mounted && allDone(p1Ids, "phase1", profile);
  const p2Done = mounted && allDone(p2Ids, "phase2", profile);

  const nextP1Idx = nextModuleIndex(P1, "phase1", profile);
  const nextP2Idx = nextModuleIndex(P2, "phase2", profile);
  const nextP3Idx = nextModuleIndex(P3, "phase3", profile);

  const p1Status: "complete" | "active" = p1Done ? "complete" : "active";
  const p2Status: "complete" | "active" = p2Done ? "complete" : "active";
  const p3Status: "complete" | "active" = p3Count === P3.length ? "complete" : "active";

  return (
    <BrandShell hideStickyCta>

      {/* ── BRAND MARK ───────────────────────────────────────── */}
      <div className="mb-10 mt-4">
        <h1
          className="font-display text-shimmer leading-[0.82] tracking-[0.1em]"
          style={{ fontSize: "clamp(64px, 20vw, 96px)" }}
        >
          RARE
          <br />
          BREED
        </h1>
        <p
          className="font-mono uppercase tracking-[0.32em] mt-3"
          style={{ fontSize: "clamp(11px, 2.2vw, 14px)", color: "rgba(74,18,89,0.45)" }}
        >
          identity x business builder
        </p>
      </div>

      {/* ── YOUR JOURNEY — responsive grid ─────────────────────── */}
      <div className="mb-8">
        <div className="grid grid-cols-1 gap-4 items-stretch lg:grid-cols-3">
          <PhaseCard
            phaseNum="01 · Discover"
            name="Good Girl Prison Break™"
            descriptor="Reveal the outdated operating system you've been living from—and get complete clarity on what deserves to be left behind and what deserves to be built."
            result="You leave knowing exactly what isn't yours, what you've outgrown, and which 20% of your work has been waiting to lead. Not a business plan. The clarity that makes every future business decision obvious."
            status={p1Status}
            completed={p1Count}
            total={P1.length}
            accent={PHASE_ACCENTS.p1}
            continueTo="/prison-break"
            continueParams={undefined}
          />
          {access?.phase2 ? (
            <PhaseCard
              phaseNum="02 · Design"
              name="The 10X Leap™"
              descriptor="Create the life and business that naturally emerge from your Zone of Genius. Every exercise becomes structured intelligence stored in your Rare Breed Operating Manual™."
              result="You are not building assets. You are building the intelligence your future business will run from. When your Operating Manual is complete, Rare Breed OS™ brings the rest to life."
              status={p2Status}
              completed={p2Count}
              total={P2.length}
              accent={PHASE_ACCENTS.p2}
              continueTo="/ten-x-leap"
              continueParams={undefined}
            />
          ) : (
            <LockedPhaseCard
              phaseNum="02 · Design"
              name="10X Leap™"
              tagline="Design your complete business around your Zone of Genius."
              accent={PHASE_ACCENTS.p2}
              enterTo="/ten-x-leap"
            />
          )}
          {access?.phase3 ? (
            <FeaturedCard
              descriptor="Install your Rare Breed Operating Manual™ into Rare Breed OS™. Every Studio already knows who you are—and uses that intelligence to generate your messaging, offers, content, emails, launches, curriculum, brand, and business systems."
              result="Everything generated from your Operating Manual. Not from generic AI. Not from someone else's template. From your unique genius. Watch your business come to life."
              status={p3Status}
              completed={p3Count}
              total={P3.length}
              continueTo="/rare-breed-club"
              continueParams={undefined}
            />
          ) : (
            <FeaturedCard
              descriptor="Your Rare Breed Operating Manual™ plugs into twelve AI Studios that already know who you are — generating your messaging, offers, sales pages, content, launches, and brand from one source."
              result="You did the deep thinking once. You never start from a blank page again."
              status={p3Status}
              completed={p3Count}
              total={P3.length}
              continueTo="/rare-breed-club"
              continueParams={undefined}
              locked
            />
          )}
        </div>
      </div>

      {/* Voice Library — always accessible, add to it anytime */}
      <Link
        to={"/voice-library" as any}
        className="mb-8 flex w-full items-center justify-between gap-4 rounded-2xl border p-6 transition-all hover:-translate-y-0.5"
        style={{
          borderColor: "rgba(224,36,156,0.25)",
          background: "linear-gradient(135deg, rgba(224,36,156,0.05) 0%, rgba(201,168,76,0.05) 100%)",
        }}
      >
        <div>
          <p className="font-display text-xl tracking-[0.03em] text-[#1F1623]">
            Your Voice Library
          </p>
          <p className="mt-1 font-serif text-sm italic text-[#4A1259]/60">
            Add your real writing, transcripts, and testimonial screenshots anytime. The more you add, the more everything sounds like you.
          </p>
        </div>
        <span className="flex-shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-[#E0249C]">
          Open →
        </span>
      </Link>

    </BrandShell>
  );
}
