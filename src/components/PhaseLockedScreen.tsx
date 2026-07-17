import { BrandShell } from "@/components/brand/BrandShell";

const DELIVERABLES = [
  "Your 10X Vision",
  "Your Release Plan",
  "Your Rare Breed Constitution™",
  "Your Zone of Genius Report",
  "Your 10X Calendar",
  "Your Dream Client Decision",
  "Your Offer Ecosystem Map",
  "Your Brand Direction",
  "Your 10X Factor Operating Manual™",
];

const INCLUDES = [
  "Complete 10X Leap™ Builder",
  "AI-Guided Business Design Intensive",
  "All Design Elements",
  "10X Factor Operating Manual™",
  "Lifetime Updates",
  "Three Live Support Calls with Dana",
];

function TenXLeapLockedScreen() {
  return (
    <BrandShell hideStickyCta>
      <div className="mx-auto max-w-2xl py-16">
        <p className="eyebrow mb-6">Phase 02 · The 10X Leap™</p>

        <h1 className="font-display text-[36px] leading-[1.0] tracking-wide text-shimmer mb-6 sm:text-[48px]">
          You've discovered your Zone of Genius.<br />Now design the business it deserves.
        </h1>

        <p className="font-serif text-[24px] italic leading-relaxed text-[#4A1259]/70 mb-6 max-w-xl">
          Good Girl Prison Break helped you uncover what you were actually meant to build.
        </p>

        <p className="font-serif text-[24px] leading-relaxed text-[#4A1259]/80 mb-6 max-w-xl">
          10X Leap™ is where you design the business around it.
        </p>

        <p className="font-serif text-[22px] leading-relaxed text-[#4A1259]/70 mb-10 max-w-xl">
          Over five AI-guided design phases, you'll transform your Zone of Genius into a complete business blueprint — so every future offer, client, launch, and piece of content is built from the same foundation.
        </p>

        <div className="mb-10 space-y-2 max-w-xl">
          <p className="font-serif text-[22px] italic text-[#4A1259]/60">Not another business strategy.</p>
          <p className="font-serif text-[22px] font-semibold text-[#1F1623]">A business designed around you.</p>
        </div>

        {/* Deliverables */}
        <div className="mb-10">
          <p className="font-mono text-[12px] uppercase tracking-[0.25em] text-[#4A1259]/40 mb-5">Your Complete Business Design</p>
          <div className="space-y-3">
            {DELIVERABLES.map((item, i) => (
              <div key={item} className="flex items-center gap-4">
                <span
                  className="font-mono text-[12px] tracking-[0.15em] flex-shrink-0"
                  style={{ color: i === DELIVERABLES.length - 1 ? "#c9a84c" : "#E0249C" }}
                >
                  {i === DELIVERABLES.length - 1 ? "★" : `0${i + 1}`}
                </span>
                <span
                  className="font-serif text-[17px] leading-snug"
                  style={{
                    color: i === DELIVERABLES.length - 1 ? "#1F1623" : "#1F1623cc",
                    fontWeight: i === DELIVERABLES.length - 1 ? 500 : 400,
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Why this matters */}
        <div className="mb-10 max-w-lg space-y-4 border-l-2 border-[rgba(224,36,156,0.2)] pl-6">
          <p className="font-display text-[13px] uppercase tracking-[0.2em] text-[#4A1259]/50">Why This Matters</p>
          <p className="font-serif text-[17px] leading-relaxed text-[#4A1259]/75">
            Most entrepreneurs rebuild their business every year. New offers. New messaging. New strategies. New identities.
          </p>
          <p className="font-serif text-[17px] font-semibold text-[#1F1623]">10X Leap ends that cycle.</p>
          <p className="font-serif text-[17px] leading-relaxed text-[#4A1259]/75">
            Instead of creating disconnected pieces, you'll design one coherent business that compounds over time — because every future decision is made from your Zone of Genius.
          </p>
        </div>

        {/* When finished */}
        <div className="mb-10 max-w-lg rounded-2xl p-6" style={{ background: "linear-gradient(160deg, rgba(74,18,89,0.05) 0%, rgba(224,36,156,0.05) 100%)", border: "1px solid rgba(224,36,156,0.15)" }}>
          <p className="font-mono text-[12px] uppercase tracking-[0.25em] text-[#4A1259]/40 mb-3">When You're Finished</p>
          <p className="font-serif text-[17px] leading-relaxed text-[#4A1259]/80">
            You'll leave with a complete business operating manual — the intelligence that powers everything you create next. Then, if you choose, you'll import it into the Rare Breed Operating System, where your blueprint becomes high-converting sales pages, offers, content, launches, and business assets generated through Dana's proprietary framework.
          </p>
        </div>

        {/* Price */}
        <div
          className="mb-8 rounded-2xl px-8 py-6"
          style={{
            background: "linear-gradient(160deg, rgba(74,18,89,0.06) 0%, rgba(224,36,156,0.06) 100%)",
            border: "1px solid rgba(224,36,156,0.18)",
          }}
        >
          <div className="flex flex-wrap items-baseline gap-3 mb-2">
            <span className="font-display text-[42px] tracking-tight text-shimmer">$1,111</span>
            <span className="font-mono text-[13px] uppercase tracking-[0.22em] text-[#4A1259]/45">one time</span>
            <span className="rounded-full bg-[#E0249C]/10 px-3 py-1 font-mono text-[13px] uppercase tracking-[0.18em] text-[#E0249C]">First Round Pricing</span>
          </div>
          <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-[#4A1259]/40 mb-4">Rises to $2,222 after July 12</p>
          <div className="space-y-2">
            {INCLUDES.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="text-[#E0249C] text-[12px]">✓</span>
                <span className="font-serif text-[17px] text-[#1F1623]/80">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4">
          <a
            href="https://moderndayhealer.thrivecart.com/the-10x-leap/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-10 py-5 font-display text-[14px] tracking-[0.18em] text-white"
            style={{
              background: "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
              boxShadow: "0 12px 40px -8px rgba(224,36,156,0.45)",
            }}
          >
            Enter the 10X Leap™ →
          </a>
          <a
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(74,18,89,0.25)] bg-white/70 px-8 py-5 font-display text-[14px] tracking-[0.18em] text-[#4A1259]/70 hover:border-[#E0249C]/40 hover:text-[#E0249C] transition-colors"
          >
            Already enrolled? Log In
          </a>
        </div>
      </div>
    </BrandShell>
  );
}

const CLUB_STUDIOS = [
  "Dream Client + Messaging Studio",
  "Offer Studio",
  "Framework Studio",
  "Brand Studio",
  "Sales Page Studio",
  "Website Studio",
  "Content + Email Studio",
  "Launch Studio",
  "Delivered HQ",
];

function RareBreedClubLockedScreen() {
  return (
    <BrandShell hideStickyCta>
      <div className="mx-auto max-w-2xl py-16">
        <p className="eyebrow mb-6">Phase 03 · Delivered × Rare Breed Club</p>

        <h1 className="font-display text-[36px] leading-[1.0] tracking-wide text-shimmer mb-6 sm:text-[48px]">
          Your business, completely built.<br />In as little as two weeks.
        </h1>

        <p className="font-serif text-[24px] italic leading-relaxed text-[#4A1259]/70 mb-6 max-w-xl">
          10X Leap™ gave you the blueprint.
        </p>

        <p className="font-serif text-[24px] leading-relaxed text-[#4A1259]/80 mb-6 max-w-xl">
          Delivered × Rare Breed Club is where Dana builds it with you.
        </p>

        <p className="font-serif text-[22px] leading-relaxed text-[#4A1259]/70 mb-10 max-w-xl">
          3 months of done-with-you business building — 1:1 with Dana — using Rare Breed OS™ with all 9 Studios powered by your 10X Factor Operating Manual™ and Zone of Genius Code™. Your most complete, most aligned business, built out as fast as possible. Most clients are done in 2 weeks. You have up to 3 months.
        </p>

        <div className="mb-10 max-w-xl">
          <p className="font-serif text-[22px] font-semibold text-[#1F1623]">Dana, your genius, and the OS — building your business together.</p>
        </div>

        {/* What's included */}
        <div className="mb-10">
          <p className="font-mono text-[12px] uppercase tracking-[0.25em] text-[#4A1259]/40 mb-5">What's Included</p>

          <div className="mb-6 rounded-2xl p-6 space-y-3" style={{ background: "linear-gradient(160deg, rgba(74,18,89,0.04) 0%, rgba(224,36,156,0.04) 100%)", border: "1px solid rgba(224,36,156,0.12)" }}>
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#E0249C]/70 mb-3">3 Months Done-With-You</p>
            <p className="font-serif text-[17px] leading-relaxed text-[#1F1623]/80">All 9 Rare Breed OS™ Studios powered by your Operating Manual™ and Zone of Genius Code™ — built 1:1 with Dana until your business is complete.</p>
          </div>

          <div className="mb-6 rounded-2xl p-6 space-y-2" style={{ background: "linear-gradient(160deg, rgba(74,18,89,0.04) 0%, rgba(224,36,156,0.04) 100%)", border: "1px solid rgba(224,36,156,0.12)" }}>
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#E0249C]/70 mb-3">The 9 Studios</p>
            {CLUB_STUDIOS.map((studio, i) => (
              <div key={studio} className="flex items-center gap-3">
                <span className="font-mono text-[12px] text-[#E0249C] flex-shrink-0">{`0${i + 1}`}</span>
                <span className="font-serif text-[16px] text-[#1F1623]/80">{studio}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-6" style={{ background: "linear-gradient(160deg, rgba(74,18,89,0.04) 0%, rgba(201,168,76,0.06) 100%)", border: "1px solid rgba(201,168,76,0.2)" }}>
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#c9a84c] mb-3">12 Months RBC Access</p>
            <p className="font-serif text-[17px] leading-relaxed text-[#1F1623]/80">3 calls per month with Dana to mastermind, refine, and take it as far as possible as fast as possible — starting the day you begin your build, running alongside your entire 1:1 and continuing for a full year.</p>
          </div>
        </div>

        {/* Price */}
        <div
          className="mb-8 rounded-2xl px-8 py-6"
          style={{
            background: "linear-gradient(160deg, rgba(74,18,89,0.06) 0%, rgba(224,36,156,0.06) 100%)",
            border: "1px solid rgba(224,36,156,0.18)",
          }}
        >
          <div className="flex flex-wrap items-baseline gap-3 mb-2">
            <span className="font-display text-[42px] tracking-tight text-shimmer">$11,111</span>
            <span className="rounded-full bg-[#E0249C]/10 px-3 py-1 font-mono text-[13px] uppercase tracking-[0.18em] text-[#E0249C]">First 5 Only</span>
          </div>
          <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-[#E0249C]">Doubles after the first 5 · By inquiry only</p>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4">
          <a
            href="mailto:dana@danahayes.com?subject=Delivered%20%C3%97%20Rare%20Breed%20Club%20%E2%80%94%20I%27m%20Ready%20to%20Inquire"
            className="inline-flex items-center gap-2 rounded-full px-10 py-5 font-display text-[14px] tracking-[0.18em] text-white"
            style={{
              background: "linear-gradient(135deg, #4A1259 0%, #E0249C 50%, #c9a84c 100%)",
              boxShadow: "0 12px 40px -8px rgba(74,18,89,0.45)",
            }}
          >
            Claim My Seat →
          </a>
          <a
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(74,18,89,0.25)] bg-white/70 px-8 py-5 font-display text-[14px] tracking-[0.18em] text-[#4A1259]/70 hover:border-[#E0249C]/40 hover:text-[#E0249C] transition-colors"
          >
            Already a member? Log In
          </a>
        </div>
      </div>
    </BrandShell>
  );
}

function GGPBLockedScreen() {
  return (
    <BrandShell hideStickyCta>
      <div className="mx-auto max-w-2xl py-16">
        <p className="eyebrow mb-6">Phase 01 · Discover</p>

        <h1 className="font-display text-[36px] leading-[1.0] tracking-wide text-shimmer mb-6 sm:text-[48px]">
          Good Girl Prison Break™
        </h1>

        <p className="font-serif text-[20px] italic leading-relaxed text-[#4A1259]/70 mb-10 max-w-lg">
          A 7-day guided experience that reveals the operating system that has been running your business — and replaces it with one built from your Zone of Genius.
        </p>

        <a
          href="https://danahayes.com/prison-break"
          className="inline-flex items-center gap-2 rounded-full px-10 py-5 font-display text-[14px] tracking-[0.18em] text-white"
          style={{
            background: "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
            boxShadow: "0 12px 40px -8px rgba(224,36,156,0.45)",
          }}
        >
          Sign Up for Free →
        </a>

        <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.2em] text-[#4A1259]/30">
          Already signed up? Make sure you're logging in with the same email address you used to register.
          Need help?{" "}
          <a href="mailto:dana@danahayes.com" className="underline hover:text-[#E0249C]/60 transition-colors">
            dana@danahayes.com
          </a>
        </p>
      </div>
    </BrandShell>
  );
}

export function PhaseLockedScreen({ phase }: { phase: "prison-break" | "10x-leap" | "rare-breed-club" }) {
  if (phase === "prison-break") return <GGPBLockedScreen />;
  if (phase === "10x-leap") return <TenXLeapLockedScreen />;
  return <RareBreedClubLockedScreen />;
}
