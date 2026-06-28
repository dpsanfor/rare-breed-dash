import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandShell, PageHeader, VelvetCard } from "@/components/brand/BrandShell";
import { Textarea } from "./sexy-unicorn-offer";

export const Route = createFileRoute("/metamorphosis")({
  component: MetamorphosisPage,
});

type Entry = { id: string; entry_text: string; entry_date: string };

function MetamorphosisPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState("");

  async function load() {
    const { data } = await supabase
      .from("metamorphosis_entry")
      .select("*")
      .order("entry_date", { ascending: false });
    setEntries((data as Entry[]) ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!draft.trim()) return;
    await supabase.from("metamorphosis_entry").insert({ entry_text: draft.trim() });
    setDraft("");
    load();
  }

  return (
    <BrandShell>
      <PageHeader
        eyebrow="The becoming · Private"
        title="Metamorphosis"
        subtitle="You don't get what you want. You get what you become. Track who you're turning into as you build."
      />

      <VelvetCard className="mb-6">
        <p className="label-soft mb-3">New entry · {new Date().toLocaleDateString()}</p>
        <Textarea
          value={draft}
          onChange={setDraft}
          placeholder="What did you become this week? Land it in one or two lines."
          rows={4}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={add}
            disabled={!draft.trim()}
            className="rounded-full bg-gradient-to-r from-rb-violet to-rb-amethyst px-6 py-2.5 font-display text-sm tracking-[0.18em] text-rb-champagne hover:opacity-90 disabled:opacity-40"
          >
            + Add entry
          </button>
        </div>
      </VelvetCard>

      <div className="space-y-3">
        {entries.length === 0 && (
          <p className="px-2 font-serif italic text-[rgba(240,223,160,0.55)]">
            Quiet here. Your first entry will land below.
          </p>
        )}
        {entries.map((e) => (
          <VelvetCard key={e.id} className="!p-6">
            <div className="flex items-start gap-5">
              <span className="mt-1 text-2xl">📝</span>
              <div className="flex-1">
                <p className="label-soft">
                  {new Date(e.entry_date).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="mt-2 whitespace-pre-wrap font-serif text-xl italic leading-snug text-rb-champagne">
                  {e.entry_text}
                </p>
              </div>
            </div>
          </VelvetCard>
        ))}
      </div>
    </BrandShell>
  );
}
