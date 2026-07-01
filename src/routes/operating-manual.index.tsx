import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BrandShell } from "@/components/brand/BrandShell";
import { readProfile, updateManualSection, type UserProfile } from "@/lib/profile";

export const Route = createFileRoute("/operating-manual/")({
  head: () => ({
    meta: [{ title: "Operating Manual™ · Rare Breed OS" }],
  }),
  component: OperatingManualPage,
});

// Friendly display names for each section key
const SECTION_LABELS: Partial<Record<keyof UserProfile, string>> = {
  bigger_vision: "Bigger Vision™",
  current_identity: "Current Identity™",
  zone_of_genius: "Zone of Genius™",
  magic_gumdrop: "Magic Gumdrop™",
  category_of_one: "Category of One™",
  decision_filters: "Decision Filters™",
  core_beliefs: "Core Beliefs™",
  non_negotiables_business: "Non-Negotiables™ — Business",
  non_negotiables_life: "Non-Negotiables™ — Life",
  non_negotiables_leadership: "Non-Negotiables™ — Leadership",
  current_focus: "Current Focus™",
};

const SECTION_HINTS: Partial<Record<keyof UserProfile, string>> = {
  bigger_vision: "One sentence. Who you are becoming and what you are building.",
  current_identity: "Who you are becoming. Written in the present tense.",
  zone_of_genius: "The intersection of your deepest gift and highest energy. Generated in Phase Two.",
  magic_gumdrop: "The positioning intersection that makes you undeniable.",
  category_of_one: "How you are different. Not better — different.",
  decision_filters: "The principles that filter every business decision.",
  core_beliefs: "The beliefs your business is built on. List them.",
  non_negotiables_business: "What you will not compromise in your business.",
  non_negotiables_life: "What you will not compromise in your life.",
  non_negotiables_leadership: "How you lead. What you model.",
  current_focus: "One sentence. What you are building this month.",
};

// Which sections are read-only by default (require "unlock" to edit)
const PROTECTED_SECTIONS = new Set<keyof UserProfile>(["zone_of_genius", "magic_gumdrop"]);

// ── SECTION COMPONENT ─────────────────────────────────────────────────────

