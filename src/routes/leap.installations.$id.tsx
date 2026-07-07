import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandShell } from "@/components/brand/BrandShell";
import { INSTALLATIONS } from "@/lib/leap-data";

export const Route = createFileRoute("/leap/installations/$id")({
  component: InstallationPage,
});

type ProgressRow = {
  installation_id: string;
  step_key: string;
  response: string | null;
  completed_at: string | null;
};

function InstallationPage() {
  const { id } = useParams({ from: "/leap/installations/$id" });
  const navigate = useNavigate();
  const installation = INSTALLATIONS.find((i) => i.id === id);

  const [stepIndex, setStepIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const inst = installation;
    if (!inst) return;
    supabase
      .from("leap_progress")
      .select("*")
      .eq("installation_id", id)
      .then(({ data }) => {
        const rows = (data as ProgressRow[]) ?? [];
        const saved: Record<string, string> = {};
        rows.forEach((r) => {
          if (r.response) saved[r.step_key] = r.response;
        });
        setResponses(saved);
        const firstIncomplete = inst.steps.findIndex(
          (step, i) =>
            i > 0 && !rows.find((r) => r.step_key === step.key && r.completed_at)
        );
        setStepIndex(
          firstIncomplete >= 0 ? firstIncomplete : inst.steps.length - 1
        );
      });
  }, [id]);

  if (!installation) {
    return (
      <BrandShell hideStickyCta>
        <p className="font-serif italic text-[#4A1259]/50">
          Installation not found.
        </p>
      </BrandShell>
    );
  }

  const step = installation.steps[stepIndex];
  const exerciseSteps = installation.steps.filter((s) => s.type === "exercise");
  const exerciseIndex = exerciseSteps.findIndex((s) => s.key === step?.key);
  const totalExercises = exerciseSteps.length;

  async function advance() {
    if (!installation || !step) return;
    setSaving(true);

    if (step.type === "exercise") {
      await supabase.from("leap_progress").upsert(
        {
          installation_id: id,
          step_key: step.key,
          response: responses[step.key] ?? "",
          completed_at: new Date().toISOString(),
        },
        { onConflict: "installation_id,step_key" }
      );
    }

    if (step.type === "completion") {
      await supabase.from("leap_progress").upsert(
        {
          installation_id: id,
          step_key: "completion",
          completed_at: new Date().toISOString(),
        },
        { onConflict: "installation_id,step_key" }
      );
    }

    setSaving(false);

    if (stepIndex < installation.steps.length - 1) {
      setStepIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate({ to: "/leap/installations" });
    }
  }

  // ── RECAP ──────────────────────────────────────────────────────────────────
  if (step.type === "recap") {
    return (
      <BrandShell hideStickyCta>
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 mt-8 flex items-center gap-3">
            <Link
              to="/leap/installations"
              className="font-mono text-[13px] uppercase tracking-[0.2em] text-[#4A1259]/45 hover:text-[#E0249C]"
            >
              ← Installations
            </Link>
            <span className="text-[rgba(74,18,89,0.3)]">/</span>
            <span className="eyebrow">Day {installation.number} · {installation.name}</span>
          </div>

          <p className="eyebrow mb-6">Before we begin</p>
          <h1 className="font-display text-5xl leading-[1.05] tracking-wide text-shimmer md:text-6xl">
            {step.title}
          </h1>

          <div className="mt-12 space-y-5">
            {step.body?.split("\n\n").map((para, i) => (
              <p
                key={i}
                className={`font-serif leading-relaxed ${
                  para.startsWith("•")
                    ? "pl-5 text-lg text-[#4A1259]/75"
                    : para.length < 55
                      ? "text-xl italic text-[#1F1623]"
                      : "text-lg text-[#4A1259]/72"
                }`}
              >
                {para}
              </p>
            ))}
          </div>

          <div className="mt-16">
            <button
              onClick={advance}
              className="inline-flex items-center gap-3 rounded-full px-8 py-4 font-display text-[17px] tracking-[0.2em] text-white transition-transform hover:-translate-y-0.5 active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
                boxShadow: "0 10px 40px -10px rgba(224,36,156,0.4)",
              }}
            >
              Begin Installation {installation.number} →
            </button>
          </div>
        </div>
      </BrandShell>
    );
  }

  // ── COMPLETION ─────────────────────────────────────────────────────────────
  if (step.type === "completion") {
    const isLast = installation.number === INSTALLATIONS.length;
    return (
      <BrandShell hideStickyCta>
        <div className="mx-auto max-w-xl text-center">
          <div className="mb-16 mt-16">
            <p className="eyebrow mb-8">Status Update</p>
            <div className="mb-8 font-mono text-sm text-[#4A1259]/45">
              <p>Installing...</p>
              <p className="mt-2">████████████ 100%</p>
            </div>
            <h1 className="font-display text-6xl leading-[1.05] tracking-wide text-shimmer md:text-7xl">
              {step.title}
            </h1>
            <p className="mt-6 font-serif text-xl font-light italic text-[#4A1259]/65">
              {isLast
                ? "You are the operating system now."
                : installation.deliverables.join(" · ") + ". Saved."}
            </p>
          </div>

          <div className="mb-12 rounded-2xl border border-[rgba(74,18,89,0.12)] bg-white/80 p-8 text-left">
            <p className="label-soft mb-4">Deliverables Installed</p>
            <div className="space-y-3">
              {installation.deliverables.map((d) => (
                <div key={d} className="flex items-center gap-3">
                  <span className="text-sm text-[#E0249C]">✓</span>
                  <span className="font-serif italic text-[#1F1623]">{d}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-5">
            <button
              onClick={advance}
              disabled={saving}
              className="inline-flex items-center gap-3 rounded-full px-8 py-4 font-display text-[17px] tracking-[0.2em] text-white transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
              style={{
                background:
                  "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
                boxShadow: "0 10px 40px -10px rgba(224,36,156,0.4)",
              }}
            >
              {saving
                ? "Saving..."
                : isLast
                  ? "Enter the OS →"
                  : "Continue →"}
            </button>
            <Link
              to="/leap/installations"
              className="font-mono text-[13px] uppercase tracking-[0.2em] text-[#4A1259]/45 hover:text-[#1F1623]"
            >
              Back to Installations
            </Link>
          </div>
        </div>
      </BrandShell>
    );
  }

  // ── EXERCISE ───────────────────────────────────────────────────────────────
  return (
    <BrandShell hideStickyCta>
      <div className="mx-auto max-w-2xl">
        {/* Breadcrumb + step counter */}
        <div className="mb-12 mt-8 flex items-center gap-3">
          <button
            onClick={() =>
              stepIndex > 0
                ? setStepIndex((i) => i - 1)
                : navigate({ to: "/leap/installations" })
            }
            className="font-mono text-[13px] uppercase tracking-[0.2em] text-[#4A1259]/45 hover:text-[#E0249C]"
          >
            ← Back
          </button>
          <span className="ml-auto eyebrow">
            Day {installation.number} · {exerciseIndex + 1} of {totalExercises}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-14">
          <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-[rgba(74,18,89,0.1)]">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
              style={{
                width: `${Math.round(((exerciseIndex + 1) / totalExercises) * 100)}%`,
                background: "linear-gradient(90deg, #4A1259, #E0249C)",
              }}
            />
          </div>
          <p className="mt-2 font-mono text-[13px] text-[#E0249C]/60">
            Installing... {installation.name} · Step {exerciseIndex + 1} of{" "}
            {totalExercises}
          </p>
        </div>

        {/* The question — one per screen */}
        <div className="mb-10">
          <p className="eyebrow mb-4">{installation.name}</p>
          <h2 className="font-display text-4xl leading-tight tracking-wide text-shimmer md:text-5xl">
            {step.title}
          </h2>
          {step.prompt && (
            <p className="mt-6 font-serif text-lg font-light italic leading-relaxed text-[#4A1259]/68">
              {step.prompt}
            </p>
          )}
        </div>

        {/* Response */}
        <div className="mb-12">
          <textarea
            value={responses[step.key] ?? ""}
            onChange={(e) =>
              setResponses((prev) => ({ ...prev, [step.key]: e.target.value }))
            }
            placeholder={step.placeholder}
            rows={8}
            className="w-full resize-none rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white/80 px-6 py-5 font-serif text-base italic leading-relaxed text-[#1F1623] outline-none placeholder:text-[#4A1259]/25 focus:border-[#E0249C]/40"
          />
        </div>

        {/* Advance */}
        <div className="flex items-center gap-6">
          <button
            onClick={advance}
            disabled={saving}
            className="inline-flex items-center gap-3 rounded-full px-8 py-4 font-display text-[17px] tracking-[0.2em] text-white transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
            style={{
              background:
                "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
              boxShadow: "0 10px 40px -10px rgba(224,36,156,0.4)",
            }}
          >
            {saving ? "Saving..." : "Save & Continue →"}
          </button>
          <p className="font-serif text-sm italic text-[#4A1259]/40">
            Your response is saved automatically
          </p>
        </div>
      </div>
    </BrandShell>
  );
}
