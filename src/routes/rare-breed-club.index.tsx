import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandShell } from "@/components/brand/BrandShell";
import { PHASES } from "@/lib/program-data";
import { readProfile } from "@/lib/profile";
import { getUserAccess } from "@/lib/supabase-profile";
import { PhaseLockedScreen } from "@/components/PhaseLockedScreen";

export const Route = createFileRoute("/rare-breed-club/")({
  head: () => ({
    meta: [{ title: "Delivered × Rare Breed Club · Build Suite" }],
  }),
  component: RareBreedClubIndex,
});

const BUILDER_GROUPS = [
  {
    label: "Your Operating Manual",
    ids: ["operating-manual"],
    phase: "phase2",
  },
  {
    label: "Identity & Positioning",
    ids: ["dream-client", "offer-suite"],
    phase: "phase3",
  },
  {
    label: "Your Method & IP",
    ids: ["framework"],
    phase: "phase3",
  },
  {
    label: "Brand, Sales & Web",
    ids: ["brand", "sales-page", "website"],
    phase: "phase3",
  },
  {
    label: "Content, Email & Launch",
    ids: ["content-engine", "launch-planner"],
    phase: "phase3",
  },
  {
    label: "Business Vault",
    ids: ["rare-breed-hq"],
    phase: "phase3",
  },
];

