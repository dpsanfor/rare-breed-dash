import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandShell } from "@/components/brand/BrandShell";
import { PHASES } from "@/lib/program-data";
import { readProfile, isModuleComplete } from "@/lib/profile";

export const Route = createFileRoute("/rare-breed-club/")({
  head: () => ({
    meta: [{ title: "Rare Breed Club™ · Build Suite" }],
  }),
  component: RareBreedClubIndex,
});

const BUILDER_GROUPS = [
  {
    label: "Foundation",
    ids: ["operating-manual"],
    phase: "phase2",
  },
  {
    label: "Business",
    ids: ["dream-client", "messaging", "offer-suite", "curriculum", "framework"],
    phase: "phase3",
  },
  {
    label: "Marketing",
    ids: ["sales-page", "email", "content-engine", "launch-planner"],
    phase: "phase3",
  },
  {
    label: "Brand",
    ids: ["brand"],
    phase: "phase3",
  },
  {
    label: "Business HQ",
    ids: ["rare-breed-hq"],
    phase: "phase3",
  },
];

function RareBreedClubIndex() {
  const [completedKeys, setCompletedKeys] = useState<string[]>([]);
  const [phase2Complete, setPhase2Complete] = useState(false);
  const phase3 = PHASES[2];
  const phase2 = PHASES[1];

  useEffect(() => {
    const profile = readProfile();
    const completed = profile.completed_modules ?? [];
    setCompletedKeys(completed);
    const p2Done = phase2.modules.every((m) =>
      completed.includes(`phase2_${m.id}`)
    );
    setPhase2Complete(p2Done);
  }, []);

  // Builders unlock sequentially: a builder unlocks when the previous one is complete
  function isBuilderUnlocked(builderNumber: number): boolean {
    if (!phase2Complete) return false;
    if (builderNumber === 1) return true;
    const prevId = phase3.modules[builderNumber - 2]?.id;
    return prevId ? completedKeys.includes(`phase3_${prevId}`) : false;
  }

  function isBuilderComplete(builderId: string): boolean {
    return completedKeys.includes(`phase3_${builderId}`);
  }

  const completedBuilders = phase3.modules.filter((m) =>
    completedKeys.includes(`phase3_${m.id}`)
  ).length;

  if (!phase2Complete) {
    return (
      <BrandShell hideStickyCta>
        <div className="py-24 text-center">
          <p className="eyebrow mb-6">Phase 03 · Rare Breed Club™</p>
          <h1 className="font-display text-[40px] leading-[1.05] tracking-wide text-[#1F1623]/50 sm:text-[56px]">
            Complete Phase Two first.
          </h1>
          <p className="mt-6 font-serif text-base italic text-[#4A1259]/50">
            Rare Breed Club uses your Operating Manual to build your business. You need the manual first.
          </p>
          <Link
            to="/ten-x-leap/"
            className="mt-10 inline-flex items-center gap-2 rounded-full border border-[rgba(74,18,89,0.2)] px-7 py-3.5 font-display text-[12px] tracking-[0.18em] text-[#4A1259]/60 hover:border-[#E0249C]/30 hover:text-[#E0249C]"
          >
            Go to Phase Two →
          </Link>
        </div>
      </BrandShell>
    );
  }

  return (
    <BrandShell hideStickyCta>
      <div className="mb-12 mt-8">
        <p className="eyebrow mb-4">Phase 03 · Rare Breed Club™</p>
        <h1 className="font-display text-[48px] leading-[1.0] tracking-wide text-shimmer sm:text-[64px] md:text-[80px]">
          Your Operating Manual<br />becomes your business.
        </h1>
        <p className="mt-6 max-w-xl font-serif text-lg font-light italic text-[#4A1259]/65">
          Each Builder reads your Operating Manual and every previous artifact before generating anything. You never start from scratch.
        </p>
      </div>

      {/* Overall progress */}
      {completedBuilders > 0 && (
        <div className="mb-12">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4A1259]/40">
              {completedBuilders} of {phase3.modules.length} builders complete
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

      {/* Builder groups */}
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
                  // For the foundation (Operating Manual from Phase 2)
                  if (group.phase === "phase2") {
                    const done = completedKeys.includes(`phase2_${mod.id}`);
                    return (
                      <Link
                        key={mod.id}
                        to="/ten-x-leap/$module"
                        params={{ module: String(mod.number) }}
                        className="flex items-center gap-6 rounded-2xl border p-6"
                        style={{
                          borderColor: done
                            ? "rgba(201,168,76,0.25)"
                            : "rgba(74,18,89,0.1)",
                          background: done
                            ? "rgba(201,168,76,0.04)"
                            : "rgba(255,255,255,0.7)",
                        }}
                      >
                        <div
                          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-mono text-[11px]"
                          style={{
                            background: done
                              ? "rgba(201,168,76,0.15)"
                              : "rgba(74,18,89,0.08)",
                            color: done ? "#c9a84c" : "#4A1259",
                          }}
                        >
                          {done ? "✓" : "OS"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-lg tracking-[0.05em] text-[#1F1623]">
                            {mod.outputName}
                          </p>
                          <p className="mt-0.5 font-serif text-sm italic text-[#4A1259]/55">
                            Required input for every builder
                          </p>
                        </div>
                        <span
                          className="font-mono text-[9px] uppercase tracking-[0.2em]"
                          style={{ color: done ? "#c9a84c" : "rgba(74,18,89,0.3)" }}
                        >
                          {done ? "Complete" : "Needed"}
                        </span>
                      </Link>
                    );
                  }

                  // Phase 3 builders
                  const complete = isBuilderComplete(mod.id);
                  const unlocked = isBuilderUnlocked(mod.number);

                  return (
                    <div
                      key={mod.id}
                      className="flex items-center gap-6 rounded-2xl border p-6 transition-all"
                      style={{
                        borderColor: complete
                          ? "rgba(201,168,76,0.25)"
                          : unlocked
                            ? "rgba(224,36,156,0.2)"
                            : "rgba(74,18,89,0.08)",
                        background: complete
                          ? "rgba(201,168,76,0.04)"
                          : unlocked
                            ? "rgba(224,36,156,0.04)"
                            : "rgba(255,255,255,0.5)",
                        opacity: !unlocked && !complete ? 0.6 : 1,
                      }}
                    >
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-mono text-[11px] tracking-[0.1em]"
                        style={{
                          background: complete
                            ? "rgba(201,168,76,0.15)"
                            : unlocked
                              ? "rgba(224,36,156,0.1)"
                              : "rgba(74,18,89,0.06)",
                          color: complete ? "#c9a84c" : unlocked ? "#E0249C" : "#4A1259",
                        }}
                      >
                        {complete ? "✓" : mod.number.toString().padStart(2, "0")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-lg tracking-[0.05em] text-[#1F1623]">
                          {mod.name}
                        </p>
                        <p className="mt-0.5 font-serif text-sm italic text-[#4A1259]/55">
                          {mod.tagline}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {complete ? (
                          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#c9a84c]">
                            Complete
                          </span>
                        ) : unlocked ? (
                          <Link
                            to="/rare-breed-club/$builder"
                            params={{ builder: String(mod.number) }}
                            className="rounded-full border border-[#E0249C]/30 px-4 py-1.5 font-display text-[11px] tracking-[0.12em] text-[#E0249C] hover:bg-[#E0249C]/10"
                          >
                            Start →
                          </Link>
                        ) : (
                          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4A1259]/25">
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-16 rounded-2xl border border-[rgba(74,18,89,0.1)] bg-white/60 p-8">
        <p className="eyebrow mb-3">How this works</p>
        <p className="font-serif text-base leading-relaxed italic text-[#4A1259]/65">
          Every Builder reads your complete Rare Breed Operating Manual before generating anything. Each completed Builder makes the next one smarter. You are not filling out forms — you are building a living business powered by your own identity.
        </p>
      </div>
    </BrandShell>
  );
}
