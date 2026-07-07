import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandShell } from "@/components/brand/BrandShell";
import { useAuth } from "@/contexts/AuthContext";

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

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

const ADMIN_EMAIL = "dana@danahayes.com";

function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin =
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? true
      : user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) { navigate({ to: "/dash" }); return; }

    fetch("/api/admin-users")
      .then((r) => r.json())
      .then((d) => {
        if (d.users) setUsers(d.users);
        else setError(d.message ?? "Failed to load users");
      })
      .catch(() => setError("Network error"));
  }, [loading, isAdmin]);

  if (loading || !isAdmin) return null;

  return (
    <BrandShell hideStickyCta>
      <div className="mx-auto max-w-4xl py-10">
        <p className="eyebrow mb-4">Admin</p>
        <h1 className="font-display text-[40px] tracking-wide text-shimmer mb-8">
          Members
        </h1>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-4">
            <p className="font-mono text-[12px] text-red-600">{error}</p>
            {error.includes("SERVICE_ROLE_KEY") && (
              <p className="mt-2 font-serif text-[14px] text-red-500">
                Add <code className="bg-red-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> to your Vercel environment variables. Find it in Supabase → Project Settings → API → service_role key.
              </p>
            )}
          </div>
        )}

        {!users && !error && (
          <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-[#4A1259]/40">Loading...</p>
        )}

        {users && (
          <>
            <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-[#4A1259]/40 mb-6">
              {users.length} account{users.length !== 1 ? "s" : ""}
            </p>

            <div className="rounded-2xl border border-[rgba(74,18,89,0.12)] overflow-hidden">
              {/* Header */}
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
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-[17px] text-[#1F1623]">{u.email}</span>
                      {u.email === ADMIN_EMAIL && (
                        <span className="rounded-full bg-[#E0249C]/10 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.15em] text-[#E0249C]">you</span>
                      )}
                    </div>
                    <span className="font-mono text-[13px] text-[#4A1259]/60">{fmt(u.created_at)}</span>
                    <span className="font-mono text-[13px] text-[#4A1259]/60">{fmt(u.last_sign_in_at)}</span>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </BrandShell>
  );
}
