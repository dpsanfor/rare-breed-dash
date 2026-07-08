import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

type Mode = "signin" | "signup" | "forgot" | "forgot-sent" | "reset-password";

function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth events — PASSWORD_RECOVERY means user clicked reset link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset-password");
        return;
      }
      if (event === "SIGNED_IN" && session && mode !== "reset-password") {
        navigate({ to: "/dash" });
      }
    });

    // Also check for existing session on mount (handles normal page load)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && mode === "signin") {
        navigate({ to: "/dash" });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  function reset() {
    setError(null);
    setPassword("");
  }

  async function handlePasswordReset(e: React.FormEvent) {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/login",
      });
      setLoading(false);
      if (error) setError(error.message);
      else setMode("forgot-sent");
      return;
    }

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        fetch("/api/ac-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }).catch(() => {});

        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) {
          setSuccess("Account created. Check your email to confirm before signing in.");
        } else {
          navigate({ to: "/dash" });
        }
      }
      return;
    }

    // signin
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(
        error.message.toLowerCase().includes("invalid")
          ? "Incorrect email or password."
          : error.message
      );
    } else {
      navigate({ to: "/dash" });
    }
  }

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

  const containerClass = "flex min-h-screen items-center justify-center px-6";
  const containerStyle = { background: "linear-gradient(135deg, #F9F5F0 0%, #F5EDE8 100%)" };

  // ── PASSWORD RESET FORM (after clicking email link) ──────────────────────────
  if (mode === "reset-password") {
    return (
      <div className={containerClass} style={containerStyle}>
        <div className="max-w-md w-full">
          {logo}
          <p className="font-display text-[30px] tracking-wide text-shimmer mb-2 text-center">Set your new password</p>
          <form onSubmit={handlePasswordReset} className="space-y-3 mt-6">
            <div className="rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white/80 overflow-hidden">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                required
                minLength={6}
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
            {error && <p className="font-mono text-[13px] text-red-500 text-center px-2">{error}</p>}
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

  // ── FORGOT SENT ──────────────────────────────────────────────────────────────
  if (mode === "forgot-sent") {
    return (
      <div className={containerClass} style={containerStyle}>
        <div className="max-w-md w-full text-center">
          {logo}
          <p className="font-display text-[36px] leading-tight tracking-wide text-shimmer mb-4">
            Check your inbox.
          </p>
          <p className="font-serif text-[18px] italic leading-relaxed text-[#4A1259]/70 mb-8">
            We sent a reset link to <span className="font-semibold not-italic text-[#4A1259]">{email}</span>.
          </p>
          <button onClick={() => { setMode("signin"); reset(); }} className="font-mono text-[13px] uppercase tracking-[0.2em] text-[#E0249C]/70 hover:text-[#E0249C] transition-colors">
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  const isForgot = mode === "forgot";
  const isSignup = mode === "signup";

  // ── MAIN SIGN IN / SIGN UP / FORGOT ─────────────────────────────────────────
  return (
    <div className={containerClass} style={containerStyle}>
      <div className="max-w-md w-full">
        {logo}

        <form onSubmit={handleSubmit} className="space-y-3">
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

          {!isForgot && (
            <div className="rounded-2xl border border-[rgba(74,18,89,0.15)] bg-white/80 overflow-hidden">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignup ? "Create a password" : "Password"}
                required
                minLength={6}
                className="w-full bg-transparent px-6 py-4 font-serif text-[18px] text-[#1F1623] outline-none placeholder:text-[#4A1259]/30"
              />
            </div>
          )}

          {error && <p className="font-mono text-[13px] text-red-500 text-center px-2">{error}</p>}
          {success && <p className="font-mono text-[13px] text-green-600 text-center px-2">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-full py-4 font-display text-[13px] tracking-[0.18em] text-white disabled:opacity-60 transition-opacity"
            style={{
              background: "linear-gradient(135deg, #E0249C 0%, #ec4899 50%, #c9a84c 100%)",
              boxShadow: "0 8px 32px -8px rgba(224,36,156,0.4)",
            }}
          >
            {loading ? "..." : isForgot ? "Send Reset Link →" : isSignup ? "Create Account →" : "Sign In →"}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3">
          {!isForgot && (
            <button
              onClick={() => { setMode(isSignup ? "signin" : "signup"); reset(); }}
              className="font-mono text-[13px] uppercase tracking-[0.2em] text-[#4A1259]/45 hover:text-[#4A1259]/70 transition-colors"
            >
              {isSignup ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
          )}
          {!isSignup && (
            <button
              onClick={() => { setMode(isForgot ? "signin" : "forgot"); reset(); }}
              className="font-mono text-[13px] uppercase tracking-[0.2em] text-[#4A1259]/35 hover:text-[#4A1259]/55 transition-colors"
            >
              {isForgot ? "Back to sign in" : "Forgot password?"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
