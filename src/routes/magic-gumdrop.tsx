import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandShell, PageHeader, VelvetCard } from "@/components/brand/BrandShell";
import { Input, Textarea } from "./sexy-unicorn-offer";

export const Route = createFileRoute("/magic-gumdrop")({
  component: MagicGumdropPage,
});

type MG = {
  id?: string;
  name: string;
  tagline_10x: string;
  x_factor_statement: string;
  unique_mechanism: string;
  drool_factor: string;
  embodiment_notes: string;
};

const blank: MG = {
  name: "",
  tagline_10x: "",
  x_factor_statement: "",
  unique_mechanism: "",
  drool_factor: "",
  embodiment_notes: "",
};

function MagicGumdropPage() {
  const [mg, setMg] = useState<MG>(blank);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [trailCount, setTrailCount] = useState(0);

  useEffect(() => {
    supabase
      .from("magic_gumdrop")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) {
          const d = data[0] as Record<string, unknown>;
          const norm: MG = { ...blank };
          for (const k of Object.keys(blank) as (keyof MG)[]) {
            if (d[k] != null) (norm as any)[k] = d[k];
          }
          (norm as any).id = d.id;
          setMg(norm);
        }
      });
    supabase
      .from("gumdrop_trail")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => setTrailCount(count ?? 0));
  }, []);

  async function save() {
    const payload = { ...mg, last_refined_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    if (mg.id) {
      await supabase.from("magic_gumdrop").update(payload).eq("id", mg.id);
    } else {
      const { data } = await supabase.from("magic_gumdrop").insert(payload).select().single();
      if (data) setMg({ ...mg, id: data.id });
    }
  }

  async function analyze() {
    setAnalyzing(true);
    const { data, error } = await supabase.functions.invoke("rb-generate", {
      body: { kind: "magic_gumdrop_analysis" },
    });
    setAnalyzing(false);
    if (error) {
      setAnalysis(`Couldn't reach the pattern analyzer. ${error.message}`);
      return;
    }
    setAnalysis((data as { output: string }).output);
  }

  return (
    <BrandShell>
      <PageHeader
        eyebrow="The X-Factor · The 10x"
        title="Magic Gumdrop"
        subtitle="The flavor other unicorns drool over. The dashboard doesn't tell you what it is — it surfaces the pattern. You name what's emerging."
      />

      {/* Zone 1 */}
      <VelvetCard className="mb-8 space-y-6">
        <div className="flex items-center justify-between">
          <p className="eyebrow !text-rb-iridescent">Your Magic Gumdrop · current articulation</p>
          <div className="bg-iridescent h-2 w-32 rounded-full opacity-70" />
        </div>

        <label className="block">
          <span className="label-soft mb-2 block">Magic Gumdrop name</span>
          <Input value={mg.name} onChange={(v) => setMg({ ...mg, name: v })} placeholder="The Soft Power Activator" />
        </label>
        <label className="block">
          <span className="label-soft mb-2 block">10x Tagline</span>
          <Input value={mg.tagline_10x} onChange={(v) => setMg({ ...mg, tagline_10x: v })} />
        </label>
        <label className="block">
          <span className="label-soft mb-2 block">X-Factor Statement</span>
          <Textarea
            value={mg.x_factor_statement}
            onChange={(v) => setMg({ ...mg, x_factor_statement: v })}
            placeholder="I help [X] achieve [Y] without [Z] — in a way no one else does because [unique mechanism]."
          />
        </label>
        <label className="block">
          <span className="label-soft mb-2 block">Unique Mechanism</span>
          <Textarea value={mg.unique_mechanism} onChange={(v) => setMg({ ...mg, unique_mechanism: v })} />
        </label>
        <label className="block">
          <span className="label-soft mb-2 block">The Drool Factor</span>
          <Textarea value={mg.drool_factor} onChange={(v) => setMg({ ...mg, drool_factor: v })} placeholder="What other unicorns specifically want from you." />
        </label>
        <label className="block">
          <span className="label-soft mb-2 block">Embodiment notes</span>
          <Textarea value={mg.embodiment_notes} onChange={(v) => setMg({ ...mg, embodiment_notes: v })} />
        </label>

        <div className="flex justify-end border-t border-[rgba(201,168,76,0.15)] pt-6">
          <button
            onClick={save}
            className="rounded-full bg-gradient-to-r from-rb-fuchsia to-rb-iridescent px-7 py-3 font-display text-sm tracking-[0.18em] text-rb-black hover:opacity-90"
          >
            Save articulation
          </button>
        </div>
      </VelvetCard>

      {/* Zone 2 */}
      <VelvetCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="eyebrow">What the market is telling you</p>
            <p className="mt-2 font-serif text-lg italic text-[rgba(240,223,160,0.7)]">
              Pattern analysis from {trailCount} saved trail{trailCount === 1 ? "" : "s"}.
            </p>
          </div>
          <button
            onClick={analyze}
            disabled={analyzing || trailCount === 0}
            className="rounded-full border border-rb-gold/50 bg-black/40 px-5 py-2 font-display text-xs tracking-[0.2em] text-rb-champagne hover:bg-rb-gold/10 disabled:opacity-40"
          >
            {analyzing ? "Reading the field…" : "Surface the pattern"}
          </button>
        </div>

        {analysis ? (
          <div className="prose prose-invert max-w-none whitespace-pre-wrap font-serif text-lg leading-relaxed text-rb-champagne">
            {analysis}
          </div>
        ) : (
          <p className="font-serif italic text-[rgba(240,223,160,0.5)]">
            {trailCount === 0
              ? "Drop a few gumdrop trails first — the pattern needs signal to read."
              : "Click 'Surface the pattern' to see what's converging across your trails."}
          </p>
        )}
      </VelvetCard>
    </BrandShell>
  );
}
