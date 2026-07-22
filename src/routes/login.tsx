import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

type Mode = "signin" | "signup" | "forgot" | "forgot-sent";

function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const isNewBuyer = params.get("welcome") === "1";
  // Tracks whether we're in a recovery flow so SIGNED_IN doesn't redirect
  const inRecovery = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // Supabase redirected here instead of /reset-password — send them there
        inRecovery.current = true;
        navigate({ to: "/reset-password" });
        return;
      }
      if (inRecovery.current) return;

      if (event === "SIGNED_IN" && session) {
        redirectAfterLogin();
      }
    });

    // Redirect already-logged-in users, but only if NOT arriving from a reset link.
    // Reset links may carry a session token that makes getSession() return a session
    // before PASSWORD_RECOVERY fires — check the URL first.
    const urlIndicatesReset =
      window.location.hash.includes("type=recovery") ||
      window.location.search.includes("type=recovery");

    if (!urlIndicatesReset) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) redirectAfterLogin();
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  function redirectAfterLogin() {
    const returnUrl = sessionStorage.getItem("rb_post_login_url");
    if (returnUrl) {
      sessionStorage.removeItem("rb_post_login_url");
      window.location.href = returnUrl;
    } else {
      navigate({ to: "/dash" });
    }
  }

  function reset() {
    setError(null);
    setPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
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
          redirectAfterLogin();
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
      redirectAfterLogin();
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
            We sent a reset link to{" "}
            <span className="font-semibold not-italic text-[#4A1259]">{email}</span>.
          </p>
          <button
            onClick={() => { setMode("signin"); reset(); }}
            className="font-mono text-[13px] uppercase tracking-[0.2em] text-[#E0249C]/70 hover:text-[#E0249C] transition-colors"
          >
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

        {isNewBuyer && (
          <div
            className="mb-6 rounded-2xl p-5 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(224,36,156,0.08) 0%, rgba(201,168,76,0.08) 100%)",
              border: "1px solid rgba(224,36,156,0.25)",
            }}
          >
            <p className="font-display text-[18px] tracking-wide text-[#1F1623] mb-1">
              You're in. 🎉
            </p>
            <p className="font-serif text-[15px] italic text-[#4A1259]/70">
              Log in or create your account below to access the 10X Leap. Your access is already waiting.
            </p>
          </div>
        )}

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
