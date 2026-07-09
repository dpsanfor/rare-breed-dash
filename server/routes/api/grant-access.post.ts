import { defineEventHandler, readBody, createError } from "h3";
import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const { email, product, key } = await readBody(event);

  const validKey = process.env.GRANT_ACCESS_KEY;
  if (!validKey || key !== validKey) {
    throw createError({ statusCode: 401, message: "Invalid access key" });
  }

  if (!email || !product) {
    throw createError({ statusCode: 400, message: "email and product required" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw createError({ statusCode: 503, message: "Server not configured" });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Grant access by email (works whether or not they have an account yet)
  await admin.from("email_grants" as any).upsert(
    { email, product },
    { onConflict: "email,product" }
  );

  // If they already have an account, update user_profiles directly too
  const { data: users } = await admin.auth.admin.listUsers();
  const existing = users?.users?.find((u) => u.email === email);
  if (existing) {
    const update =
      product === "rare_breed_club"
        ? { phase2_access: true, phase3_access: true }
        : { phase2_access: true };
    await admin.from("user_profiles" as any).update(update).eq("id", existing.id);
  }

  return { ok: true };
});
