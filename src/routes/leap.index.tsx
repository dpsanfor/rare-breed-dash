import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandShell } from "@/components/brand/BrandShell";
import { INSTALLATIONS } from "@/lib/leap-data";

export const Route = createFileRoute("/leap/")({
  head: () => ({
    meta: [{ title: "Rare Breed OS™ · 10X Leap" }],
  }),
  component: LeapHome,
});

type ProgressRow = {
  installation_id: string;
  step_key: string;
  completed_at: string | null;
};
type OsRow = {
  id: string;
  wins: string[] | null;
  current_version: string;
};

function LeapHome() {
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [osRow, setOsRow] = useState<OsRow | null>(null);
  const [newWin, setNewWin] = useState("");

  async function load() {
    const [p, os] = await Promise.all([
      supabase
        .from("leap_progress")
        .select("installation_id,step_key,completed_at"),
      supabase
        .from("leap_os")
        .select("id,wins,current_version")
        .order("created_at", { ascending: false })
        .limit(1),
    ]);
    setProgress((p.data as ProgressRow[]) ?? []);
    setOsRow((os.data?.[0] as OsRow) ?? null);
  }

  useEffect(() => {
    load();
  }, []);

  const completedInstallations = INSTALLATIONS.filter((inst) =>
    progress.some(
      (p) =>
        p.installation_id === inst.id &&
        p.step_key === "completion" &&
        p.completed_at
    )
  );
  const currentInstallation =
    INSTALLATIONS[completedInstallations.length] ?? null;
  const totalExercises = currentInstallation
    ? currentInstallation.steps.filter((s) => s.type === "exercise").length
    : 0;
  const completedSteps = currentInstallation
    ? progress.filter(
        (p) =>
          p.installation_id === currentInstallation.id &&
          p.completed_at &&
          p.step_key !== "completion"
      ).length
    : 0;

  const pct = Math.round(
    (completedInstallations.length / INSTALLATIONS.length) * 100
  );
  const version = osRow?.current_version ?? `1.${completedInstallations.length}`;
  const wins: string[] = osRow?.wins ?? [];
  const instruction =
    currentInstallation?.instruction ??
    INSTALLATIONS[INSTALLATIONS.length - 1].instruction;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning." : hour < 17 ? "Good afternoon." : "Good evening.";

  async function addWin() {
    if (!newWin.trim()) return;
    const updated = [newWin.trim(), ...wins].slice(0, 10);
    if (osRow?.id) {
      await supabase
        .from("leap_os")
        .update({ wins: updated })
        .eq("id", osRow.id);
      setOsRow({ ...osRow, wins: updated });
    } else {
      const { data } = await supabase
        .from("leap_os")
        .insert({ wins: updated })
        .select()
        .single();
      if (data) setOsRow(data as OsRow);
    }
    setNewWin("");
  }

  return (
    <BrandShell hideStickyCta>
      {/* Greeting */}
      <div className="mb-20 mt-8">
        <p className="eyebrow mb-4">
          Rare Breed OS™ · Version {version}
        </p>
        <h1 className="font-display text-[80px] leading-[0.88] tracking-wide text-shimmer md:text-[120px]">
          {greeting}
        </h1>
        <p className="mt-6 max-w-xl font-serif text-xl font-light italic text-[#4A1259]/65">
          {completedInstallations.length === INSTALLATIONS.length
            ? "Your operating system is installed. Run everything through the filter."
            : currentInstallation
              ? `Installation ${currentInstallation.number} of ${INSTALLATIONS.length} in progress.`
              : "Ready to begin."}
        </p>
      </div>

      {/* OS Progress bar */}
      <div className="mb-16">
        <div className="mb-2 flex items-center justify-between">
          <p className="label-soft">Operating System</p>
          <p className="label-soft">{pct}% installed</p>
        </div>
        <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-[rgba(74,18,89,0.1)]">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #4A1259, #E0249C, #ec4899)",
            }}
          />
        </div>
        <div className="mt-3 flex gap-1">
          {INSTALLATIONS.map((inst, i) => (
            <span
              key={inst.id}
              className="flex-1 text-center font-mono text-[9px] uppercase tracking-[0.15em]"
              style={{
                color:
                  i < completedInstallations.length
                    ? "#E0249C"
                    : "rgba(74,18,89,0.3)",
              }}
            >
              {i < completedInstallations.length ? "✓" : "○"} {inst.name}
            </span>
          ))}
        </div>
      </div>

      {/* Today's operating instruction */}
      <div className="mb-16 rounded-2xl border border-[rgba(74,18,89,0.12)] bg-white/80 p-10">
        <p className="eyebrow mb-4">Today's Operating Instruction</p>
        <p className="font-serif text-2xl font-light italic leading-relaxed text-[#1F1623]">
          "{instruction}"
        </p>
      </div>

      {/* Primary actions — one decision per column */}
      <div className="mb-20 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {currentInstallation && (
          <Link
            to="/leap/installations/$id"
            params={{ id: currentInstallation.id }}
            className="rounded-2xl border border-[#E0249C]/30 bg-[#E0249C]/5 p-7 transition-all hover:-translate-y-0.5 hover:border-[#E0249C]/60 hover:bg-[#E0249C]/8"
          >
            <p className="label-soft mb-2">Continue</p>
            <p className="font-display text-2xl tracking-wide text-shimmer">
              Installation {currentInstallation.number}
            </p>
            <p className="mt-1 font-serif italic text-[#1F1623]/70">
              {currentInstallation.name}
            </p>
            {totalExercises > 0 && (
              <p className="mt-3 text-[11px] text-[#E0249C]/70">
                {completedSteps} of {totalExercises} steps complete
              </p>
            )}
          </Link>
        )}
        {!currentInstallation && (
          <Link
            to="/leap/installations/"
            className="rounded-2xl border border-[#E0249C]/30 bg-[#E0249C]/5 p-7 transition-all hover:-translate-y-0.5 hover:border-[#E0249C]/60"
          >
            <p className="label-soft mb-2">Complete</p>
            <p className="font-display text-2xl tracking-wide text-shimmer">
              All Installations
            </p>
            <p className="mt-1 font-serif italic text-[#1F1623]/70">
              OS fully active
            </p>
          </Link>
        )}
        <Link
          to="/leap/decision-filter"
          className="rounded-2xl border border-[rgba(74,18,89,0.12)] bg-white/60 p-7 transition-all hover:-translate-y-0.5 hover:border-[#E0249C]/30"
        >
          <p className="label-soft mb-2">Tool</p>
          <p className="font-display text-2xl tracking-wide text-[#1F1623]">
            Decision Filter
          </p>
          <p className="mt-1 text-sm font-serif italic text-[#4A1259]/55">
            Run a decision through the OS
          </p>
        </Link>
        <Link
          to="/leap/weekly-audit"
          className="rounded-2xl border border-[rgba(74,18,89,0.12)] bg-white/60 p-7 transition-all hover:-translate-y-0.5 hover:border-[#E0249C]/30"
        >
          <p className="label-soft mb-2">Friday Ritual</p>
          <p className="font-display text-2xl tracking-wide text-[#1F1623]">
            Weekly Audit
          </p>
          <p className="mt-1 text-sm font-serif italic text-[#4A1259]/55">
            5-minute operating check-in
          </p>
        </Link>
      </div>

      {/* Recent wins */}
      <div>
        <p className="eyebrow mb-6">Recent Wins</p>
        <div className="space-y-3">
          {wins.slice(0, 3).map((w, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl border border-[rgba(74,18,89,0.1)] bg-white/70 px-5 py-4"
            >
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#E0249C]" />
              <p className="font-serif italic text-[#1F1623]/80">{w}</p>
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <input
              type="text"
              value={newWin}
              onChange={(e) => setNewWin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addWin()}
              placeholder="Drop a win..."
              className="flex-1 rounded-xl border border-[rgba(74,18,89,0.15)] bg-white/70 px-4 py-3 font-serif text-sm italic text-[#1F1623] outline-none placeholder:text-[#4A1259]/30 focus:border-[#E0249C]/50"
            />
            <button
              onClick={addWin}
              disabled={!newWin.trim()}
              className="rounded-xl border border-[#E0249C]/30 bg-[#E0249C]/10 px-5 py-3 font-display text-sm tracking-[0.15em] text-[#E0249C] hover:bg-[#E0249C]/20 disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </BrandShell>
  );
}
