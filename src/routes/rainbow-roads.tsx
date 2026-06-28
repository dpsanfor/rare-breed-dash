import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandShell, PageHeader, VelvetCard } from "@/components/brand/BrandShell";

export const Route = createFileRoute("/rainbow-roads")({
  component: RainbowRoadsPage,
});

type Step = { name: string; what: string; why: string };
type Road = { id: string; name: string; steps: Step[]; bridge_gap: string | null; usage_count: number };

function RainbowRoadsPage() {
  const [roads, setRoads] = useState<Road[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase
      .from("rainbow_road")
      .select("*")
      .order("updated_at", { ascending: false });
    setRoads((data as unknown as Road[]) ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <BrandShell>
      <PageHeader
        eyebrow="Your proprietary frameworks"
        title="Rainbow Roads"
        subtitle="The pads. Your signature blend, bottled. Every framework you build in the Test Kitchen lands here."
      />

      {roads.length === 0 ? (
        <VelvetCard>
          <p className="font-serif text-xl italic text-[rgba(240,223,160,0.7)]">
            No frameworks yet. Drop a gumdrop trail in the Test Kitchen — Step 4
            builds your first Rainbow Road.
          </p>
        </VelvetCard>
      ) : (
        <div className="space-y-4">
          {roads.map((r) => (
            <VelvetCard key={r.id}>
              <button
                onClick={() => setOpen(open === r.id ? null : r.id)}
                className="flex w-full items-center justify-between text-left"
              >
                <div>
                  <p className="label-soft mb-2">
                    {Array.isArray(r.steps) ? r.steps.length : 0} steps · used in {r.usage_count} trail
                    {r.usage_count === 1 ? "" : "s"}
                  </p>
                  <h3 className="font-display text-3xl text-shimmer">🌈 {r.name}</h3>
                </div>
                <span className="font-display text-3xl text-rb-fuchsia">
                  {open === r.id ? "–" : "+"}
                </span>
              </button>

              {open === r.id && (
                <div className="mt-6 space-y-4 border-t border-[rgba(201,168,76,0.15)] pt-6">
                  {(r.steps ?? []).map((s, i) => (
                    <div key={i}>
                      <p className="eyebrow">Step {i + 1}</p>
                      <h4 className="mt-1 font-serif text-xl italic text-rb-champagne">{s.name}</h4>
                      {s.what && <p className="mt-2 text-sm text-[rgba(250,247,255,0.75)]"><b className="text-rb-gold">What:</b> {s.what}</p>}
                      {s.why && <p className="mt-1 text-sm text-[rgba(250,247,255,0.75)]"><b className="text-rb-gold">Why:</b> {s.why}</p>}
                    </div>
                  ))}
                  {r.bridge_gap && (
                    <div className="mt-4 rounded-lg border border-rb-fuchsia/40 bg-rb-fuchsia/5 p-4">
                      <p className="eyebrow !text-rb-fuchsia">The bridge gap</p>
                      <p className="mt-1 font-serif italic text-rb-champagne">{r.bridge_gap}</p>
                    </div>
                  )}
                </div>
              )}
            </VelvetCard>
          ))}
        </div>
      )}
    </BrandShell>
  );
}
