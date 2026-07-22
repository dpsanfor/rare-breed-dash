import { defineEventHandler, createError } from "h3";
import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async () => {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw createError({ statusCode: 503, message: "SUPABASE_SERVICE_ROLE_KEY not configured" });
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const [{ data: authData, error: authError }, { data: profiles }, { data: grants }] =
    await Promise.all([
      admin.auth.admin.listUsers({ perPage: 1000 }),
      admin.from("user_profiles").select("id, phase2_access, phase3_access"),
      admin.from("grants").select("user_id, email, product"),
    ]);

  if (authError) throw createError({ statusCode: 500, message: authError.message });

  // Build lookup maps keyed by user id and by email
  const profileById = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  const grantsByUserId = new Map<string, Set<string>>();
  const grantsByEmail = new Map<string, Set<string>>();
  for (const g of grants ?? []) {
    if (g.user_id) {
      if (!grantsByUserId.has(g.user_id)) grantsByUserId.set(g.user_id, new Set());
      grantsByUserId.get(g.user_id)!.add(g.product);
    }
    if (g.email) {
      const key = (g.email as string).toLowerCase();
      if (!grantsByEmail.has(key)) grantsByEmail.set(key, new Set());
      grantsByEmail.get(key)!.add(g.product);
    }
  }

  return {
    users: authData.users.map((u) => {
      const profile = profileById.get(u.id) as any;
      const byId = grantsByUserId.get(u.id) ?? new Set<string>();
      const byEmail = u.email ? (grantsByEmail.get(u.email.toLowerCase()) ?? new Set<string>()) : new Set<string>();
      const allGrants = new Set([...byId, ...byEmail]);

      // Mirror the same logic getUserAccess() uses on the client
      const phase2 =
        !!profile?.phase2_access ||
        allGrants.has("ten_x_leap") ||
        allGrants.has("rare_breed_club");
      const phase3 =
        !!profile?.phase3_access ||
        allGrants.has("rare_breed_club");

      return {
        id: u.id,
        email: u.email ?? "",
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        confirmed: !!u.email_confirmed_at,
        phase2_access: phase2,
        phase3_access: phase3,
      };
    }),
  };
});
