import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandShell } from "@/components/brand/BrandShell";
import { PHASES } from "@/lib/program-data";
import { readProfile, writeProfile } from "@/lib/profile";
import { getUserAccess, loadUserProfile } from "@/lib/supabase-profile";
import { PhaseLockedScreen } from "@/components/PhaseLockedScreen";
import { useAuth } from "@/contexts/AuthContext";

const OWNER_EMAIL = "dana@danahayes.com";
const IS_LOCAL_DEV = typeof window !== "undefined" && window.location.hostname === "localhost";

const ELEMENT_KEYS: { key: string; label: string }[] = [
  { key: "bigger_vision", label: "10X Vision" },
  { key: "release_plan", label: "Dead Weight Release Plan" },
  { key: "constitution", label: "Rare Breed Constitution" },
  { key: "zone_of_genius", label: "Zone of Genius" },
  { key: "ten_x_business", label: "10X Business Concept" },
  { key: "living_proof", label: "Living Proof" },
  { key: "ten_x_calendar", label: "10X Calendar" },
  { key: "dream_client_decision", label: "Dream Client Decision" },
  { key: "offer_map", label: "Offer Ecosystem Map" },
  { key: "brand_direction", label: "Brand Direction" },
  { key: "operating_manual", label: "X Factor Operating Manual" },
];

export const Route = createFileRoute("/ten-x-leap/")({
  head: () => ({
    meta: [{ title: "The 10X Leap™ · Phase Two" }],
  }),
  component: TenXLeapIndex,
});

