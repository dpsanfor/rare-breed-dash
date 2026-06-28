import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandShell, PageHeader, VelvetCard } from "@/components/brand/BrandShell";
import { Textarea } from "./sexy-unicorn-offer";

export const Route = createFileRoute("/gumdrop-trails/$id")({
  component: TrailDetail,
});

type Trail = {
  id: string;
  name: string;
  status: string;
  tagline: string | null;
  trail_avatar: any;
  sales_page_copy: string | null;
  welcome_email_subject: string | null;
  welcome_email_body: string | null;
  launch_plan: any;
  coach_notes_loved: string | null;
  coach_notes_misaligned: string | null;
};

function TrailDetail() {
  const { id } = useParams({ from: "/gumdrop-trails/$id" });
  const [t, setT] = useState<Trail | null>(null);

  async function load() {
    const { data } = await supabase.from("gumdrop_trail").select("*").eq("id", id).single();
    setT(data as Trail);
  }
  useEffect(() => {
    load();
  }, [id]);

  async function saveNotes() {
    if (!t) return;
    await supabase
      .from("gumdrop_trail")
      .update({
        coach_notes_loved: t.coach_notes_loved,
        coach_notes_misaligned: t.coach_notes_misaligned,
      })
      .eq("id", id);
  }

  if (!t)
    return (
      <BrandShell>
        <p className="font-serif italic text-[rgba(240,223,160,0.6)]">Loading the trail…</p>
      </BrandShell>
    );

  return (
    <BrandShell>
      <PageHeader
        eyebrow={`Trail · ${t.status}`}
        title={t.name}
        subtitle={t.tagline ?? undefined}
      />

      <div className="space-y-6">
        {t.trail_avatar && (
          <VelvetCard>
            <p className="eyebrow mb-3">Aligned Avatar</p>
            <h3 className="font-display text-3xl text-shimmer">{t.trail_avatar.name ?? "Avatar"}</h3>
            {t.trail_avatar.demographics && (
              <p className="mt-2 font-serif italic text-rb-champagne">{t.trail_avatar.demographics}</p>
            )}
            {t.trail_avatar.lights_her_up && (
              <p className="mt-4 text-sm text-[rgba(250,247,255,0.8)]"><b className="text-rb-gold">What lights her up:</b> {t.trail_avatar.lights_her_up}</p>
            )}
          </VelvetCard>
        )}

        {t.sales_page_copy && (
          <VelvetCard>
            <div className="mb-3 flex items-center justify-between">
              <p className="eyebrow">Wireframe Sales Page</p>
              <button
                onClick={() => navigator.clipboard.writeText(t.sales_page_copy!)}
                className="text-xs uppercase tracking-[0.25em] text-rb-fuchsia hover:text-rb-champagne"
              >
                Copy
              </button>
            </div>
            <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap font-serif text-base leading-relaxed text-rb-champagne">
              {t.sales_page_copy}
            </pre>
          </VelvetCard>
        )}

        {t.welcome_email_body && (
          <VelvetCard>
            <p className="eyebrow mb-2">Welcome Email</p>
            <p className="font-serif text-lg italic text-rb-champagne">{t.welcome_email_subject}</p>
            <pre className="mt-4 whitespace-pre-wrap font-serif text-base leading-relaxed text-[rgba(250,247,255,0.85)]">
              {t.welcome_email_body}
            </pre>
          </VelvetCard>
        )}

        {Array.isArray(t.launch_plan) && t.launch_plan.length > 0 && (
          <VelvetCard>
            <p className="eyebrow mb-4">Launch Plan</p>
            <div className="space-y-3">
              {t.launch_plan.map((day: any, i: number) => (
                <div key={i} className="rounded-lg border border-[rgba(201,168,76,0.15)] bg-black/30 p-4">
                  <p className="font-display text-lg text-rb-champagne">Day {day.day ?? i + 1} · {day.platform ?? "—"} · {day.angle ?? ""}</p>
                  {day.hook && <p className="mt-2 font-serif italic text-rb-fuchsia">"{day.hook}"</p>}
                  {day.cta && <p className="mt-2 text-sm text-[rgba(250,247,255,0.7)]">CTA: {day.cta}</p>}
                </div>
              ))}
            </div>
          </VelvetCard>
        )}

        <VelvetCard className="space-y-4">
          <p className="eyebrow">Coach notes</p>
          <label className="block">
            <span className="label-soft mb-2 block">What I loved about this trail</span>
            <Textarea
              value={t.coach_notes_loved ?? ""}
              onChange={(v) => setT({ ...t, coach_notes_loved: v })}
            />
          </label>
          <label className="block">
            <span className="label-soft mb-2 block">What didn't feel aligned</span>
            <Textarea
              value={t.coach_notes_misaligned ?? ""}
              onChange={(v) => setT({ ...t, coach_notes_misaligned: v })}
            />
          </label>
          <div className="flex justify-end">
            <button
              onClick={saveNotes}
              className="rounded-full bg-gradient-to-r from-rb-fuchsia to-rb-hot-pink px-6 py-2.5 font-display text-sm tracking-[0.18em] text-rb-black hover:opacity-90"
            >
              Save notes
            </button>
          </div>
        </VelvetCard>
      </div>
    </BrandShell>
  );
}
