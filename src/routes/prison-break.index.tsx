import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandShell } from "@/components/brand/BrandShell";
import { PHASES } from "@/lib/program-data";
import { readProfile, isModuleComplete } from "@/lib/profile";

export const Route = createFileRoute("/prison-break/")({
  head: () => ({
    meta: [{ title: "Good Girl Prison Break™ · Phase One" }],
  }),
  component: PrisonBreakIndex,
});

function PrisonBreakIndex() {
  const [completedKeys, setCompletedKeys] = useState<string[]>([]);
  const phase = PHASES[0];

  useEffect(() => {
    const profile = readProfile();
    setCompletedKeys(profile.completed_modules ?? []);
  }, []);

  const completedCount = phase.modules.filter((m) =>
    completedKeys.includes(`phase1_${m.id}`)
  ).length;

  const nextIncomplete = phase.modules.find(
    (m) => !completedKeys.includes(`phase1_${m.id}`)
  );

  return (
    <BrandShell hideStickyCta>
      <div className="mb-12 mt-8">
        <p className="eyebrow mb-2">Phase 01 · Good Girl Prison Break™</p>
        <h1 className="font-display text-[24px] leading-[1.0] tracking-wide text-shimmer sm:text-[32px] md:text-[40px]">
          Discover the outdated operating system that has been running your life.
        </h1>
        <p className="mt-5 max-w-2xl font-serif text-2xl font-light italic text-[#4A1259]/80">
          Because until you can see the system, you can't choose a new one.
        </p>
        <p className="mt-4 font-mono text-[14px] uppercase tracking-[0.2em] text-[#4A1259]/55">
          {completedCount} of {phase.modules.length} modules installed
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-12">
        <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-[rgba(74,18,89,0.1)]">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
            style={{
              width: `${Math.round((completedCount / phase.modules.length) * 100)}%`,
              background: "linear-gradient(90deg, #4A1259, #E0249C)",
            }}
          />
        </div>
      </div>

      {/* Continue button */}
      {nextIncomplete && (
        <div className="mb-12">
          <Link
            to="/prison-break/$module"
            params={{ module: String(nextIncomplete.number) }}
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-[13px] tracking-[0.18em] text-white"
            style={{
              background:
                "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
              boxShadow: "0 8px 32px -8px rgba(224,36,156,0.4)",
            }}
          >
            Continue Installation →
          </Link>
        </div>
      )}

      {/* Call Replays */}
      <div className="mb-12">
        <p className="eyebrow mb-5">Call Replays</p>
        <div className="space-y-3">
          {[
            { number: "01", title: "Calculate the Escape", description: "The full session where we map exactly what it costs to stay." },
            { number: "02", title: "Liberation Day", description: "The live call where we install your new operating system together." },
          ].map((call) => (
            <div
              key={call.number}
              className="flex items-center gap-6 rounded-2xl border p-6"
              style={{
                borderColor: "rgba(224,36,156,0.2)",
                background: "linear-gradient(135deg, rgba(224,36,156,0.05) 0%, rgba(74,18,89,0.04) 100%)",
              }}
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-mono text-[11px] tracking-[0.15em]"
                style={{ background: "rgba(224,36,156,0.12)", color: "#E0249C" }}
              >
                {call.number}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-lg tracking-[0.05em] text-[#1F1623]">{call.title}</p>
                <p className="mt-0.5 font-serif text-sm italic text-[#4A1259]/55">{call.description}</p>
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4A1259]/30">
                Coming Soon
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Module list */}
      <div className="mb-5">
        <p className="eyebrow">Liberation Modules</p>
      </div>
      <div className="space-y-3">
        {phase.modules.map((mod) => {
          const complete = completedKeys.includes(`phase1_${mod.id}`);
          const isNext = nextIncomplete?.id === mod.id;
          return (
            <Link
              key={mod.id}
              to="/prison-break/$module"
              params={{ module: String(mod.number) }}
              className="flex items-center gap-6 rounded-2xl border p-6 transition-all hover:-translate-y-0.5"
              style={{
                borderColor: complete
                  ? "rgba(201,168,76,0.3)"
                  : isNext
                    ? "rgba(224,36,156,0.5)"
                    : "rgba(74,18,89,0.1)",
                background: complete
                  ? "linear-gradient(135deg, rgba(201,168,76,0.09) 0%, rgba(240,223,160,0.04) 100%)"
                  : isNext
                    ? "linear-gradient(135deg, rgba(224,36,156,0.1) 0%, rgba(236,72,153,0.04) 100%)"
                    : "rgba(255,255,255,0.6)",
                boxShadow: isNext ? "0 4px 24px -6px rgba(224,36,156,0.2)" : "none",
              }}
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-mono text-[11px] tracking-[0.15em]"
                style={{
                  background: complete
                    ? "linear-gradient(135deg, rgba(201,168,76,0.25), rgba(201,168,76,0.12))"
                    : isNext
                      ? "linear-gradient(135deg, #E0249C, #EC4899)"
                      : "rgba(74,18,89,0.08)",
                  color: complete ? "#c9a84c" : isNext ? "#fff" : "#4A1259",
                }}
              >
                {complete ? "✓" : mod.number.toString().padStart(2, "0")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-2xl tracking-[0.05em] text-[#1F1623]">
                  {mod.name}
                </p>
                <p className="mt-1 font-serif text-[28px] italic leading-snug text-[#4A1259]/55">
                  {mod.tagline}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span
                  className="font-mono text-[9px] uppercase tracking-[0.2em]"
                  style={{
                    color: complete
                      ? "#c9a84c"
                      : isNext
                        ? "#E0249C"
                        : "rgba(74,18,89,0.3)",
                  }}
                >
                  {complete ? "Installed" : isNext ? "Active" : "Queued"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {completedCount === phase.modules.length && (
        <div className="mt-12 rounded-2xl border border-[rgba(224,36,156,0.2)] bg-[rgba(224,36,156,0.04)] p-8 text-center">
          <p className="font-display text-3xl tracking-wide text-shimmer mb-4">
            Phase One Complete
          </p>
          <p className="font-serif italic text-[#4A1259]/65 mb-6">
            You've discovered the operating system you've been living from. Now it's time to build a new one.
          </p>
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
        </div>
      )}
    </BrandShell>
  );
}
