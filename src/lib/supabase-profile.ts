import { supabase } from "@/integrations/supabase/client";
import type { UserProfile } from "./profile";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export async function loadUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await db
    .from("user_profiles")
    .select("data")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return null;
  if (!data) {
    // First time — create the row
    await db.from("user_profiles").insert({ id: user.id, email: user.email });
    return null;
  }
  return (data.data as UserProfile) ?? null;
}

export async function syncProfileToSupabase(profile: UserProfile): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await db.from("user_profiles").upsert({
    id: user.id,
    data: profile,
    updated_at: new Date().toISOString(),
  });
}

const OWNER_EMAIL = "dana@danahayes.com";
const IS_LOCAL_DEV = typeof window !== "undefined" && window.location.hostname === "localhost";

export async function getUserAccess(): Promise<{ phase1: boolean; phase2: boolean; phase3: boolean }> {
  if (IS_LOCAL_DEV) return { phase1: true, phase2: true, phase3: true };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { phase1: false, phase2: false, phase3: false };
  if (user.email === OWNER_EMAIL) return { phase1: true, phase2: true, phase3: true };

  const { data } = await db
    .from("user_profiles")
    .select("phase2_access, phase3_access")
    .eq("id", user.id)
    .maybeSingle();

  // GGPB is free — any logged-in user gets phase 1
  let phase1 = true;
  let phase2 = data?.phase2_access ?? false;
  let phase3 = data?.phase3_access ?? false;

  const { data: purchases } = await db.from("purchases").select("product");
  for (const p of purchases ?? []) {
    if (p.product === "ten_x_leap") phase2 = true;
    if (p.product === "rare_breed_club") {
      phase2 = true;
      phase3 = true;
    }
  }

  // Also check email_grants (covers buyers who paid before creating an account)
  if (user.email && (!phase2 || !phase3)) {
    const { data: grants } = await db
      .from("email_grants")
      .select("product")
      .eq("email", user.email);
    for (const g of grants ?? []) {
      if (g.product === "ten_x_leap") phase2 = true;
      if (g.product === "rare_breed_club") {
        phase2 = true;
        phase3 = true;
      }
    }
  }

  return { phase1, phase2, phase3 };
}
