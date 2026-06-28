import { createFileRoute } from "@tanstack/react-router";
import { BrandShell, PageHeader, VelvetCard } from "@/components/brand/BrandShell";
import { OS_UPDATES } from "@/lib/leap-data";

export const Route = createFileRoute("/leap/updates")({
  head: () => ({
    meta: [{ title: "OS Updates · Rare Breed Club" }],
  }),
  component: UpdatesPage,
});

function UpdatesPage() {
  return (
    <BrandShell hideStickyCta>
      <PageHeader
        eyebrow="Rare Breed Club · Members Only"
        title="OS Updates"
        subtitle="Monthly operating system updates. New frameworks, decision filter calibrations, identity upgrades."
      />

      <div className="space-y-6">
        {OS_UPDATES.map((update, i) => (
          <VelvetCard key={update.version}>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="label-soft mb-2">
                  Version {update.version} ·{" "}
                  {new Date(update.date).toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <h3 className="font-display text-3xl tracking-wide text-shimmer">
                  {update.title}
                </h3>
              </div>
              {i === 0 && (
                <span className="rounded-full border border-[#E0249C]/40 bg-[#E0249C]/10 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.25em] text-[#E0249C]">
                  Current
                </span>
              )}
            </div>

            {i === 0 && (
              <div className="mb-6">
                <p className="font-mono text-[10px] text-[#4A1259]/40">
                  Installing...
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 12 }).map((_, j) => (
                      <div
                        key={j}
                        className="h-3 w-2 rounded-sm"
                        style={{
                          background:
                            j < 8 ? "#E0249C" : "rgba(74,18,89,0.12)",
                        }}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[10px] text-[#E0249C]/60">
                    64%
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {update.items.map((item) => {
                const dashIdx = item.indexOf(" — ");
                const title = dashIdx > -1 ? item.slice(0, dashIdx) : item;
                const desc = dashIdx > -1 ? item.slice(dashIdx + 3) : null;
                return (
                  <div key={item} className="flex items-start gap-4">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E0249C]" />
                    <p className="font-serif text-base text-[#4A1259]/75">
                      <span className="not-italic font-medium text-[#1F1623]">
                        {title}
                      </span>
                      {desc && ` — ${desc}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </VelvetCard>
        ))}

        {/* Coming soon */}
        <VelvetCard className="opacity-50">
          <p className="label-soft mb-4">Coming · Version 1.3</p>
          <h3 className="font-display text-3xl tracking-wide text-[#4A1259]/40">
            Community Feed
          </h3>
          <p className="mt-2 font-serif text-sm italic text-[#4A1259]/30">
            Q4 2026
          </p>
        </VelvetCard>
      </div>
    </BrandShell>
  );
}
