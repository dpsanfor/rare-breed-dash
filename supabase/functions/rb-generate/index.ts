// Single AI dispatcher for the Rare Breed Dashboard.
// Uses Anthropic API (Claude) directly.
// Every prompt is wrapped with the user's voice profile.

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getVoiceProfile() {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/voice_profile?order=updated_at.desc&limit=1`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
  );
  const rows = await r.json();
  return rows?.[0] ?? null;
}

function voiceBlock(vp: any) {
  if (!vp) return "VOICE PROFILE: not yet captured — use a warm, direct, empowered tone.";
  return `VOICE PROFILE FOR THIS USER:
- Self-descriptors: ${(vp.self_descriptors ?? []).join(", ")}
- Signature words she uses: ${(vp.signature_words ?? []).join(", ")}
- Words she NEVER uses: ${(vp.blacklist_words ?? []).join(", ")}
- Signoff: ${vp.signoff ?? "—"}
- Swearing comfort: ${vp.swearing_level ?? "pg-13"}

VOICE SAMPLES (study these for rhythm, vocabulary, structure):
${(vp.writing_samples ?? []).map((s: string, i: number) => `[Sample ${i + 1}]\n${s}`).join("\n\n")}`;
}

const SYSTEM_PREFIX = `You are generating content for a premium coach using her Rare Breed Dashboard.

YOUR JOB: Generate the requested content in HER voice — not in a generic AI voice, not in Dana Hayes' voice, not in a polished corporate voice. HER voice.

NEVER use pain-point marketing language. NEVER write to a desperate buyer. Speak to an empowered, premium buyer who buys from desire, not need.

Brand lexicon (always use these terms verbatim): Sexy Unicorn Offer, Magic Gumdrop, Brand Unicorn, Rainbow Roads, Gumdrop Trail, Metamorphosis, Rare Breed, drool.`;

const PROMPTS: Record<string, (p: any) => { user: string; expectJson: boolean }> = {

  // ── NEW WIZARD PROMPTS ────────────────────────────────────────────────────

  unicorn_cards: (p) => ({
    expectJson: true,
    user: `Generate 4 distinct aligned avatar profiles for this coach's offer. Each should be a genuinely DIFFERENT flavor — different life stage, different driver, different expression of the same core transformation.

These are empowered, premium women who want MORE, not desperate women who need saving. Write from desire and momentum, not pain and struggle.

COACH'S OFFER DESCRIPTION:
${p.offer_description}

${p.offer_name ? `OFFER NAME: ${p.offer_name}` : ""}

Output ONLY valid JSON:
{
  "avatars": [
    {
      "id": "a1",
      "emoji": "💗",
      "name": "First name only",
      "title": "Her archetype (e.g. 'The Relatable Coach', 'The Rising Expert')",
      "demographics_summary": "Age range · income · business stage · niche · family — one flowing line",
      "who_she_is": "1-2 vivid present-tense sentences describing who she is RIGHT NOW — alive, specific, not generic",
      "core_desire": "What she wants most — specific, alive, forward-looking. What she's moving TOWARD.",
      "done_with": "What she is DONE WITH — said from power, not victimhood. Already tried it, over it.",
      "unicorn_signal": "The thing she says or does that makes you think 'that's my unicorn'"
    }
  ]
}`,
  }),

  unicorn_refine_card: (p) => ({
    expectJson: true,
    user: `Refine this avatar based on the coach's feedback. Keep everything she likes. Change what she asked to change. Be specific and vivid.

ORIGINAL AVATAR:
${JSON.stringify(p.avatar, null, 2)}

COACH'S FEEDBACK (what to change, keep, or add):
${p.feedback}

Output ONLY valid JSON with the exact same shape as the original avatar (id, emoji, name, title, demographics_summary, who_she_is, core_desire, done_with, unicorn_signal).`,
  }),

  unicorn_expand: (p) => ({
    expectJson: true,
    user: `Expand this avatar selection into a complete, deeply detailed avatar profile. This is for a PREMIUM COACHING context — write with specificity, warmth, and power. Never write to a desperate buyer. Speak to an empowered woman who wants more.

COACH'S OFFER: ${p.offer_description}
OFFER NAME: ${p.offer_name ?? "this offer"}

SELECTED AVATAR(S):
${JSON.stringify(p.selected, null, 2)}

${p.blend_notes ? `COACH'S BLEND NOTES (blend these avatars with this guidance): ${p.blend_notes}` : ""}

${p.selected?.length > 1 ? "BLEND these avatars into ONE unified avatar. Take the strongest, most specific elements from each." : ""}

Rules:
- Write from aliveness and desire, not lack and pain
- Be SPECIFIC — real demographics, real situations, real language
- Each list item should be a complete, standalone bullet — not vague
- Desires: what she's moving TOWARD, specific and tangible
- Vehicles: things she's tried that haven't worked — named from power, not victimhood
- Outcomes: what she will be ABLE TO DO as a result — lived, embodied, real
- Challenges: her empowered frustration — what she's outgrown and is done with
- Objections: her real hesitations + the deeper fear behind each one

Output ONLY valid JSON:
{
  "name": "First name",
  "title": "Her archetype",
  "emoji": "💗",
  "demographics": {
    "age": "age range",
    "income": "income level and pattern",
    "business_stage": "where she is in her journey",
    "location": "geography",
    "family": "family situation",
    "niche": "her coaching niche or profession"
  },
  "background": "2-3 sentences MAX. Sharp and specific — who she is right now, what she does, and the one thing that's not working. Not a story. A snapshot.",
  "unicorn_signal": "How you spot her in a crowd — 1-2 sentences. The thing she says, how she shows up, the tells that make you think 'that's my unicorn'.",
  "desires": [
    "To [specific desire 1 — what she's moving toward]",
    "To [specific desire 2]",
    "To [specific desire 3]",
    "To [specific desire 4]",
    "To [specific desire 5]"
  ],
  "challenges": [
    "Specific empowered frustration 1 — what she's outgrown and is done with",
    "Specific empowered frustration 2",
    "Specific empowered frustration 3",
    "Specific empowered frustration 4",
    "Specific empowered frustration 5"
  ],
  "outcomes": [
    "Tangible thing she'll be ABLE TO DO as a result — specific and lived",
    "Tangible outcome 2",
    "Tangible outcome 3",
    "Tangible outcome 4",
    "Tangible outcome 5"
  ],
  "vehicles_tried": [
    "Specific thing she's already tried that hasn't worked — named with empathy, said from power",
    "Vehicle 2",
    "Vehicle 3",
    "Vehicle 4",
    "Vehicle 5"
  ],
  "where_stuck": [
    "Specific place she's most stuck — concrete and named",
    "Stuck point 2",
    "Stuck point 3",
    "Stuck point 4"
  ],
  "how_it_feels": [
    "Emotional reality of being stuck — compassionate and specific",
    "Feeling 2",
    "Feeling 3",
    "Feeling 4"
  ],
  "objections": [
    "Real objection she has to investing — her thinking + the deeper fear behind it",
    "Objection 2",
    "Objection 3",
    "Objection 4"
  ],
  "does_not_want": [
    "Option 1 — a specific thing she refuses to do to get results, said from power",
    "Option 2 — different angle on what she's done with",
    "Option 3 — different angle",
    "Option 4 — different angle"
  ],
  "bonuses": [
    "Specific bonus or tool she'd find incredibly valuable",
    "Bonus 2",
    "Bonus 3",
    "Bonus 4"
  ]
}`,
  }),

  unicorn_taglines_v2: (p) => ({
    expectJson: true,
    user: `Write 4 tagline variations + 1 recommended using this EXACT structure every time:
"I help [who she is], [chosen desire], without [chosen vehicle], so she can [chosen outcome]."

AVATAR: ${JSON.stringify(p.avatar)}
CHOSEN DESIRE (use this — do not replace it): ${p.desire}
CHOSEN VEHICLE (use this — do not replace it): ${p.vehicle}
CHOSEN OUTCOME (use this — do not replace it): ${p.outcome}

Rules:
- The ONLY thing that changes between variations is the opening "I help [who she is]" — 3-6 words drawn from the avatar's demographics, niche, or life stage
- The desire, vehicle, and outcome must stay true to what was chosen — you may tighten the wording but never change the meaning
- All 4 variations should feel like sisters — clearly the same tagline family, just slightly different ways of naming her
- Under 40 words each
- Empowered buyer voice — no "finally," "stop struggling," or pain-point language
- The recommended version is the tightest, most specific, most premium

Output ONLY valid JSON:
{
  "variations": ["variation 1", "variation 2", "variation 3", "variation 4"],
  "recommended": "the tightest, most conversion-ready version"
}`,
  }),

  unicorn_tagline_refine: (p) => ({
    expectJson: true,
    user: `Refine this tagline based on the coach's request. Keep all 3 variations as close sisters to each other — same core message, just slightly different tone or wording.

CURRENT TAGLINE: ${p.current_tagline}
AVATAR: ${JSON.stringify(p.avatar)}
COACH'S REQUEST: ${p.request}

Keep the "I help [who she is], [desire], without [vehicle], so she can [outcome]" structure. Only adjust wording — never change the core meaning of what was chosen.

Output ONLY valid JSON:
{
  "variations": ["option 1", "option 2", "option 3"],
  "recommended": "the tightest, most specific version"
}`,
  }),

  // ── EXISTING PROMPTS ──────────────────────────────────────────────────────

  unicorn_list: (p) => ({
    expectJson: true,
    user: `Generate 4 distinct aligned avatar profiles for this coach's offer. Each avatar should be a DIFFERENT flavor — different life stage, different driver, different expression of the same core transformation. These are empowered, premium women who want MORE, not desperate women who need saving. Speak entirely from desire and momentum.

COACH'S OFFER DESCRIPTION:
${p.offer_description}

Output ONLY valid JSON:
{
  "avatars": [
    {
      "id": "a1",
      "name": "first name only",
      "demographics": "age range, life stage, archetype",
      "headline": "one punchy sentence capturing her essence and momentum",
      "core_desire": "what she is moving TOWARD — specific, alive, empowered",
      "empowered_frustration": "what she is DONE WITH — said from power, not victimhood"
    }
  ]
}`,
  }),

  unicorn_blend: (p) => ({
    expectJson: true,
    user: `Blend these selected avatars into ONE refined Brand Unicorn.

COACH'S OFFER:
${p.offer_description}

SELECTED AVATARS:
${JSON.stringify(p.selected, null, 2)}

Output ONLY valid JSON:
{
  "avatar": {
    "name": "first name",
    "demographics": "rich, specific demographic description",
    "who_she_is": "2-3 vivid present-tense sentences.",
    "lights_her_up": "what she's building toward",
    "biggest_challenges": "her empowered frustration",
    "unicorn_signal": "how you spot her in a crowd"
  },
  "desires": ["option 1", "option 2", "option 3", "option 4"],
  "vehicles": ["option 1", "option 2", "option 3", "option 4"],
  "outcomes": ["option 1", "option 2", "option 3", "option 4"]
}`,
  }),

  unicorn_tagline: (p) => ({
    expectJson: true,
    user: `Write tagline variations: "I help [avatar] achieve [desire], without [vehicle], so she can [outcome]."

AVATAR: ${JSON.stringify(p.avatar)}
CHOSEN DESIRE: ${p.desire}
CHOSEN VEHICLE: ${p.vehicle}
CHOSEN OUTCOME: ${p.outcome}

Output ONLY valid JSON:
{
  "variations": ["variation 1", "variation 2", "variation 3"],
  "recommended": "the most conversion-ready version"
}`,
  }),

  avatar: (p) => ({
    expectJson: true,
    user: `Generate ONE aligned avatar profile.

COACH'S INPUTS:
- Work she's excited to teach: ${p.excited}
- Result she's helping her get: ${p.result}
- Demographics: ${p.demo}
- What avatar tried that hasn't worked: ${p.tried}

Output ONLY valid JSON:
{
  "name": "string",
  "demographics": "string",
  "lights_her_up": "string",
  "biggest_challenges": ["empowered frustration 1", "..."],
  "old_vehicles_done_with": ["...", "..."],
  "desires": ["specific tangible outcome 1", "..."],
  "new_opportunity": "why this offer is the new opportunity for her"
}`,
  }),

  tagline: (p) => ({
    expectJson: false,
    user: `Generate 5 tagline variations + 1 recommended refinement:
"I help [avatar] achieve [result] without [old vehicle] so she can [outcome]."

AVATAR: ${JSON.stringify(p.avatar)}
OLD VEHICLE: ${p.old_vehicle}
RESULT: ${p.light_result}

Each must be under 30 words, punchy, speaking to the empowered version.
Output as a clean numbered list, then "RECOMMENDED:" with the refined version.`,
  }),

  framework: (p) => ({
    expectJson: true,
    user: `Generate a 6-step Rainbow Road framework (what+why, not how).

AVATAR: ${JSON.stringify(p.avatar)}
TAGLINE: ${p.tagline}
TRANSFORMATION: ${p.transformation}
OFFER LENGTH: ${p.length}
BRIDGE TO SEXY UNICORN OFFER: ${p.bridge}

Output ONLY valid JSON:
{
  "name": "proprietary framework name in coach's voice",
  "steps": [
    { "name": "step name", "what": "1-sentence what it covers", "why": "1-sentence why it matters" }
  ],
  "bridge_gap": "the ONE piece this trail seeds but doesn't fully deliver"
}`,
  }),

  sales_page: (p) => ({
    expectJson: false,
    user: `Generate a complete 9-section wireframe sales page. Empowered buyer voice only.

TAGLINE: ${p.tagline}
AVATAR: ${JSON.stringify(p.avatar)}
OFFER LENGTH: ${p.offer_length}

Sections: 1. HEADLINE/HOOK 2. SUBHEADLINE 3. COMPLETE EMPATHY (5 bullets) 4. SOLUTION 5. AUTHORITY-THROUGH-BELIEF-SHIFTING 6. BOLD TRUTH + WHAT YOU GET 7. VALUE STACK 8. VALUE/PRICE/CTA 9. TANGIBLE RESULTS + OBJECTION HANDLERS 10. WHO I AM

Output as clean markdown.`,
  }),

  landing_page: (p) => ({
    expectJson: false,
    user: `Condensed landing page under 500 words for cold ad traffic. Use sections 1, 2, 3, 7, 8.
TAGLINE: ${p.tagline}
AVATAR: ${JSON.stringify(p.avatar)}
Markdown output.`,
  }),

  welcome_email: (p) => ({
    expectJson: true,
    user: `Welcome email for buyers. 150-250 words. Warm + personal, confirm purchase, set tone, tease ONE thing, signoff in her voice.

TAGLINE: ${p.tagline}
OFFER LENGTH: ${p.offer_length}

Output ONLY valid JSON:
{ "subject": "subject line", "alt_subjects": ["alt 1", "alt 2"], "body": "full email body" }`,
  }),

  launch_plan: (p) => ({
    expectJson: true,
    user: `Day-by-day launch calendar using CTCCU (Curiosity, Tension, Clarity, Craving, Urgency).

DAYS: ${p.days}
PLATFORMS: ${p.platforms}
TAGLINE: ${p.tagline}
AVATAR: ${JSON.stringify(p.avatar)}

Output ONLY valid JSON array:
[{ "day": 1, "platform": "Instagram", "angle": "...", "hook": "...", "outline": { "curiosity": "...", "tension": "...", "clarity": "...", "craving": "...", "urgency": "..." }, "cta": "Reply [KEYWORD] to get the link", "visual": "Photo | Reel | Carousel | Story" }]`,
  }),

  magic_gumdrop_analysis: () => ({
    expectJson: false,
    user: `Analyze the pattern across all the coach's saved gumdrop trails to surface her emerging Magic Gumdrop (10x positioning).

Surface:
1. The 2-3 highest-converting angles
2. The 2-3 angles she said lit her up most
3. The OVERLAP between converting and aligned — this is signal
4. Recurring avatars
5. Frameworks that converted best
6. A "Drool Pattern" hypothesis

Lead with the signal, then the data. Bold the convergence points. Coach's voice.`,
  }),
};

