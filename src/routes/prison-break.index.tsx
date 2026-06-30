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
        <p className="eyebrow mb-4">Phase 01 · Good Girl Prison Break™</p>
        <h1 className="font-display text-[48px] leading-[1.0] tracking-wide text-shimmer sm:text-[64px] md:text-[80px]">
          Discover the operating system<br />you've been living from.
        </h1>
        <p className="mt-6 max-w-xl font-serif text-lg font-light italic text-[#4A1259]/65">
          {completedCount} of {phase.modules.length} modules installed.
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

      {/* Module list */}
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
                  ? "rgba(201,168,76,0.25)"
                  : isNext
                    ? "rgba(224,36,156,0.3)"
                    : "rgba(74,18,89,0.1)",
                background: complete
                  ? "rgba(201,168,76,0.04)"
                  : isNext
                    ? "rgba(224,36,156,0.04)"
                    : "rgba(255,255,255,0.7)",
              }}
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-mono text-[11px] tracking-[0.15em]"
                style={{
                  background: complete
                    ? "rgba(201,168,76,0.15)"
                    : "rgba(74,18,89,0.08)",
                  color: complete ? "#c9a84c" : "#4A1259",
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
