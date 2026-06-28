import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandShell, PageHeader, VelvetCard } from "@/components/brand/BrandShell";
import { AvatarWizard, type WizardOutput, type FullAvatar } from "@/components/brand/AvatarWizard";

export const Route = createFileRoute("/brand-unicorn")({
  component: BrandUnicornPage,
});

type SavedBU = {
  id: string;
  name: string | null;
  tagline: string | null;
  full_profile: FullAvatar | null;
  resonant_desire: string | null;
  resonant_vehicle: string | null;
  resonant_outcome: string | null;
  offer_description: string | null;
  updated_at: string;
};

function BrandUnicornPage() {
  const nav = useNavigate();
  const [saved, setSaved] = useState<SavedBU | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [saveDone, setSaveDone] = useState(false);

  useEffect(() => {
    supabase
      .from("brand_unicorn")
      .select("id,name,tagline,full_profile,resonant_desire,resonant_vehicle,resonant_outcome,offer_description,updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) setSaved(data[0] as SavedBU);
      });
  }, []);

  async function handleWizardComplete(output: WizardOutput) {
    const payload = {
      name: output.name,
      who_she_is: output.who_she_is,
      lights_her_up: output.lights_her_up,
      biggest_challenges: output.biggest_challenges,
      what_she_tried: output.what_she_tried,
      what_she_desires: output.what_she_desires,
      unicorn_signal: output.unicorn_signal,
      tagline: output.tagline,
      full_profile: output.full_profile,
      resonant_desire: output.resonant_desire,
      resonant_vehicle: output.resonant_vehicle,
      resonant_outcome: output.resonant_outcome,
      offer_description: output.offer_description,
      last_refined_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let newId = saved?.id;
    if (saved?.id) {
      await (supabase.from("brand_unicorn").update(payload as any) as any).eq("id", saved.id);
    } else {
      const { data } = await (supabase.from("brand_unicorn").insert(payload as any) as any).select().single();
      newId = data?.id;
    }

    setSaveDone(true);
    setWizardOpen(false);
    setSaved({
      id: newId ?? "",
      name: output.name,
      tagline: output.tagline,
      full_profile: output.full_profile,
      resonant_desire: output.resonant_desire,
      resonant_vehicle: output.resonant_vehicle,
      resonant_outcome: output.resonant_outcome,
      offer_description: output.offer_description,
      updated_at: new Date().toISOString(),
    });
    setTimeout(() => setSaveDone(false), 3000);
  }

  if (wizardOpen) {
    return (
      <BrandShell>
        <div className="mb-10">
          <h1 className="font-display text-6xl leading-[0.9] text-shimmer md:text-7xl">
            Brand Unicorn
          </h1>
          <div className="hr-gold mt-8 h-px w-24" />
        </div>
        <AvatarWizard
          onComplete={handleWizardComplete}
          onCancel={() => setWizardOpen(false)}
        />
      </BrandShell>
    );
  }

  const fp = saved?.full_profile;

  return (
    <BrandShell>
      <PageHeader
        eyebrow="Across all your work"
        title="Brand Unicorn"
        subtitle="The overarching unicorn you're calling in. Distinct from any one trail avatar — this is who lives across the whole brand."
      />

      {saveDone && (
        <div className="mb-6 rounded-xl border border-rb-gold/30 bg-rb-gold/5 px-5 py-4">
          <p className="font-serif italic text-rb-gold">Saved ✓ — your Brand Unicorn is locked in.</p>
        </div>
      )}

      {/* Build / Refine button */}
      <div className="mb-8 flex items-center justify-between rounded-xl border border-[rgba(201,168,76,0.2)] bg-black/20 px-6 py-5">
        <div>
          <p className="font-display text-lg text-rb-champagne">
            {fp ? "Refine with AI" : "Build with AI"}
          </p>
          <p className="mt-1 font-serif text-sm italic text-[rgba(240,223,160,0.55)]">
            {fp
              ? "Walk back through the wizard to sharpen your positioning."
              : "Walk through the wizard to define your most aligned avatar and tagline."}
          </p>
        </div>
        <button
          onClick={() => setWizardOpen(true)}
          className="shrink-0 rounded-full bg-gradient-to-r from-rb-amethyst to-rb-fuchsia px-6 py-2.5 font-display text-sm tracking-[0.18em] text-rb-champagne hover:opacity-90"
        >
          {fp ? "Refine →" : "Build →"}
        </button>
      </div>

      {/* Saved profile view */}
      {fp ? (
        <div className="space-y-6">
          {/* Avatar header */}
          <VelvetCard>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-4xl text-shimmer">
                  {fp.emoji} {fp.name} — {fp.title}
                </h2>
                {saved?.tagline && (
                  <p className="mt-4 font-serif text-xl italic text-rb-fuchsia leading-relaxed">
                    "{saved.tagline}"
                  </p>
                )}
              </div>
            </div>

            {/* Demographics */}
            {fp.demographics && (
              <div className="mt-6 grid grid-cols-2 gap-2 text-sm">
                {Object.entries(fp.demographics).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-[rgba(201,168,76,0.6)] capitalize">{k.replace(/_/g, " ")}: </span>
                    <span className="text-rb-champagne">{v as string}</span>
                  </div>
                ))}
              </div>
            )}
          </VelvetCard>

          {/* Positioning summary */}
          {(saved?.resonant_desire || saved?.resonant_vehicle || saved?.resonant_outcome) && (
            <VelvetCard>
              <p className="label-soft mb-4">Positioning Summary</p>
              <div className="space-y-3">
                {saved?.resonant_desire && (
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-rb-fuchsia mb-1">She wants to achieve</p>
                    <p className="font-serif text-base text-rb-champagne">{saved.resonant_desire}</p>
                  </div>
                )}
                {saved?.resonant_vehicle && (
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-rb-amethyst mb-1">Without having to</p>
                    <p className="font-serif text-base text-rb-champagne">{saved.resonant_vehicle}</p>
                  </div>
                )}
                {saved?.resonant_outcome && (
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-rb-gold mb-1">So that she can</p>
                    <p className="font-serif text-base text-rb-champagne">{saved.resonant_outcome}</p>
                  </div>
                )}
              </div>
            </VelvetCard>
          )}

          {/* Background */}
          {fp.background && (
            <VelvetCard>
              <p className="label-soft mb-3">Background</p>
              <p className="font-serif text-base leading-relaxed text-[rgba(240,223,160,0.8)] whitespace-pre-line">
                {fp.background}
              </p>
            </VelvetCard>
          )}

          {/* Desires */}
          {(fp.desires ?? []).length > 0 && (
            <ProfileList
              label={`What ${fp.name} Wants Most`}
              items={fp.desires}
              highlighted={saved?.resonant_desire ? [saved.resonant_desire] : []}
              accent="fuchsia"
            />
          )}

          {/* Vehicles */}
          {(fp.vehicles_tried ?? []).length > 0 && (
            <ProfileList
              label="What She's Already Tried"
              items={fp.vehicles_tried}
              highlighted={saved?.resonant_vehicle ? [saved.resonant_vehicle] : []}
              accent="amethyst"
            />
          )}

          {/* Outcomes */}
          {(fp.outcomes ?? []).length > 0 && (
            <ProfileList
              label="Outcomes She Craves"
              items={fp.outcomes}
              highlighted={saved?.resonant_outcome ? [saved.resonant_outcome] : []}
              accent="gold"
            />
          )}

          {fp.unicorn_signal && (
            <VelvetCard>
              <p className="label-soft mb-2">Her Unicorn Signal</p>
              <p className="font-serif text-base italic text-[rgba(240,223,160,0.85)]">{fp.unicorn_signal}</p>
            </VelvetCard>
          )}

          {/* Use in Test Kitchen */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => {
                sessionStorage.setItem("rb_brand_unicorn_prefill", JSON.stringify({
                  trail_avatar: fp,
                  tagline: saved?.tagline ?? "",
                }));
                nav({ to: "/test-kitchen" });
              }}
              className="rounded-full px-8 py-3 font-display text-sm tracking-[0.18em] text-rb-black hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #d946ef 0%, #ec4899 50%, #c9a84c 100%)" }}
            >
              Drop a Gumdrop Trail with This Avatar →
            </button>
          </div>
        </div>
      ) : (
        <VelvetCard>
          <p className="font-serif text-xl italic text-[rgba(240,223,160,0.65)]">
            No Brand Unicorn yet. Hit "Build →" above to walk through the wizard — I'll help you
            find her.
          </p>
        </VelvetCard>
      )}
    </BrandShell>
  );
}

