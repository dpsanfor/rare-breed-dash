import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandShell } from "@/components/brand/BrandShell";
import { PHASES } from "@/lib/program-data";
import { readProfile } from "@/lib/profile";

export const Route = createFileRoute("/ten-x-leap/")({
  head: () => ({
    meta: [{ title: "The 10X Leap™ · Phase Two" }],
  }),
  component: TenXLeapIndex,
});

function TenXLeapIndex() {
  const [completedKeys, setCompletedKeys] = useState<string[]>([]);
  const [phase1Complete, setPhase1Complete] = useState(false);
  const phase = PHASES[1];
  const phase1 = PHASES[0];

  useEffect(() => {
    const profile = readProfile();
    const completed = profile.completed_modules ?? [];
    setCompletedKeys(completed);
    const p1Done = phase1.modules.every((m) =>
      completed.includes(`phase1_${m.id}`)
    );
    setPhase1Complete(p1Done);
  }, []);

  const completedCount = phase.modules.filter((m) =>
    completedKeys.includes(`phase2_${m.id}`)
  ).length;

  const nextIncomplete = phase.modules.find(
    (m) => !completedKeys.includes(`phase2_${m.id}`)
  );

  if (!phase1Complete) {
    return (
      <BrandShell hideStickyCta>
        <div className="py-24 text-center">
          <p className="eyebrow mb-6">Phase 02 · The 10X Leap™</p>
          <h1 className="font-display text-[40px] leading-[1.05] tracking-wide text-[#1F1623]/50 sm:text-[56px]">
            Complete Phase One first.
          </h1>
          <p className="mt-6 font-serif text-base italic text-[#4A1259]/50">
            The 10X Leap installs a new operating system. You need to understand the current one first.
          </p>
          <Link
            to="/prison-break/"
            className="mt-10 inline-flex items-center gap-2 rounded-full border border-[rgba(74,18,89,0.2)] px-7 py-3.5 font-display text-[12px] tracking-[0.18em] text-[#4A1259]/60 hover:border-[#E0249C]/30 hover:text-[#E0249C]"
          >
            Go to Phase One →
          </Link>
        </div>
      </BrandShell>
    );
  }

  return (
    <BrandShell hideStickyCta>
      <div className="mb-12 mt-8">
        <p className="eyebrow mb-4">Phase 02 · The 10X Leap™</p>
        <h1 className="font-display text-[48px] leading-[1.0] tracking-wide text-shimmer sm:text-[64px] md:text-[80px]">
          Install the Rare Breed<br />Operating System™.
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

      {nextIncomplete && (
        <div className="mb-12">
          <Link
            to="/ten-x-leap/$module"
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

      <div className="space-y-3">
        {phase.modules.map((mod) => {
          const complete = completedKeys.includes(`phase2_${mod.id}`);
          const isNext = nextIncomplete?.id === mod.id;
          return (
            <Link
              key={mod.id}
              to="/ten-x-leap/$module"
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
              <span
                className="flex-shrink-0 font-mono text-[9px] uppercase tracking-[0.2em]"
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
            </Link>
          );
        })}
      </div>

      {completedCount === phase.modules.length && (
        <div className="mt-12 rounded-2xl border border-[rgba(224,36,156,0.2)] bg-[rgba(224,36,156,0.04)] p-8 text-center">
          <p className="font-display text-3xl tracking-wide text-shimmer mb-4">
            Rare Breed OS™ Installed
          </p>
          <p className="font-serif italic text-[#4A1259]/65 mb-6">
            You've installed your Rare Breed Operating System and created your Operating Manual. Inside Rare Breed Club, your Operating Manual powers an entire suite of AI builders that transform your identity into a complete business.
          </p>
          <Link
            to="/dash/"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(74,18,89,0.2)] px-7 py-3.5 font-display text-[12px] tracking-[0.18em] text-[#4A1259]/60 hover:border-[#E0249C]/30 hover:text-[#E0249C]"
          >
            Return to Dashboard →
          </Link>
        </div>
      )}
    </BrandShell>
  );
}
