import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VelvetCard } from "./BrandShell";

// ─── Types ────────────────────────────────────────────────────────────────────

type AvatarCard = {
  id: string;
  emoji: string;
  name: string;
  title: string;
  demographics_summary: string;
  who_she_is: string;
  core_desire: string;
  done_with: string;
  unicorn_signal: string;
};

type Demographics = {
  age: string;
  income: string;
  business_stage: string;
  location: string;
  family: string;
  niche: string;
};

export type FullAvatar = {
  name: string;
  title: string;
  emoji: string;
  demographics: Demographics;
  background: string;
  unicorn_signal: string;
  desires: string[];
  challenges: string[];
  outcomes: string[];
  vehicles_tried: string[];
  where_stuck: string[];
  how_it_feels: string[];
  objections: string[];
  does_not_want: string[];
  bonuses: string[];
};

type TaglineResult = {
  variations: string[];
  recommended: string;
};

export type WizardOutput = {
  name: string;
  who_she_is: string;
  lights_her_up: string;
  biggest_challenges: string;
  what_she_tried: string;
  what_she_desires: string;
  unicorn_signal: string;
  tagline: string;
  full_profile: FullAvatar;
  resonant_desire: string;
  resonant_vehicle: string;
  resonant_outcome: string;
  offer_description: string;
};

type WizardStep = "brain_dump" | "cards" | "refining" | "full_profile" | "taglines";

