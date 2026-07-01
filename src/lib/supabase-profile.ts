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

export async function getUserAccess(): Promise<{ phase2: boolean; phase3: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { phase2: false, phase3: false };

  const { data } = await db
    .from("user_profiles")
    .select("phase2_access, phase3_access")
    .eq("id", user.id)
    .maybeSingle();

  return {
    phase2: data?.phase2_access ?? false,
    phase3: data?.phase3_access ?? false,
  };
}
