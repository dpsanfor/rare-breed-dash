import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandShell } from "@/components/brand/BrandShell";
import { PHASES } from "@/lib/program-data";
import { readProfile, isModuleComplete } from "@/lib/profile";
import { getUserAccess } from "@/lib/supabase-profile";
import { PhaseLockedScreen } from "@/components/PhaseLockedScreen";

export const Route = createFileRoute("/prison-break/")({
  head: () => ({
    meta: [{ title: "Good Girl Prison Break™ · Phase One" }],
  }),
  component: PrisonBreakIndex,
});

const ACTS: { act: string; title: string; range: [number, number] }[] = [
  { act: "Act One", title: "See the behaviors", range: [1, 4] },
  { act: "Act Two", title: "See the beliefs", range: [5, 8] },
  { act: "Act Three", title: "Embody the new identity", range: [9, 10] },
];

function PrisonBreakIndex() {
  const [completedKeys, setCompletedKeys] = useState<string[]>([]);
  const [openReplay, setOpenReplay] = useState<string | null>(null);
  const [access, setAccess] = useState<boolean | null>(null);
  const phase = PHASES[0];

  useEffect(() => {
    const profile = readProfile();
    setCompletedKeys(profile.completed_modules ?? []);
    getUserAccess().then((a) => setAccess(a.phase1));
  }, []);

  if (access === null) return null;
  if (!access) return <PhaseLockedScreen phase="prison-break" />;

  const completedCount = phase.modules.filter((m) =>
    completedKeys.includes(`phase1_${m.id}`)
  ).length;

  const nextIncomplete = phase.modules.find(
    (m) => !completedKeys.includes(`phase1_${m.id}`)
  );

  const allComplete =
    phase.modules.length > 0 && completedCount === phase.modules.length;

  return (
    <BrandShell hideStickyCta>
      <div className="mb-12 mt-8">
        <p className="eyebrow mb-3">Phase 01 · Discover</p>
        <h1
          className="font-display text-shimmer leading-[0.92] tracking-wide"
          style={{ fontSize: "clamp(44px, 9vw, 78px)" }}
        >
          Good Girl Prison Break™
        </h1>
        <p
          className="mt-5 max-w-2xl font-serif font-light italic text-[#4A1259]/80"
          style={{ fontSize: "clamp(20px, 2.8vw, 26px)" }}
        >
          Discover the outdated operating system that has been running your life. Because until you can see the system, you can't choose a new one.
        </p>
        <p className="mt-4 font-mono text-[14px] uppercase tracking-[0.2em] text-[#4A1259]/55">
          {completedCount} of {phase.modules.length} layers decoded
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
            { number: "01", title: "Calculate the Escape", description: "The full session where we map exactly what it costs to stay.", videoId: "OKSCcUCf0DY" },
            { number: "02", title: "Liberation Day", description: "The live call where we install your new operating system together.", videoId: "6eA-ed9QWVE" },
          ].map((call) => {
            const open = openReplay === call.number;
            return (
              <div
                key={call.number}
                className="rounded-2xl border p-6"
                style={{
                  borderColor: "rgba(224,36,156,0.2)",
                  background: "linear-gradient(135deg, rgba(224,36,156,0.05) 0%, rgba(74,18,89,0.04) 100%)",
                }}
              >
                <button
                  onClick={() => setOpenReplay(open ? null : call.number)}
                  className="flex w-full items-center gap-6 text-left"
                >
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-mono text-[13px] tracking-[0.15em]"
                    style={{ background: "rgba(224,36,156,0.12)", color: "#E0249C" }}
                  >
                    {call.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-lg tracking-[0.05em] text-[#1F1623]">{call.title}</p>
                    <p className="mt-0.5 font-serif text-sm italic text-[#4A1259]/55">{call.description}</p>
                  </div>
                  <span className="flex-shrink-0 font-mono text-[12px] uppercase tracking-[0.2em] text-[#E0249C]">
                    {open ? "Close ▲" : "Watch ▾"}
                  </span>
                </button>
                {open && (
                  <div
                    className="mt-5 overflow-hidden rounded-xl bg-black"
                    style={{ aspectRatio: "16 / 9" }}
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/${call.videoId}`}
                      title={call.title}
                      className="h-full w-full"
                      style={{ border: 0 }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* What this section is */}
      <div className="mb-8 border-t border-[rgba(74,18,89,0.12)] pt-10">
        <p className="eyebrow mb-3">The Layers</p>
        <h2
          className="font-display tracking-wide text-[#1F1623]"
          style={{ fontSize: "clamp(28px, 5vw, 42px)" }}
        >
          Decode All Ten Layers of Your Good Girl OS
        </h2>
        <p
          className="mt-3 max-w-2xl font-serif italic text-[#4A1259]/75"
          style={{ fontSize: "clamp(20px, 2.4vw, 21px)" }}
        >
          Each layer is a guided conversation that decodes another part of the operating system you've been running on, and generates the Code that hands you your Zone of Genius Code at the end. Move through them in order, one act at a time.
        </p>
      </div>

      {/* Module list — grouped by act */}
      {ACTS.map(({ act, title, range }) => (
        <div key={act} className="mb-10">
          <div className="mb-5 flex items-baseline gap-3">
            <p className="eyebrow">{act}</p>
            <p className="font-serif text-xl italic text-[#4A1259]/55">{title}</p>
          </div>
          <div className="space-y-3">
            {phase.modules
              .filter((m) => m.number >= range[0] && m.number <= range[1])
              .map((mod) => {
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
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-mono text-[13px] tracking-[0.15em]"
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
                <p className="font-display text-[28px] tracking-[0.05em] text-[#1F1623]">
                  {mod.name}
                </p>
                <p className="mt-1 font-serif text-2xl italic leading-snug text-[#4A1259]/55">
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
                        : "rgba(74,18,89,0.3)",
                  }}
                >
                  {complete ? "Decoded" : isNext ? "Active" : "Queued"}
                </span>
              </div>
            </Link>
          );
              })}
          </div>
        </div>
      ))}

      {/* Your Zone of Genius Code — unlocked once all modules are complete */}
      {allComplete && (
        <div
          className="mt-16 overflow-hidden rounded-3xl p-10 text-center"
          style={{
            background:
              "radial-gradient(130% 130% at 0% 0%, #2A0E33 0%, #170820 55%, #0D0512 100%)",
            border: "1px solid rgba(201,168,76,0.4)",
            boxShadow: "0 24px 80px -24px rgba(224,36,156,0.5)",
          }}
        >
          <p
            className="font-mono text-[12px] uppercase tracking-[0.3em]"
            style={{ color: "rgba(201,168,76,0.9)" }}
          >
            ✦ Unlocked
          </p>
          <p
            className="mt-4 font-display leading-[0.95] tracking-[0.03em] text-white"
            style={{ fontSize: "clamp(30px, 6vw, 46px)" }}
          >
            Your Zone of Genius Code™ Is Ready
          </p>
          <p
            className="mx-auto mt-4 max-w-xl font-serif italic"
            style={{ color: "rgba(255,255,255,0.65)", fontSize: "clamp(20px, 2.6vw, 21px)" }}
          >
            Everything you surfaced across all ten modules, distilled into the one lane only you can own.
          </p>
          <Link
            to={"/zone-of-genius-code" as any}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-5 font-display tracking-[0.14em] text-white transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            style={{
              fontSize: "clamp(18px, 3.2vw, 26px)",
              background: "linear-gradient(135deg, #4A1259 0%, #E0249C 50%, #c9a84c 100%)",
              boxShadow: "0 16px 50px -12px rgba(224,36,156,0.55)",
            }}
          >
            Access Your Zone of Genius Code →
          </Link>
        </div>
      )}

      {/* Bridge — where this leads */}
      <div
        className="mt-16 rounded-2xl p-10"
        style={{
          background: "linear-gradient(150deg, rgba(74,18,89,0.06) 0%, rgba(224,36,156,0.05) 60%, rgba(201,168,76,0.06) 100%)",
          border: "1px solid rgba(224,36,156,0.18)",
        }}
      >
        <p className="eyebrow mb-4">{allComplete ? "Your next move" : "Where this leads"}</p>
        {allComplete ? (
          <>
            <p className="font-display leading-[1.02] tracking-wide text-shimmer mb-4" style={{ fontSize: "clamp(26px, 4.8vw, 40px)" }}>
              How to Use Your Zone of Genius Code to Design the Exact Business You're Here to Build
            </p>
            <p className="max-w-xl font-serif text-xl italic leading-relaxed text-[#4A1259]/75 mb-6">
              You already know exactly who you are. The 10X Leap is where you finally build it. It reads your Zone of Genius Code and designs the complete business around it, so the business you've been carrying in your head for years finally exists in real life. No rebuilding every six months. No second-guessing what to build next. You walk out saying "Finally, I know exactly what I'm building." And Dana is beside you on three live calls the whole way.
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-[34px] leading-[1.0] tracking-wide text-shimmer mb-4">
              The 10X Leap™
            </p>
            <p className="max-w-xl font-serif text-xl italic leading-relaxed text-[#4A1259]/75 mb-6">
              Good Girl Prison Break hands you your Zone of Genius Code™. The 10X Leap is the design tool that turns it into your complete business: eleven elements, one Rare Breed Operating Manual™. And Dana is beside you on three live calls while you build.
            </p>
          </>
        )}
        <div className="mb-8 space-y-2">
          {[
            ["01", "The Walkthrough", "how the tool works and how to think inside it"],
            ["02", "The Support Call", "your questions and your builds, live with Dana"],
            ["03", "The What Now", "your Manual is done. Here's your next move"],
          ].map(([n, t, d]) => (
            <div key={n} className="flex items-baseline gap-4">
              <span className="font-mono text-[13px] tracking-[0.15em] text-[#E0249C]">{n}</span>
              <p className="font-serif text-lg text-[#1F1623]/85">
                <span className="font-display text-[17px] tracking-[0.05em]">{t}</span>
                <span className="italic text-[#4A1259]/60"> · {d}</span>
              </p>
            </div>
          ))}
        </div>
        <Link
          to={"/ten-x-leap/unlock" as any}
          className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-[13px] tracking-[0.18em] text-white"
          style={{
            background: "linear-gradient(135deg, #4A1259 0%, #E0249C 50%, #c9a84c 100%)",
            boxShadow: "0 8px 32px -8px rgba(224,36,156,0.4)",
          }}
        >
          {allComplete ? "Take My Code Into The 10X Leap →" : "See The 10X Leap™ →"}
        </Link>
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
            to={"/ten-x-leap/unlock" as any}
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-[13px] tracking-[0.18em] text-white"
            style={{
              background: "linear-gradient(135deg, #4A1259 0%, #E0249C 100%)",
              boxShadow: "0 8px 32px -8px rgba(74,18,89,0.35)",
            }}
          >
            Enter The 10X Leap →
          </Link>
        </div>
      )}
    </BrandShell>
  );
}
