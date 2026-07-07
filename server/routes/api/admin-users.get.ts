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

  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) throw createError({ statusCode: 500, message: error.message });

  return {
    users: data.users.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      confirmed: !!u.email_confirmed_at,
    })),
  };
});
