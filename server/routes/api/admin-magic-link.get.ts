import { defineEventHandler, getQuery, createError, getHeader } from "h3";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "dana@danahayes.com";

export default defineEventHandler(async (event) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const grantKey = process.env.GRANT_ACCESS_KEY;

  if (!supabaseUrl || !anonKey || !grantKey) {
    throw createError({ statusCode: 503, message: "Server not configured" });
  }

  // Verify caller is admin
  const authHeader = getHeader(event, "authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) throw createError({ statusCode: 401, message: "Not authorized" });

  const caller = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user } } = await caller.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    throw createError({ statusCode: 403, message: "Admin only" });
  }

  const { product = "ten_x_leap" } = getQuery(event);
  const base = "https://rarebreedos.com";
  const link = `${base}/grant-access?key=${encodeURIComponent(grantKey)}&product=${product}`;

  return { link };
});
