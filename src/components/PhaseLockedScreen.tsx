import { BrandShell } from "@/components/brand/BrandShell";

export function PhaseLockedScreen({ phase }: { phase: "10x-leap" | "rare-breed-club" }) {
  const name = phase === "10x-leap" ? "The 10X Leap™" : "Rare Breed Club™";

  return (
    <BrandShell hideStickyCta>
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
        <div
          className="mb-8 h-16 w-16 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, rgba(74,18,89,0.12), rgba(224,36,156,0.08))" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4A1259" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <p className="font-display text-[42px] leading-tight tracking-wide text-shimmer mb-4">
          {name}
        </p>
        <p className="font-serif text-[20px] italic leading-relaxed text-[#4A1259]/65 max-w-lg mb-10">
          This phase is available to enrolled clients. Reach out to Dana to unlock access.
        </p>

        <a
          href="mailto:dana@danahayes.com"
          className="inline-flex items-center gap-2 rounded-full px-10 py-4 font-display text-[13px] tracking-[0.18em] text-white"
          style={{
            background: "linear-gradient(135deg, #4A1259 0%, #E0249C 100%)",
            boxShadow: "0 8px 32px -8px rgba(74,18,89,0.35)",
          }}
        >
          Contact Dana →
        </a>
      </div>
    </BrandShell>
  );
}
