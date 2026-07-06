// ThriveCart → Supabase access webhook.
//
// Point ThriveCart's "webhook & notification" URL at this function:
//   https://<project-ref>.supabase.co/functions/v1/thrivecart-webhook
//
// Set two secrets on the function:
//   THRIVECART_SECRET  — from ThriveCart Settings → API & webhooks
//   (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically)
//
// Product mapping: edit PRODUCT_MAP so the ThriveCart product name (or ID)
// resolves to 'ten_x_leap' or 'rare_breed_club'.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const THRIVECART_SECRET = Deno.env.get("THRIVECART_SECRET") ?? "";

const PRODUCT_MAP: Record<string, "ten_x_leap" | "rare_breed_club"> = {
  "the 10x leap": "ten_x_leap",
  "10x leap": "ten_x_leap",
  "rare breed club": "rare_breed_club",
};

function resolveProduct(name: string): "ten_x_leap" | "rare_breed_club" | null {
  const n = name.trim().toLowerCase();
  for (const key of Object.keys(PRODUCT_MAP)) {
    if (n.includes(key)) return PRODUCT_MAP[key];
  }
  return null;
}

async function sb(path: string, init: RequestInit) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // ThriveCart posts application/x-www-form-urlencoded
  let fields: Record<string, string> = {};
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    fields = await req.json();
  } else {
    const form = await req.formData();
    for (const [k, v] of form.entries()) fields[k] = String(v);
  }

  // 1. Verify it's really ThriveCart
  const secret = fields["thrivecart_secret"] ?? "";
  if (!THRIVECART_SECRET || secret !== THRIVECART_SECRET) {
    return new Response("Invalid secret", { status: 401 });
  }

  // 2. Only act on successful orders
  const event = (fields["event"] ?? "").toLowerCase();
  if (event && !event.includes("order.success")) {
    return new Response("Ignored event", { status: 200 });
  }

  // 3. Pull email + product
  const email = (
    fields["customer[email]"] ??
    fields["customer_email"] ??
    fields["email"] ??
    ""
  )
    .trim()
    .toLowerCase();
  const productName =
    fields["base_product_name"] ?? fields["product_name"] ?? "";
  const orderId = fields["order_id"] ?? fields["order[id]"] ?? null;

  if (!email) return new Response("No email in payload", { status: 400 });

  const product = resolveProduct(productName);
  if (!product) {
    // Unknown product (e.g. a different offer) — acknowledge and skip.
    return new Response(`No access mapping for: ${productName}`, { status: 200 });
  }

  // 4. Record the purchase (grants access by email, even pre-signup)
  await sb("purchases", {
    method: "POST",
    body: JSON.stringify({
      email,
      product,
      thrivecart_order_id: orderId,
      raw_payload: fields,
    }),
  });

  // 5. If she already has an account, flip her flags immediately too
  const flags =
    product === "rare_breed_club"
      ? { phase2_access: true, phase3_access: true } // Club includes the Leap
      : { phase2_access: true };

  await sb(`user_profiles?email=eq.${encodeURIComponent(email)}`, {
    method: "PATCH",
    body: JSON.stringify(flags),
  });

  return new Response("OK", { status: 200 });
});
