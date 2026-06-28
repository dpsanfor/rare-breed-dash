import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandShell, PageHeader, VelvetCard } from "@/components/brand/BrandShell";

export const Route = createFileRoute("/gumdrop-trails/")({
  component: GumdropTrailsPage,
});

type Trail = {
  id: string;
  name: string;
  status: string;
  tagline: string | null;
  flavor_color: string | null;
  launched_at: string | null;
  created_at: string;
  trail_avatar: { name?: string } | null;
};

const FLAVOR: Record<string, string> = {
  raspberry: "#ec4899",
  fuchsia: "#d946ef",
  blueberry: "#6366f1",
  lemon: "#fbbf24",
  peppermint: "#34d399",
  amethyst: "#a855f7",
  gold: "#c9a84c",
};

function GumdropTrailsPage() {
  const [trails, setTrails] = useState<Trail[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "draft" | "archived">("all");

  useEffect(() => {
    supabase
      .from("gumdrop_trail")
      .select("id,name,status,tagline,flavor_color,launched_at,created_at,trail_avatar")
      .order("created_at", { ascending: false })
      .then(({ data }) => setTrails((data as Trail[]) ?? []));
  }, []);

  const visible = trails.filter((t) => filter === "all" || t.status === filter);

  return (
    <BrandShell>
      <PageHeader
        eyebrow="Your archive · Season by season"
        title="Saved Gumdrop Trails"
        subtitle="Every trail you've dropped. Pull one back when the season shifts — re-launch in minutes, not weeks."
      />

      <div className="mb-6 flex items-center gap-2">
        {(["all", "active", "draft", "archived"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] transition ${
              filter === f
                ? "border-rb-fuchsia bg-rb-fuchsia/10 text-rb-champagne"
                : "border-[rgba(201,168,76,0.2)] text-[rgba(240,223,160,0.5)] hover:text-rb-champagne"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <VelvetCard>
          <p className="font-serif text-xl italic text-[rgba(240,223,160,0.65)]">
            No trails {filter === "all" ? "" : filter} yet. The Test Kitchen is warm whenever
            you're ready.
          </p>
        </VelvetCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((t) => (
            <Link
              key={t.id}
              to="/gumdrop-trails/$id"
              params={{ id: t.id }}
              className="group"
            >
              <VelvetCard className="transition-all hover:-translate-y-0.5 hover:border-rb-fuchsia/40">
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: FLAVOR[t.flavor_color ?? "fuchsia"] }}
                  />
                  <span className="label-soft">
                    {t.status} · {t.launched_at
                      ? `launched ${new Date(t.launched_at).toLocaleDateString()}`
                      : `saved ${new Date(t.created_at).toLocaleDateString()}`}
                  </span>
                </div>
                <h3 className="font-display text-2xl text-shimmer">📦 {t.name}</h3>
                {t.trail_avatar?.name && (
                  <p className="mt-1 font-serif italic text-[rgba(240,223,160,0.6)]">
                    for {t.trail_avatar.name}
                  </p>
                )}
                {t.tagline && (
                  <p className="mt-4 line-clamp-2 text-sm text-[rgba(250,247,255,0.7)]">
                    {t.tagline}
                  </p>
                )}
                <p className="mt-5 text-xs uppercase tracking-[0.25em] text-rb-fuchsia opacity-0 transition-opacity group-hover:opacity-100">
                  Open trail →
                </p>
              </VelvetCard>
            </Link>
          ))}
        </div>
      )}
    </BrandShell>
  );
}
