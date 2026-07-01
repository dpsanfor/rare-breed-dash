import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate({ to: "/dash/" });
    });
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/dash/" },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-6"
        style={{ background: "linear-gradient(135deg, #F9F5F0 0%, #F5EDE8 100%)" }}
      >
        <div className="max-w-md w-full text-center">
          <p className="font-display text-[42px] leading-tight tracking-wide text-shimmer mb-5">
            Check your inbox.
          </p>
          <p className="font-serif text-[22px] italic leading-relaxed text-[#4A1259]/70">
            We sent a magic link to <span className="font-semibold not-italic text-[#4A1259]">{email}</span>.
            Click it to enter the dashboard.
          </p>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-[#4A1259]/35">
            No password needed. Ever.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: "linear-gradient(135deg, #F9F5F0 0%, #F5EDE8 100%)" }}
    >
      <div className="max-w-md w-full">
        <div className="mb-12 text-center">
          <p className="font-display text-[52px] leading-none tracking-[0.1em] text-shimmer">
            RARE BREED
          </p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.3em] text-[#4A1259]/45">
            Operating System™
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white/80 overflow-hidden">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="w-full bg-transparent px-6 py-4 font-serif text-[18px] text-[#1F1623] outline-none placeholder:text-[#4A1259]/30"
            />
          </div>

          {error && (
            <p className="font-mono text-[12px] text-red-500 text-center">{error}</p>
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
            {loading ? "Sending..." : "Enter with Magic Link →"}
          </button>
        </form>

        <p className="mt-8 text-center font-serif text-[14px] italic text-[#4A1259]/40">
          You'll receive a one-click login link by email.
        </p>
      </div>
    </div>
  );
}
