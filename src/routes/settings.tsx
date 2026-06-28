import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandShell, VelvetCard } from "@/components/brand/BrandShell";
import { Input, Textarea } from "./sexy-unicorn-offer";
import { WIZARD_STEPS } from "@/lib/lexicon";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

type VP = {
  id?: string;
  self_descriptors: string[];
  writing_samples: string[];
  signature_words: string[];
  blacklist_words: string[];
  signoff: string;
  swearing_level: string;
  synthesized_voice_summary: string | null;
};

const blank: VP = {
  self_descriptors: ["", "", ""],
  writing_samples: ["", ""],
  signature_words: [],
  blacklist_words: [],
  signoff: "",
  swearing_level: "pg-13",
  synthesized_voice_summary: null,
};

function SettingsPage() {
  const [vp, setVp] = useState<VP>(blank);
  const [sigInput, setSigInput] = useState("");
  const [blackInput, setBlackInput] = useState("");

  useEffect(() => {
    supabase
      .from("voice_profile")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) {
          const d = data[0] as any;
          setVp({
            id: d.id,
            self_descriptors: d.self_descriptors?.length ? d.self_descriptors : ["", "", ""],
            writing_samples: d.writing_samples?.length ? d.writing_samples : ["", ""],
            signature_words: d.signature_words ?? [],
            blacklist_words: d.blacklist_words ?? [],
            signoff: d.signoff ?? "",
            swearing_level: d.swearing_level ?? "pg-13",
            synthesized_voice_summary: d.synthesized_voice_summary,
          });
        }
      });
  }, []);

  async function save() {
    const payload = {
      self_descriptors: vp.self_descriptors.filter(Boolean),
      writing_samples: vp.writing_samples.filter(Boolean),
      signature_words: vp.signature_words,
      blacklist_words: vp.blacklist_words,
      signoff: vp.signoff,
      swearing_level: vp.swearing_level,
      updated_at: new Date().toISOString(),
    };
    if (vp.id) {
      await supabase.from("voice_profile").update(payload).eq("id", vp.id);
    } else {
      const { data } = await supabase.from("voice_profile").insert(payload).select().single();
      if (data) setVp({ ...vp, id: data.id });
    }
  }

  return (
    <BrandShell>
      <div className="mb-12">
        <p className="eyebrow">Settings · Voice profile</p>
        <h1 className="mt-4 font-display text-6xl text-shimmer">Your voice — captured</h1>
        <p className="mt-5 max-w-2xl font-serif text-xl italic text-[rgba(240,223,160,0.7)]">
          Every AI generation in the dashboard sounds like you. Not me. Not corporate. Spend 5 minutes here and the whole thing changes.
        </p>
      </div>

      <VelvetCard className="space-y-8">
        <div>
          <p className="label-soft mb-3">Three words that describe how you sound when you're most you</p>
          <div className="grid gap-3 md:grid-cols-3">
            {vp.self_descriptors.map((w, i) => (
              <Input
                key={i}
                value={w}
                onChange={(v) => {
                  const copy = [...vp.self_descriptors];
                  copy[i] = v;
                  setVp({ ...vp, self_descriptors: copy });
                }}
                placeholder={["raw", "warm", "direct"][i]}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="label-soft mb-3">Two writing samples (post, email, caption — up to 500 words each)</p>
          <div className="space-y-3">
            {vp.writing_samples.map((s, i) => (
              <Textarea
                key={i}
                value={s}
                onChange={(v) => {
                  const copy = [...vp.writing_samples];
                  copy[i] = v;
                  setVp({ ...vp, writing_samples: copy });
                }}
                placeholder={`Sample ${i + 1}`}
                rows={5}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ChipField
            label="Words & phrases you use a lot"
            chips={vp.signature_words}
            input={sigInput}
            setInput={setSigInput}
            onAdd={(v) => setVp({ ...vp, signature_words: [...vp.signature_words, v] })}
            onRemove={(i) =>
              setVp({ ...vp, signature_words: vp.signature_words.filter((_, j) => j !== i) })
            }
            placeholder="literally, girl, okay so…"
          />
          <ChipField
            label="Words you NEVER use"
            chips={vp.blacklist_words}
            input={blackInput}
            setInput={setBlackInput}
            onAdd={(v) => setVp({ ...vp, blacklist_words: [...vp.blacklist_words, v] })}
            onRemove={(i) =>
              setVp({ ...vp, blacklist_words: vp.blacklist_words.filter((_, j) => j !== i) })
            }
            placeholder="sacred, divine being, manifest…"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="label-soft mb-2 block">How you sign off</span>
            <Input value={vp.signoff} onChange={(v) => setVp({ ...vp, signoff: v })} placeholder="xo, S" />
          </label>
          <label className="block">
            <span className="label-soft mb-2 block">Swearing</span>
            <select
              value={vp.swearing_level}
              onChange={(e) => setVp({ ...vp, swearing_level: e.target.value })}
              className="w-full rounded-lg border border-[rgba(201,168,76,0.25)] bg-black/40 px-4 py-3 font-serif text-lg text-rb-champagne focus:border-rb-fuchsia focus:outline-none"
            >
              <option value="none">No, never</option>
              <option value="pg-13">PG-13</option>
              <option value="yes">Yes, freely</option>
            </select>
          </label>
        </div>

        <div className="flex justify-end border-t border-[rgba(201,168,76,0.15)] pt-6">
          <button
            onClick={save}
            className="rounded-full bg-gradient-to-r from-rb-fuchsia to-rb-hot-pink px-7 py-3 font-display text-sm tracking-[0.18em] text-rb-black hover:opacity-90"
          >
            Save voice profile
          </button>
        </div>
      </VelvetCard>

      {/* Reference */}
      <p className="mt-12 label-soft">{WIZARD_STEPS.length} steps live in the Test Kitchen</p>
    </BrandShell>
  );
}

function ChipField({
  label,
  chips,
  input,
  setInput,
  onAdd,
  onRemove,
  placeholder,
}: {
  label: string;
  chips: string[];
  input: string;
  setInput: (s: string) => void;
  onAdd: (v: string) => void;
  onRemove: (i: number) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <span className="label-soft mb-2 block">{label}</span>
      <div className="flex flex-wrap gap-2 rounded-lg border border-[rgba(201,168,76,0.25)] bg-black/40 p-3">
        {chips.map((c, i) => (
          <span
            key={i}
            className="group inline-flex items-center gap-2 rounded-full bg-rb-fuchsia/15 px-3 py-1 font-serif text-sm italic text-rb-champagne"
          >
            {c}
            <button
              onClick={() => onRemove(i)}
              className="text-[rgba(240,223,160,0.5)] hover:text-rb-fuchsia"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === ",") && input.trim()) {
              e.preventDefault();
              onAdd(input.trim());
              setInput("");
            }
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm font-light text-rb-champagne placeholder:text-[rgba(240,223,160,0.3)] focus:outline-none"
        />
      </div>
    </div>
  );
}
