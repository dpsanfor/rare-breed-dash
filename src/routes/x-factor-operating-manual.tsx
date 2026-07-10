import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandShell } from "@/components/brand/BrandShell";
import { Markdown } from "@/components/Markdown";
import { readProfile, saveArtifact, buildPhase2Context, type UserProfile } from "@/lib/profile";
import { generateOperatingManual } from "@/lib/anthropic";

export const Route = createFileRoute("/x-factor-operating-manual")({
  head: () => ({
    meta: [{ title: "Your X Factor Operating Manual™" }],
  }),
  component: OperatingManualReveal,
});

function OperatingManualReveal() {
  const [profile, setProfile] = useState<UserProfile>({});
  const [mounted, setMounted] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);

  useEffect(() => {
    setProfile(readProfile());
    setMounted(true);
  }, []);

  const manual = profile.operating_manual;

  // Stale if: elements updated after manual was generated, OR manual exists but
  // was generated before timestamp tracking was added (no manual_generated_at)
  const isStale = Boolean(
    manual && (
      !profile.manual_generated_at ||
      (profile.leap_last_updated_at &&
        new Date(profile.leap_last_updated_at) > new Date(profile.manual_generated_at))
    )
  );

  async function regenerate() {
    setRegenerating(true);
    setRegenError(null);
    try {
      const ctx = buildPhase2Context(profile);
      const result = await generateOperatingManual({ data: { context: ctx } });
      saveArtifact("operating_manual", result);
      setProfile(readProfile());
    } catch (e) {
      setRegenError(e instanceof Error ? e.message : "Regeneration failed. Try again.");
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <BrandShell hideStickyCta>
      {/* Eyebrow + title */}
      <div className="mb-8 mt-2">
        <p
          className="font-mono text-[13px] uppercase tracking-[0.32em]"
          style={{ color: "rgba(201,168,76,0.85)" }}
        >
          ✦ Access Granted · The 10X Leap Complete
        </p>
        <h1
          className="font-display text-shimmer leading-[0.9] tracking-[0.03em] mt-4"
          style={{ fontSize: "clamp(40px, 9vw, 72px)" }}
        >
          Your X Factor
          <br />
          Operating Manual™
        </h1>
        <p
          className="mt-4 font-mono text-[13px] uppercase tracking-[0.24em]"
          style={{ color: "rgba(74,18,89,0.45)" }}
        >
          ✦ Saved · every element you designed is captured here
        </p>
      </div>

      {/* Stale / regen notice */}
      {isStale && (
        <div
          className="mb-6 flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between"
          style={{
            background: "linear-gradient(135deg, rgba(224,36,156,0.10) 0%, rgba(74,18,89,0.10) 100%)",
            border: "1px solid rgba(224,36,156,0.35)",
          }}
        >
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.28em]" style={{ color: "#E0249C" }}>
              {regenerating ? "✦ Regenerating your manual..." : "✦ Your manual needs an update"}
            </p>
            <p className="mt-1 font-serif italic" style={{ color: "rgba(31,22,35,0.7)", fontSize: "clamp(16px,2.2vw,18px)" }}>
              {regenerating
                ? "Pulling everything from your elements and rewriting your manual. This takes about 30 seconds."
                : "Your elements have been updated since this was generated. Click to rebuild your manual from your latest design."}
            </p>
            {regenError && (
              <p className="mt-2 font-mono text-[12px]" style={{ color: "#E0249C" }}>{regenError}</p>
            )}
          </div>
          <button
            type="button"
            onClick={regenerate}
            disabled={regenerating}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-display text-[13px] tracking-[0.18em] text-white transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #E0249C 0%, #c9a84c 100%)",
              boxShadow: "0 8px 28px -8px rgba(224,36,156,0.45)",
            }}
          >
            {regenerating ? "Regenerating..." : "Regenerate Manual →"}
          </button>
        </div>
      )}

      {/* The Manual, an openable card */}
      <div
        className="mb-12 overflow-hidden rounded-3xl"
        style={{
          background:
            "radial-gradient(120% 120% at 0% 0%, #2A0E33 0%, #170820 55%, #0D0512 100%)",
          border: "1px solid rgba(201,168,76,0.35)",
          boxShadow: "0 24px 80px -24px rgba(201,168,76,0.4)",
        }}
      >
        <button
          type="button"
          onClick={() => setManualOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-4 p-8 sm:p-10"
        >
          <span
            className="font-mono text-[12px] uppercase tracking-[0.28em]"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            x_factor.operating_manual
          </span>
          <span
            className="font-mono text-[12px] uppercase tracking-[0.24em]"
            style={{ color: "rgba(201,168,76,0.9)" }}
          >
            {manualOpen ? "Close ▲" : "Open ▾"}
          </span>
        </button>

        {!manualOpen && (
          <p
            className="px-8 pb-8 font-serif italic sm:px-10 sm:pb-10"
            style={{ color: "rgba(255,255,255,0.6)", fontSize: "clamp(20px, 2.6vw, 21px)" }}
          >
            {manual
              ? "Open your Operating Manual to read the complete design of your business."
              : mounted
                ? "Complete all eleven elements of The 10X Leap to generate your X Factor Operating Manual."
                : "Loading your Operating Manual..."}
          </p>
        )}

        {manualOpen && (
          <div className="px-8 pb-8 sm:px-10 sm:pb-10">
            {manual ? (
              <Markdown
                text={manual}
                className="prose prose-sm prose-invert max-w-none font-serif leading-relaxed [&_h1]:text-[#F0DFA0] [&_h2]:text-[#F0DFA0] [&_h3]:text-[#C9A84C] [&_strong]:text-white [&_p]:text-[rgba(245,239,224,0.85)] [&_li]:text-[rgba(245,239,224,0.85)]"
              />
            ) : (
              <p className="font-serif italic" style={{ color: "rgba(255,255,255,0.6)" }}>
                {mounted
                  ? "Complete all eleven elements of The 10X Leap to generate your X Factor Operating Manual."
                  : "Loading..."}
              </p>
            )}
          </div>
        )}
      </div>

      <p className="mb-12 -mt-6 text-center">
        <Link
          to={"/operating-manual" as any}
          className="font-mono text-[13px] uppercase tracking-[0.24em] text-[#1F1623]/50 hover:text-[#1F1623]/80"
        >
          View &amp; edit the full manual, section by section →
        </Link>
      </p>

      {/* Synopsis */}
      <div className="space-y-6">
        <SynopsisCard label="What it is" accent="#E0249C">
          <p>
            Your X Factor Operating Manual is the complete design of your business,
            pulled from every element you built across The 10X Leap and written into
            one living document.
          </p>
          <p>
            It holds your 10X Vision, your Rare Breed Constitution, your Zone of
            Genius, your offers, your calendar, your dream client, and your standards.
            The whole operating system, in one place.
          </p>
          <p className="font-semibold text-[#1F1623]">
            Why it matters to you: you only have to think this deeply once. Everything
            you build from here reads from this.
          </p>
        </SynopsisCard>

        <SynopsisCard label="What it's for" accent="#A78BFA">
          <p>It's the source every Studio in Delivered builds from.</p>
          <p>
            Your messaging, your offers, your content, your emails, your launches,
            your sales pages: each one gets generated from this Manual, so nothing you
            create contradicts anything else and everything sounds like you.
          </p>
          <p className="font-semibold text-[#1F1623]">
            Why it matters to you: you never start from a blank page again. The
            Studios already know who you are before you ask the first question.
          </p>
        </SynopsisCard>

        <SynopsisCard
          label="How to Use Your Operating Manual in Delivered"
          accent="#E0249C"
          featured
        >
          <p>This is where your operating system becomes a living business.</p>
          <p>
            You hand your X Factor Operating Manual to the Studios, and they
            generate the actual assets, built from your genius instead of a generic
            template. You stop being the bottleneck. You stop rebuilding every six
            months. Your business finally runs on a system that is unmistakably yours.
          </p>
          <p className="font-semibold text-[#1F1623]">
            Why it matters to you: this is the payoff of everything. The business
            you've been carrying in your head, standing up in real life, generated
            from the one operating system only you could build.
          </p>
          <p className="text-[#1F1623]/70">
            Take your Operating Manual into Delivered and bring it to life.
          </p>
        </SynopsisCard>
      </div>

      {/* CTA */}
      <div className="mt-12 mb-6">
        <Link
          to={"/rare-breed-club" as any}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full py-5 font-display tracking-[0.14em] text-white transition-all hover:-translate-y-0.5 active:scale-[0.98]"
          style={{
            fontSize: "clamp(18px, 3.4vw, 24px)",
            background: "linear-gradient(135deg, #4A1259 0%, #E0249C 55%, #c9a84c 100%)",
            boxShadow: "0 16px 50px -12px rgba(224,36,156,0.55)",
          }}
        >
          Enter Delivered × Rare Breed Club →
        </Link>
        <Link
          to={"/ten-x-leap" as any}
          className="mt-4 block text-center font-mono text-[13px] uppercase tracking-[0.24em] text-[#1F1623]/45 hover:text-[#1F1623]/70"
        >
          ← Back to The 10X Leap
        </Link>
      </div>
    </BrandShell>
  );
}

