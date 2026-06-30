import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandShell } from "@/components/brand/BrandShell";
import { PHASES } from "@/lib/program-data";
import { readProfile, type UserProfile } from "@/lib/profile";

export const Route = createFileRoute("/dash/")({
  head: () => ({
    meta: [{ title: "Rare Breed OS™ · Dashboard" }],
  }),
  component: DashHome,
});

const PHASE1_IDS = PHASES[0].modules.map((m) => m.id);
const PHASE2_IDS = PHASES[1].modules.map((m) => m.id);
const PHASE3_IDS = PHASES[2].modules.map((m) => m.id);

function p1Progress(profile: UserProfile) {
  const c = profile.completed_modules ?? [];
  return PHASE1_IDS.filter((id) => c.includes(`phase1_${id}`)).length;
}
function p2Progress(profile: UserProfile) {
  const c = profile.completed_modules ?? [];
  return PHASE2_IDS.filter((id) => c.includes(`phase2_${id}`)).length;
}
function p3Progress(profile: UserProfile) {
  const c = profile.completed_modules ?? [];
  return PHASE3_IDS.filter((id) => c.includes(`phase3_${id}`)).length;
}
function nextIncomplete(ids: string[], prefix: string, profile: UserProfile) {
  const c = profile.completed_modules ?? [];
  const idx = ids.findIndex((id) => !c.includes(`${prefix}_${id}`));
  return idx === -1 ? ids.length - 1 : idx;
}
function isComplete(ids: string[], prefix: string, profile: UserProfile) {
  const c = profile.completed_modules ?? [];
  return ids.every((id) => c.includes(`${prefix}_${id}`));
}

// Derive Today's Focus items from profile state
function getTodaysFocus(profile: UserProfile, mounted: boolean) {
  if (!mounted) return [];
  const items: { label: string; path: string; params?: Record<string, string> }[] = [];
  const p1Done = isComplete(PHASE1_IDS, "phase1", profile);
  const p2Done = isComplete(PHASE2_IDS, "phase2", profile);

  if (!p1Done) {
    const idx = nextIncomplete(PHASE1_IDS, "phase1", profile);
    const mod = PHASES[0].modules[idx];
    items.push({ label: `Complete: ${mod.name}`, path: `/prison-break/${idx + 1}` });
  } else if (!p2Done) {
    const idx = nextIncomplete(PHASE2_IDS, "phase2", profile);
    const mod = PHASES[1].modules[idx];
    items.push({ label: `Complete: ${mod.name}`, path: `/ten-x-leap/${idx + 1}` });
  } else {
    const idx = nextIncomplete(PHASE3_IDS, "phase3", profile);
    const mod = PHASES[2].modules[idx];
    items.push({ label: `Build: ${mod.name}`, path: `/rare-breed-club/${idx + 1}` });
  }

  if (!profile.dream_client) items.push({ label: "Build your Dream Client Playbook™", path: "/rare-breed-club/1" });
  if (!profile.messaging_blueprint && profile.dream_client) items.push({ label: "Translate dream client language into messaging", path: "/rare-breed-club/2" });
  if (!profile.content_strategy && profile.operating_manual) items.push({ label: "Set up your Content Operating System™", path: "/rare-breed-club/9" });

  return items.slice(0, 5);
}

