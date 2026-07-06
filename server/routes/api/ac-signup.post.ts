import { defineEventHandler, readBody, createError } from "h3";

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event);
  if (!email) throw createError({ statusCode: 400, message: "email required" });

  const base = process.env.ACTIVECAMPAIGN_BASE_URL;
  const key = process.env.ACTIVECAMPAIGN_API_KEY;
  const listId = process.env.ACTIVECAMPAIGN_SIGNUP_LIST_ID;

  if (!base || !key) {
    // AC not configured — fail silently so signup still works
    return { ok: true, skipped: true };
  }

  const headers = {
    "Api-Token": key,
    "Content-Type": "application/json",
  };

  // Upsert contact
  const syncRes = await fetch(`${base}/api/3/contact/sync`, {
    method: "POST",
    headers,
    body: JSON.stringify({ contact: { email } }),
  });

  if (!syncRes.ok) {
    console.error("AC contact sync failed", await syncRes.text());
    return { ok: false };
  }

  const { contact } = await syncRes.json() as { contact: { id: string } };

  // Add to list if configured
  if (listId && contact?.id) {
    await fetch(`${base}/api/3/contactLists`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        contactList: { list: listId, contact: contact.id, status: 1 },
      }),
    });
  }

  return { ok: true };
});
