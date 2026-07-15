// Profile = the growing library of personalized artifacts the AI references
// throughout the entire dashboard. Every module saves here.

export interface UserProfile {
  // Phase 1 artifacts
  x_vs_y?: string;
  revenue_integrity?: string;
  dead_weight?: string;
  comfort_map?: string;
  approval_map?: string;
  source_code?: string;
  language_report?: string;
  good_girl_os?: string;
  zog_code?: string;
  declaration?: string;

  // Phase 2 artifacts
  bigger_vision?: string;
  release_plan?: string;
  constitution?: string;
  magic_gumdrop?: string;
  zone_of_genius?: string;
  ten_x_business?: string;
  living_proof?: string;
  category_of_one?: string;
  the_method?: string;
  signature_stories?: string;
  ten_x_calendar?: string;
  dream_client_decision?: string;
  offer_map?: string;
  brand_direction?: string;
  teaching_pillars?: string;
  operating_manual?: string;

  // Voice Library (persistent — she can keep adding samples over time)
  voice_emails?: string;
  voice_social?: string;
  voice_curriculum?: string;
  voice_aspirational?: string;
  voice_testimonials?: string;
  voice_transcripts?: string;
  voice_documents?: string; // text pulled from uploaded/dragged files
  voice_images?: string; // JSON array of { name, dataUrl } for testimonial screenshots

  // Delivered builder artifacts
  dream_client?: string;
  messaging_blueprint?: string;
  offer_suite?: string;
  signature_curriculum?: string;
  framework_library?: string;
  gumdrop_kitchen?: string;
  sales_page?: string;
  email_playbook?: string;
  content_strategy?: string;
  brand_blueprint?: string;
  brand_images?: string; // JSON array of { name, dataUrl } — brand reference/mood images
  brand_photoshoot_outfits?: string;
  brand_photoshoot_shotlist?: string;
  website_blueprint?: string;
  launch_blueprint?: string;
  business_blueprint?: string;

  // Operating Manual sections (editable by founder)
  current_identity?: string;
  core_beliefs?: string;
  non_negotiables_business?: string;
  non_negotiables_life?: string;
  non_negotiables_leadership?: string;
  current_focus?: string;
  operating_manual_updated_at?: string;

  // Staleness tracking — compare these to know if the manual needs regenerating
  manual_generated_at?: string;   // set when operating_manual is saved
  leap_last_updated_at?: string;  // set when any of the 10 source elements are saved

  // Background intelligence (continuously refined across all engines)
  discernment_signals?: string;
  decision_filters?: string;
  faith_framework?: string;
  identity_evolution?: string;

  // Raw module inputs (used by synthesis modules)
  module_inputs?: Record<string, Record<string, string>>;

  // Conversation transcripts (for pattern-matching across sessions)
  conversations?: Record<string, Array<{ role: "user" | "assistant"; content: string }>>;

  // Module completion
  completed_modules?: string[];

  // Evolution Timeline entries
  evolution_timeline?: EvolutionEntry[];
}

export type EvolutionEntryType =
  | "module_complete"
  | "manual_update"
  | "reflection"
  | "business_milestone"
  | "phase_complete"
  | "breakthrough";

export interface EvolutionEntry {
  id: string;
  date: string;
  type: EvolutionEntryType;
  title: string;
  description?: string;
  reflection?: string;
  sectionKey?: string;
  previousValue?: string;
}

const PROFILE_KEY = "rb_profile";

// Lazily imported to avoid circular dependency
async function bgSync(profile: UserProfile) {
  try {
    const { syncProfileToSupabase } = await import("./supabase-profile");
    await syncProfileToSupabase(profile);
  } catch {
    // silently skip if not logged in or offline
  }
}

export function readProfile(): UserProfile {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : {};
  } catch {
    return {};
  }
}

