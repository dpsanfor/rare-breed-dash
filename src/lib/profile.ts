// Profile = the growing library of personalized artifacts the AI references
// throughout the entire dashboard. Every module saves here.

export interface UserProfile {
  // Phase 1 artifacts
  x_vs_y?: string;
  revenue_integrity?: string;
  dead_weight?: string;
  comfort_map?: string;
  approval_map?: string;
  language_report?: string;
  good_girl_os?: string;

  // Phase 2 artifacts
  bigger_vision?: string;
  release_plan?: string;
  constitution?: string;
  magic_gumdrop?: string;
  zone_of_genius?: string;
  category_of_one?: string;
  business_blueprint?: string;

  // Raw module inputs (used by synthesis modules)
  module_inputs?: Record<string, Record<string, string>>;

  // Conversation transcripts (for pattern-matching across sessions)
  conversations?: Record<string, Array<{ role: "user" | "assistant"; content: string }>>;

  // Module completion
  completed_modules?: string[];
}

const PROFILE_KEY = "rb_profile";

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
  return merged;
}

export function saveArtifact(key: keyof UserProfile, value: string): void {
  writeProfile({ [key]: value } as Partial<UserProfile>);
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

export function buildPhase1Context(profile: UserProfile): string {
  const parts: string[] = [];

  if (profile.module_inputs?.["x-vs-y"]) {
    const i = profile.module_inputs["x-vs-y"];
    parts.push(`X vs Y INPUTS:\nCurrent offers: ${i.current_offers ?? ""}\nCurrent clients: ${i.current_clients ?? ""}\nFavorite work: ${i.favorite_work ?? ""}\nDraining work: ${i.draining_work ?? ""}\nWork forever: ${i.forever_work ?? ""}\nPraised for: ${i.praised_for ?? ""}\nSecret wish: ${i.secret_wish ?? ""}`);
  }
  if (profile.x_vs_y) parts.push(`X VS Y REPORT:\n${profile.x_vs_y}`);

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
  if (profile.language_report) parts.push(`LANGUAGE/PROGRAMMING REPORT:\n${profile.language_report}`);

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

  if (profile.bigger_vision) parts.push(`BIGGER VISION:\n${profile.bigger_vision}`);
  if (profile.release_plan) parts.push(`RELEASE PLAN:\n${profile.release_plan}`);
  if (profile.constitution) parts.push(`RARE BREED CONSTITUTION:\n${profile.constitution}`);
  if (profile.magic_gumdrop) parts.push(`MAGIC GUMDROP:\n${profile.magic_gumdrop}`);
  if (profile.zone_of_genius) parts.push(`ZONE OF GENIUS:\n${profile.zone_of_genius}`);
  if (profile.category_of_one) parts.push(`CATEGORY OF ONE:\n${profile.category_of_one}`);

  return parts.join("\n\n---\n\n");
}