function ManualSection({
  sectionKey,
  value,
  onSave,
}: {
  sectionKey: keyof UserProfile;
  value: string | undefined;
  onSave: (key: keyof UserProfile, val: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [unlocked, setUnlocked] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isProtected = PROTECTED_SECTIONS.has(sectionKey);
  const label = SECTION_LABELS[sectionKey] ?? sectionKey;
  const hint = SECTION_HINTS[sectionKey] ?? "";
  const isEmpty = !value;

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(draft.length, draft.length);
    }
  }, [editing]);

  function handleSave() {
    const trimmed = draft.trim();
    if (trimmed !== (value ?? "")) {
      onSave(sectionKey, trimmed);
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setDraft(value ?? "");
      setEditing(false);
    }
  }

  const canEdit = !isProtected || unlocked;

  return (
    <div className="group border-b border-[rgba(74,18,89,0.07)] pb-10 last:border-0">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#4A1259]/35 mb-1.5">
            {label}
          </p>
          {!editing && (
            <p className="font-serif text-[13px] italic text-[#4A1259]/30">{hint}</p>
          )}
        </div>

        <div className="flex-shrink-0 flex items-center gap-3 pt-0.5">
          {isProtected && !unlocked && value && (
            <button
              onClick={() => setUnlocked(true)}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4A1259]/25 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#c9a84c]"
            >
              unlock
            </button>
          )}
          {canEdit && !editing && (
            <button
              onClick={() => {
                setDraft(value ?? "");
                setEditing(true);
              }}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4A1259]/25 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#E0249C]"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-3">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={sectionKey === "decision_filters" || sectionKey.includes("non_negotiables") || sectionKey === "core_beliefs" ? 6 : 3}
            className="w-full resize-none rounded-2xl border bg-white/60 px-5 py-4 font-serif text-[17px] leading-relaxed text-[#1F1623] outline-none ring-0 transition-all"
            style={{
              borderColor: "rgba(224,36,156,0.3)",
              boxShadow: "0 0 0 3px rgba(224,36,156,0.06)",
            }}
            placeholder={hint}
          />
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              className="rounded-full px-5 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white transition-all hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #E0249C, #c9a84c)",
                boxShadow: "0 4px 16px -4px rgba(224,36,156,0.4)",
              }}
            >
              Save
            </button>
            <button
              onClick={() => {
                setDraft(value ?? "");
                setEditing(false);
              }}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4A1259]/35 hover:text-[#4A1259]/60"
            >
              Cancel
            </button>
            <span className="font-mono text-[9px] text-[#4A1259]/20 tracking-[0.1em]">
              esc to cancel
            </span>
          </div>
        </div>
      ) : (
        <div
          className={`min-h-[48px] cursor-default ${!canEdit || isProtected ? "" : "cursor-text"}`}
          onClick={() => {
            if (canEdit) {
              setDraft(value ?? "");
              setEditing(true);
            }
          }}
        >
          {isEmpty ? (
            <p
              className="font-serif text-[17px] italic leading-relaxed"
              style={{ color: "rgba(74,18,89,0.18)" }}
            >
              {isProtected ? "Generated in Phase Two." : "Not yet written."}
            </p>
          ) : (
            <p className="font-serif text-[17px] leading-relaxed text-[#1F1623]/85 whitespace-pre-wrap">
              {value}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────

function OperatingManualPage() {
  const [profile, setProfile] = useState<UserProfile>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setProfile(readProfile());
    setMounted(true);
  }, []);

  function handleSave(key: keyof UserProfile, value: string) {
    updateManualSection(key, value);
    setProfile(readProfile());
  }

  const updatedAt = profile.operating_manual_updated_at
    ? new Date(profile.operating_manual_updated_at)
    : null;

  const nextReview = updatedAt
    ? new Date(updatedAt.getTime() + 90 * 24 * 60 * 60 * 1000)
    : null;

  return (
    <BrandShell hideStickyCta showBottomNav>
      {/* ── MASTHEAD ─────────────────────────────────────── */}
      <div className="mb-12 mt-6">
        <p className="eyebrow mb-6">Rare Breed OS™</p>

        <h1 className="font-display text-[44px] leading-[0.95] tracking-[0.04em] text-shimmer sm:text-[60px]">
          Operating<br />Manual™
        </h1>

        <p className="mt-5 font-serif text-[17px] font-light italic text-[#4A1259]/55 max-w-sm">
          The source of truth for who you are becoming and how you build.
          Every Builder reads from here. Every insight writes back.
        </p>

        {/* Gold divider */}
        <div
          className="mt-8 h-px w-20"
          style={{ background: "linear-gradient(90deg, #c9a84c, transparent)" }}
        />
      </div>

      {/* ── VISION + IDENTITY ────────────────────────────── */}
      <div className="mb-14 space-y-10">
        <ManualSection sectionKey="bigger_vision" value={profile.bigger_vision} onSave={handleSave} />
        <ManualSection sectionKey="current_identity" value={profile.current_identity} onSave={handleSave} />
      </div>

      {/* ── POSITIONING ──────────────────────────────────── */}
      <div className="mb-2">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.3em] mb-8"
          style={{ color: "rgba(74,18,89,0.2)" }}
        >
          Positioning
        </p>
      </div>
      <div className="mb-14 space-y-10">
        <ManualSection sectionKey="zone_of_genius" value={profile.zone_of_genius} onSave={handleSave} />
        <ManualSection sectionKey="magic_gumdrop" value={profile.magic_gumdrop} onSave={handleSave} />
        <ManualSection sectionKey="category_of_one" value={profile.category_of_one} onSave={handleSave} />
      </div>

      {/* ── OPERATING PRINCIPLES ─────────────────────────── */}
      <div className="mb-2">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.3em] mb-8"
          style={{ color: "rgba(74,18,89,0.2)" }}
        >
          Operating Principles
        </p>
      </div>
      <div className="mb-14 space-y-10">
        <ManualSection sectionKey="decision_filters" value={profile.decision_filters} onSave={handleSave} />
        <ManualSection sectionKey="core_beliefs" value={profile.core_beliefs} onSave={handleSave} />
      </div>

      {/* ── NON-NEGOTIABLES ──────────────────────────────── */}
      <div className="mb-2">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.3em] mb-8"
          style={{ color: "rgba(74,18,89,0.2)" }}
        >
          Non-Negotiables™
        </p>
      </div>
      <div className="mb-14 space-y-10">
        <ManualSection sectionKey="non_negotiables_business" value={profile.non_negotiables_business} onSave={handleSave} />
        <ManualSection sectionKey="non_negotiables_life" value={profile.non_negotiables_life} onSave={handleSave} />
        <ManualSection sectionKey="non_negotiables_leadership" value={profile.non_negotiables_leadership} onSave={handleSave} />
      </div>

      {/* ── CURRENT FOCUS ────────────────────────────────── */}
      <div className="mb-14">
        <ManualSection sectionKey="current_focus" value={profile.current_focus} onSave={handleSave} />
      </div>

      {/* ── LAST UPDATED ─────────────────────────────────── */}
      {mounted && (
        <div
          className="rounded-3xl border p-7 mb-4"
          style={{
            borderColor: "rgba(201,168,76,0.2)",
            background: "linear-gradient(135deg, rgba(201,168,76,0.04) 0%, rgba(255,255,255,0.6) 100%)",
          }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#c9a84c]/60 mb-5">
            Last Updated
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4A1259]/30 mb-1.5">
                Evolution Session
              </p>
              <p className="font-serif text-[15px] text-[#1F1623]/70">
                {updatedAt
                  ? updatedAt.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Not yet updated"}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4A1259]/30 mb-1.5">
                Next Review
              </p>
              <p className="font-serif text-[15px] text-[#1F1623]/70">
                {nextReview
                  ? nextReview.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Schedule your first review"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── BUILDER RULE ─────────────────────────────────── */}
      <div className="rounded-3xl border border-[rgba(74,18,89,0.07)] bg-white/40 p-7">
        <p className="eyebrow mb-3">How This Works</p>
        <p className="font-serif text-[14px] font-light italic leading-relaxed text-[#4A1259]/55">
          Every Builder reads this document before it generates anything. When a Builder finishes, it asks whether the work revealed something new about you. If it did, this Manual updates automatically. Read first. Edit intentionally. Return often.
        </p>
      </div>
    </BrandShell>
  );
}
