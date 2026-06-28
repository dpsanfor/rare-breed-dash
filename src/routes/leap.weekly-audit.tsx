import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandShell } from "@/components/brand/BrandShell";
import { WEEKLY_AUDIT_DIMENSIONS } from "@/lib/leap-data";

export const Route = createFileRoute("/leap/weekly-audit")({
  head: () => ({
    meta: [{ title: "Weekly Audit · Rare Breed OS™" }],
  }),
  component: WeeklyAuditPage,
});

type Phase = "questions" | "notes" | "complete";

const SCORE_LABELS: Record<number, string> = {
  1: "Not at all",
  2: "Slightly",
  3: "Neutral",
  4: "Mostly",
  5: "Fully",
};

function WeeklyAuditPage() {
  const [phase, setPhase] = useState<Phase>("questions");
  const [dimIndex, setDimIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  function selectScore(key: string, score: number) {
    const updated = { ...scores, [key]: score };
    setScores(updated);
    setTimeout(() => {
      if (dimIndex < WEEKLY_AUDIT_DIMENSIONS.length - 1) {
        setDimIndex((i) => i + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setPhase("notes");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 320);
  }

  async function submit() {
    setSaving(true);
    await supabase.from("leap_weekly_audit").insert({
      week_date: new Date().toISOString().split("T")[0],
      alignment_score: scores.alignment_score ?? null,
      energy_score: scores.energy_score ?? null,
      calling_score: scores.calling_score ?? null,
      expansion_score: scores.expansion_score ?? null,
      self_abandonment_score: scores.self_abandonment_score ?? null,
      notes: notes.trim() || null,
    });
    setSaving(false);
    setPhase("complete");
  }

  const scoreValues = Object.values(scores);
  const avg =
    scoreValues.length > 0
      ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
      : 0;

  // ── QUESTIONS — one dimension per screen ───────────────────────────────────
  if (phase === "questions") {
    const dim = WEEKLY_AUDIT_DIMENSIONS[dimIndex];
    return (
      <BrandShell hideStickyCta>
        <div className="mx-auto max-w-xl">
          <div className="mb-14 mt-8">
            <p className="eyebrow mb-4">
              Weekly Audit ·{" "}
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-[rgba(201,168,76,0.1)]">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                style={{
                  width: `${((dimIndex + 1) / WEEKLY_AUDIT_DIMENSIONS.length) * 100}%`,
                  background: "linear-gradient(90deg, #6b21a8, #d946ef)",
                }}
              />
            </div>
            <p className="mt-2 font-mono text-[10px] text-rb-fuchsia/50">
              {dimIndex + 1} of {WEEKLY_AUDIT_DIMENSIONS.length}
            </p>
          </div>

          <p className="eyebrow mb-3">{dim.label}</p>
          <h2 className="mb-12 font-display text-4xl leading-tight tracking-wide text-shimmer md:text-5xl">
            {dim.question}
          </h2>

          {/* 1–5 as large tap targets */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => selectScore(dim.key, n)}
                className={`flex w-full items-center gap-6 rounded-2xl border px-6 py-5 text-left transition-all hover:-translate-y-0.5 ${
                  scores[dim.key] === n
                    ? "border-rb-fuchsia bg-rb-violet/40"
                    : "border-[rgba(201,168,76,0.18)] bg-[rgba(21,8,40,0.5)] hover:border-rb-fuchsia/40 hover:bg-rb-violet/15"
                }`}
              >
                <span
                  className="font-display text-3xl tracking-wide"
                  style={{
                    color:
                      scores[dim.key] === n
                        ? "#d946ef"
                        : "rgba(240,223,160,0.45)",
                  }}
                >
                  {n}
                </span>
                <div>
                  <p
                    className="font-serif text-base italic"
                    style={{
                      color:
                        scores[dim.key] === n
                          ? "rgba(240,223,160,0.9)"
                          : "rgba(240,223,160,0.6)",
                    }}
                  >
                    {SCORE_LABELS[n]}
                  </p>
                  {n === 1 && (
                    <p className="font-mono text-[10px] text-[rgba(240,223,160,0.3)]">
                      {dim.low}
                    </p>
                  )}
                  {n === 5 && (
                    <p className="font-mono text-[10px] text-[rgba(240,223,160,0.3)]">
                      {dim.high}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>

          {dimIndex > 0 && (
            <button
              onClick={() => setDimIndex((i) => i - 1)}
              className="mt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-[rgba(240,223,160,0.3)] hover:text-rb-champagne"
            >
              ← Back
            </button>
          )}
        </div>
      </BrandShell>
    );
  }

  // ── NOTES ──────────────────────────────────────────────────────────────────
  if (phase === "notes") {
    return (
      <BrandShell hideStickyCta>
        <div className="mx-auto max-w-xl">
          <div className="mb-14 mt-8">
            <p className="eyebrow mb-4">Weekly Audit · Final step</p>
            <div
              className="h-[2px] w-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, #6b21a8, #d946ef, #ec4899)",
              }}
            />
          </div>

          <h2 className="mb-4 font-display text-5xl leading-tight tracking-wide text-shimmer">
            What does this week need you to know?
          </h2>
          <p className="mb-8 font-serif font-light italic text-[rgba(240,223,160,0.5)]">
            One line. The truth you'd rather avoid looking at.
          </p>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="This week taught me..."
            rows={4}
            className="mb-8 w-full resize-none rounded-2xl border border-[rgba(201,168,76,0.2)] bg-[rgba(21,8,40,0.7)] px-6 py-5 font-serif text-base font-light italic leading-relaxed text-rb-champagne outline-none placeholder:text-[rgba(240,223,160,0.22)] focus:border-rb-fuchsia/40"
          />

          {/* Score summary */}
          <div className="mb-10 rounded-xl border border-[rgba(201,168,76,0.15)] bg-[rgba(21,8,40,0.5)] px-6 py-5">
            <p className="label-soft mb-3">This week's OS score</p>
            <div className="flex items-end gap-3">
              <p className="font-display text-5xl text-shimmer">
                {avg.toFixed(1)}
              </p>
              <p className="mb-1 font-serif italic text-[rgba(240,223,160,0.4)]">
                / 5
              </p>
            </div>
          </div>

          <button
            onClick={submit}
            disabled={saving}
            className="inline-flex items-center gap-3 rounded-full px-8 py-4 font-display text-[15px] tracking-[0.2em] text-rb-black transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
            style={{
              background:
                "linear-gradient(135deg, #d946ef 0%, #ec4899 50%, #c9a84c 100%)",
              boxShadow: "0 10px 40px -10px rgba(217,70,239,0.5)",
            }}
          >
            {saving ? "Saving..." : "Complete Audit →"}
          </button>
        </div>
      </BrandShell>
    );
  }

  // ── COMPLETE ───────────────────────────────────────────────────────────────
  return (
    <BrandShell hideStickyCta>
      <div className="mx-auto max-w-xl text-center">
        <div className="mb-16 mt-16">
          <p className="eyebrow mb-8">Audit Complete</p>
          <div className="mb-8 font-mono text-sm text-[rgba(240,223,160,0.4)]">
            <p>████████████ 100%</p>
          </div>
          <h2 className="font-display text-6xl leading-[0.9] tracking-wide text-shimmer">
            Operating system checked.
          </h2>
          <p className="mt-6 font-serif text-xl font-light italic text-[rgba(240,223,160,0.6)]">
            See you next Friday.
          </p>
          <div className="mt-10 inline-flex items-end gap-3 rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[rgba(21,8,40,0.7)] px-10 py-6">
            <p className="font-display text-6xl text-shimmer">{avg.toFixed(1)}</p>
            <p className="mb-2 font-serif italic text-[rgba(240,223,160,0.4)]">
              / 5
            </p>
          </div>
        </div>
      </div>
    </BrandShell>
  );
}