function RareBreedClubIndex() {
  const [completedKeys, setCompletedKeys] = useState<string[]>([]);
  const [access, setAccess] = useState<boolean | null>(null);
  const phase3 = PHASES[2];
  const phase2 = PHASES[1];

  useEffect(() => {
    const profile = readProfile();
    setCompletedKeys(profile.completed_modules ?? []);
    getUserAccess().then((a) => setAccess(a.phase3));
  }, []);

  if (access === null) return null;
  if (!access) return <PhaseLockedScreen phase="rare-breed-club" />;

  function isBuilderComplete(builderId: string): boolean {
    return completedKeys.includes(`phase3_${builderId}`);
  }

  const completedBuilders = phase3.modules.filter((m) =>
    completedKeys.includes(`phase3_${m.id}`)
  ).length;

  return (
    <BrandShell hideStickyCta>
      <div className="mb-12 mt-8">
        <p className="eyebrow mb-3">Phase 03 · Build</p>
        <h1
          className="font-display text-shimmer leading-[0.92] tracking-wide"
          style={{ fontSize: "clamp(44px, 9vw, 78px)" }}
        >
          Delivered × Rare Breed Club
        </h1>
        <p
          className="mt-5 max-w-2xl font-serif font-light italic text-[#4A1259]/80"
          style={{ fontSize: "clamp(20px, 2.8vw, 26px)" }}
        >
          You're finally living inside the business you've been building toward.
        </p>
        <p className="mt-6 max-w-xl font-serif text-xl font-light italic text-[#4A1259]/80">
          Every Studio reads your Operating Manual before generating anything. Rare Breed OS™ already knows who you are. You never start from scratch again.
        </p>
      </div>

      {/* BRING YOUR OPERATING MANUAL TO LIFE section header */}
      <div
        className="mb-10 rounded-2xl p-8"
        style={{
          background: "linear-gradient(160deg, rgba(74,18,89,0.06) 0%, rgba(224,36,156,0.06) 100%)",
          border: "1px solid rgba(224,36,156,0.15)",
        }}
      >
        <p
          className="font-mono uppercase tracking-[0.3em] text-[#E0249C] mb-3"
          style={{ fontSize: "11px" }}
        >
          ✦ Activate Your Studios
        </p>
        <p
          className="font-display leading-[0.95] tracking-[0.04em] text-shimmer mb-4"
          style={{ fontSize: "clamp(22px, 5vw, 32px)" }}
        >
          Bring Your Operating Manual<br />to Life.
        </p>
        <p className="font-serif italic leading-relaxed text-[#1F1623]/75" style={{ fontSize: "17px", maxWidth: "560px" }}>
          Everything you built in The 10X Leap becomes the intelligence these Studios use to generate a business built from your unique genius—not someone else's template.
        </p>
      </div>

      {completedBuilders > 0 && (
        <div className="mb-12">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-[#4A1259]/55">
              {completedBuilders} of {phase3.modules.length} Studios complete
            </p>
          </div>
          <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-[rgba(74,18,89,0.1)]">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.round((completedBuilders / phase3.modules.length) * 100)}%`,
                background: "linear-gradient(90deg, #4A1259, #E0249C, #c9a84c)",
              }}
            />
          </div>
        </div>
      )}

      <div className="space-y-10">
        {BUILDER_GROUPS.map((group) => {
          const groupModules = group.phase === "phase2"
            ? phase2.modules.filter((m) => group.ids.includes(m.id))
            : phase3.modules.filter((m) => group.ids.includes(m.id));

          return (
            <div key={group.label}>
              <p className="eyebrow mb-4">{group.label}</p>
              <div className="space-y-3">
                {groupModules.map((mod) => {
                  if (group.phase === "phase2") {
                    const done = completedKeys.includes(`phase2_${mod.id}`);
                    return (
                      <Link
                        key={mod.id}
                        to="/ten-x-leap/$module"
                        params={{ module: String(mod.number) }}
                        className="flex items-center gap-6 rounded-2xl border p-6 transition-all hover:-translate-y-0.5"
                        style={{
                          borderColor: done ? "rgba(201,168,76,0.25)" : "rgba(74,18,89,0.1)",
                          background: done ? "rgba(201,168,76,0.04)" : "rgba(255,255,255,0.7)",
                        }}
                      >
                        <div
                          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-mono text-[14px]"
                          style={{
                            background: done ? "rgba(201,168,76,0.15)" : "rgba(74,18,89,0.08)",
                            color: done ? "#c9a84c" : "#4A1259",
                          }}
                        >
                          {done ? "✓" : "OS"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-[32px] tracking-[0.05em] text-[#1F1623]">
                            {mod.outputName}
                          </p>
                          <p className="mt-1 font-serif text-2xl italic leading-snug text-[#4A1259]/70">
                            Required input for every Studio
                          </p>
                        </div>
                        <span
                          className="font-mono text-[13px] uppercase tracking-[0.2em]"
                          style={{ color: done ? "#c9a84c" : "rgba(74,18,89,0.4)" }}
                        >
                          {done ? "Complete" : "Needed"}
                        </span>
                      </Link>
                    );
                  }

                  const complete = isBuilderComplete(mod.id);

                  return (
                    <Link
                      key={mod.id}
                      to="/rare-breed-club/$builder"
                      params={{ builder: String(mod.number) }}
                      className="flex items-center gap-6 rounded-2xl border p-6 transition-all hover:-translate-y-0.5"
                      style={{
                        borderColor: complete ? "rgba(201,168,76,0.25)" : "rgba(224,36,156,0.18)",
                        background: complete ? "rgba(201,168,76,0.04)" : "rgba(255,255,255,0.7)",
                      }}
                    >
                      <div
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-mono text-[14px] tracking-[0.1em]"
                        style={{
                          background: complete ? "rgba(201,168,76,0.15)" : "rgba(224,36,156,0.1)",
                          color: complete ? "#c9a84c" : "#E0249C",
                        }}
                      >
                        {complete ? "✓" : mod.number.toString().padStart(2, "0")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-[32px] tracking-[0.05em] text-[#1F1623]">
                          {mod.name}
                        </p>
                        <p className="mt-1 font-serif text-xl italic leading-snug text-[#4A1259]/70">
                          {mod.tagline}
                        </p>
                      </div>
                      <span
                        className="flex-shrink-0 font-mono text-[13px] uppercase tracking-[0.2em]"
                        style={{ color: complete ? "#c9a84c" : "#E0249C" }}
                      >
                        {complete ? "Complete" : "Start →"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-16 rounded-2xl border border-[rgba(74,18,89,0.1)] bg-white/60 p-8">
        <p className="eyebrow mb-3">How this works</p>
        <p className="font-serif text-lg leading-relaxed italic text-[#4A1259]/75">
          Every Studio reads your complete X Factor Operating Manual before generating anything. Each completed Studio makes the next one smarter. You are not filling out forms. You are building a living business powered by your own identity.
        </p>
      </div>
    </BrandShell>
  );
}
