import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandShell } from "@/components/brand/BrandShell";
import { PHASES } from "@/lib/program-data";
import { readProfile, type UserProfile } from "@/lib/profile";

export const Route = createFileRoute("/dash/")({
  head: () => ({
    meta: [{ title: "Rare Breed Dashboard" }],
  }),
  component: DashHome,
});

// Which modules belong to which phase (using outputKey or id)
const PHASE1_MODULE_KEYS = [
  "welcome",
  "x-vs-y",
  "wanted-vs-needed",
  "dead-weight",
  "comfort-cage",
  "approval-map",
  "language-detection",
  "good-girl-os",
];

const PHASE2_MODULE_KEYS = [
  "bigger-vision",
  "release-80",
  "constitution",
  "magic-gumdrop",
  "zone-of-genius",
  "category-of-one",
  "business-blueprint",
];

function getPhase1Progress(profile: UserProfile) {
  const completed = profile.completed_modules ?? [];
  return PHASE1_MODULE_KEYS.filter((k) => completed.includes(`phase1_${k}`)).length;
}

function getPhase2Progress(profile: UserProfile) {
  const completed = profile.completed_modules ?? [];
  return PHASE2_MODULE_KEYS.filter((k) => completed.includes(`phase2_${k}`)).length;
}

function getNextPhase1Module(profile: UserProfile): number {
  const completed = profile.completed_modules ?? [];
  for (let i = 0; i < PHASE1_MODULE_KEYS.length; i++) {
    if (!completed.includes(`phase1_${PHASE1_MODULE_KEYS[i]}`)) return i + 1;
  }
  return 8;
}

function getNextPhase2Module(profile: UserProfile): number {
  const completed = profile.completed_modules ?? [];
  for (let i = 0; i < PHASE2_MODULE_KEYS.length; i++) {
    if (!completed.includes(`phase2_${PHASE2_MODULE_KEYS[i]}`)) return i + 1;
  }
  return 7;
}

const PHASE_COLORS = {
  active: { border: "rgba(224,36,156,0.25)", bg: "rgba(255,255,255,0.9)", bar: "linear-gradient(90deg, #4A1259, #E0249C)" },
  locked: { border: "rgba(74,18,89,0.1)", bg: "rgba(255,255,255,0.5)", bar: "" },
  complete: { border: "rgba(224,36,156,0.4)", bg: "rgba(224,36,156,0.04)", bar: "linear-gradient(90deg, #E0249C, #c9a84c)" },
};

