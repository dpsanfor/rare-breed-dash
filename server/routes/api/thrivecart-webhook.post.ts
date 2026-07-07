import { defineEventHandler, readBody, getQuery, createError } from "h3";
import { createClient } from "@supabase/supabase-js";

// ThriveCart sends the webhook secret as a query param: ?secret=YOUR_SECRET
// Set THRIVECART_WEBHOOK_SECRET in your env, and use that same value in ThriveCart's webhook URL.

function extractEmail(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  // ThriveCart nested format: { thrivecart: { customer: { email } } }
  const tc = b["thrivecart"] as Record<string, unknown> | undefined;
  if (tc) {
    const cust = tc["customer"] as Record<string, unknown> | undefined;
    if (typeof cust?.["email"] === "string") return cust["email"];
  }

  // Flat format: { customer: { email } }
  const cust = b["customer"] as Record<string, unknown> | undefined;
  if (typeof cust?.["email"] === "string") return cust["email"];

  // Direct: { email }
  if (typeof b["email"] === "string") return b["email"];

  return null;
}

function extractProduct(body: unknown): string {
  if (!body || typeof body !== "object") return "ten_x_leap";
  const b = body as Record<string, unknown>;

  const tc = b["thrivecart"] as Record<string, unknown> | undefined;
  const prod = (tc?.["product"] ?? b["product"]) as Record<string, unknown> | undefined;

  const name = ((prod?.["name"] ?? prod?.["url_name"] ?? "") as string).toLowerCase();
  if (name.includes("rare-breed-club") || name.includes("rare_breed_club") || name.includes("rbc")) {
    return "rare_breed_club";
  }
  // Default to ten_x_leap for this project
  return "ten_x_leap";
}

export default defineEventHandler(async (event) => {
  const secret = process.env.THRIVECART_WEBHOOK_SECRET;
  const query = getQuery(event);

  // Validate secret if one is configured
  if (secret && query["secret"] !== secret) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const body = await readBody(event);
  console.log("[thrivecart-webhook] body:", JSON.stringify(body));

  const email = extractEmail(body);
  if (!email) {
    console.error("[thrivecart-webhook] no email found in payload");
    return { ok: false, error: "no email" };
  }

  const product = extractProduct(body);
  console.log(`[thrivecart-webhook] granting ${product} to ${email}`);

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("[thrivecart-webhook] missing SUPABASE_SERVICE_ROLE_KEY");
    return { ok: false, error: "server misconfigured" };
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Store in email_grants so access works even before account creation
  await admin.from("email_grants" as any).upsert({ email, product }, { onConflict: "email,product" });

  // 2. If they already have an account, grant access immediately
  const { data: users } = await admin.auth.admin.listUsers();
  const existing = users?.users?.find((u) => u.email === email);
  if (existing) {
    const update =
      product === "rare_breed_club"
        ? { phase2_access: true, phase3_access: true }
        : { phase2_access: true };

    await admin
      .from("user_profiles" as any)
      .update(update)
      .eq("id", existing.id);

    console.log(`[thrivecart-webhook] updated user_profiles for ${email}`);
  }

  return { ok: true, email, product };
});
