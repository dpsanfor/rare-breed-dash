import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandShell } from "@/components/brand/BrandShell";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  confirmed: boolean;
}

type GrantProduct = "ten_x_leap" | "rare_breed_club";

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

const ADMIN_EMAIL = "dana@danahayes.com";
const IS_LOCAL_DEV = typeof window !== "undefined" && window.location.hostname === "localhost";

function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Grant access state
  const [grantEmail, setGrantEmail] = useState("");
  const [grantProduct, setGrantProduct] = useState<GrantProduct>("ten_x_leap");
  const [granting, setGranting] = useState(false);
  const [grantResult, setGrantResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const isAdmin = IS_LOCAL_DEV ? true : user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) { navigate({ to: "/dash" }); return; }

    fetch("/api/admin-users")
      .then((r) => r.json())
      .then((d) => {
        if (d.users) setUsers(d.users);
        else setUsersError(d.message ?? "Failed to load users");
      })
      .catch(() => setUsersError("Network error"));
  }, [loading, isAdmin]);

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault();
    if (!grantEmail.trim()) return;
    setGranting(true);
    setGrantResult(null);

    try {
      let token = "";
      if (!IS_LOCAL_DEV) {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token ?? "";
      }

      const res = await fetch("/api/admin-grant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email: grantEmail.trim().toLowerCase(), product: grantProduct }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        const productLabel = grantProduct === "rare_breed_club" ? "Rare Breed Club" : "10X Leap";
        const note = data.hasAccount ? " (account updated immediately)" : " (will activate when they sign up)";
        setGrantResult({ ok: true, msg: `${productLabel} access granted to ${grantEmail.trim()}${note}.` });
        setGrantEmail("");
      } else {
        setGrantResult({ ok: false, msg: data.message ?? "Something went wrong." });
      }
    } catch {
      setGrantResult({ ok: false, msg: "Network error." });
    } finally {
      setGranting(false);
    }
  }

  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch magic link from server (key stays server-side)
  useEffect(() => {
    if (!isAdmin || IS_LOCAL_DEV) return;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const token = session?.access_token ?? "";
      const res = await fetch(`/api/admin-magic-link?product=${grantProduct}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null);
      if (!res?.ok) return;
      const d = await res.json();
      if (d.link) setMagicLink(d.link);
    });
  }, [isAdmin, grantProduct]);

  function copyLink() {
    if (!magicLink) return;
    navigator.clipboard.writeText(magicLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading || !isAdmin) return null;

  return (
    <BrandShell hideStickyCta>
      <div className="mx-auto max-w-4xl py-10 px-4">
        <p className="eyebrow mb-4">Admin</p>
        <h1 className="font-display text-[40px] tracking-wide text-shimmer mb-10">
          Dashboard
        </h1>

        {/* ── GRANT ACCESS SECTION ─────────────────────────────────── */}
        <section className="mb-12">
          <p className="label-section mb-5">Grant Access</p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Manual email grant */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "white", border: "1px solid rgba(74,18,89,0.12)" }}
            >
              <p className="font-display text-[20px] tracking-wide text-[#1F1623] mb-1">
                By email
              </p>
              <p className="font-serif text-[15px] italic text-[#4A1259]/55 mb-5">
                Add any email — grants access whether or not they've signed up yet.
              </p>
              <form onSubmit={handleGrant} className="space-y-3">
                <input
                  type="email"
                  value={grantEmail}
                  onChange={(e) => setGrantEmail(e.target.value)}
                  placeholder="their@email.com"
                  required
                  className="w-full rounded-xl border border-[rgba(74,18,89,0.15)] bg-[#F9F5F0] px-4 py-3 font-serif text-[17px] text-[#1F1623] outline-none focus:border-[#E0249C]/40 placeholder:text-[#4A1259]/30"
                />
                <select
                  value={grantProduct}
                  onChange={(e) => setGrantProduct(e.target.value as GrantProduct)}
                  className="w-full rounded-xl border border-[rgba(74,18,89,0.15)] bg-[#F9F5F0] px-4 py-3 font-mono text-[13px] uppercase tracking-[0.15em] text-[#4A1259] outline-none focus:border-[#E0249C]/40"
                >
                  <option value="ten_x_leap">10X Leap</option>
                  <option value="rare_breed_club">Rare Breed Club</option>
                </select>
                <button
                  type="submit"
                  disabled={granting}
                  className="w-full rounded-full py-3 font-display text-[13px] tracking-[0.18em] text-white disabled:opacity-50 transition-opacity"
                  style={{
                    background: "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
                  }}
                >
                  {granting ? "Granting..." : "Grant Access →"}
                </button>
              </form>
              {grantResult && (
                <p
                  className="mt-3 font-mono text-[12px] leading-relaxed"
                  style={{ color: grantResult.ok ? "#16a34a" : "#dc2626" }}
                >
                  {grantResult.msg}
                </p>
              )}
            </div>

            {/* Magic link */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "white", border: "1px solid rgba(74,18,89,0.12)" }}
            >
              <p className="font-display text-[20px] tracking-wide text-[#1F1623] mb-1">
                By link
              </p>
              <p className="font-serif text-[15px] italic text-[#4A1259]/55 mb-5">
                Anyone with this link gets access automatically after logging in.
              </p>

              <div className="mb-3">
                <select
                  value={grantProduct}
                  onChange={(e) => setGrantProduct(e.target.value as GrantProduct)}
                  className="w-full rounded-xl border border-[rgba(74,18,89,0.15)] bg-[#F9F5F0] px-4 py-3 font-mono text-[13px] uppercase tracking-[0.15em] text-[#4A1259] outline-none focus:border-[#E0249C]/40 mb-3"
                >
                  <option value="ten_x_leap">10X Leap</option>
                  <option value="rare_breed_club">Rare Breed Club</option>
                </select>
              </div>

              <div
                className="rounded-xl px-4 py-3 mb-3 font-mono text-[11px] text-[#4A1259]/60 break-all leading-relaxed"
                style={{ background: "rgba(74,18,89,0.04)", border: "1px solid rgba(74,18,89,0.1)" }}
              >
                {magicLink ?? (IS_LOCAL_DEV ? "https://rarebreedos.com/grant-access?key=…&product=" + grantProduct : "Loading…")}
              </div>

              <button
                onClick={copyLink}
                disabled={!magicLink && !IS_LOCAL_DEV}
                className="w-full rounded-full py-3 font-display text-[13px] tracking-[0.18em] transition-all disabled:opacity-40"
                style={{
                  background: copied ? "rgba(22,163,74,0.1)" : "rgba(74,18,89,0.06)",
                  border: `1px solid ${copied ? "rgba(22,163,74,0.3)" : "rgba(74,18,89,0.15)"}`,
                  color: copied ? "#16a34a" : "#4A1259",
                }}
              >
                {copied ? "Copied ✓" : "Copy Link"}
              </button>

              <p className="mt-3 font-serif text-[13px] italic text-[#4A1259]/40 leading-relaxed">
                Keep this link private — anyone who has it and creates an account will get access.
              </p>
            </div>
          </div>
        </section>

        {/* ── MEMBERS TABLE ────────────────────────────────────────── */}
        <section>
          <p className="label-section mb-5">Members</p>

          {usersError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-4">
              <p className="font-mono text-[12px] text-red-600">{usersError}</p>
              {usersError.includes("SERVICE_ROLE_KEY") && (
                <p className="mt-2 font-serif text-[14px] text-red-500">
                  Add <code className="bg-red-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> to your Vercel environment variables.
                </p>
              )}
            </div>
          )}

          {!users && !usersError && (
            <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-[#4A1259]/40">Loading...</p>
          )}

          {users && (
            <>
              <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-[#4A1259]/40 mb-4">
                {users.length} account{users.length !== 1 ? "s" : ""}
              </p>

              <div className="rounded-2xl border border-[rgba(74,18,89,0.12)] overflow-hidden">
                <div
                  className="grid grid-cols-3 gap-4 px-6 py-3"
                  style={{ background: "rgba(74,18,89,0.05)", borderBottom: "1px solid rgba(74,18,89,0.1)" }}
                >
                  <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#4A1259]/50">Email</p>
                  <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#4A1259]/50">Joined</p>
                  <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#4A1259]/50">Last Sign In</p>
                </div>

                {users
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((u, i) => (
                    <div
                      key={u.id}
                      className="grid grid-cols-3 gap-4 px-6 py-4"
                      style={{
                        borderBottom: i < users.length - 1 ? "1px solid rgba(74,18,89,0.07)" : "none",
                        background: u.email === ADMIN_EMAIL ? "rgba(224,36,156,0.03)" : "transparent",
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-serif text-[15px] text-[#1F1623] truncate">{u.email}</span>
                        {u.email === ADMIN_EMAIL && (
                          <span className="shrink-0 rounded-full bg-[#E0249C]/10 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.15em] text-[#E0249C]">you</span>
                        )}
                      </div>
                      <span className="font-mono text-[13px] text-[#4A1259]/60">{fmt(u.created_at)}</span>
                      <span className="font-mono text-[13px] text-[#4A1259]/60">{fmt(u.last_sign_in_at)}</span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </section>
      </div>
    </BrandShell>
  );
}
