import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandShell, PageHeader } from "@/components/brand/BrandShell";
import { INSTALLATIONS } from "@/lib/leap-data";

export const Route = createFileRoute("/leap/installations/")({
  head: () => ({
    meta: [{ title: "Installations · Rare Breed OS™" }],
  }),
  component: InstallationsPage,
});

type ProgressRow = {
  installation_id: string;
  step_key: string;
  completed_at: string | null;
};

function InstallationsPage() {
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [adminMode, setAdminMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("rb_admin") === "1";
  });

  function toggleAdmin() {
    const next = !adminMode;
    setAdminMode(next);
    localStorage.setItem("rb_admin", next ? "1" : "");
  }

  useEffect(() => {
    supabase
      .from("leap_progress")
      .select("installation_id,step_key,completed_at")
      .then(({ data }) => setProgress((data as ProgressRow[]) ?? []));
  }, []);

  function getStatus(id: string, index: number) {
    if (!adminMode && index > 0) {
      const prevId = INSTALLATIONS[index - 1].id;
      const prevDone = progress.some(
        (p) =>
          p.installation_id === prevId &&
          p.step_key === "completion" &&
          p.completed_at
      );
      if (!prevDone) return "locked";
    }
    const done = progress.some(
      (p) =>
        p.installation_id === id &&
        p.step_key === "completion" &&
        p.completed_at
    );
    if (done) return "complete";
    const started = progress.some(
      (p) => p.installation_id === id && p.completed_at
    );
    return started ? "installing" : "ready";
  }

  function completedStepCount(id: string) {
    return progress.filter(
      (p) =>
        p.installation_id === id &&
        p.completed_at &&
        p.step_key !== "completion"
    ).length;
  }

  return (
    <BrandShell hideStickyCta>
      <PageHeader
        eyebrow="The 10X Leap · 5-Day Workshop"
        title="Installations"
        subtitle="Five installations. One operating system. Work in sequence. Each installation prepares the next."
      />

      <div className="mb-6 flex justify-end">
        <button
          onClick={toggleAdmin}
          className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
            adminMode
              ? "border-[#E0249C]/50 bg-[#E0249C]/10 text-[#E0249C]"
              : "border-[rgba(74,18,89,0.2)] text-[#4A1259]/40 hover:border-[rgba(74,18,89,0.4)] hover:text-[#4A1259]/70"
          }`}
        >
          {adminMode ? "Preview Mode: On" : "Preview Mode"}
        </button>
      </div>

      <div className="space-y-4">
        {INSTALLATIONS.map((inst, i) => {
          const status = getStatus(inst.id, i);
          const completed = completedStepCount(inst.id);
          const totalExercises = inst.steps.filter(
            (s) => s.type === "exercise"
          ).length;
          const pct =
            totalExercises > 0
              ? Math.round((completed / totalExercises) * 100)
              : 0;

          if (status === "locked") {
            return (
              <div
                key={inst.id}
                className="rounded-2xl border border-[rgba(74,18,89,0.08)] bg-white/40 p-8 opacity-40"
              >
                <p className="label-soft mb-2">Day {inst.number} · Locked</p>
                <h3 className="font-display text-4xl tracking-wide text-[#4A1259]/40">
                  {inst.name}
                </h3>
                <p className="mt-2 text-sm font-serif italic text-[#4A1259]/30">
                  {inst.goal}
                </p>
              </div>
            );
          }

          return (
            <Link
              key={inst.id}
              to="/leap/installations/$id"
              params={{ id: inst.id }}
              className="block rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_40px_-15px_rgba(224,36,156,0.2)]"
              style={{
                borderColor:
                  status === "complete"
                    ? "rgba(224,36,156,0.3)"
                    : "rgba(74,18,89,0.12)",
                background:
                  status === "complete"
                    ? "rgba(224,36,156,0.05)"
                    : "rgba(255,255,255,0.8)",
              }}
            >
              <div className="p-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="label-soft mb-2">
                      Day {inst.number} ·{" "}
                      {status === "complete"
                        ? "Installed"
                        : status === "installing"
                          ? "Installing..."
                          : "Ready"}
                    </p>
                    <h3 className="font-display text-4xl tracking-wide text-shimmer">
                      {inst.name}
                    </h3>
                    <p className="mt-2 text-base font-serif italic text-[#4A1259]/65">
                      {inst.goal}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {inst.deliverables.map((d) => (
                        <span
                          key={d}
                          className="rounded-full border border-[rgba(74,18,89,0.15)] px-3 py-1 font-mono text-[12px] uppercase tracking-[0.12em] text-[#4A1259]/55"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="ml-6 text-right">
                    {status === "complete" && (
                      <span className="font-display text-3xl text-[#E0249C]">
                        ✓
                      </span>
                    )}
                    {status === "installing" && (
                      <span className="font-mono text-[11px] text-[#E0249C]">
                        {pct}%
                      </span>
                    )}
                  </div>
                </div>

                {status === "installing" && (
                  <div className="mt-6">
                    <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-[rgba(74,18,89,0.1)]">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: "linear-gradient(90deg, #4A1259, #E0249C)",
                        }}
                      />
                    </div>
                    <p className="mt-2 font-mono text-[13px] text-[#E0249C]/60">
                      Installing... {completed} of {totalExercises} steps
                    </p>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </BrandShell>
  );
}
