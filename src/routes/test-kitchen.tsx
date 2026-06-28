import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandShell, VelvetCard } from "@/components/brand/BrandShell";
import { AvatarWizard, type WizardOutput } from "@/components/brand/AvatarWizard";
import { Textarea } from "./sexy-unicorn-offer";

export const Route = createFileRoute("/test-kitchen")({
  component: TestKitchen,
});

const ALL_STEPS = [
  { n: 1, title: "Anchor", sub: "Which Sexy Unicorn Offer does this trail lead to?" },
  { n: 2, title: "Aligned Avatar & Tagline", sub: "Who is this trail for? Let's build her together." },
  { n: 3, title: "Rainbow Road", sub: "The framework she'll move through." },
  { n: 4, title: "Wireframe Sales Page", sub: "9-section structure with copy." },
  { n: 5, title: "Landing Page", sub: "Optional, for ad-driven funnels." },
  { n: 6, title: "Welcome Email", sub: "Onboarding email for buyers." },
  { n: 7, title: "Launch Plan", sub: "7–14 day content calendar." },
];

const STEPS_NO_AVATAR = ALL_STEPS.filter((s) => s.n !== 2);

type Trail = any;

function TestKitchen() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [trail, setTrail] = useState<Trail>({
    name: "Untitled trail",
    status: "draft",
    trail_avatar: null,
    tagline: "",
    sales_page_copy: "",
    welcome_email_subject: "",
    welcome_email_body: "",
    launch_plan: null,
    offer_length: "",
    landing_page_copy: "",
    flavor_color: "fuchsia",
  });
  const [offers, setOffers] = useState<{ id: string; name: string }[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<{ id: string; name: string } | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [fromBrandUnicorn, setFromBrandUnicorn] = useState(false);

  useEffect(() => {
    supabase
      .from("sexy_unicorn_offer")
      .select("id,name")
      .then(({ data }) => setOffers(data ?? []));

    const prefill = sessionStorage.getItem("rb_brand_unicorn_prefill");
    if (prefill) {
      try {
        const { trail_avatar, tagline } = JSON.parse(prefill);
        setTrail((prev: any) => ({ ...prev, trail_avatar, tagline }));
        setFromBrandUnicorn(true);
      } catch { /* ignore */ }
      sessionStorage.removeItem("rb_brand_unicorn_prefill");
    }
  }, []);

  async function ensureTrail() {
    if (trail.id) return trail.id;
    const { data } = await supabase.from("gumdrop_trail").insert(trail).select().single();
    setTrail(data);
    return data!.id as string;
  }

  async function patch(p: Record<string, any>) {
    const id = await ensureTrail();
    const next = { ...trail, ...p };
    setTrail(next);
    await (supabase.from("gumdrop_trail").update(p as any) as any).eq("id", id);
  }

  async function gen(kind: string, payload: Record<string, unknown>) {
    setBusy(true);
    setErr(null);
    const { data, error } = await supabase.functions.invoke("rb-generate", {
      body: { kind, payload },
    });
    setBusy(false);
    if (error) { setErr(error.message); return null; }
    return (data as { output: string; json?: any }) ?? null;
  }

  function handleAvatarComplete(output: WizardOutput) {
    patch({
      trail_avatar: output.full_profile,
      tagline: output.tagline,
      name: `${output.name}'s Trail`,
    });
    setStep(3);
  }

  const STEPS = fromBrandUnicorn ? STEPS_NO_AVATAR : ALL_STEPS;
  const current = ALL_STEPS.find((s) => s.n === step) ?? ALL_STEPS[0];

  function nextStep() {
    const idx = STEPS.findIndex((s) => s.n === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].n);
  }

  function prevStep() {
    const idx = STEPS.findIndex((s) => s.n === step);
    if (idx > 0) setStep(STEPS[idx - 1].n);
  }

  const isLastStep = STEPS.findIndex((s) => s.n === step) === STEPS.length - 1;

  // Step 2 renders the full wizard — no outer card
  if (step === 2) {
    return (
      <BrandShell hideStickyCta>
        <div className="mb-8">
          <p className="eyebrow">Gumdrop Test Kitchen · Step 2 of {ALL_STEPS.length}</p>
          <h1 className="mt-3 font-display text-5xl text-shimmer">Aligned Avatar & Tagline</h1>
          <p className="mt-3 font-serif text-xl italic text-[rgba(240,223,160,0.7)]">
            Who is this gumdrop trail for? Let's build her together.
          </p>
          <div className="mt-6 flex gap-1.5">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className={`h-1 flex-1 rounded-full transition ${
                  s.n < step ? "bg-rb-fuchsia" : s.n === step ? "bg-iridescent" : "bg-rb-deep-plum"
                }`}
              />
            ))}
          </div>
        </div>
        <AvatarWizard
          onComplete={handleAvatarComplete}
          onCancel={() => setStep(1)}
          offerName={selectedOffer?.name}
          saveLabel="Save Avatar & Continue →"
        />
      </BrandShell>
    );
  }

  return (
    <BrandShell hideStickyCta>
      {/* Stepper header */}
      <div className="mb-10">
        <p className="eyebrow">Gumdrop Test Kitchen · Step {STEPS.findIndex((s) => s.n === step) + 1} of {STEPS.length}</p>
        <h1 className="mt-3 font-display text-5xl text-shimmer">{current.title}</h1>
        <p className="mt-3 font-serif text-xl italic text-[rgba(240,223,160,0.7)]">{current.sub}</p>
        <div className="mt-6 flex gap-1.5">
          {STEPS.map((s) => {
            const idx = STEPS.findIndex((x) => x.n === step);
            const sIdx = STEPS.findIndex((x) => x.n === s.n);
            return (
              <div
                key={s.n}
                className={`h-1 flex-1 rounded-full transition ${
                  sIdx < idx ? "bg-rb-fuchsia" : sIdx === idx ? "bg-iridescent" : "bg-rb-deep-plum"
                }`}
              />
            );
          })}
        </div>
      </div>

      <VelvetCard className="space-y-6">

        {/* STEP 1 — Anchor */}
        {step === 1 && (
          <>
            <p className="font-serif text-lg italic text-[rgba(240,223,160,0.85)]">
              Every gumdrop trail leads to your sexy unicorn offer. That's the whole point. So
              before we drop another trail — what's the core offer this one is feeding?
            </p>
            {offers.length === 0 ? (
              <p className="text-rb-fuchsia">
                You need at least one Sexy Unicorn Offer set up first.{" "}
                <a href="/sexy-unicorn-offer" className="underline">Set one up →</a>
              </p>
            ) : (
              <select
                value={trail.linked_sexy_unicorn_offer_id ?? ""}
                onChange={(e) => {
                  const offer = offers.find((o) => o.id === e.target.value) ?? null;
                  setSelectedOffer(offer);
                  patch({ linked_sexy_unicorn_offer_id: e.target.value });
                }}
                className="w-full rounded-lg border border-[rgba(201,168,76,0.25)] bg-black/40 px-4 py-3 font-serif text-lg text-rb-champagne"
              >
                <option value="">— Pick the anchor offer —</option>
                {offers.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            )}
          </>
        )}

        {/* STEP 3 — Framework */}
        {step === 3 && (
          <Inputs
            fields={[
              ["transformation", "What transformation are you delivering in this trail?"],
              ["length", "How long is this offer? (e.g. 2-week challenge, 4-week course)"],
              ["bridge", "What's the one thing this trail plants but doesn't fully deliver — the bridge into your Sexy Unicorn Offer?"],
            ]}
            inputs={inputs}
            setInputs={setInputs}
            onGenerate={async () => {
              const r = await gen("framework", {
                ...inputs,
                avatar: trail.trail_avatar,
                tagline: trail.tagline,
              });
              if (r?.json) {
                const { data: rr } = await supabase
                  .from("rainbow_road")
                  .insert({ name: r.json.name, steps: r.json.steps, bridge_gap: r.json.bridge_gap })
                  .select()
                  .single();
                if (rr) await patch({ framework_id: rr.id, offer_length: inputs.length });
              }
            }}
            busy={busy}
            preview={
              trail.framework_id && (
                <p className="font-serif text-sm italic text-rb-fuchsia">Framework saved ✓</p>
              )
            }
          />
        )}

        {/* STEP 4 — Sales Page */}
        {step === 4 && (
          <GenBlock
            blurb="We're using the structure that's converted for years. Grab this and drop it into Squarespace, Canva, Notion — wherever you build."
            busy={busy}
            onGenerate={async () => {
              const r = await gen("sales_page", {
                avatar: trail.trail_avatar,
                tagline: trail.tagline,
                offer_length: trail.offer_length,
              });
              if (r?.output) await patch({ sales_page_copy: r.output });
            }}
            value={trail.sales_page_copy}
            onChange={(v) => patch({ sales_page_copy: v })}
          />
        )}

        {/* STEP 5 — Landing Page */}
        {step === 5 && (
          <GenBlock
            blurb="If you're running ads, you need a tighter landing page. Skip if not."
            busy={busy}
            onGenerate={async () => {
              const r = await gen("landing_page", {
                tagline: trail.tagline,
                avatar: trail.trail_avatar,
              });
              if (r?.output) await patch({ landing_page_copy: r.output });
            }}
            value={trail.landing_page_copy}
            onChange={(v) => patch({ landing_page_copy: v })}
          />
        )}

        {/* STEP 6 — Welcome Email */}
        {step === 6 && (
          <GenBlock
            blurb="When she buys, she gets this email. Sets the tone, tells her what to expect."
            busy={busy}
            onGenerate={async () => {
              const r = await gen("welcome_email", {
                tagline: trail.tagline,
                offer_length: trail.offer_length,
              });
              if (r?.json) {
                await patch({
                  welcome_email_subject: r.json.subject,
                  welcome_email_body: r.json.body,
                });
              }
            }}
            value={
              trail.welcome_email_body
                ? `Subject: ${trail.welcome_email_subject ?? ""}\n\n${trail.welcome_email_body}`
                : ""
            }
            onChange={() => {}}
          />
        )}

        {/* STEP 7 — Launch Plan */}
        {step === 7 && (
          <Inputs
            fields={[
              ["days", "Days until launch (7 / 10 / 14)"],
              ["platforms", "Where are you posting? (Instagram, Email, Facebook, etc.)"],
            ]}
            inputs={inputs}
            setInputs={setInputs}
            onGenerate={async () => {
              const r = await gen("launch_plan", {
                ...inputs,
                tagline: trail.tagline,
                avatar: trail.trail_avatar,
              });
              if (r?.json) await patch({ launch_plan: r.json });
            }}
            busy={busy}
            preview={
              Array.isArray(trail.launch_plan) && (
                <div className="space-y-2 max-h-96 overflow-auto">
                  {trail.launch_plan.map((d: any, i: number) => (
                    <div key={i} className="rounded border border-[rgba(201,168,76,0.15)] p-3 text-sm">
                      <p className="font-display">Day {d.day ?? i + 1} · {d.platform} · {d.angle}</p>
                      <p className="mt-1 font-serif italic text-rb-fuchsia">"{d.hook}"</p>
                    </div>
                  ))}
                </div>
              )
            }
          />
        )}

        {err && <p className="text-rb-fuchsia text-sm">{err}</p>}
      </VelvetCard>

      {/* Nav */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => {
            if (step === STEPS[0].n) {
              nav({ to: fromBrandUnicorn ? "/brand-unicorn" : "/" });
            } else {
              prevStep();
            }
          }}
          className="rounded-full border border-[rgba(201,168,76,0.25)] px-5 py-2 text-xs uppercase tracking-[0.25em] text-[rgba(240,223,160,0.6)] hover:text-rb-champagne transition-colors"
        >
          ← Back
        </button>
        {!isLastStep ? (
          <button
            onClick={nextStep}
            className="rounded-full bg-gradient-to-r from-rb-fuchsia to-rb-hot-pink px-7 py-3 font-display text-sm tracking-[0.18em] text-rb-black hover:opacity-90"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={async () => {
              await patch({ status: "active", launched_at: new Date().toISOString() });
              nav({ to: "/gumdrop-trails" });
            }}
            className="rounded-full bg-gradient-to-r from-rb-fuchsia to-rb-iridescent px-7 py-3 font-display text-sm tracking-[0.18em] text-rb-black hover:opacity-90"
          >
            Save & Launch
          </button>
        )}
      </div>
    </BrandShell>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Inputs({
  fields, inputs, setInputs, onGenerate, busy, preview,
}: {
  fields: [string, string][];
  inputs: Record<string, string>;
  setInputs: (v: Record<string, string>) => void;
  onGenerate: () => Promise<void>;
  busy: boolean;
  preview?: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      {fields.map(([k, label]) => (
        <label key={k} className="block">
          <span className="label-soft mb-2 block">{label}</span>
          <Textarea value={inputs[k] ?? ""} onChange={(v) => setInputs({ ...inputs, [k]: v })} rows={2} />
        </label>
      ))}
      <div className="flex justify-end">
        <button
          onClick={onGenerate}
          disabled={busy}
          className="rounded-full bg-gradient-to-r from-rb-amethyst to-rb-fuchsia px-6 py-2.5 font-display text-sm tracking-[0.18em] text-rb-champagne hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Cooking…" : "Generate with AI"}
        </button>
      </div>
      {preview}
    </div>
  );
}

function GenBlock({
  blurb, busy, onGenerate, value, onChange,
}: {
  blurb: string;
  busy: boolean;
  onGenerate: () => Promise<void>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="font-serif text-lg italic text-[rgba(240,223,160,0.85)]">{blurb}</p>
      <div className="flex justify-end">
        <button
          onClick={onGenerate}
          disabled={busy}
          className="rounded-full bg-gradient-to-r from-rb-amethyst to-rb-fuchsia px-6 py-2.5 font-display text-sm tracking-[0.18em] text-rb-champagne hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Cooking…" : "Generate with AI"}
        </button>
      </div>
      {value && <Textarea value={value} onChange={onChange} rows={14} />}
    </div>
  );
}