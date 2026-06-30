import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandShell } from "@/components/brand/BrandShell";
import {
  DECISION_FILTER_QUESTIONS,
  type FilterAnswer,
  calculateFilterOutput,
} from "@/lib/leap-data";

export const Route = createFileRoute("/leap/decision-filter")({
  head: () => ({
    meta: [{ title: "Decision Filter · Rare Breed OS™" }],
  }),
  component: DecisionFilterPage,
});

type Phase = "entry" | "questions" | "result";
type Output = "proceed" | "pause" | "not_yours";

const OUTPUT_CONFIG: Record<
  Output,
  { label: string; headline: string; body: string; color: string }
> = {
  proceed: {
    label: "PROCEED",
    headline: "This is yours.",
    body: "Your operating system says yes. Move forward with full commitment — not tentatively, not halfway. This decision expands your vision and requires your genius. Proceed.",
    color: "#E0249C",
  },
  pause: {
    label: "PAUSE",
    headline: "Hold here.",
    body: "Something in this decision needs more clarity before you move. It's not a no — it's a not yet. Sit with the questions that didn't fully land. Return when you have more clarity.",
    color: "#c9a84c",
  },
  not_yours: {
    label: "NOT YOURS",
    headline: "Put it down.",
    body: "This decision is not aligned with where you're going. It may feel urgent. It may seem logical. But your operating system is telling you the truth: this one isn't yours to carry.",
    color: "#ec4899",
  },
};

