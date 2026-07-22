import { defineEventHandler, getQuery, sendRedirect } from "h3";
import { createClient } from "@supabase/supabase-js";

// ThriveCart redirects here after purchase with the customer's email.
// We store the email in email_grants and redirect to the login page.
// URL format: /api/tc-activate?email=CUSTOMER_EMAIL&product=ten_x_leap&key=SECRET

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const secret = process.env.THRIVECART_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const email = ((query.email as string) ?? "").toLowerCase().trim();
  const product = (query.product as string) || "ten_x_leap";
  const key = query.key as string;

  // Validate secret
  if (!email || (secret && key !== secret)) {
    return sendRedirect(event, "/login?error=invalid", 302);
  }

  if (supabaseUrl && serviceKey) {
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Store in email_grants so access fires the moment they log in
    await admin
      .from("email_grants")
      .upsert({ email, product }, { onConflict: "email,product" });

    // 2. If they already have an account, grant access immediately
    const { data: authUsers } = await admin.auth.admin.listUsers();
    const existing = authUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email
    );
    if (existing) {
      const update =
        product === "rare_breed_club"
          ? { phase2_access: true, phase3_access: true }
          : { phase2_access: true };
      await admin.from("user_profiles").update(update).eq("id", existing.id);
    }
  }

  // Redirect to login with a welcome message
  const dest = `/login?welcome=1&product=${encodeURIComponent(product)}`;
  return sendRedirect(event, dest, 302);
});
