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

  useEffect(() => {
    supabase
      .from("leap_progress")
      .select("installation_id,step_key,completed_at")
      .then(({ data }) => setProgress((data as ProgressRow[]) ?? []));
  }, []);

  function getStatus(id: string, index: number) {
    if (index > 0) {
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
        subtitle="Five installations. One operating system. Work in sequence — each installation prepares the next."
      />

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
                className="rounded-2xl border border-[rgba(201,168,76,0.08)] bg-[rgba(10,10,10,0.5)] p-8 opacity-40"
              >
                <p className="label-soft mb-2">
                  Day {inst.number} · Locked
                </p>
                <h3 className="font-display text-4xl tracking-wide text-[rgba(240,223,160,0.4)]">
                  {inst.name}
                </h3>
                <p className="mt-2 text-sm font-serif italic text-[rgba(240,223,160,0.3)]">
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
              className="block rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_40px_-15px_rgba(217,70,239,0.25)]"
              style={{
                borderColor:
                  status === "complete"
                    ? "rgba(217,70,239,0.3)"
                    : "rgba(201,168,76,0.18)",
                background:
                  status === "complete"
                    ? "linear-gradient(135deg, #1a0533, #0e0518, #0a0a0a)"
                    : "linear-gradient(135deg, #150828, #0e0518, #0a0a0a)",
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
                    <p className="mt-2 text-base font-serif italic text-[rgba(240,223,160,0.65)]">
                      {inst.goal}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {inst.deliverables.map((d) => (
                        <span
                          key={d}
                          className="rounded-full border border-[rgba(201,168,76,0.18)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[rgba(240,223,160,0.45)]"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="ml-6 text-right">
                    {status === "complete" && (
                      <span className="font-display text-3xl text-rb-fuchsia">
                        ✓
                      </span>
                    )}
                    {status === "installing" && (
                      <span className="font-mono text-[11px] text-rb-fuchsia">
                        {pct}%
                      </span>
                    )}
                  </div>
                </div>

                {status === "installing" && (
                  <div className="mt-6">
                    <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-[rgba(201,168,76,0.1)]">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          width: `${pct}%`,
                          background:
                            "linear-gradient(90deg, #6b21a8, #d946ef)",
                        }}
                      />
                    </div>
                    <p className="mt-2 font-mono text-[10px] text-rb-fuchsia/50">
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
