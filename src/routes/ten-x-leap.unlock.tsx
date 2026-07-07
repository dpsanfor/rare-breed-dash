import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BrandShell } from "@/components/brand/BrandShell";
import { supabase } from "@/integrations/supabase/client";


export const Route = createFileRoute("/ten-x-leap/unlock")({
  head: () => ({
    meta: [{ title: "The 10X Leap™ · Get Access" }],
  }),
  component: TenXLeapUnlock,
});

function TenXLeapUnlock() {
  const navigate = useNavigate();

  async function enterLeap() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    navigate({ to: (session ? "/ten-x-leap" : "/login") as any });
  }

  return (
    <BrandShell hideStickyCta>
      <div className="mx-auto max-w-2xl py-6 text-center">
        <p
          className="font-mono uppercase tracking-[0.3em]"
          style={{ color: "rgba(224,36,156,0.9)", fontSize: "12px" }}
        >
          ✦ Phase 02 · Design · Locked
        </p>

        <h1
          className="mt-4 font-display text-shimmer leading-[0.92] tracking-wide"
          style={{ fontSize: "clamp(44px, 9vw, 78px)" }}
        >
          The 10X Leap™
        </h1>

        <p
          className="mx-auto mt-5 max-w-xl font-serif font-light italic text-[#4A1259]/80"
          style={{ fontSize: "clamp(20px, 2.8vw, 26px)" }}
        >
          This is where you take your Zone of Genius Code and design the exact business
          you're here to build. Down to the last decision.
        </p>

        <p className="mx-auto mt-6 max-w-lg font-serif leading-relaxed text-[#1F1623]/70" style={{ fontSize: "clamp(18px, 2.4vw, 19px)" }}>
          The 10X Leap is a premium enrollment. Get access below, or log in if you're
          already in.
        </p>

        {/* Options */}
        <div className="mx-auto mt-10 max-w-md space-y-4">
          <a
            href="https://www.the10xleap.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full px-8 py-5 font-display tracking-[0.14em] text-white transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            style={{
              fontSize: "clamp(20px, 3vw, 22px)",
              background: "linear-gradient(135deg, #4A1259 0%, #E0249C 55%, #c9a84c 100%)",
              boxShadow: "0 16px 50px -12px rgba(224,36,156,0.55)",
            }}
          >
            Learn More About The 10X Leap →
          </a>

          <button
            onClick={enterLeap}
            className="flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 font-display tracking-[0.14em] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            style={{
              fontSize: "clamp(15px, 2.6vw, 19px)",
              color: "#1F1623",
              border: "1.5px solid rgba(74,18,89,0.35)",
              background: "rgba(255,255,255,0.7)",
            }}
          >
            Log In · Already Enrolled →
          </button>
        </div>

        <Link
          to={"/prison-break" as any}
          className="mt-8 inline-block font-mono text-[13px] uppercase tracking-[0.24em] text-[#1F1623]/45 hover:text-[#1F1623]/70"
        >
          ← Back to Good Girl Prison Break
        </Link>
      </div>
    </BrandShell>
  );
}