export function writeProfile(update: Partial<UserProfile>): UserProfile {
  const current = readProfile();
  const merged: UserProfile = {
    ...current,
    ...update,
    module_inputs: { ...current.module_inputs, ...update.module_inputs },
    conversations: { ...current.conversations, ...update.conversations },
    completed_modules: Array.from(
      new Set([...(current.completed_modules ?? []), ...(update.completed_modules ?? [])])
    ),
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
  bgSync(merged);
  return merged;
}

const LEAP_ELEMENT_KEYS = new Set([
  "bigger_vision", "release_plan", "constitution", "zone_of_genius",
  "ten_x_business", "the_method", "signature_stories", "living_proof",
  "ten_x_calendar", "dream_client_decision", "offer_map", "brand_direction",
  "teaching_pillars",
]);

export function saveArtifact(key: keyof UserProfile, value: string): void {
  const now = new Date().toISOString();
  const extra: Partial<UserProfile> =
    key === "operating_manual"
      ? { manual_generated_at: now }
      : LEAP_ELEMENT_KEYS.has(key as string)
        ? { leap_last_updated_at: now }
        : {};
  writeProfile({ [key]: value, ...extra } as Partial<UserProfile>);
}

export function saveModuleInputs(
  moduleId: string,
  inputs: Record<string, string>
): void {
  const current = readProfile();
  writeProfile({
    module_inputs: { ...(current.module_inputs ?? {}), [moduleId]: inputs },
  });
}

export function saveConversation(
  moduleId: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>
): void {
  const current = readProfile();
  writeProfile({
    conversations: { ...(current.conversations ?? {}), [moduleId]: messages },
  });
}

export function markModuleComplete(moduleKey: string): void {
  writeProfile({ completed_modules: [moduleKey] });
}

export function isModuleComplete(moduleKey: string): boolean {
  return readProfile().completed_modules?.includes(moduleKey) ?? false;
}

export function addEvolutionEntry(entry: Omit<EvolutionEntry, "id" | "date">): void {
  const current = readProfile();
  const newEntry: EvolutionEntry = {
    ...entry,
    id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    date: new Date().toISOString(),
  };
  const existing = current.evolution_timeline ?? [];
  writeProfile({ evolution_timeline: [newEntry, ...existing] });
}

export function updateManualSection(key: keyof UserProfile, value: string): void {
  const current = readProfile();
  const previous = current[key] as string | undefined;
  if (previous && previous !== value) {
    addEvolutionEntry({
      type: "manual_update",
      title: `Operating Manual updated`,
      description: `${key.replace(/_/g, " ")} was revised`,
      sectionKey: key,
      previousValue: previous,
    });
  }
  writeProfile({
    [key]: value,
    operating_manual_updated_at: new Date().toISOString(),
  } as Partial<UserProfile>);
}

export function buildPhase1Context(profile: UserProfile): string {
  const parts: string[] = [];

  if (profile.module_inputs?.["x-vs-y"]) {
    const i = profile.module_inputs["x-vs-y"];
    parts.push(`10X GAP INPUTS:\nCurrent offers: ${i.current_offers ?? ""}\nCurrent clients: ${i.current_clients ?? ""}\nFavorite work: ${i.favorite_work ?? ""}\nDraining work: ${i.draining_work ?? ""}\nWork forever: ${i.forever_work ?? ""}\nPraised for: ${i.praised_for ?? ""}\nSecret wish: ${i.secret_wish ?? ""}`);
  }
  if (profile.x_vs_y) parts.push(`10X GAP MAP:\n${profile.x_vs_y}`);

  if (profile.module_inputs?.["wanted-vs-needed"]) {
    const i = profile.module_inputs["wanted-vs-needed"];
    parts.push(`REVENUE INPUTS:\nStreams: ${i.revenue_streams ?? ""}\nClient energy: ${i.client_energy ?? ""}\nExpansive work: ${i.expansive_work ?? ""}\nContracted work: ${i.contracted_work ?? ""}\nNeeded number: ${i.needed_number ?? ""}\nWanted number: ${i.wanted_number ?? ""}`);
  }
  if (profile.revenue_integrity) parts.push(`REVENUE INTEGRITY REPORT:\n${profile.revenue_integrity}`);

  if (profile.module_inputs?.["dead-weight"]) {
    const i = profile.module_inputs["dead-weight"];
    parts.push(`80% AUDIT INPUTS:\nClients: ${i.clients ?? ""}\nOffers: ${i.offers ?? ""}\nWeekly tasks: ${i.tasks ?? ""}\nMarketing: ${i.marketing ?? ""}\nResponsibilities: ${i.responsibilities ?? ""}`);
  }
  if (profile.dead_weight) parts.push(`DEAD WEIGHT AUDIT:\n${profile.dead_weight}`);

  if (profile.comfort_map) parts.push(`COMFORT MAP:\n${profile.comfort_map}`);
  if (profile.approval_map) parts.push(`APPROVAL MAP:\n${profile.approval_map}`);
  if (profile.source_code) parts.push(`SOURCE CODE (GOD CONCEPT):\n${profile.source_code}`);
  if (profile.language_report) parts.push(`LANGUAGE/PROGRAMMING REPORT:\n${profile.language_report}`);
  if (profile.good_girl_os) parts.push(`GOOD GIRL OPERATING SYSTEM:\n${profile.good_girl_os}`);
  if (profile.zog_code) parts.push(`ZONE OF GENIUS CODE™:\n${profile.zog_code}`);
  if (profile.declaration) parts.push(`PRISON BREAK DECLARATION:\n${profile.declaration}`);

  // Pull raw conversation text from conversation modules
  const comfortConvo = profile.conversations?.["comfort-cage"];
  if (comfortConvo) {
    const text = comfortConvo
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join("\n");
    if (text) parts.push(`COMFORT CAGE RESPONSES:\n${text}`);
  }

  const approvalConvo = profile.conversations?.["approval-map"];
  if (approvalConvo) {
    const text = approvalConvo
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join("\n");
    if (text) parts.push(`APPROVAL MAP RESPONSES:\n${text}`);
  }

  return parts.join("\n\n---\n\n");
}

export function buildPhase2Context(profile: UserProfile): string {
  const phase1 = buildPhase1Context(profile);
  const parts: string[] = [phase1];

  if (profile.bigger_vision) parts.push(`10X VISION:\n${profile.bigger_vision}`);
  if (profile.release_plan) parts.push(`RELEASE PLAN:\n${profile.release_plan}`);
  if (profile.constitution) parts.push(`RARE BREED CONSTITUTION:\n${profile.constitution}`);
  if (profile.magic_gumdrop) parts.push(`MAGIC GUMDROP:\n${profile.magic_gumdrop}`);
  if (profile.zone_of_genius) parts.push(`ZONE OF GENIUS:\n${profile.zone_of_genius}`);
  if (profile.ten_x_business) parts.push(`THE BUSINESS SHE'S HERE TO BUILD (10X BUSINESS CONCEPT):\n${profile.ten_x_business}`);
  if (profile.the_method) parts.push(`HER METHOD (proprietary process, named phases, mechanism, and vocabulary):\n${profile.the_method}`);
  if (profile.signature_stories) parts.push(`SIGNATURE STORIES (origin, wall, crossing, and client transformations — the only stories any AI is permitted to use):\n${profile.signature_stories}`);
  if (profile.living_proof) parts.push(`LIVING PROOF (her evidence and walking testimony for sales):\n${profile.living_proof}`);
  if (profile.category_of_one) parts.push(`CATEGORY OF ONE:\n${profile.category_of_one}`);
  if (profile.ten_x_calendar) parts.push(`10X CALENDAR:\n${profile.ten_x_calendar}`);
  if (profile.dream_client_decision) parts.push(`DREAM CLIENT DECISION:\n${profile.dream_client_decision}`);
  if (profile.offer_map) parts.push(`OFFER ECOSYSTEM MAP:\n${profile.offer_map}`);
  if (profile.brand_direction) parts.push(`BRAND DIRECTION:\n${profile.brand_direction}`);
  if (profile.teaching_pillars) parts.push(`TEACHING PILLARS & POV (her content DNA, what she stands for, what she refuses):\n${profile.teaching_pillars}`);
  if (profile.operating_manual) parts.push(`X FACTOR OPERATING MANUAL:\n${profile.operating_manual}`);

  const voice = [
    profile.voice_emails && `EMAILS SHE'S PROUD OF:\n${profile.voice_emails}`,
    profile.voice_social && `SOCIAL POSTS SHE'S PROUD OF:\n${profile.voice_social}`,
    profile.voice_curriculum && `HER OWN CURRICULUM / TRAINING WRITING:\n${profile.voice_curriculum}`,
    profile.voice_aspirational && `WRITERS SHE ASPIRES TO (inspiration, NOT her own voice):\n${profile.voice_aspirational}`,
    profile.voice_testimonials && `TESTIMONIALS / CLIENT WORDS:\n${profile.voice_testimonials}`,
    profile.voice_transcripts && `TRAINING TRANSCRIPTS:\n${profile.voice_transcripts}`,
    profile.voice_documents && `TEXT FROM HER UPLOADED FILES:\n${profile.voice_documents}`,
  ].filter(Boolean);
  if (voice.length)
    parts.push(
      `VOICE LIBRARY (her real writing — every Studio must write in exactly this voice):\n${voice.join("\n\n")}`
    );

  return parts.join("\n\n---\n\n");
}

// ── Scoped Studio context ──────────────────────────────────────────────
// buildPhase2Context sends EVERYTHING (every Phase 1 input, transcript, and
// report, every Phase 2 artifact, the whole Voice Library) on every Club
// message — which is slow and expensive, and mostly redundant because the
// Operating Manual already synthesizes all of it. buildStudioContext instead
// sends the Manual as the identity foundation, the crisp anchors a Studio
// leans on, and ONLY the upstream Club playbooks that this specific Studio
// builds on — plus her Voice Library (essential for voice matching).

function voiceBlock(profile: UserProfile): string | null {
  const voice = [
    profile.voice_emails && `EMAILS SHE'S PROUD OF:\n${profile.voice_emails}`,
    profile.voice_social && `SOCIAL POSTS SHE'S PROUD OF:\n${profile.voice_social}`,
    profile.voice_curriculum && `HER OWN CURRICULUM / TRAINING WRITING:\n${profile.voice_curriculum}`,
    profile.voice_aspirational && `WRITERS SHE ASPIRES TO (inspiration, NOT her own voice):\n${profile.voice_aspirational}`,
    profile.voice_testimonials && `TESTIMONIALS / CLIENT WORDS:\n${profile.voice_testimonials}`,
    profile.voice_transcripts && `TRAINING TRANSCRIPTS:\n${profile.voice_transcripts}`,
    profile.voice_documents && `TEXT FROM HER UPLOADED FILES:\n${profile.voice_documents}`,
  ].filter(Boolean);
  return voice.length
    ? `VOICE LIBRARY (her real writing — write in exactly this voice):\n${voice.join("\n\n")}`
    : null;
}

const STUDIO_CONTEXT_LABELS: Partial<Record<keyof UserProfile, string>> = {
  zone_of_genius: "ZONE OF GENIUS",
  ten_x_business: "THE BUSINESS SHE'S BUILDING",
  dream_client_decision: "DREAM CLIENT DECISION",
  brand_direction: "BRAND DIRECTION",
  dream_client: "DREAM CLIENT PLAYBOOK",
  messaging_blueprint: "MESSAGING PLAYBOOK",
  offer_suite: "OFFER PLAYBOOK",
  signature_curriculum: "CURRICULUM PLAYBOOK",
  framework_library: "FRAMEWORK PLAYBOOK",
  gumdrop_kitchen: "GUMDROP INTELLIGENCE REPORT",
  sales_page: "SALES PAGE PLAYBOOK",
  email_playbook: "EMAIL PLAYBOOK",
  content_strategy: "CONTENT PLAYBOOK",
  brand_blueprint: "BRAND PLAYBOOK",
  website_blueprint: "HOMEPAGE PLAYBOOK",
};

// Keyed by Club Studio module id. `upstream` = prior Club playbooks this Studio
// builds on. `extra` = specific Phase 2 artifacts it references directly.
// The Dream Client + Messaging Studio (outputKey "dream_client") now produces
// the messaging language too, so every Studio that used to build on the
// standalone Messaging Playbook builds on the Dream Client doc instead.
const STUDIO_DEPS: Record<string, { upstream: (keyof UserProfile)[]; extra?: (keyof UserProfile)[] }> = {
  "dream-client": { upstream: [] },
  "offer-suite": { upstream: ["dream_client"] },
  framework: { upstream: ["dream_client", "offer_suite"] },
  brand: { upstream: ["dream_client"], extra: ["brand_direction"] },
  // Sales pages build from messaging AND branding.
  "sales-page": { upstream: ["dream_client", "brand_blueprint", "offer_suite"] },
  // The homepage: copy from messaging, offers to feature, styled to the brand.
  website: { upstream: ["dream_client", "brand_blueprint", "offer_suite"] },
  // Content + Email Studio (produces both content and email).
  "content-engine": { upstream: ["dream_client", "brand_blueprint", "offer_suite"] },
  "launch-planner": { upstream: ["dream_client", "offer_suite", "sales_page", "content_strategy"] },
  "rare-breed-hq": {
    upstream: [
      "dream_client",
      "offer_suite",
      "framework_library",
      "brand_blueprint",
      "sales_page",
      "website_blueprint",
      "content_strategy",
    ],
  },
};

function labelFor(k: keyof UserProfile): string {
  return STUDIO_CONTEXT_LABELS[k] ?? String(k).toUpperCase().replace(/_/g, " ");
}

export function buildStudioContext(profile: UserProfile, studioId: string): string {
  const dep = STUDIO_DEPS[studioId];

  // Fallback: no Operating Manual yet — use the full Phase 2 context so nothing
  // is missing for users who haven't finished the Leap, then append any
  // upstream Club playbooks (which the full context doesn't include).
  if (!profile.operating_manual) {
    const base = buildPhase2Context(profile);
    const extra: string[] = [];
    for (const k of [...(dep?.extra ?? []), ...(dep?.upstream ?? [])]) {
      const v = profile[k];
      if (typeof v === "string" && v.trim()) extra.push(`${labelFor(k)}:\n${v}`);
    }
    return extra.length ? `${base}\n\n---\n\n${extra.join("\n\n---\n\n")}` : base;
  }

  const parts: string[] = [];
  const seen = new Set<keyof UserProfile>();

  // PRIMARY SOURCE FIRST. Each Studio's first upstream playbook is the document
  // it must build FROM (Messaging builds from the Dream Client Playbook, etc.).
  // Lead with it, loudly, so the model anchors on the specific prior work
  // instead of the generic Operating Manual.
  const primary = dep?.upstream[0];
  if (primary) {
    const v = profile[primary];
    if (typeof v === "string" && v.trim()) {
      parts.push(
        `PRIMARY SOURCE — BUILD THIS STUDIO DIRECTLY FROM THIS DOCUMENT. Pull its exact language, names, and specifics. Do NOT invent generic material when this already contains the real thing.\n\n${labelFor(primary)}:\n${v}`
      );
      seen.add(primary);
    }
  }

  parts.push(
    `RARE BREED OPERATING MANUAL (her identity + business foundation from the Leap). ALWAYS reference this too: the primary source above is what you build FROM, but this Manual is WHO SHE IS, her philosophy, her Zone of Genius, her voice, and everything you write must stay true to it:\n${profile.operating_manual}`
  );

  // Crisp anchors most Studios lean on directly.
  for (const k of ["zone_of_genius", "ten_x_business", "dream_client_decision"] as (keyof UserProfile)[]) {
    if (seen.has(k)) continue;
    seen.add(k);
    const v = profile[k];
    if (typeof v === "string" && v.trim()) parts.push(`${labelFor(k)}:\n${v}`);
  }

  // Remaining upstream Club playbooks this Studio builds on.
  for (const k of [...(dep?.extra ?? []), ...(dep?.upstream ?? [])]) {
    if (seen.has(k)) continue;
    seen.add(k);
    const v = profile[k];
    if (typeof v === "string" && v.trim()) parts.push(`${labelFor(k)}:\n${v}`);
  }

  const voice = voiceBlock(profile);
  if (voice) parts.push(voice);

  return parts.join("\n\n---\n\n");
}