// Contextual AI Coach message
function getCoachMessage(profile: UserProfile, mounted: boolean): string {
  if (!mounted) return "";
  const p1Done = isComplete(PHASE1_IDS, "phase1", profile);
  const p2Done = isComplete(PHASE2_IDS, "phase2", profile);
  const p3Count = p3Progress(profile);

  if (!p1Done) {
    const count = p1Progress(profile);
    if (count === 0) return "Your operating system has been running quietly in the background your entire life. Phase One makes it visible for the first time. This is the most important work you'll do.";
    if (count < 4) return "I'm noticing patterns in what you've shared. The woman who keeps showing up is more capable than she's letting herself believe. Keep going.";
    return "You're in the final stretch of Phase One. The patterns are becoming clear. What you're discovering isn't a problem to fix — it's an operating system to upgrade.";
  }
  if (!p2Done) {
    return "Phase Two is where identity shifts from discovered to installed. Every module you complete is a decision the woman you're becoming would make. You're not learning this — you're becoming it.";
  }
  if (p3Count === 0) {
    return "Your Operating Manual is the foundation. Everything built in Rare Breed Club reads from it. The business you're about to build isn't a collection of offers — it's a physical expression of who you've become.";
  }
  if (p3Count < 4) {
    return "The Builders are reading your Operating Manual before they ask you anything. That's by design. Every recommendation is traced back to your identity — not a template.";
  }
  if (!profile.content_strategy) {
    return "Your offer infrastructure is building. The Content Operating System™ is what makes it visible to the market. Once it's running, your business starts finding people — not the other way around.";
  }
  return "You're building something that only you could build. The next move is refinement, not creation. What's already here — what's the highest-leverage thing to make more irresistible?";
}

// Business snapshot status
function builderStatus(key: keyof UserProfile, profile: UserProfile): "complete" | "in-progress" | "locked" {
  if (profile[key]) return "complete";
  return "locked";
}

const SNAPSHOT_ITEMS = [
  { label: "Dream Client", key: "dream_client" as keyof UserProfile, icon: "🍬", path: "/rare-breed-club/1" },
  { label: "Messaging", key: "messaging_blueprint" as keyof UserProfile, icon: "💎", path: "/rare-breed-club/2" },
  { label: "Offers", key: "offer_suite" as keyof UserProfile, icon: "🦄", path: "/rare-breed-club/3" },
  { label: "Brand", key: "brand_blueprint" as keyof UserProfile, icon: "💾", path: "/rare-breed-club/10" },
  { label: "Content", key: "content_strategy" as keyof UserProfile, icon: "🌱", path: "/rare-breed-club/9" },
  { label: "Launch", key: "launch_blueprint" as keyof UserProfile, icon: "🔥", path: "/rare-breed-club/11" },
];

function StatusBadge({ status }: { status: "complete" | "in-progress" | "locked" }) {
  if (status === "complete") return (
    <span className="rounded-full border border-[rgba(201,168,76,0.35)] px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.15em] text-[#c9a84c]">
      Complete
    </span>
  );
  if (status === "in-progress") return (
    <span className="rounded-full border border-[rgba(224,36,156,0.3)] px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.15em] text-[#E0249C]">
      In Progress
    </span>
  );
  return (
    <span className="rounded-full border border-[rgba(74,18,89,0.15)] px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.15em] text-[#4A1259]/35">
      Not Started
    </span>
  );
}

