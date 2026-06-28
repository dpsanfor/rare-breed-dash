import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BrandShell, Eyebrow } from "@/components/brand/BrandShell";
import { SectionCard } from "@/components/brand/SectionCard";
import { SECTIONS } from "@/lib/lexicon";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Rare Breed Dashboard — Macro Hub" },
      {
        name: "description",
        content:
          "Private AI hub for premium coaches in the Rare Breed Club. Refine your positioning, drop gumdrop trails, find your Magic Gumdrop.",
      },
    ],
  }),
  component: MacroHub,
});

function MacroHub() {
  const { data } = useQuery({
    queryKey: ["macro-hub"],
    queryFn: async () => {
      const [
        suo,
        bu,
        rr,
        mg,
        meta,
        trails,
      ] = await Promise.all([
        supabase
          .from("sexy_unicorn_offer")
          .select("name,tagline,updated_at")
          .order("updated_at", { ascending: false })
          .limit(1),
        supabase
          .from("brand_unicorn")
          .select("name,who_she_is,last_refined_at,updated_at")
          .order("updated_at", { ascending: false })
          .limit(1),
        supabase.from("rainbow_road").select("id,name").limit(5),
        supabase
          .from("magic_gumdrop")
          .select("name,tagline_10x,x_factor_statement,last_refined_at")
          .order("updated_at", { ascending: false })
          .limit(1),
        supabase
          .from("metamorphosis_entry")
          .select("entry_text,entry_date")
          .order("entry_date", { ascending: false })
          .limit(1),
        supabase
          .from("gumdrop_trail")
          .select("id,name,status,updated_at")
          .order("updated_at", { ascending: false })
          .limit(50),
      ]);
      return {
        suo: suo.data?.[0] ?? null,
        bu: bu.data?.[0] ?? null,
        rrCount: rr.data?.length ?? 0,
        mg: mg.data?.[0] ?? null,
        meta: meta.data?.[0] ?? null,
        trails: trails.data ?? [],
      };
    },
  });

  const previews: Record<string, { status: string; preview: string | null }> = {
    "sexy-unicorn-offer": {
      status: data?.suo
        ? `Refined ${timeAgo(data.suo.updated_at)}`
        : "Not yet set — start here",
      preview: data?.suo?.tagline ?? data?.suo?.name ?? null,
    },
    "magic-gumdrop": {
      status: data?.mg
        ? `Last refined ${timeAgo(data.mg.last_refined_at ?? data.mg.name ? new Date().toISOString() : null)}`
        : "Synthesizing from your trails…",
      preview: data?.mg?.tagline_10x ?? data?.mg?.x_factor_statement ?? null,
    },
    "brand-unicorn": {
      status: data?.bu
        ? `Refined ${timeAgo(data.bu.updated_at)}`
        : "Not yet set — sketch her in",
      preview: data?.bu?.who_she_is ?? data?.bu?.name ?? null,
    },
    "rainbow-roads": {
      status: `${data?.rrCount ?? 0} framework${(data?.rrCount ?? 0) === 1 ? "" : "s"} in the library`,
      preview: null,
    },
    "metamorphosis": {
      status: data?.meta
        ? `Last entry ${timeAgo(data.meta.entry_date)}`
        : "Quiet here — drop your first entry",
      preview: data?.meta?.entry_text ?? null,
    },
    "gumdrop-trails": {
      status: `${data?.trails.length ?? 0} trail${(data?.trails.length ?? 0) === 1 ? "" : "s"} saved`,
      preview:
        data?.trails
          .slice(0, 3)
          .map((t) => t.name)
          .join(" · ") || null,
    },
  };

  const activeTrails = data?.trails.filter((t) => t.status === "active").length ?? 0;

  return (
    <BrandShell>
      {/* Hero */}
      <section className="mb-16">
        <Eyebrow>The Macro Hub · Your atelier</Eyebrow>
        <h1 className="mt-4 max-w-[18ch] font-display text-7xl leading-[0.88] tracking-wide text-shimmer md:text-[112px]">
          You're not a horse that needs fixing.
        </h1>
        <p className="mt-6 max-w-2xl font-serif text-2xl italic font-light text-[rgba(240,223,160,0.7)]">
          Welcome back. Six pillars of your positioning — one tap to refine any of them.
          When you're ready to test the market, drop a gumdrop trail.
        </p>

        {/* Magic gumdrop progress */}
        <div className="mt-10 flex max-w-md items-center gap-4 rounded-full border border-[rgba(201,168,76,0.2)] bg-black/30 px-5 py-3 backdrop-blur">
          <span className="label-soft shrink-0">Magic Gumdrop</span>
          <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-rb-deep-plum">
            <div className="bg-iridescent absolute inset-y-0 left-0 w-[64%] rounded-full" />
          </div>
          <span className="font-serif text-sm italic text-rb-fuchsia">
            getting closer
          </span>
        </div>
      </section>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => {
          const p = previews[s.slug];
          return (
            <SectionCard
              key={s.slug}
              slug={s.slug}
              title={s.title}
              blurb={s.blurb}
              flavor={s.flavor}
              status={p?.status ?? ""}
              preview={p?.preview ?? null}
              prominent={s.slug === "magic-gumdrop" || s.slug === "sexy-unicorn-offer"}
            />
          );
        })}
      </div>

      {/* Footer note */}
      <div className="mt-20 flex items-center justify-between border-t border-[rgba(201,168,76,0.15)] pt-8">
        <p className="font-serif text-base italic text-[rgba(240,223,160,0.55)]">
          {activeTrails > 0
            ? `${activeTrails} trail${activeTrails === 1 ? "" : "s"} live in the field. The market is teaching.`
            : "No trails live yet. The Test Kitchen is warm."}
        </p>
        <p className="label-soft">Rare Breed Club · Members Only</p>
      </div>
    </BrandShell>
  );
}

function timeAgo(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days < 1) return "today";
  if (days < 2) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}