async function getTrailHistory() {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/gumdrop_trail?select=name,tagline,status,coach_notes_loved,coach_notes_misaligned,trail_avatar,launched_at&order=created_at.desc&limit=50`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
  );
  return await r.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { kind, payload = {} } = await req.json();
    const builder = PROMPTS[kind];
    if (!builder) {
      return new Response(JSON.stringify({ error: `unknown kind ${kind}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const vp = await getVoiceProfile();
    let extraContext = "";
    if (kind === "magic_gumdrop_analysis") {
      const history = await getTrailHistory();
      extraContext = `\n\nGUMDROP TRAIL HISTORY:\n${JSON.stringify(history, null, 2)}`;
    }

    const { user, expectJson } = builder(payload);

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "prompt-caching-2024-07-31",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: [
          {
            type: "text",
            text: `${SYSTEM_PREFIX}\n\n${voiceBlock(vp)}${extraContext}`,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: user }],
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit. Try again in a moment." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiRes.ok) {
      const text = await aiRes.text();
      return new Response(JSON.stringify({ error: `Anthropic API error: ${text}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const output: string = aiJson.content?.[0]?.text ?? "";

    let parsedJson: unknown = null;
    if (expectJson) {
      const match = output.match(/```json\s*([\s\S]*?)```/) ?? output.match(/```\s*([\s\S]*?)```/);
      const candidate = match ? match[1] : output;
      try {
        parsedJson = JSON.parse(candidate.trim());
      } catch {
        const firstBrace = candidate.search(/[{\[]/);
        if (firstBrace >= 0) {
          try { parsedJson = JSON.parse(candidate.slice(firstBrace)); } catch { /* ignore */ }
        }
      }
    }

    return new Response(JSON.stringify({ output, json: parsedJson }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
