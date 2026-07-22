import { defineEventHandler, getHeader, createError } from "h3";
import { createClient } from "@supabase/supabase-js";

// Called on every login. Checks email_grants for the logged-in user's email
// and permanently writes phase2/phase3 access to user_profiles.
// This covers buyers who paid before creating an account.

export default defineEventHandler(async (event) => {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw createError({ statusCode: 503, message: "Not configured" });

  const token = (getHeader(event, "authorization") ?? "").replace("Bearer ", "").trim();
  if (!token) throw createError({ statusCode: 401, message: "No token" });

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user?.email) throw createError({ statusCode: 401, message: "Invalid token" });

  const email = user.email.toLowerCase();

  const { data: grants } = await admin
    .from("email_grants")
    .select("product")
    .eq("email", email);

  if (!grants?.length) return { ok: true, activated: false };

  let phase2 = false;
  let phase3 = false;
  for (const g of grants) {
    if (g.product === "ten_x_leap") phase2 = true;
    if (g.product === "rare_breed_club") { phase2 = true; phase3 = true; }
  }

  const update: Record<string, boolean> = {};
  if (phase2) update.phase2_access = true;
  if (phase3) update.phase3_access = true;

  await admin.from("user_profiles").update(update).eq("id", user.id);

  return { ok: true, activated: true, phase2, phase3 };
});
