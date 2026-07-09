import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/grant-access")({
  validateSearch: (search: Record<string, unknown>) => ({
    key: (search.key as string) ?? "",
    product: (search.product as string) ?? "ten_x_leap",
  }),
  component: GrantAccessPage,
});

function GrantAccessPage() {
  const { key, product } = Route.useSearch();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "granting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const productLabel =
    product === "rare_breed_club" ? "Rare Breed Club" : "10X Leap";
  const productRoute =
    product === "rare_breed_club" ? "/rare-breed-club" : "/ten-x-leap";

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Save return URL then send to login
      if (typeof window !== "undefined") {
        sessionStorage.setItem("rb_post_login_url", window.location.href);
      }
      navigate({ to: "/login" });
      return;
    }

    if (!key) {
      setStatus("error");
      setErrorMsg("This link is missing an access key. Check with Dana for the correct link.");
      return;
    }

    if (status !== "idle") return;
    setStatus("granting");

    fetch("/api/grant-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, product, key }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setStatus("done");
          setTimeout(() => navigate({ to: productRoute }), 2000);
        } else {
          setStatus("error");
          setErrorMsg(d.message ?? "Something went wrong.");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("Network error. Try refreshing the page.");
      });
  }, [loading, user]);

  const bg = {
    background: "linear-gradient(135deg, #F9F5F0 0%, #F5EDE8 100%)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  };

  if (loading || status === "idle") {
    return (
      <div style={bg}>
        <div className="text-center">
          <p className="font-display text-[52px] leading-none tracking-[0.1em] text-shimmer mb-12">
            RARE BREED
          </p>
          <p className="font-mono text-[13px] uppercase tracking-[0.25em] text-[#4A1259]/40">
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  if (status === "granting") {
    return (
      <div style={bg}>
        <div className="text-center max-w-sm">
          <p className="font-display text-[52px] leading-none tracking-[0.1em] text-shimmer mb-12">
            RARE BREED
          </p>
          <p className="font-display text-[32px] tracking-wide text-[#1F1623] mb-3">
            Unlocking your access...
          </p>
          <p className="font-serif text-[18px] italic text-[#4A1259]/60">
            Granting you access to {productLabel}.
          </p>
        </div>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div style={bg}>
        <div className="text-center max-w-sm">
          <p className="font-display text-[52px] leading-none tracking-[0.1em] text-shimmer mb-10">
            RARE BREED
          </p>
          <div
            className="rounded-3xl px-8 py-8 mb-6"
            style={{ background: "rgba(224,36,156,0.06)", border: "1px solid rgba(224,36,156,0.2)" }}
          >
            <p className="font-display text-[40px] tracking-wide text-shimmer mb-2">
              You're in.
            </p>
            <p className="font-serif text-[20px] italic text-[#4A1259]/70">
              {productLabel} access granted.
            </p>
          </div>
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#4A1259]/35">
            Redirecting you now...
          </p>
        </div>
      </div>
    );
  }

  // error
  return (
    <div style={bg}>
      <div className="text-center max-w-sm">
        <p className="font-display text-[52px] leading-none tracking-[0.1em] text-shimmer mb-10">
          RARE BREED
        </p>
        <div
          className="rounded-3xl px-8 py-6 mb-6"
          style={{ background: "rgba(224,36,156,0.06)", border: "1px solid rgba(224,36,156,0.2)" }}
        >
          <p className="font-display text-[28px] tracking-wide text-[#1F1623] mb-2">
            Link issue
          </p>
          <p className="font-serif text-[17px] italic text-[#4A1259]/70 leading-relaxed">
            {errorMsg}
          </p>
        </div>
        <button
          onClick={() => navigate({ to: "/dash" })}
          className="font-mono text-[13px] uppercase tracking-[0.2em] text-[#E0249C]/70 hover:text-[#E0249C] transition-colors"
        >
          Go to dashboard
        </button>
      </div>
    </div>
  );
}
