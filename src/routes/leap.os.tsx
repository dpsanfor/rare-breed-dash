import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandShell, PageHeader, VelvetCard } from "@/components/brand/BrandShell";
import { INSTALLATIONS } from "@/lib/leap-data";

export const Route = createFileRoute("/leap/os")({
  head: () => ({
    meta: [{ title: "Operating System · Rare Breed OS™" }],
  }),
  component: OSDashboard,
});

type ProgressRow = {
  installation_id: string;
  step_key: string;
  response: string | null;
  completed_at: string | null;
};
type Decision = {
  id: string;
  decision_text: string;
  output: string;
  created_at: string;
};
type Audit = {
  id: string;
  week_date: string;
  alignment_score: number | null;
  energy_score: number | null;
  calling_score: number | null;
  expansion_score: number | null;
  self_abandonment_score: number | null;
};
type OsRow = {
  current_version: string;
  expansion_goal: string | null;
};

const OUTPUT_COLORS: Record<string, string> = {
  proceed: "#d946ef",
  pause: "#c9a84c",
  not_yours: "#ec4899",
};

function OSDashboard() {
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [osRow, setOsRow] = useState<OsRow | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("leap_progress").select("*"),
      supabase
        .from("leap_decisions")
        .select("id,decision_text,output,created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("leap_weekly_audit")
        .select("id,week_date,alignment_score,energy_score,calling_score,expansion_score,self_abandonment_score")
        .order("week_date", { ascending: false })
        .limit(8),
      supabase
        .from("leap_os")
        .select("current_version,expansion_goal")
        .order("created_at", { ascending: false })
        .limit(1),
    ]).then(([p, d, a, os]) => {
      setProgress((p.data as ProgressRow[]) ?? []);
      setDecisions((d.data as Decision[]) ?? []);
      setAudits((a.data as Audit[]) ?? []);
      setOsRow((os.data?.[0] as OsRow) ?? null);
    });
  }, []);

  function getResponse(installId: string, stepKey: string) {
    return (
      progress.find(
        (p) => p.installation_id === installId && p.step_key === stepKey
      )?.response ?? null
    );
  }

  const completedCount = INSTALLATIONS.filter((inst) =>
    progress.some(
      (p) =>
        p.installation_id === inst.id &&
        p.step_key === "completion" &&
        p.completed_at
    )
  ).length;

  const version = osRow?.current_version ?? `1.${completedCount}`;

  function auditAvg(a: Audit) {
    const vals = [
      a.alignment_score,
      a.energy_score,
      a.calling_score,
      a.expansion_score,
      a.self_abandonment_score,
    ].filter((v) => v !== null) as number[];
    return vals.length > 0
      ? (vals.reduce((s, n) => s + n, 0) / vals.length).toFixed(1)
      : "—";
  }

  const KEY_DELIVERABLES = [
    {
      label: "Rare Breed Vision",
      value: getResponse("envision", "vision"),
      hint: "complete Installation 1",
    },
    {
      label: "Future Identity",
      value: getResponse("envision", "identity"),
      hint: "complete Installation 1",
    },
    {
      label: "10X Goal",
      value: getResponse("envision", "goal_10x"),
      hint: "complete Installation 1",
    },
    {
      label: "Unique Genius Statement",
      value: getResponse("build", "genius"),
      hint: "complete Installation 4",
    },
    {
      label: "Personal Standards",
      value: getResponse("operate", "standards"),
      hint: "complete Installation 5",
    },
    {
      label: "Operating Manual",
      value: getResponse("operate", "manual"),
      hint: "complete Installation 5",
    },
  ];

  return (
    <BrandShell hideStickyCta>
      <PageHeader
        eyebrow="Rare Breed OS™"
        title={`Version ${version}`}
        subtitle="Your installed deliverables, decision history, and audit log. One place."
      />

      {/* Stats */}
      <div className="mb-10 grid grid-cols-3 gap-4">
        <VelvetCard className="!p-6 text-center">
          <p className="label-soft mb-2">Installations</p>
          <p className="font-display text-4xl text-shimmer">
            {completedCount} / {INSTALLATIONS.length}
          </p>
        </VelvetCard>
        <VelvetCard className="!p-6 text-center">
          <p className="label-soft mb-2">Decisions Filtered</p>
          <p className="font-display text-4xl text-shimmer">{decisions.length}</p>
        </VelvetCard>
        <VelvetCard className="!p-6 text-center">
          <p className="label-soft mb-2">Audits Complete</p>
          <p className="font-display text-4xl text-shimmer">{audits.length}</p>
        </VelvetCard>
      </div>

      {/* Expansion goal */}
      {osRow?.expansion_goal && (
        <VelvetCard className="mb-10">
          <p className="label-soft mb-3">Current Expansion Goal</p>
          <p className="font-serif text-xl italic text-rb-champagne">
            {osRow.expansion_goal}
          </p>
        </VelvetCard>
      )}

      {/* Installed deliverables */}
      <div className="mb-14">
        <p className="eyebrow mb-6">Installed Deliverables</p>
        <div className="space-y-3">
          {KEY_DELIVERABLES.map(({ label, value, hint }) => (
            <div
              key={label}
              className="rounded-2xl border border-[rgba(201,168,76,0.12)] bg-[rgba(21,8,40,0.6)] px-7 py-6"
            >
              <p className="label-soft mb-3">{label}</p>
              {value ? (
                <p className="line-clamp-3 font-serif text-base italic leading-relaxed text-rb-champagne/80">
                  {value}
                </p>
              ) : (
                <p className="font-serif text-sm italic text-[rgba(240,223,160,0.28)]">
                  Not yet installed — {hint}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Decision history */}
      {decisions.length > 0 && (
        <div className="mb-14">
          <div className="mb-6 flex items-center justify-between">
            <p className="eyebrow">Decision History</p>
            <Link
              to="/leap/decision-filter"
              className="font-mono text-[10px] uppercase tracking-[0.25em] text-rb-fuchsia/60 hover:text-rb-fuchsia"
            >
              Run Filter →
            </Link>
          </div>
          <div className="space-y-2">
            {decisions.slice(0, 6).map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-4 rounded-xl border border-[rgba(201,168,76,0.1)] bg-[rgba(21,8,40,0.5)] px-5 py-4"
              >
                <span
                  className="shrink-0 rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em]"
                  style={{
                    borderColor: `${OUTPUT_COLORS[d.output] ?? "#c9a84c"}50`,
                    color: OUTPUT_COLORS[d.output] ?? "#c9a84c",
                  }}
                >
                  {d.output.replace("_", " ")}
                </span>
                <p className="flex-1 line-clamp-1 font-serif text-sm italic text-[rgba(240,223,160,0.7)]">
                  {d.decision_text}
                </p>
                <span className="label-soft shrink-0">
                  {new Date(d.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit history */}
      {audits.length > 0 && (
        <div className="mb-14">
          <div className="mb-6 flex items-center justify-between">
            <p className="eyebrow">Audit History</p>
            <Link
              to="/leap/weekly-audit"
              className="font-mono text-[10px] uppercase tracking-[0.25em] text-rb-fuchsia/60 hover:text-rb-fuchsia"
            >
              This Week →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {audits.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-[rgba(201,168,76,0.12)] bg-[rgba(21,8,40,0.5)] p-4 text-center"
              >
                <p className="label-soft mb-2">
                  {new Date(a.week_date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="font-display text-2xl text-shimmer">
                  {auditAvg(a)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="border-t border-[rgba(201,168,76,0.12)] pt-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { to: "/leap/installations/", label: "Installations" },
            { to: "/leap/decision-filter", label: "Decision Filter" },
            { to: "/leap/weekly-audit", label: "Weekly Audit" },
            { to: "/leap/updates", label: "OS Updates" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="rounded-xl border border-[rgba(201,168,76,0.15)] p-4 text-center font-display text-sm tracking-[0.15em] text-[rgba(240,223,160,0.55)] transition hover:border-rb-fuchsia/30 hover:text-rb-champagne"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </BrandShell>
  );
}
