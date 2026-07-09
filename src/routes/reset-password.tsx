import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false); // true once recovery session is active

  useEffect(() => {
    // This page is ONLY ever reached from a password reset email link.
    // Wait for Supabase to fire PASSWORD_RECOVERY, then show the form.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Supabase v2: if the session is already set up from the URL token
    // (e.g. PKCE exchange already happened), getSession reflects it.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      navigate({ to: "/dash" });
    }
  }

  const bg = {
    background: "linear-gradient(135deg, #F9F5F0 0%, #F5EDE8 100%)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  };

  const logo = (
    <div className="mb-12 text-center">
      <p className="font-display text-[52px] leading-none tracking-[0.1em] text-shimmer">
        RARE BREED
      </p>
      <p className="mt-2 font-mono text-[13px] uppercase tracking-[0.3em] text-[#4A1259]/45">
        Operating System™
      </p>
    </div>
  );

  if (!ready) {
    return (
      <div style={bg}>
        <div className="text-center">
          {logo}
          <p className="font-mono text-[13px] uppercase tracking-[0.25em] text-[#4A1259]/40">
            Verifying reset link...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={bg}>
      <div className="w-full max-w-md">
        {logo}
        <p className="font-display text-[30px] tracking-wide text-shimmer mb-2 text-center">
          Set your new password
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div className="rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white/80 overflow-hidden">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              required
              minLength={6}
              autoFocus
              className="w-full bg-transparent px-6 py-4 font-serif text-[18px] text-[#1F1623] outline-none placeholder:text-[#4A1259]/30"
            />
          </div>
          <div className="rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white/80 overflow-hidden">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={6}
              className="w-full bg-transparent px-6 py-4 font-serif text-[18px] text-[#1F1623] outline-none placeholder:text-[#4A1259]/30"
            />
          </div>
          {error && (
            <p className="font-mono text-[13px] text-red-500 text-center px-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-full py-4 font-display text-[13px] tracking-[0.18em] text-white disabled:opacity-60 transition-opacity"
            style={{
              background: "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
              boxShadow: "0 8px 32px -8px rgba(224,36,156,0.4)",
            }}
          >
            {loading ? "..." : "Update Password →"}
          </button>
        </form>
      </div>
    </div>
  );
}
