import { defineEventHandler, readBody, createError, getHeader } from "h3";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "dana@danahayes.com";

export default defineEventHandler(async (event) => {
  const { email, product } = await readBody(event);

  if (!email || !product) {
    throw createError({ statusCode: 400, message: "email and product required" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !serviceKey || !anonKey) {
    throw createError({ statusCode: 503, message: "Server not configured" });
  }

  // Verify caller is the admin by checking their Supabase JWT
  const authHeader = getHeader(event, "authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");

  if (!token) {
    throw createError({ statusCode: 401, message: "Not authorized" });
  }

  const caller = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user } } = await caller.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    throw createError({ statusCode: 403, message: "Admin only" });
  }

  // Use service role to grant access
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  await admin.from("email_grants" as any).upsert(
    { email, product },
    { onConflict: "email,product" }
  );

  // If user already has an account, update user_profiles too
  const { data: users } = await admin.auth.admin.listUsers();
  const existing = users?.users?.find((u) => u.email === email);
  if (existing) {
    const update =
      product === "rare_breed_club"
        ? { phase2_access: true, phase3_access: true }
        : { phase2_access: true };
    await admin.from("user_profiles" as any).update(update).eq("id", existing.id);
  }

  return { ok: true, hasAccount: !!existing };
});