function ProfileList({
  label, items, highlighted, accent,
}: {
  label: string;
  items: string[];
  highlighted: string[];
  accent: "fuchsia" | "gold" | "amethyst";
}) {
  const cls = {
    fuchsia: { border: "border-rb-fuchsia/40", bg: "bg-rb-fuchsia/5", dot: "bg-rb-fuchsia" },
    gold: { border: "border-rb-gold/40", bg: "bg-rb-gold/5", dot: "bg-rb-gold" },
    amethyst: { border: "border-rb-amethyst/40", bg: "bg-rb-amethyst/5", dot: "bg-rb-amethyst" },
  }[accent];

  return (
    <VelvetCard>
      <p className="label-soft mb-4">{label}</p>
      <ul className="space-y-2">
        {items.map((item, i) => {
          const isHl = highlighted.includes(item);
          return (
            <li
              key={i}
              className={`flex items-start gap-3 rounded-lg p-3 ${isHl ? `border ${cls.border} ${cls.bg}` : ""}`}
            >
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${isHl ? cls.dot : "bg-[rgba(201,168,76,0.4)]"}`} />
              <p className="font-serif text-sm leading-relaxed text-rb-champagne">{item}</p>
            </li>
          );
        })}
      </ul>
    </VelvetCard>
  );
}
