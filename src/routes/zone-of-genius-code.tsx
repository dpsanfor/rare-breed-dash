import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandShell } from "@/components/brand/BrandShell";
import { readProfile, type UserProfile } from "@/lib/profile";

export const Route = createFileRoute("/zone-of-genius-code")({
  head: () => ({
    meta: [{ title: "Your Zone of Genius Code™" }],
  }),
  component: ZoneOfGeniusCodePage,
});

// Strip markdown markers so the code reads as clean, glowing lines.
function toCodeLines(text: string): string[] {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/^\s*[-*]\s+/gm, "› ")
    .replace(/^>\s?/gm, "")
    .replace(/`/g, "")
    .split("\n")
    .map((l) => l.trimEnd());
}

function ZoneOfGeniusCodePage() {
  const [profile, setProfile] = useState<UserProfile>({});
  const [mounted, setMounted] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);

  useEffect(() => {
    setProfile(readProfile());
    setMounted(true);
  }, []);

  const code = profile.zog_code;
  const codeLines = code ? toCodeLines(code) : [];

  return (
    <BrandShell hideStickyCta>
      <style>{`
        @keyframes zogShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .zog-iridescent {
          background: linear-gradient(115deg, #E0249C 0%, #c9a84c 20%, #6EE7F9 40%, #A78BFA 60%, #F472B6 80%, #E0249C 100%);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          animation: zogShimmer 9s ease infinite;
        }
      `}</style>

      {/* Eyebrow */}
      <div className="mb-8 mt-2">
        <p
          className="font-mono text-[13px] uppercase tracking-[0.32em]"
          style={{ color: "rgba(201,168,76,0.85)" }}
        >
          ✦ Access Granted · Good Girl Prison Break Complete
        </p>
        <h1
          className="font-display leading-[0.9] tracking-[0.04em] mt-4"
          style={{ fontSize: "clamp(40px, 9vw, 68px)", color: "#1F1623" }}
        >
          Your Zone of
          <br />
          Genius Code™
        </h1>
        <p
          className="mt-4 font-mono text-[13px] uppercase tracking-[0.24em]"
          style={{ color: "rgba(74,18,89,0.45)" }}
        >
          ✦ Saved to your record · flows into The 10X Leap
        </p>
      </div>

      {/* The Code, as an openable iridescent card */}
      <div
        className="mb-12 overflow-hidden rounded-3xl"
        style={{
          background:
            "radial-gradient(120% 120% at 0% 0%, #2A0E33 0%, #170820 55%, #0D0512 100%)",
          border: "1px solid rgba(201,168,76,0.35)",
          boxShadow: "0 24px 80px -24px rgba(224,36,156,0.5)",
        }}
      >
        <button
          type="button"
          onClick={() => setCodeOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-4 p-8 sm:p-10"
        >
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: "#E0249C" }} />
            <span className="h-3 w-3 rounded-full" style={{ background: "#c9a84c" }} />
            <span className="h-3 w-3 rounded-full" style={{ background: "#A78BFA" }} />
            <span
              className="ml-3 font-mono text-[12px] uppercase tracking-[0.28em]"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              zone_of_genius.code
            </span>
          </span>
          <span
            className="font-mono text-[12px] uppercase tracking-[0.24em]"
            style={{ color: "rgba(201,168,76,0.9)" }}
          >
            {codeOpen ? "Close ▲" : "Open ▾"}
          </span>
        </button>

        {!codeOpen && (
          <p
            className="px-8 pb-8 font-serif italic sm:px-10 sm:pb-10"
            style={{ color: "rgba(255,255,255,0.6)", fontSize: "clamp(20px, 2.6vw, 21px)" }}
          >
            {code
              ? "Open your Code to read it in full."
              : mounted
                ? "Complete Module 9, The Escape, in Good Girl Prison Break to generate your Zone of Genius Code."
                : "Loading your Code..."}
          </p>
        )}

        {codeOpen && (
          <div className="px-8 pb-8 sm:px-10 sm:pb-10">
            {code ? (
              <pre
                className="zog-iridescent whitespace-pre-wrap break-words font-mono leading-relaxed"
                style={{ fontSize: "clamp(18px, 2.9vw, 22px)", margin: 0 }}
              >
                {codeLines.join("\n")}
              </pre>
            ) : (
              <p className="font-serif italic" style={{ color: "rgba(255,255,255,0.6)" }}>
                {mounted
                  ? "Complete Module 9, The Escape, in Good Girl Prison Break to generate your Zone of Genius Code."
                  : "Loading your Code..."}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Synopsis */}
      <div className="space-y-6">
        <SynopsisCard label="What it is" accent="#E0249C">
          <p>
            Your Zone of Genius Code is the one lane only you can own, pulled out of
            everything you named across all ten modules of Good Girl Prison Break and
            written down in plain language.
          </p>
          <p>
            It isn't a personality type or a vibe. It's the specific work that is
            effortless for you and EXPENSIVE for everyone else to copy.
          </p>
          <p className="font-semibold text-[#1F1623]">
            Why it matters to you: you already know who you are. This is the part
            that turns that knowing into a business you can actually build, so you
            stop starting from a blank page every quarter.
          </p>
        </SynopsisCard>

        <SynopsisCard label="What it's for" accent="#A78BFA">
          <p>Every real decision in your business runs through this Code.</p>
          <p>
            Which offer to build first. What to charge. What to say no to. Which
            clients are yours and which ones drain you. What your message leads with.
            The Code answers all of it, because it names the work that was always
            yours.
          </p>
          <p className="font-semibold text-[#1F1623]">
            Why it matters to you: this is the end of second-guessing. You stop
            building from capability, the work you're good at, and start building
            from genius, the work that sets you free. One fills your calendar. The
            other buys back your life.
          </p>
        </SynopsisCard>

        <SynopsisCard
          label="How to Use Your Zone of Genius Code in The 10X Leap"
          accent="#E0249C"
          featured
        >
          <p>
            Your Zone of Genius Code is the blueprint. The 10X Leap is where it gets
            built into a real business.
          </p>
          <p>
            Here's what makes this different from every plan you've ever bought: the
            Leap doesn't hand you a generic template. It reads your Zone of Genius
            Code and designs the entire business around your genius. Your offers, your
            pricing, your calendar, the way you sell, all of it built from the one
            thing only YOU can do.
          </p>
          <p className="font-semibold text-[#1F1623]">
            So you stop stitching together other people's strategies. You stop
            rebuilding from scratch every six months. And you finally get the business
            you've been carrying in your head for years, standing up in real life.
          </p>
          <p className="font-display text-[#1F1623]">
            This is how you walk out saying "Finally, I know exactly what I'm
            building." Not clearer. Not inspired. Designed, down to the last decision.
          </p>
          <p className="text-[#1F1623]/70">
            Take your Zone of Genius Code into the Leap and design it now.
          </p>
        </SynopsisCard>
      </div>

      {/* CTA */}
      <div className="mt-12 mb-6">
        <Link
          to={"/ten-x-leap/unlock" as any}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full py-5 font-display tracking-[0.14em] text-white transition-all hover:-translate-y-0.5 active:scale-[0.98]"
          style={{
            fontSize: "clamp(18px, 3.4vw, 24px)",
            background: "linear-gradient(135deg, #4A1259 0%, #E0249C 55%, #c9a84c 100%)",
            boxShadow: "0 16px 50px -12px rgba(224,36,156,0.55)",
          }}
        >
          Activate Your 10X Leap Using Your ZOG Code Now →
        </Link>
        <Link
          to={"/prison-break" as any}
          className="mt-4 block text-center font-mono text-[13px] uppercase tracking-[0.24em] text-[#1F1623]/45 hover:text-[#1F1623]/70"
        >
          ← Back to Good Girl Prison Break
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