function TenXLeapIndex() {
  const { user } = useAuth();
  const isOwner = IS_LOCAL_DEV || user?.email === OWNER_EMAIL;
  const [completedKeys, setCompletedKeys] = useState<string[]>([]);
  const [access, setAccess] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreMsg, setRestoreMsg] = useState<string | null>(null);
  const phase = PHASES[1];

  useEffect(() => {
    const profile = readProfile();
    setCompletedKeys(profile.completed_modules ?? []);
    getUserAccess().then((a) => setAccess(a.phase2));
  }, []);

  async function restoreFromCloud() {
    setRestoring(true);
    setRestoreMsg(null);
    try {
      const remote = await loadUserProfile();
      if (!remote) {
        setRestoreMsg("Nothing found in the cloud for this account.");
      } else {
        const hasData = ELEMENT_KEYS.some(({ key }) => !!(remote as any)[key]);
        if (!hasData) {
          setRestoreMsg("Your cloud profile exists but has no completed elements saved.");
        } else {
          writeProfile(remote);
          setCompletedKeys(remote.completed_modules ?? []);
          setRestoreMsg("Restored. Click Copy All Elements now.");
        }
      }
    } catch {
      setRestoreMsg("Restore failed — try refreshing and trying again.");
    } finally {
      setRestoring(false);
    }
  }

  async function copyElements() {
    let profile = readProfile();
    const hasLocal = ELEMENT_KEYS.some(({ key }) => !!(profile as any)[key]);

    if (!hasLocal) {
      // Try cloud before giving up
      const remote = await loadUserProfile();
      if (remote) {
        writeProfile(remote);
        profile = readProfile();
      }
    }

    const lines: string[] = ["MY 10X LEAP ELEMENTS\n"];
    for (const { key, label } of ELEMENT_KEYS) {
      const val = (profile as any)[key] as string | undefined;
      if (val) lines.push(`## ${label}\n${val}`);
    }
    if (lines.length === 1) {
      lines.push("(No elements completed yet — your data may not have been saved to the cloud from the previous domain.)");
    }
    await navigator.clipboard.writeText(lines.join("\n\n---\n\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

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
        <p className="eyebrow mb-3">Phase 02 · Design</p>
        <h1
          className="font-display text-shimmer leading-[0.92] tracking-wide"
          style={{ fontSize: "clamp(44px, 9vw, 78px)" }}
        >
          The 10X Leap™
        </h1>
        <p
          className="mt-5 max-w-2xl font-serif font-light italic text-[#4A1259]/80"
          style={{ fontSize: "clamp(20px, 2.8vw, 26px)" }}
        >
          Create the life and business your Zone of Genius has been waiting for.
        </p>
        <p className="mt-6 max-w-xl font-serif text-xl font-light italic text-[#4A1259]/80">
          {completedCount} of {phase.modules.length} elements designed.
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
            Continue Designing →
          </Link>
        </div>
      )}

      {/* Copy / restore elements — owner only */}
      {isOwner && (
        <div className="mb-8 flex flex-wrap items-center justify-end gap-3">
          {restoreMsg && (
            <p className="font-mono text-[11px] text-[#4A1259]/55">{restoreMsg}</p>
          )}
          <button
            onClick={restoreFromCloud}
            disabled={restoring}
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2 font-mono text-[12px] uppercase tracking-[0.2em] transition-all disabled:opacity-40"
            style={{ borderColor: "rgba(74,18,89,0.2)", color: "rgba(74,18,89,0.45)" }}
          >
            {restoring ? "Restoring..." : "Restore from cloud"}
          </button>
          <button
            onClick={copyElements}
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2 font-mono text-[12px] uppercase tracking-[0.2em] transition-all"
            style={{
              borderColor: copied ? "rgba(22,163,74,0.4)" : "rgba(74,18,89,0.2)",
              color: copied ? "#16a34a" : "rgba(74,18,89,0.5)",
              background: copied ? "rgba(22,163,74,0.06)" : "transparent",
            }}
          >
            {copied ? "Copied ✓" : "Copy all elements"}
          </button>
        </div>
      )}

      {/* What this section is */}
      <div className="mb-8 border-t border-[rgba(74,18,89,0.12)] pt-10">
        <p className="eyebrow mb-3">The Elements</p>
        <h2
          className="font-display tracking-wide text-[#1F1623]"
          style={{ fontSize: "clamp(28px, 5vw, 42px)" }}
        >
          Design the Eleven Elements of Your X Factor Operating Manual™
        </h2>
        <p
          className="mt-3 max-w-2xl font-serif italic text-[#4A1259]/75"
          style={{ fontSize: "clamp(20px, 2.4vw, 21px)" }}
        >
          Each element designs one part of your business from your Zone of Genius Code. Together they become your X Factor Operating Manual™: the complete operating system every Studio in Delivered reads before it builds a thing. You design it once here, and you never start from a blank page again.
        </p>
      </div>

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
                <p className="font-display text-[32px] tracking-[0.05em] text-[#1F1623]">
                  {mod.name}
                </p>
                <p className="mt-1 font-serif text-2xl italic leading-snug text-[#4A1259]/75">
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
                  {complete ? "Designed" : isNext ? "Active" : "Queued"}
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
            Your X Factor Operating Manual™ Is Ready
          </p>
          <p className="font-display text-shimmer leading-[1.0] tracking-wide mb-6" style={{ fontSize: "clamp(28px, 6vw, 42px)" }}>
            You've Built Your New Operating System.
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
            to={(completedCount === phase.modules.length ? "/x-factor-operating-manual" : "/rare-breed-club") as any}
            className="inline-flex items-center gap-2 rounded-full px-10 py-5 font-display tracking-[0.18em] text-white"
            style={{
              fontSize: "clamp(14px, 3vw, 18px)",
              background: "linear-gradient(135deg, #D946EF 0%, #E0249C 50%, #c9a84c 100%)",
              boxShadow: "0 12px 40px -8px rgba(217,70,239,0.5)",
            }}
          >
            {completedCount === phase.modules.length ? "Reveal My X Factor Operating Manual™ →" : "Preview Delivered × Rare Breed Club →"}
          </Link>
        </div>
    </BrandShell>
  );
}