function DashHome() {
  const [profile, setProfile] = useState<UserProfile>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setProfile(readProfile());
    setMounted(true);
  }, []);

  const p1Progress = getPhase1Progress(profile);
  const p2Progress = getPhase2Progress(profile);
  const p1Total = PHASE1_MODULE_KEYS.length;
  const p2Total = PHASE2_MODULE_KEYS.length;

  const p1Complete = p1Progress === p1Total;
  const p2Active = p1Complete;
  const p2Complete = p2Progress === p2Total;
  const p3Active = p2Complete;

  const nextP1 = mounted ? getNextPhase1Module(profile) : 1;
  const nextP2 = mounted ? getNextPhase2Module(profile) : 1;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning." : hour < 17 ? "Good afternoon." : "Good evening.";

  return (
    <BrandShell hideStickyCta>
      {/* Header */}
      <div className="mb-16 mt-8">
        <p className="eyebrow mb-4">Rare Breed OS™ · Dashboard</p>
        <h1 className="font-display text-[52px] leading-[1] tracking-wide text-shimmer sm:text-[72px] md:text-[96px]">
          {greeting}
        </h1>
        <p className="mt-6 max-w-xl font-serif text-xl font-light italic text-[#4A1259]/65">
          {!mounted
            ? "Loading your installation status..."
            : p1Complete && p2Complete
              ? "Your Rare Breed OS is installed. Everything runs through the filter."
              : p1Complete
                ? "Phase One complete. You're in Phase Two — creating the business only you could build."
                : `Phase One in progress. ${p1Progress} of ${p1Total} modules installed.`}
        </p>
      </div>

      {/* Phase installations */}
      <div className="space-y-4">
        {/* PHASE 1 */}
        {(() => {
          const status = p1Complete ? "complete" : "active";
          const c = PHASE_COLORS[status];
          const pct = Math.round((p1Progress / p1Total) * 100);
          return (
            <div
              className="rounded-2xl border p-8 transition-all"
              style={{ borderColor: c.border, background: c.bg }}
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="font-mono text-[10px] tracking-[0.3em] text-[#E0249C]/60">
                      PHASE 01
                    </span>
                    <span
                      className="rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em]"
                      style={{
                        borderColor: p1Complete ? "rgba(201,168,76,0.4)" : "rgba(224,36,156,0.35)",
                        color: p1Complete ? "#c9a84c" : "#E0249C",
                      }}
                    >
                      {p1Complete ? "Installed" : "Active"}
                    </span>
                  </div>
                  <h2 className="font-display text-4xl tracking-wide text-shimmer md:text-5xl">
                    Good Girl Prison Break™
                  </h2>
                  <p className="mt-2 font-serif text-base italic text-[#4A1259]/60">
                    Discover the operating system you've been living from.
                  </p>
                </div>
                {p1Complete && (
                  <span className="font-display text-3xl text-[#E0249C]">✓</span>
                )}
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="font-mono text-[10px] text-[#4A1259]/40">
                    {p1Progress} of {p1Total} modules installed
                  </p>
                  <p className="font-mono text-[10px] text-[#E0249C]/60">{pct}%</p>
                </div>
                <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-[rgba(74,18,89,0.1)]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
                    style={{ width: `${pct}%`, background: c.bar }}
                  />
                </div>
                <div className="mt-2 grid grid-cols-8 gap-0.5">
                  {PHASES[0].modules.map((m, i) => {
                    const done = (profile.completed_modules ?? []).includes(`phase1_${m.id}`);
                    return (
                      <div
                        key={m.id}
                        className="h-1 rounded-full"
                        style={{ background: done ? "#E0249C" : "rgba(74,18,89,0.12)" }}
                        title={`Module ${i + 1}: ${m.name}`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  to="/prison-break/$module"
                  params={{ module: String(p1Complete ? 8 : nextP1) }}
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-display text-[13px] tracking-[0.18em] text-white transition-transform hover:-translate-y-0.5 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
                    boxShadow: "0 8px 32px -8px rgba(224,36,156,0.4)",
                  }}
                >
                  {p1Complete ? "Review Installation" : "Continue Installation"} →
                </Link>
                <Link
                  to="/prison-break/"
                  className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#4A1259]/40 hover:text-[#E0249C]"
                >
                  All Modules
                </Link>
              </div>
            </div>
          );
        })()}

        {/* PHASE 2 */}
        {(() => {
          const status = !p1Complete ? "locked" : p2Complete ? "complete" : "active";
          const c = PHASE_COLORS[status];
          const pct = p2Active ? Math.round((p2Progress / p2Total) * 100) : 0;
          return (
            <div
              className="rounded-2xl border p-8 transition-all"
              style={{
                borderColor: c.border,
                background: c.bg,
                opacity: !p1Complete ? 0.5 : 1,
              }}
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="font-mono text-[10px] tracking-[0.3em] text-[#4A1259]/40">
                      PHASE 02
                    </span>
                    <span className="rounded-full border border-[rgba(74,18,89,0.2)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#4A1259]/40">
                      {p2Complete ? "Installed" : p2Active ? "Active" : "Locked"}
                    </span>
                  </div>
                  <h2 className="font-display text-4xl tracking-wide text-[#1F1623]/60 md:text-5xl">
                    The 10X Leap™
                  </h2>
                  <p className="mt-2 font-serif text-base italic text-[#4A1259]/40">
                    Install the Rare Breed Operating System™.
                  </p>
                </div>
                {p2Complete && <span className="font-display text-3xl text-[#E0249C]">✓</span>}
              </div>
              {p2Active && (
                <>
                  <div className="mb-6">
                    <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-[rgba(74,18,89,0.1)]">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ width: `${pct}%`, background: c.bar }}
                      />
                    </div>
                    <p className="mt-1.5 font-mono text-[10px] text-[#4A1259]/40">
                      {p2Progress} of {p2Total} modules installed
                    </p>
                  </div>
                  <Link
                    to="/ten-x-leap/$module"
                    params={{ module: String(nextP2) }}
                    className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-display text-[13px] tracking-[0.18em] text-white transition-transform hover:-translate-y-0.5"
                    style={{
                      background: "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
                      boxShadow: "0 8px 32px -8px rgba(224,36,156,0.4)",
                    }}
                  >
                    Continue Installation →
                  </Link>
                </>
              )}
            </div>
          );
        })()}

        {/* PHASE 3 */}
        <div
          className="rounded-2xl border p-8"
          style={{
            borderColor: "rgba(74,18,89,0.1)",
            background: "rgba(255,255,255,0.5)",
            opacity: p2Complete ? 1 : 0.4,
          }}
        >
          <div className="mb-2 flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.3em] text-[#4A1259]/40">
              PHASE 03
            </span>
            <span className="rounded-full border border-[rgba(74,18,89,0.15)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#4A1259]/35">
              {p2Complete ? "Active" : "Locked"}
            </span>
          </div>
          <h2 className="font-display text-4xl tracking-wide text-[#1F1623]/50 md:text-5xl">
            Rare Breed Club™
          </h2>
          <p className="mt-2 font-serif text-base italic text-[#4A1259]/35">
            Your operating system evolves every month.
          </p>
          {p2Complete && (
            <Link
              to="/leap/updates"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[rgba(74,18,89,0.2)] px-6 py-3 font-display text-[12px] tracking-[0.18em] text-[#4A1259]/60 hover:border-[#E0249C]/30 hover:text-[#E0249C]"
            >
              Enter Club →
            </Link>
          )}
        </div>
      </div>

      {/* Quick tools */}
      <div className="mt-14">
        <p className="eyebrow mb-5">Quick Tools</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { to: "/leap/decision-filter", label: "Decision Filter", desc: "Run a decision through the OS" },
            { to: "/leap/weekly-audit", label: "Weekly Audit", desc: "Friday operating check-in" },
            { to: "/leap/constitution", label: "Constitution", desc: "Your Rare Breed Constitution™" },
            { to: "/leap/os", label: "OS Dashboard", desc: "Installed artifacts and history" },
          ].map(({ to, label, desc }) => (
            <Link
              key={to}
              to={to}
              className="rounded-2xl border border-[rgba(74,18,89,0.1)] bg-white/60 p-5 transition-all hover:-translate-y-0.5 hover:border-[#E0249C]/25"
            >
              <p className="font-display text-base tracking-[0.1em] text-[#1F1623]">{label}</p>
              <p className="mt-1 font-serif text-xs italic text-[#4A1259]/50">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </BrandShell>
  );
}
