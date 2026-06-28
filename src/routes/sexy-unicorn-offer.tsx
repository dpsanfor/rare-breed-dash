import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandShell, PageHeader, VelvetCard } from "@/components/brand/BrandShell";

export const Route = createFileRoute("/sexy-unicorn-offer")({
  component: SexyUnicornOfferPage,
});

type Offer = {
  id?: string;
  name: string;
  price: string;
  length: string;
  format: string;
  tagline: string;
  transformation: string;
  curriculum_overview: string;
  status: string;
};

const blank: Offer = {
  name: "",
  price: "",
  length: "",
  format: "",
  tagline: "",
  transformation: "",
  curriculum_overview: "",
  status: "active",
};

function SexyUnicornOfferPage() {
  const [offer, setOffer] = useState<Offer>(blank);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase
      .from("sexy_unicorn_offer")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) {
          const d = data[0];
          setOffer({
            id: d.id,
            name: d.name ?? "",
            price: d.price != null ? String(d.price) : "",
            length: d.length ?? "",
            format: d.format ?? "",
            tagline: d.tagline ?? "",
            transformation: d.transformation ?? "",
            curriculum_overview: d.curriculum_overview ?? "",
            status: d.status ?? "active",
          });
        }
      });
  }, []);

  async function save() {
    setSaving(true);
    const payload = {
      ...offer,
      price: offer.price ? Number(offer.price) : null,
      updated_at: new Date().toISOString(),
    };
    if (offer.id) {
      await supabase.from("sexy_unicorn_offer").update(payload).eq("id", offer.id);
    } else {
      const { data } = await supabase
        .from("sexy_unicorn_offer")
        .insert(payload)
        .select()
        .single();
      if (data) setOffer({ ...offer, id: data.id });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <BrandShell>
      <PageHeader
        eyebrow="The Core · What every trail leads to"
        title="Sexy Unicorn Offer"
        subtitle="Your premium container. It can be rough on day one — refine as your Magic Gumdrop emerges."
      />

      <VelvetCard className="space-y-6">
        <Row label="Offer name">
          <Input
            value={offer.name}
            onChange={(v) => setOffer({ ...offer, name: v })}
            placeholder="The Rare Breed Club"
          />
        </Row>
        <div className="grid gap-6 md:grid-cols-3">
          <Row label="Price (USD)">
            <Input
              value={offer.price}
              onChange={(v) => setOffer({ ...offer, price: v })}
              placeholder="11000"
            />
          </Row>
          <Row label="Length">
            <Input
              value={offer.length}
              onChange={(v) => setOffer({ ...offer, length: v })}
              placeholder="12 months"
            />
          </Row>
          <Row label="Format">
            <Input
              value={offer.format}
              onChange={(v) => setOffer({ ...offer, format: v })}
              placeholder="Group mastermind"
            />
          </Row>
        </div>
        <Row label="Tagline">
          <Input
            value={offer.tagline}
            onChange={(v) => setOffer({ ...offer, tagline: v })}
            placeholder="A one-line filter for everything else."
          />
        </Row>
        <Row label="The transformation">
          <Textarea
            value={offer.transformation}
            onChange={(v) => setOffer({ ...offer, transformation: v })}
            placeholder="She walks in unsure of her positioning. She walks out a rare breed."
          />
        </Row>
        <Row label="Curriculum overview">
          <Textarea
            value={offer.curriculum_overview}
            onChange={(v) => setOffer({ ...offer, curriculum_overview: v })}
            placeholder="Quick sketch of what's inside. You'll evolve this."
            rows={5}
          />
        </Row>

        <div className="flex items-center justify-between border-t border-[rgba(201,168,76,0.15)] pt-6">
          <p className="label-soft">
            {saved ? "Saved." : "Auto-evolves with your Magic Gumdrop."}
          </p>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-full bg-gradient-to-r from-rb-fuchsia to-rb-hot-pink px-7 py-3 font-display text-sm tracking-[0.18em] text-rb-black hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Lock it in"}
          </button>
        </div>
      </VelvetCard>
    </BrandShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-soft mb-2 block">{label}</span>
      {children}
    </label>
  );
}

export function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-[rgba(201,168,76,0.25)] bg-black/40 px-4 py-3 font-serif text-lg text-rb-champagne placeholder:font-sans placeholder:text-sm placeholder:font-light placeholder:text-[rgba(240,223,160,0.3)] focus:border-rb-fuchsia focus:outline-none"
    />
  );
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-lg border border-[rgba(201,168,76,0.25)] bg-black/40 px-4 py-3 font-serif text-lg leading-relaxed text-rb-champagne placeholder:font-sans placeholder:text-sm placeholder:font-light placeholder:text-[rgba(240,223,160,0.3)] focus:border-rb-fuchsia focus:outline-none"
    />
  );
}
