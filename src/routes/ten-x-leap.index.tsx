import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandShell } from "@/components/brand/BrandShell";
import { PHASES } from "@/lib/program-data";
import { readProfile } from "@/lib/profile";
import { getUserAccess } from "@/lib/supabase-profile";
import { PhaseLockedScreen } from "@/components/PhaseLockedScreen";

export const Route = createFileRoute("/ten-x-leap/")({
  head: () => ({
    meta: [{ title: "The 10X Leap™ · Phase Two" }],
  }),
  component: TenXLeapIndex,
});

function TenXLeapIndex() {
  const [completedKeys, setCompletedKeys] = useState<string[]>([]);
  const [access, setAccess] = useState<boolean | null>(null);
  const phase = PHASES[1];

  useEffect(() => {
    const profile = readProfile();
    setCompletedKeys(profile.completed_modules ?? []);
    getUserAccess().then((a) => setAccess(a.phase2));
  }, []);

  if (access === null) return null;
  if (!access) return <PhaseLockedScreen phase="10x-leap" />;

  const completedCount = phase.modules.filter((m) =>
    completedKeys.includes(`phase2_${m.id}`)
  ).length;

  const nextIncomplete = phase.modules.find(
    (m) => !completedKeys.includes(`phase2_${m.id}`)
  );

  return (
    <BrandShell hideStickyCta>
      <div className="mb-12 mt-8">
        <p className="eyebrow mb-2">Phase 02 · The 10X Leap™</p>
        <h1 className="font-display text-[24px] leading-[1.0] tracking-wide text-shimmer sm:text-[32px] md:text-[40px]">
          Create the life and business<br />your Zone of Genius has been waiting for.
        </h1>
        <p className="mt-6 max-w-xl font-serif text-xl font-light italic text-[#4A1259]/80">
          {completedCount} of {phase.modules.length} modules complete.
        </p>
      </div>

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
            className="inline-flex items-center gap-2 rounded-full px-10 py-5 font-display text-[20px] tracking-[0.14em] text-white"
            style={{
              background: "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
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
                  ? "rgba(201,168,76,0.3)"
                  : isNext
                    ? "rgba(74,18,89,0.45)"
                    : "rgba(74,18,89,0.1)",
                background: complete
                  ? "linear-gradient(135deg, rgba(201,168,76,0.09) 0%, rgba(240,223,160,0.04) 100%)"
                  : isNext
                    ? "linear-gradient(135deg, rgba(74,18,89,0.1) 0%, rgba(192,132,252,0.05) 100%)"
                    : "rgba(255,255,255,0.6)",
                boxShadow: isNext ? "0 4px 24px -6px rgba(74,18,89,0.2)" : "none",
              }}
            >
              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-mono text-[14px] tracking-[0.15em]"
                style={{
                  background: complete
                    ? "linear-gradient(135deg, rgba(201,168,76,0.25), rgba(201,168,76,0.12))"
                    : isNext
                      ? "linear-gradient(135deg, #4A1259, #6B21A8)"
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
                <p className="mt-1 font-serif text-[32px] italic leading-snug text-[#4A1259]/75">
                  {mod.tagline}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span
                  className="font-mono text-[13px] uppercase tracking-[0.2em]"
                  style={{
                    color: complete
                      ? "#c9a84c"
                      : isNext
                        ? "#E0249C"
                        : "rgba(74,18,89,0.4)",
                  }}
                >
                  {complete ? "Installed" : isNext ? "Active" : "Queued"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div
          className="mt-12 rounded-2xl p-10 text-center"
          style={{
            background: "linear-gradient(160deg, rgba(224,36,156,0.1) 0%, rgba(74,18,89,0.12) 50%, rgba(201,168,76,0.08) 100%)",
            border: "1.5px solid rgba(224,36,156,0.3)",
            boxShadow: "0 16px 60px -12px rgba(224,36,156,0.25)",
          }}
        >
          <p className="font-mono uppercase tracking-[0.3em] text-[#E0249C] mb-4" style={{ fontSize: "12px" }}>
            Your Operating Manual is Ready
          </p>
          <p className="font-display text-shimmer leading-[1.0] tracking-wide mb-6" style={{ fontSize: "clamp(28px, 6vw, 42px)" }}>
            You've Built the Blueprint.
            <br />
            Now It's Time to Bring It to Life.
          </p>
          <p className="font-serif italic text-[#1F1623] mx-auto mb-4 leading-relaxed" style={{ fontSize: "18px", maxWidth: "560px" }}>
            Everything you've created inside The 10X Leap becomes the intelligence Rare Breed OS™ uses to generate a business built from your unique genius — not someone else's template.
          </p>
          <p className="font-serif italic text-[rgba(31,22,35,0.65)] mx-auto mb-10 leading-relaxed" style={{ fontSize: "17px", maxWidth: "520px" }}>
            Instead of spending months figuring out what to sell, say, and build, you'll begin with a business generated from who you are — then continuously refine it as you grow.
          </p>
          <Link
            to="/rare-breed-club/"
            className="inline-flex items-center gap-2 rounded-full px-10 py-5 font-display tracking-[0.18em] text-white"
            style={{
              fontSize: "clamp(14px, 3vw, 18px)",
              background: "linear-gradient(135deg, #D946EF 0%, #E0249C 50%, #c9a84c 100%)",
              boxShadow: "0 12px 40px -8px rgba(217,70,239,0.5)",
            }}
          >
            {completedCount === phase.modules.length ? "Activate My Operating Manual™ →" : "Preview Rare Breed Club™ →"}
          </Link>
        </div>
    </BrandShell>
  );
}