function DecisionFilterPage() {
  const [phase, setPhase] = useState<Phase>("entry");
  const [decisionText, setDecisionText] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<FilterAnswer>({});
  const [output, setOutput] = useState<Output>("pause");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function selectAnswer(key: string, value: string) {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    setTimeout(() => {
      if (currentQ < DECISION_FILTER_QUESTIONS.length - 1) {
        setCurrentQ((i) => i + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const result = calculateFilterOutput(updated);
        setOutput(result);
        setPhase("result");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 280);
  }

  async function saveDecision() {
    setSaving(true);
    await supabase.from("leap_decisions").insert({
      decision_text: decisionText,
      q1_expands_vision: answers.q1_expands_vision ?? null,
      q2_requires_genius: answers.q2_requires_genius ?? null,
      q3_comfort_or_calling: answers.q3_comfort_or_calling ?? null,
      q4_self_abandonment: answers.q4_self_abandonment ?? null,
      q5_future_self: answers.q5_future_self ?? null,
      output,
    });
    setSaving(false);
    setSaved(true);
  }

  function reset() {
    setPhase("entry");
    setDecisionText("");
    setAnswers({});
    setCurrentQ(0);
    setSaved(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── ENTRY ──────────────────────────────────────────────────────────────────
  if (phase === "entry") {
    return (
      <BrandShell hideStickyCta>
        <div className="mx-auto max-w-2xl">
          <div className="mb-14 mt-8">
            <p className="eyebrow mb-6">Decision Filter · Rare Breed OS™</p>
            <h1 className="font-display text-6xl leading-[1.05] tracking-wide text-shimmer md:text-7xl">
              What decision are you filtering?
            </h1>
            <p className="mt-6 font-serif text-lg font-light italic text-[#4A1259]/60">
              Be specific. Name the actual decision — not the feeling around it.
            </p>
          </div>

          <textarea
            value={decisionText}
            onChange={(e) => setDecisionText(e.target.value)}
            placeholder="I'm deciding whether to..."
            rows={5}
            className="mb-8 w-full resize-none rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white/80 px-6 py-5 font-serif text-lg font-light italic leading-relaxed text-[#1F1623] outline-none placeholder:text-[#4A1259]/25 focus:border-[#E0249C]/40"
          />

          <button
            onClick={() => {
              if (decisionText.trim()) setPhase("questions");
            }}
            disabled={!decisionText.trim()}
            className="inline-flex items-center gap-3 rounded-full px-8 py-4 font-display text-[15px] tracking-[0.2em] text-white transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-40"
            style={{
              background:
                "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
              boxShadow: "0 10px 40px -10px rgba(224,36,156,0.4)",
            }}
          >
            Run the Filter →
          </button>
        </div>
      </BrandShell>
    );
  }

  // ── QUESTIONS — one per screen ─────────────────────────────────────────────
  if (phase === "questions") {
    const q = DECISION_FILTER_QUESTIONS[currentQ];
    return (
      <BrandShell hideStickyCta>
        <div className="mx-auto max-w-xl">
          <div className="mb-14 mt-8">
            <div className="mb-3 flex items-center justify-between">
              <span className="eyebrow">
                Question {currentQ + 1} of {DECISION_FILTER_QUESTIONS.length}
              </span>
              {currentQ > 0 && (
                <button
                  onClick={() => setCurrentQ((i) => i - 1)}
                  className="font-mono text-[13px] uppercase tracking-[0.2em] text-[#4A1259]/45 hover:text-[#E0249C]"
                >
                  ← Back
                </button>
              )}
            </div>
            <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-[rgba(74,18,89,0.1)]">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                style={{
                  width: `${((currentQ + 1) / DECISION_FILTER_QUESTIONS.length) * 100}%`,
                  background: "linear-gradient(90deg, #4A1259, #E0249C)",
                }}
              />
            </div>
          </div>

          {/* Decision reminder */}
          <div className="mb-10 rounded-xl border border-[rgba(74,18,89,0.1)] bg-white/60 px-5 py-4">
            <p className="label-soft mb-1">Filtering</p>
            <p className="line-clamp-2 font-serif text-sm italic text-[#4A1259]/70">
              {decisionText}
            </p>
          </div>

          {/* The one question */}
          <h2 className="mb-4 font-display text-5xl leading-tight tracking-wide text-shimmer md:text-6xl">
            {q.question}
          </h2>
          <p className="mb-12 font-serif text-base font-light italic text-[#4A1259]/50">
            {q.subtext}
          </p>

          {/* Options — large tap targets */}
          <div className="flex flex-col gap-3">
            {q.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => selectAnswer(q.key, opt.value)}
                className={`w-full rounded-2xl border px-8 py-5 text-left font-display text-2xl tracking-[0.15em] transition-all hover:-translate-y-0.5 ${
                  answers[q.key] === opt.value
                    ? "border-[#E0249C] bg-[#E0249C]/8 text-shimmer"
                    : "border-[rgba(74,18,89,0.15)] bg-white/60 text-[#1F1623]/72 hover:border-[#E0249C]/40 hover:bg-[#E0249C]/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </BrandShell>
    );
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  const o = OUTPUT_CONFIG[output];
  return (
    <BrandShell hideStickyCta>
      <div className="mx-auto max-w-xl text-center">
        <div className="mb-16 mt-16">
          <p className="eyebrow mb-8">Decision Filter · Result</p>

          <div
            className="mb-6 inline-block rounded-full border px-8 py-3 font-display text-[13px] tracking-[0.4em]"
            style={{
              borderColor: `${o.color}50`,
              color: o.color,
              background: `${o.color}12`,
            }}
          >
            {o.label}
          </div>

          <h2 className="mt-6 font-display text-6xl leading-[1.05] tracking-wide text-shimmer md:text-7xl">
            {o.headline}
          </h2>
          <p className="mx-auto mt-8 max-w-md font-serif text-xl font-light italic leading-relaxed text-[#4A1259]/68">
            {o.body}
          </p>
        </div>

        {/* The filtered decision */}
        <div className="mb-12 rounded-2xl border border-[rgba(74,18,89,0.12)] bg-white/80 px-8 py-6 text-left">
          <p className="label-soft mb-3">The decision</p>
          <p className="font-serif italic text-[#1F1623]">{decisionText}</p>
        </div>

        <div className="flex flex-col items-center gap-5">
          {!saved ? (
            <button
              onClick={saveDecision}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(201,168,76,0.35)] bg-[rgba(201,168,76,0.08)] px-7 py-3.5 font-display text-[13px] tracking-[0.2em] text-[#1F1623] transition hover:border-[#c9a84c] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save to Decision History"}
            </button>
          ) : (
            <p className="font-serif text-sm italic text-[#E0249C]/70">
              Saved to your Operating System.
            </p>
          )}
          <button
            onClick={reset}
            className="font-mono text-[13px] uppercase tracking-[0.2em] text-[#4A1259]/45 hover:text-[#1F1623]"
          >
            Filter another decision
          </button>
        </div>
      </div>
    </BrandShell>
  );
}