const STEP_DOTS: WizardStep[] = ["brain_dump", "cards", "full_profile", "taglines"];

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export function AvatarWizard({
  onComplete,
  onCancel,
  offerName,
  saveLabel = "Save to Brand Unicorn →",
}: {
  onComplete: (out: WizardOutput) => void;
  onCancel: () => void;
  offerName?: string;
  saveLabel?: string;
}) {
  const [step, setStep] = useState<WizardStep>("brain_dump");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const srRef = useRef<any>(null);

  const [offerDescription, setOfferDescription] = useState("");
  const [cards, setCards] = useState<AvatarCard[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [blendNotes, setBlendNotes] = useState("");
  const [refiningCard, setRefiningCard] = useState<AvatarCard | null>(null);
  const [refineFeedback, setRefineFeedback] = useState("");
  const [fullAvatar, setFullAvatar] = useState<FullAvatar | null>(null);
  const [taglineDesire, setTaglineDesire] = useState<string | null>(null);
  const [taglineVehicle, setTaglineVehicle] = useState<string | null>(null);
  const [taglineOutcome, setTaglineOutcome] = useState<string | null>(null);
  const [taglines, setTaglines] = useState<TaglineResult | null>(null);
  const [chosenTagline, setChosenTagline] = useState("");
  const [refineRequest, setRefineRequest] = useState("");

  // ── Voice memo ──────────────────────────────────────────────────────────────

  function startVoice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setErr("Voice memos work in Chrome. Try typing your brain dump instead.");
      return;
    }
    const r = new SR();
    r.continuous = true;
    r.interimResults = false;
    r.lang = "en-US";
    r.onresult = (e: any) => {
      const text = Array.from(e.results)
        .slice(e.resultIndex)
        .map((res: any) => res[0].transcript)
        .join(" ");
      setOfferDescription((prev) => (prev ? prev + " " + text : text));
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    srRef.current = r;
    r.start();
    setListening(true);
  }

  function stopVoice() {
    srRef.current?.stop();
    setListening(false);
  }

  // ── AI calls ────────────────────────────────────────────────────────────────

  async function gen(kind: string, payload: Record<string, unknown>) {
    setBusy(true);
    setErr(null);
    const { data, error } = await supabase.functions.invoke("rb-generate", {
      body: { kind, payload },
    });
    setBusy(false);
    if (error) { setErr(error.message); return null; }
    const d = data as { output: string; json?: any };
    if (!d?.json && d?.output?.includes("unknown kind")) {
      setErr("AI function not deployed yet."); return null;
    }
    return d ?? null;
  }

  async function generateCards() {
    const r = await gen("unicorn_cards", { offer_description: offerDescription, offer_name: offerName });
    if (r?.json?.avatars) {
      setCards(r.json.avatars);
      setSelectedIds([]);
      setStep("cards");
    }
  }

  async function refineCard() {
    if (!refiningCard) return;
    const r = await gen("unicorn_refine_card", { avatar: refiningCard, feedback: refineFeedback });
    if (r?.json) {
      const updated = { ...r.json, id: refiningCard.id };
      setCards((prev) => prev.map((c) => c.id === refiningCard.id ? updated : c));
      setRefiningCard(updated);
      setRefineFeedback("");
    }
  }

  async function expandProfile() {
    const selected = cards.filter((c) => selectedIds.includes(c.id));
    const r = await gen("unicorn_expand", {
      offer_description: offerDescription,
      offer_name: offerName,
      selected,
      blend_notes: blendNotes || undefined,
    });
    if (r?.json) {
      setFullAvatar(r.json);
      setTaglineDesire(null);
      setTaglineVehicle(null);
      setTaglineOutcome(null);
      setStep("full_profile");
    }
  }

  async function generateTaglines() {
    if (!fullAvatar || !taglineDesire || !taglineVehicle || !taglineOutcome) return;
    const r = await gen("unicorn_taglines_v2", {
      avatar: fullAvatar,
      desire: taglineDesire,
      vehicle: taglineVehicle,
      outcome: taglineOutcome,
    });
    if (r?.json) {
      setTaglines(r.json);
      setChosenTagline(r.json.recommended ?? "");
      setStep("taglines");
    }
  }

  async function refineTagline() {
    if (!fullAvatar || !refineRequest.trim()) return;
    const r = await gen("unicorn_tagline_refine", {
      current_tagline: chosenTagline,
      avatar: fullAvatar,
      request: refineRequest,
    });
    if (r?.json) {
      setTaglines(r.json);
      setChosenTagline(r.json.recommended ?? chosenTagline);
      setRefineRequest("");
    }
  }

  function handleSave() {
    if (!fullAvatar) return;
    onComplete({
      name: fullAvatar.name,
      who_she_is: fullAvatar.background,
      lights_her_up: (fullAvatar.desires ?? []).slice(0, 2).join(" · "),
      biggest_challenges: (fullAvatar.challenges ?? []).slice(0, 3).join(" · "),
      what_she_tried: (fullAvatar.vehicles_tried ?? []).slice(0, 2).join(" · "),
      what_she_desires: taglineDesire ?? (fullAvatar.desires?.[0] ?? ""),
      unicorn_signal: fullAvatar.unicorn_signal ?? "",
      tagline: chosenTagline,
      full_profile: fullAvatar,
      resonant_desire: taglineDesire ?? "",
      resonant_vehicle: taglineVehicle ?? "",
      resonant_outcome: taglineOutcome ?? "",
      offer_description: offerDescription,
    });
  }

  const canGenerateTagline = !!taglineDesire && !!taglineVehicle && !!taglineOutcome;
  const stepIndex = STEP_DOTS.indexOf(step === "refining" ? "cards" : step);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="label-soft">
            {step === "brain_dump" && "Step 1 of 4 · Brain Dump"}
            {step === "cards" && "Step 2 of 4 · Meet Your Avatars"}
            {step === "refining" && "Step 2 of 4 · Refining Her"}
            {step === "full_profile" && "Step 3 of 4 · Choose What Resonates"}
            {step === "taglines" && "Step 4 of 4 · Your Tagline"}
          </p>
          <button
            onClick={onCancel}
            className="text-[12px] uppercase tracking-[0.25em] text-[rgba(240,223,160,0.35)] hover:text-[rgba(240,223,160,0.6)] transition-colors"
          >
            ← Back to Hub
          </button>
        </div>
        <div className="flex gap-1">
          {STEP_DOTS.map((_, i) => (
            <div
              key={i}
              className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${
                i < stepIndex ? "bg-rb-fuchsia" : i === stepIndex ? "bg-iridescent" : "bg-rb-deep-plum"
              }`}
            />
          ))}
        </div>
      </div>

      <VelvetCard className="space-y-6">

        {/* ── STEP 1: BRAIN DUMP ── */}
        {step === "brain_dump" && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-3xl text-shimmer">Tell me about your offer</h2>
              <p className="mt-2 font-serif text-lg italic text-[rgba(240,223,160,0.7)]">
                Tell me what type of offer you're creating. Include as much info as you have about
                your ideal client and the offer itself. Don't worry about being clear, just give me
                everything you've got. Send a voice memo brain dump if that's easier. I'll help you
                articulate this offer and buyer as we go.
              </p>
            </div>

            <textarea
              value={offerDescription}
              onChange={(e) => setOfferDescription(e.target.value)}
              rows={8}
              placeholder="I'm creating an offer for women who… my client is someone who… what they've tried is…"
              className="w-full resize-none rounded-lg border border-[rgba(201,168,76,0.25)] bg-black/40 px-4 py-3 font-serif text-lg text-rb-champagne placeholder:font-sans placeholder:text-sm placeholder:font-light placeholder:text-[rgba(240,223,160,0.25)] focus:border-rb-fuchsia focus:outline-none leading-relaxed"
            />

            <div className="flex items-center justify-between">
              <button
                onClick={listening ? stopVoice : startVoice}
                className={`flex items-center gap-2 rounded-full border px-5 py-2.5 font-display text-xs tracking-[0.18em] transition-all ${
                  listening
                    ? "border-rb-fuchsia bg-rb-fuchsia/10 text-rb-fuchsia animate-pulse"
                    : "border-[rgba(201,168,76,0.3)] text-[rgba(240,223,160,0.6)] hover:border-rb-fuchsia hover:text-rb-champagne"
                }`}
              >
                <span className="text-base">{listening ? "●" : "🎙"}</span>
                {listening ? "Recording. Tap to stop." : "Voice Memo"}
              </button>

              <button
                onClick={generateCards}
                disabled={busy || offerDescription.trim().length < 50}
                className="rounded-full bg-gradient-to-r from-rb-amethyst to-rb-fuchsia px-7 py-3 font-display text-sm tracking-[0.18em] text-rb-champagne hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                {busy ? "Finding your avatars…" : "Meet Your Avatars →"}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: AVATAR CARDS ── */}
        {step === "cards" && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-3xl text-shimmer">Who resonates?</h2>
              <p className="mt-2 font-serif text-lg italic text-[rgba(240,223,160,0.7)]">
                The goal is to find the woman who is most like <em>you yesterday</em>. That's who
                you'll be most able to sell to and work with. You can refine any of them by telling
                me what you'd change, or select two or more to blend the best parts together.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {cards.map((card) => {
                const sel = selectedIds.includes(card.id);
                return (
                  <div
                    key={card.id}
                    className={`rounded-xl border p-5 transition-all duration-200 ${
                      sel ? "border-rb-fuchsia bg-[rgba(217,70,239,0.08)]" : "border-[rgba(201,168,76,0.2)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display text-xl text-rb-champagne">
                          {card.emoji} {card.name}
                        </p>
                        <p className="mt-0.5 text-[12px] uppercase tracking-[0.2em] text-[rgba(240,223,160,0.4)]">
                          {card.title}
                        </p>
                      </div>
                      {sel && (
                        <span className="shrink-0 rounded-full bg-rb-fuchsia px-2 py-0.5 text-[13px] uppercase tracking-[0.2em] text-rb-black">
                          Selected
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-[rgba(240,223,160,0.45)]">
                      {card.demographics_summary}
                    </p>
                    <p className="mt-3 font-serif text-base leading-relaxed text-rb-champagne">
                      {card.who_she_is}
                    </p>
                    <div className="mt-4 space-y-2">
                      <p className="font-serif text-base">
                        <span className="text-[rgba(201,168,76,0.65)]">Wants: </span>
                        <span className="text-[rgba(240,223,160,0.9)]">{card.core_desire}</span>
                      </p>
                      <p className="font-serif text-base">
                        <span className="text-[rgba(201,168,76,0.65)]">Done with: </span>
                        <span className="text-[rgba(240,223,160,0.9)]">{card.done_with}</span>
                      </p>
                      <p className="font-serif text-base">
                        <span className="text-[rgba(201,168,76,0.65)]">Signal: </span>
                        <span className="text-[rgba(240,223,160,0.9)]">{card.unicorn_signal}</span>
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => { setRefiningCard(card); setRefineFeedback(""); setStep("refining"); }}
                        className="rounded-full border border-[rgba(201,168,76,0.3)] px-4 py-1.5 text-[12px] uppercase tracking-[0.2em] text-[rgba(240,223,160,0.6)] hover:border-rb-gold hover:text-rb-champagne transition-colors"
                      >
                        Refine her
                      </button>
                      <button
                        onClick={() =>
                          setSelectedIds((prev) =>
                            prev.includes(card.id) ? prev.filter((x) => x !== card.id) : [...prev, card.id]
                          )
                        }
                        className={`rounded-full px-4 py-1.5 text-[12px] uppercase tracking-[0.2em] transition-all ${
                          sel
                            ? "bg-rb-fuchsia text-rb-black"
                            : "border border-[rgba(201,168,76,0.3)] text-[rgba(240,223,160,0.6)] hover:border-rb-fuchsia hover:text-rb-champagne"
                        }`}
                      >
                        {sel ? "✓ Selected" : "Select"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedIds.length >= 2 && (
              <div>
                <p className="label-soft mb-2">Blend notes (optional)</p>
                <textarea
                  value={blendNotes}
                  onChange={(e) => setBlendNotes(e.target.value)}
                  rows={2}
                  placeholder="Tell me what you want from each. e.g. 'I love Riley's family situation and Maya's business stage…'"
                  className="w-full resize-none rounded-lg border border-[rgba(201,168,76,0.25)] bg-black/40 px-4 py-3 font-serif text-sm text-rb-champagne placeholder:font-sans placeholder:text-xs placeholder:text-[rgba(240,223,160,0.25)] focus:border-rb-fuchsia focus:outline-none"
                />
              </div>
            )}

            <div className="flex items-center justify-between border-t border-[rgba(201,168,76,0.15)] pt-5">
              <button
                onClick={() => setStep("brain_dump")}
                className="text-[12px] uppercase tracking-[0.25em] text-[rgba(240,223,160,0.4)] hover:text-[rgba(240,223,160,0.7)] transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={expandProfile}
                disabled={busy || selectedIds.length === 0}
                className="rounded-full bg-gradient-to-r from-rb-amethyst to-rb-fuchsia px-7 py-3 font-display text-sm tracking-[0.18em] text-rb-champagne hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                {busy
                  ? "Building her profile…"
                  : selectedIds.length >= 2
                    ? `Blend ${selectedIds.length} Avatars →`
                    : "Expand Her Profile →"}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: REFINE CARD ── */}
        {step === "refining" && refiningCard && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-3xl text-shimmer">
                Refining {refiningCard.emoji} {refiningCard.name}
              </h2>
              <p className="mt-2 font-serif text-lg italic text-[rgba(240,223,160,0.7)]">
                Tell me what you'd change, what to keep, or what's almost right. Be as specific or
                as vague as you want. I'll work with whatever you give me.
              </p>
            </div>

            <div className="rounded-xl border border-[rgba(201,168,76,0.2)] bg-black/20 p-5 space-y-2 text-sm">
              <p className="font-display text-lg text-rb-champagne">
                {refiningCard.emoji} {refiningCard.name}, {refiningCard.title}
              </p>
              <p className="text-[rgba(240,223,160,0.35)] text-xs">{refiningCard.demographics_summary}</p>
              <p className="font-serif text-[rgba(240,223,160,0.8)] leading-relaxed">{refiningCard.who_she_is}</p>
              <p><span className="text-[rgba(201,168,76,0.65)]">Wants: </span>{refiningCard.core_desire}</p>
              <p><span className="text-[rgba(201,168,76,0.65)]">Done with: </span>{refiningCard.done_with}</p>
            </div>

            <textarea
              value={refineFeedback}
              onChange={(e) => setRefineFeedback(e.target.value)}
              rows={4}
              placeholder="Make her younger… she's more of a healer than a coach… I want her income to be higher… keep the family situation but change the niche…"
              className="w-full resize-none rounded-lg border border-[rgba(201,168,76,0.25)] bg-black/40 px-4 py-3 font-serif text-base text-rb-champagne placeholder:font-sans placeholder:text-sm placeholder:text-[rgba(240,223,160,0.25)] focus:border-rb-fuchsia focus:outline-none leading-relaxed"
            />

            <div className="flex items-center justify-between border-t border-[rgba(201,168,76,0.15)] pt-5">
              <button
                onClick={() => { setStep("cards"); setRefiningCard(null); }}
                className="text-[12px] uppercase tracking-[0.25em] text-[rgba(240,223,160,0.4)] hover:text-[rgba(240,223,160,0.7)] transition-colors"
              >
                ← Back to Avatars
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (!selectedIds.includes(refiningCard.id)) setSelectedIds([refiningCard.id]);
                    setStep("cards");
                  }}
                  className="rounded-full border border-[rgba(201,168,76,0.3)] px-5 py-2.5 font-display text-xs tracking-[0.18em] text-rb-champagne hover:border-rb-gold transition-colors"
                >
                  She's perfect →
                </button>
                <button
                  onClick={refineCard}
                  disabled={busy || !refineFeedback.trim()}
                  className="rounded-full bg-gradient-to-r from-rb-amethyst to-rb-fuchsia px-7 py-3 font-display text-sm tracking-[0.18em] text-rb-champagne hover:opacity-90 disabled:opacity-40"
                >
                  {busy ? "Refining…" : "Regenerate her →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: FULL PROFILE ── */}
        {step === "full_profile" && fullAvatar && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-4xl text-shimmer">
                {fullAvatar.emoji} {fullAvatar.name}, {fullAvatar.title}
              </h2>
              <p className="mt-2 font-serif text-base italic text-[rgba(240,223,160,0.55)]">
                Click the items that resonate most. For your tagline you'll need to pick one from
                the <span className="text-rb-fuchsia">pink</span> desires, one from the{" "}
                <span className="text-rb-amethyst">purple</span> vehicles, and one from the{" "}
                <span className="text-rb-gold">gold</span> outcomes.
              </p>
            </div>

            {/* Demographics */}
            <div className="rounded-xl border border-[rgba(201,168,76,0.15)] bg-black/20 p-5">
              <p className="label-soft mb-3">Demographics</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
                {Object.entries(fullAvatar.demographics ?? {}).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-[rgba(201,168,76,0.6)] capitalize">{k.replace(/_/g, " ")}: </span>
                    <span className="text-rb-champagne">{v as string}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Background */}
            <div>
              <p className="label-soft mb-2">Background</p>
              <p className="font-serif text-base leading-relaxed text-[rgba(240,223,160,0.8)] whitespace-pre-line">
                {fullAvatar.background}
              </p>
            </div>

            {/* TAGLINE SECTIONS (radio-style) */}
            <TaglineSection
              label={`WHAT ${fullAvatar.name.toUpperCase()} WANTS MOST FROM ${offerName?.toUpperCase() ?? "THIS OFFER"}`}
              items={fullAvatar.desires ?? []}
              selected={taglineDesire}
              onSelect={setTaglineDesire}
              instruction="Pick ONE → becomes 'achieve' in your tagline"
              accent="fuchsia"
            />

            <TaglineSection
              label="WHAT SHE'S ALREADY TRIED (THAT HASN'T WORKED)"
              items={fullAvatar.vehicles_tried ?? []}
              selected={taglineVehicle}
              onSelect={setTaglineVehicle}
              instruction="Pick ONE → becomes 'without' in your tagline"
              accent="amethyst"
            />

            <TaglineSection
              label={`OUTCOMES SHE CRAVES FROM ${offerName?.toUpperCase() ?? "THIS OFFER"}`}
              items={fullAvatar.outcomes ?? []}
              selected={taglineOutcome}
              onSelect={setTaglineOutcome}
              instruction="Pick ONE → becomes 'so that' in your tagline"
              accent="gold"
            />

            {/* REFERENCE SECTIONS — read only, used in sales page */}
            <div className="rounded-xl border border-[rgba(201,168,76,0.1)] bg-black/10 px-5 py-3">
              <p className="text-[13px] uppercase tracking-[0.25em] text-[rgba(201,168,76,0.45)]">
                The info below is saved to your Brand Unicorn and used automatically in your sales page, landing page, and launch plan inside the Test Kitchen.
              </p>
            </div>

            {(fullAvatar.challenges ?? []).length > 0 && (
              <InfoSection label="What She's Done With" items={fullAvatar.challenges} />
            )}
            {(fullAvatar.where_stuck ?? []).length > 0 && (
              <InfoSection label="Where She's Most Stuck" items={fullAvatar.where_stuck} />
            )}
            {(fullAvatar.how_it_feels ?? []).length > 0 && (
              <InfoSection label="How Being Stuck Makes Her Feel" items={fullAvatar.how_it_feels} />
            )}
            {(fullAvatar.objections ?? []).length > 0 && (
              <InfoSection label="Her Greatest Objections" items={fullAvatar.objections} />
            )}
            {(fullAvatar.does_not_want ?? []).length > 0 && (
              <InfoSection label="The One Thing She Doesn't Want to Do" items={fullAvatar.does_not_want} />
            )}
            {(fullAvatar.bonuses ?? []).length > 0 && (
              <InfoSection label="What Would Help Her Most" items={fullAvatar.bonuses} />
            )}

            <div className="flex items-center justify-between border-t border-[rgba(201,168,76,0.15)] pt-5">
              <button
                onClick={() => setStep("cards")}
                className="text-[12px] uppercase tracking-[0.25em] text-[rgba(240,223,160,0.4)] hover:text-[rgba(240,223,160,0.7)] transition-colors"
              >
                ← Back
              </button>
              <div className="flex flex-col items-end gap-1">
                {!canGenerateTagline && (
                  <p className="text-[12px] italic text-[rgba(240,223,160,0.35)]">
                    Pick one desire (pink), one vehicle (purple), and one outcome (gold) to continue
                  </p>
                )}
                <button
                  onClick={generateTaglines}
                  disabled={busy || !canGenerateTagline}
                  className="rounded-full bg-gradient-to-r from-rb-amethyst to-rb-fuchsia px-7 py-3 font-display text-sm tracking-[0.18em] text-rb-champagne hover:opacity-90 disabled:opacity-40"
                >
                  {busy ? "Building your tagline…" : "Generate My Tagline →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 5: TAGLINES ── */}
        {step === "taglines" && taglines && fullAvatar && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-3xl text-shimmer">Your tagline</h2>
              <p className="mt-2 font-serif text-lg italic text-[rgba(240,223,160,0.7)]">
                Pick the one that hits, or edit it below. This becomes the heartbeat of your
                positioning. It lives in your sales page, your content, everywhere.
              </p>
            </div>

            {/* Condensed positioning summary */}
            <div className="rounded-xl border border-[rgba(201,168,76,0.15)] bg-black/20 p-5 space-y-3">
              <p className="label-soft">Your Positioning Summary</p>
              <p className="font-display text-lg text-rb-champagne">
                {fullAvatar.emoji} {fullAvatar.name}, {fullAvatar.title}
              </p>
              <p className="text-xs text-[rgba(240,223,160,0.4)]">
                {Object.values(fullAvatar.demographics ?? {}).join(" · ")}
              </p>
              {taglineDesire && (
                <div className="space-y-0.5">
                  <p className="text-[13px] uppercase tracking-[0.2em] text-rb-fuchsia">She wants to achieve</p>
                  <p className="font-serif text-sm text-rb-champagne">{taglineDesire}</p>
                </div>
              )}
              {taglineVehicle && (
                <div className="space-y-0.5">
                  <p className="text-[13px] uppercase tracking-[0.2em] text-rb-amethyst">Without having to</p>
                  <p className="font-serif text-sm text-rb-champagne">{taglineVehicle}</p>
                </div>
              )}
              {taglineOutcome && (
                <div className="space-y-0.5">
                  <p className="text-[13px] uppercase tracking-[0.2em] text-rb-gold">So that she can</p>
                  <p className="font-serif text-sm text-rb-champagne">{taglineOutcome}</p>
                </div>
              )}
            </div>

            {/* Variations */}
            <div className="space-y-3">
              {taglines.variations.map((v, i) => (
                <ResonanceBtn
                  key={i}
                  text={v}
                  chosen={chosenTagline === v}
                  onChoose={() => setChosenTagline(v)}
                />
              ))}
              <div>
                <p className="label-soft mb-2">Recommended. Refined for conversion.</p>
                <ResonanceBtn
                  text={taglines.recommended}
                  chosen={chosenTagline === taglines.recommended}
                  onChoose={() => setChosenTagline(taglines.recommended)}
                  highlight
                />
              </div>
            </div>

            {/* Edit field */}
            <div>
              <p className="label-soft mb-2">Make it yours</p>
              <textarea
                value={chosenTagline}
                onChange={(e) => setChosenTagline(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-[rgba(201,168,76,0.25)] bg-black/40 px-4 py-3 font-serif text-lg text-rb-champagne focus:border-rb-fuchsia focus:outline-none leading-relaxed"
              />
            </div>

            {/* Refine with AI */}
            <div className="rounded-xl border border-[rgba(201,168,76,0.12)] bg-black/10 p-4 space-y-3">
              <p className="label-soft">Refine with AI</p>
              <textarea
                value={refineRequest}
                onChange={(e) => setRefineRequest(e.target.value)}
                rows={2}
                placeholder="Make it more specific… less fluffy… more tangible… speak to moms… bolder…"
                className="w-full resize-none rounded-lg border border-[rgba(201,168,76,0.2)] bg-black/40 px-4 py-2.5 font-serif text-sm text-rb-champagne placeholder:text-[rgba(240,223,160,0.25)] focus:border-rb-fuchsia focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={refineTagline}
                  disabled={busy || !refineRequest.trim()}
                  className="rounded-full border border-[rgba(201,168,76,0.3)] px-5 py-2 font-display text-xs tracking-[0.18em] text-rb-champagne hover:border-rb-gold disabled:opacity-40 transition-all"
                >
                  {busy ? "Refining…" : "Regenerate →"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[rgba(201,168,76,0.15)] pt-5">
              <button
                onClick={() => setStep("full_profile")}
                className="text-[12px] uppercase tracking-[0.25em] text-[rgba(240,223,160,0.4)] hover:text-[rgba(240,223,160,0.7)] transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSave}
                disabled={!chosenTagline.trim()}
                className="rounded-full px-7 py-3 font-display text-sm tracking-[0.18em] text-rb-black hover:opacity-90 disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #d946ef 0%, #ec4899 50%, #c9a84c 100%)" }}
              >
                {saveLabel}
              </button>
            </div>
          </div>
        )}

        {err && (
          <p className="rounded-lg border border-rb-fuchsia/30 bg-rb-fuchsia/5 px-4 py-3 font-serif text-sm italic text-rb-fuchsia">
            {err}
          </p>
        )}
      </VelvetCard>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TaglineSection({
  label, items, selected, onSelect, instruction, accent,
}: {
  label: string;
  items: string[];
  selected: string | null;
  onSelect: (v: string) => void;
  instruction: string;
  accent: "fuchsia" | "gold" | "amethyst";
}) {
  const cls = {
    fuchsia: { lbl: "text-rb-fuchsia", border: "border-rb-fuchsia", bg: "bg-[rgba(217,70,239,0.08)]", tag: "bg-rb-fuchsia text-rb-black" },
    gold: { lbl: "text-rb-gold", border: "border-rb-gold", bg: "bg-[rgba(201,168,76,0.08)]", tag: "bg-rb-gold text-rb-black" },
    amethyst: { lbl: "text-rb-amethyst", border: "border-rb-amethyst", bg: "bg-[rgba(168,85,247,0.08)]", tag: "bg-rb-amethyst text-rb-black" },
  }[accent];

  return (
    <div>
      <div className="mb-3">
        <p className={`text-xs uppercase tracking-[0.2em] font-bold ${cls.lbl}`}>{label}</p>
        <p className="mt-1 text-xs italic text-[rgba(240,223,160,0.45)]">{instruction}</p>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => {
          const isSel = selected === item;
          return (
            <button
              key={i}
              onClick={() => onSelect(item)}
              className={`w-full rounded-xl border p-5 text-left transition-all duration-150 ${
                isSel ? `${cls.border} ${cls.bg}` : "border-[rgba(201,168,76,0.15)] hover:border-[rgba(201,168,76,0.35)]"
              }`}
            >
              <p className="font-serif text-base leading-relaxed text-rb-champagne">{item}</p>
              {isSel && (
                <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[13px] uppercase tracking-[0.2em] ${cls.tag}`}>
                  ✓ Tagline pick
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function InfoSection({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-[0.2em] font-bold text-[rgba(240,223,160,0.4)]">
        {label}
      </p>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgba(201,168,76,0.35)]" />
            <p className="font-serif text-base leading-relaxed text-[rgba(240,223,160,0.7)]">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResonanceBtn({
  text, chosen, onChoose, highlight = false,
}: {
  text: string;
  chosen: boolean;
  onChoose: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onChoose}
      className={`w-full rounded-xl border p-5 text-left transition-all duration-200 ${
        chosen
          ? highlight ? "border-rb-gold bg-[rgba(201,168,76,0.08)]" : "border-rb-fuchsia bg-[rgba(217,70,239,0.08)]"
          : highlight ? "border-[rgba(201,168,76,0.3)] hover:border-rb-gold" : "border-[rgba(201,168,76,0.2)] hover:border-[rgba(201,168,76,0.45)]"
      }`}
    >
      <p className="font-serif text-base leading-relaxed text-rb-champagne">{text}</p>
      {chosen && (
        <p className={`mt-1.5 text-[13px] uppercase tracking-[0.25em] ${highlight ? "text-rb-gold" : "text-rb-fuchsia"}`}>
          ✓ This one
        </p>
      )}
    </button>
  );
}
