import { defineEventHandler, readBody, getHeader, createError } from "h3";
import { createClient } from "@supabase/supabase-js";

// POST /api/ggpb-register
// Called by an ActiveCampaign webhook when someone joins the GGPB list.
// Body: { "email": "contact@example.com" }
// Header: x-webhook-secret: <GGPB_WEBHOOK_SECRET from .env>
// On success: inserts a purchases row (product = 'prison_break') so the user
// gains GGPB access the moment they log in with that email.

export default defineEventHandler(async (event) => {
  // ── 1. Validate webhook secret ───────────────────────────────────────────
  const secret = getHeader(event, "x-webhook-secret");
  const expected = process.env.GGPB_WEBHOOK_SECRET;
  if (!expected || secret !== expected) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  // ── 2. Parse email ───────────────────────────────────────────────────────
  let email: string | undefined;
  try {
    const body = await readBody(event);
    email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : undefined;
  } catch {
    // AC sometimes sends form-encoded — h3 readBody handles both, but fallback just in case
    email = undefined;
  }

  if (!email || !email.includes("@")) {
    throw createError({ statusCode: 400, statusMessage: "Missing or invalid email" });
  }

  // ── 3. Grant Supabase phase1 access ─────────────────────────────────────
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[ggpb-register] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    throw createError({ statusCode: 500, statusMessage: "Server configuration error" });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { error: dbError } = await admin.from("purchases").upsert(
    { email, product: "prison_break" },
    { onConflict: "email,product", ignoreDuplicates: true }
  );

  if (dbError) {
    console.error("[ggpb-register] Supabase error:", dbError);
    throw createError({ statusCode: 500, statusMessage: "Database error" });
  }

  // ── 4. Tag in ActiveCampaign (optional — skipped if vars not set) ────────
  const acBase = process.env.ACTIVECAMPAIGN_BASE_URL;
  const acKey = process.env.ACTIVECAMPAIGN_API_KEY;
  const acListId = process.env.ACTIVECAMPAIGN_GGPB_LIST_ID;

  if (acBase && acKey && acListId) {
    try {
      const contactRes = await fetch(`${acBase}/api/3/contacts`, {
        method: "POST",
        headers: { "Api-Token": acKey, "Content-Type": "application/json" },
        body: JSON.stringify({ contact: { email } }),
      });
      if (contactRes.ok) {
        const contactData = await contactRes.json();
        const contactId = contactData?.contact?.id;
        if (contactId) {
          await fetch(`${acBase}/api/3/contactLists`, {
            method: "POST",
            headers: { "Api-Token": acKey, "Content-Type": "application/json" },
            body: JSON.stringify({
              contactList: { contact: contactId, list: acListId, status: 1 },
            }),
          });
        }
      }
    } catch (acErr) {
      // AC failure is non-fatal — access is already granted
      console.warn("[ggpb-register] ActiveCampaign call failed:", acErr);
    }
  }

  console.log(`[ggpb-register] Granted GGPB access to ${email}`);
  return { ok: true };
});