function SynopsisCard({
  label,
  accent,
  featured = false,
  children,
}: {
  label: string;
  accent: string;
  featured?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border p-8 sm:p-10 ${featured ? "sm:p-12" : ""}`}
      style={{
        borderColor: featured ? "rgba(224,36,156,0.45)" : "rgba(74,18,89,0.12)",
        background: featured
          ? "linear-gradient(165deg, rgba(224,36,156,0.12) 0%, rgba(74,18,89,0.1) 100%)"
          : "rgba(255,255,255,0.8)",
        boxShadow: featured ? "0 22px 64px -22px rgba(224,36,156,0.5)" : "none",
      }}
    >
      {featured && (
        <p
          className="mb-3 font-mono uppercase tracking-[0.28em]"
          style={{ color: "rgba(224,36,156,0.95)", fontSize: "13px" }}
        >
          ✦ This is the part that matters most
        </p>
      )}
      <div className="mb-5 flex items-center gap-3">
        <span
          className="rounded-full"
          style={{
            width: featured ? 15 : 11,
            height: featured ? 15 : 11,
            background: accent,
          }}
        />
        <p
          className="font-mono uppercase tracking-[0.24em]"
          style={{
            color: "rgba(74,18,89,0.65)",
            fontSize: featured ? "clamp(15px, 2.4vw, 18px)" : "13px",
          }}
        >
          {label}
        </p>
      </div>
      <div
        className="font-serif leading-relaxed text-[#1F1623]/85 space-y-4"
        style={{
          fontSize: featured ? "clamp(21px, 3.4vw, 27px)" : "clamp(18px, 2.6vw, 21px)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