function DashHome() {
  const [profile, setProfile] = useState<UserProfile>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setProfile(readProfile());
    setMounted(true);
  }, []);

  const p1Done = mounted && isComplete(PHASE1_IDS, "phase1", profile);
  const p2Done = mounted && isComplete(PHASE2_IDS, "phase2", profile);
  const p1Count = p1Progress(profile);
  const p2Count = p2Progress(profile);
  const p3Count = p3Progress(profile);
  const focus = getTodaysFocus(profile, mounted);
  const coachMessage = getCoachMessage(profile, mounted);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning." : hour < 17 ? "Good afternoon." : "Good evening.";

  const currentPhaseLabel = !p1Done ? "Phase One" : !p2Done ? "Phase Two" : "Rare Breed Club™";
  const overallPct = mounted
    ? Math.round(((p1Count + p2Count + p3Count) / (PHASE1_IDS.length + PHASE2_IDS.length + PHASE3_IDS.length)) * 100)
    : 0;

  return (
    <BrandShell hideStickyCta>
      {/* ── GREETING ── */}
      <div className="mb-10 mt-8">
        <p className="font-mono text-[13px] uppercase tracking-[0.28em] text-[#4A1259]/40">{greeting}</p>
      </div>

      {/* ── HERO: WHO YOU'RE BECOMING ── */}
      <div
        className="mb-6 overflow-hidden rounded-3xl border p-8 sm:p-10"
        style={{
          borderColor: "rgba(224,36,156,0.2)",
          background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,239,224,0.8) 100%)",
        }}
      >
        <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#E0249C]/55 mb-4">
          Who You're Becoming
        </p>
        {profile.bigger_vision ? (
          <p className="font-serif text-lg font-light italic leading-relaxed text-[#1F1623]/80 max-w-2xl">
            "{profile.bigger_vision.slice(0, 220)}{profile.bigger_vision.length > 220 ? "…" : ""}"
          </p>
        ) : (
          <p className="font-serif text-lg font-light italic text-[#4A1259]/40">
            Your Bigger Vision installs in Phase Two.
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#4A1259]/35 mb-1">Current Phase</p>
            <p className="font-display text-[17px] tracking-[0.08em] text-[#1F1623]">{currentPhaseLabel}</p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#4A1259]/35 mb-1">OS Installation</p>
            <div className="flex items-center gap-3">
              <div className="relative h-[5px] w-36 overflow-hidden rounded-full bg-[rgba(74,18,89,0.1)]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
                  style={{
                    width: `${overallPct}%`,
                    background: "linear-gradient(90deg, #4A1259, #E0249C, #c9a84c)",
                  }}
                />
              </div>
              <span className="font-mono text-[12px] text-[#E0249C]/70">{overallPct}%</span>
            </div>
          </div>
          {profile.operating_manual && (
            <Link
              to="/ten-x-leap/$module"
              params={{ module: "7" }}
              className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[#c9a84c] hover:text-[#E0249C] transition-colors"
            >
              <span>💾</span> View Operating Manual
            </Link>
          )}
        </div>
      </div>

      {/* ── TWO-COLUMN MIDDLE ── */}
      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_340px]">

        {/* TODAY'S FOCUS */}
        <div className="rounded-3xl border border-[rgba(74,18,89,0.1)] bg-white/80 p-7">
          <p className="font-mono text-[12px] uppercase tracking-[0.28em] text-[#4A1259]/40 mb-5">
            Today's Focus
          </p>
          {focus.length === 0 ? (
            <p className="font-serif text-base italic text-[#4A1259]/40">Calculating your priorities…</p>
          ) : (
            <ul className="space-y-3.5">
              {focus.map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.path as any}
                    className="group flex items-start gap-3.5"
                  >
                    <span
                      className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-[rgba(224,36,156,0.3)] font-mono text-[10px] text-[#E0249C]/60 group-hover:bg-[#E0249C]/10"
                    >
                      {i + 1}
                    </span>
                    <span className="font-serif text-[15px] leading-snug text-[#1F1623]/80 group-hover:text-[#E0249C]">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* AI COACH */}
        <div
          className="rounded-3xl border p-7"
          style={{
            borderColor: "rgba(74,18,89,0.12)",
            background: "linear-gradient(160deg, rgba(74,18,89,0.04) 0%, rgba(224,36,156,0.04) 100%)",
          }}
        >
          <p className="font-mono text-[12px] uppercase tracking-[0.28em] text-[#E0249C]/55 mb-4">
            AI Coach
          </p>
          <p className="font-serif text-[15px] font-light italic leading-relaxed text-[#1F1623]/75">
            {coachMessage || "Loading your coaching insight…"}
          </p>
          <div className="mt-5 h-px bg-[rgba(74,18,89,0.08)]" />
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#4A1259]/30">
            Dana Hayes · Rare Breed AI
          </p>
        </div>
      </div>

      {/* ── YOUR JOURNEY ── */}
      <div className="mb-6 rounded-3xl border border-[rgba(74,18,89,0.1)] bg-white/80 p-7">
        <p className="font-mono text-[12px] uppercase tracking-[0.28em] text-[#4A1259]/40 mb-6">
          Your Journey
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              phase: "01",
              name: "Good Girl Prison Break™",
              tagline: "Discover the operating system you've been living from.",
              count: p1Count,
              total: PHASE1_IDS.length,
              done: p1Done,
              active: !p1Done,
              path: "/prison-break/",
              continuePath: "/prison-break/$module" as const,
              continueParams: { module: String(nextIncomplete(PHASE1_IDS, "phase1", profile) + 1) },
              milestone: p1Done ? "All patterns revealed." : p1Count > 0 ? "OS becoming visible." : "Ready to begin.",
            },
            {
              phase: "02",
              name: "The 10X Leap™",
              tagline: "Install the Rare Breed Operating System™.",
              count: p2Count,
              total: PHASE2_IDS.length,
              done: p2Done,
              active: p1Done && !p2Done,
              path: "/ten-x-leap/",
              continuePath: "/ten-x-leap/$module" as const,
              continueParams: { module: String(nextIncomplete(PHASE2_IDS, "phase2", profile) + 1) },
              milestone: p2Done ? "New OS installed." : p2Count > 0 ? "Identity shifting." : p1Done ? "Ready to install." : "Unlocks after Phase One.",
            },
            {
              phase: "03",
              name: "Rare Breed Club™",
              tagline: "Your Operating Manual becomes your business.",
              count: p3Count,
              total: PHASE3_IDS.length,
              done: p3Count === PHASE3_IDS.length,
              active: p2Done,
              path: "/rare-breed-club/",
              continuePath: "/rare-breed-club/$builder" as const,
              continueParams: { builder: String(nextIncomplete(PHASE3_IDS, "phase3", profile) + 1) },
              milestone: p3Count === PHASE3_IDS.length ? "Business complete." : p3Count > 0 ? `${p3Count} playbooks built.` : p2Done ? "Ready to build." : "Unlocks after Phase Two.",
            },
          ].map((phase) => (
            <div
              key={phase.phase}
              className="rounded-2xl border p-5 transition-all"
              style={{
                borderColor: phase.done
                  ? "rgba(201,168,76,0.25)"
                  : phase.active
                    ? "rgba(224,36,156,0.2)"
                    : "rgba(74,18,89,0.08)",
                background: phase.done
                  ? "rgba(201,168,76,0.04)"
                  : phase.active
                    ? "rgba(224,36,156,0.03)"
                    : "rgba(255,255,255,0.4)",
                opacity: !phase.active && !phase.done ? 0.5 : 1,
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className="font-mono text-[12px] uppercase tracking-[0.2em]"
                  style={{ color: phase.done ? "#c9a84c" : phase.active ? "#E0249C" : "rgba(74,18,89,0.35)" }}
                >
                  Phase {phase.phase}
                </span>
                {phase.done && <span className="text-[#c9a84c] text-sm">✓</span>}
              </div>
              <h3 className="font-display text-[18px] leading-snug tracking-[0.04em] text-[#1F1623] mb-1.5">
                {phase.name}
              </h3>
              <p className="font-mono text-[11px] tracking-[0.08em] text-[#4A1259]/45 mb-4">
                {phase.milestone}
              </p>
              {/* Progress dots */}
              <div className="mb-4 flex gap-1 flex-wrap">
                {Array.from({ length: phase.total }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background: i < phase.count
                        ? phase.done ? "#c9a84c" : "#E0249C"
                        : "rgba(74,18,89,0.12)",
                    }}
                  />
                ))}
              </div>
              {phase.active && !phase.done && (
                <Link
                  to={phase.continuePath}
                  params={phase.continueParams as any}
                  className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#E0249C] hover:text-[#4A1259] transition-colors"
                >
                  Continue →
                </Link>
              )}
              {phase.done && (
                <Link
                  to={phase.path}
                  className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#c9a84c] hover:text-[#E0249C] transition-colors"
                >
                  Review →
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── BUSINESS SNAPSHOT ── */}
      {p2Done && (
        <div className="mb-6 rounded-3xl border border-[rgba(74,18,89,0.1)] bg-white/80 p-7">
          <div className="mb-6 flex items-center justify-between">
            <p className="font-mono text-[12px] uppercase tracking-[0.28em] text-[#4A1259]/40">
              Business Snapshot
            </p>
            <Link
              to="/rare-breed-club/"
              className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#4A1259]/35 hover:text-[#E0249C] transition-colors"
            >
              All Builders →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {SNAPSHOT_ITEMS.map(({ label, key, icon, path }) => {
              const status = builderStatus(key, profile);
              return (
                <Link
                  key={key}
                  to={path as any}
                  className="group rounded-2xl border p-4 transition-all hover:-translate-y-0.5"
                  style={{
                    borderColor: status === "complete"
                      ? "rgba(201,168,76,0.25)"
                      : "rgba(74,18,89,0.1)",
                    background: status === "complete"
                      ? "rgba(201,168,76,0.04)"
                      : "rgba(255,255,255,0.6)",
                  }}
                >
                  <div className="mb-3 text-xl">{icon}</div>
                  <p className="font-display text-[15px] tracking-[0.05em] text-[#1F1623] mb-1.5">{label}</p>
                  <StatusBadge status={status} />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── OPERATING MANUAL (heart of the product) ── */}
      {profile.operating_manual && (
        <div
          className="mb-6 rounded-3xl border p-7 sm:p-9"
          style={{
            borderColor: "rgba(201,168,76,0.3)",
            background: "linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(255,255,255,0.9) 100%)",
          }}
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="text-xl">💾</span>
            <p className="font-mono text-[12px] uppercase tracking-[0.28em] text-[#c9a84c]">
              Rare Breed Operating Manual™
            </p>
          </div>
          <p className="font-serif text-[15px] font-light italic leading-relaxed text-[#1F1623]/70 max-w-2xl mb-5">
            {profile.operating_manual.slice(0, 280)}{profile.operating_manual.length > 280 ? "…" : ""}
          </p>
          <Link
            to="/ten-x-leap/$module"
            params={{ module: "7" }}
            className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#c9a84c] hover:text-[#E0249C] transition-colors"
          >
            Read Full Manual →
          </Link>
        </div>
      )}

      {/* ── QUICK TOOLS ── */}
      <div className="mb-6">
        <p className="font-mono text-[12px] uppercase tracking-[0.28em] text-[#4A1259]/40 mb-5">Quick Tools</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { to: "/leap/decision-filter", label: "Decision Filter", desc: "Run a decision through the OS" },
            { to: "/leap/weekly-audit", label: "Weekly Audit", desc: "Friday operating check-in" },
            { to: "/leap/constitution", label: "Constitution", desc: "Your Rare Breed Constitution™" },
            { to: "/leap/os", label: "OS Dashboard", desc: "Installed artifacts and history" },
          ].map(({ to, label, desc }) => (
            <Link
              key={to}
              to={to as any}
              className="rounded-2xl border border-[rgba(74,18,89,0.1)] bg-white/60 p-5 transition-all hover:-translate-y-0.5 hover:border-[#E0249C]/25"
            >
              <p className="font-display text-[15px] tracking-[0.08em] text-[#1F1623]">{label}</p>
              <p className="mt-1 font-serif text-[13px] italic text-[#4A1259]/50">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── FLOATING QUICK CAPTURE ── */}
      <button
        onClick={() => alert("Quick Capture — coming soon. Ideas, voice notes, client insights, and stories save directly to your Content Vault™.")}
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #4A1259 0%, #E0249C 100%)",
          boxShadow: "0 8px 32px -4px rgba(224,36,156,0.45)",
        }}
        title="Quick Capture"
      >
        <span className="text-2xl leading-none">+</span>
      </button>
    </BrandShell>
  );
}
