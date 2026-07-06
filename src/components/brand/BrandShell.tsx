import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Only use routes that exist in routeTree.gen.ts to avoid runtime Link errors.
// New routes must be registered before adding here.
const TOP_NAV = [
  { to: "/prison-break", label: "Become" },
  { to: "/ten-x-leap", label: "Build" },
  { to: "/rare-breed-club", label: "Refine" },
];

// Bottom nav uses Dana's three methodology verbs instead of phase names.
// Logo (top-left) taps to /dash/ — no "Home" item needed.
const BOTTOM_NAV = [
  { to: "/prison-break", label: "Become" },
  { to: "/ten-x-leap", label: "Build" },
  { to: "/rare-breed-club", label: "Refine" },
];

export function BrandShell({
  children,
  hideStickyCta = false,
  showBottomNav = false,
}: {
  children: ReactNode;
  hideStickyCta?: boolean;
  showBottomNav?: boolean;
}) {
  const { location } = useRouterState();
  const path = location.pathname;
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login" });
  }

  return (
    <div className="surface-bone min-h-screen text-foreground">
      {/* TOP HEADER */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "rgba(245,239,224,0.96)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(74,18,89,0.07)",
          boxShadow: "0 1px 0 0 rgba(224,36,156,0.08)",
        }}
      >
        {/* Magenta → plum → gold accent line */}
        <div
          className="h-[3px] w-full"
          style={{
            background: "linear-gradient(90deg, #E0249C 0%, #4A1259 35%, #EC4899 60%, #c9a84c 100%)",
            opacity: 0.85,
          }}
        />
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          {/* Logo — 2× larger, "OPERATING SYSTEM™" spelled out */}
          <Link to="/dash" className="group flex items-center">
            <div className="flex flex-col leading-none gap-[6px]">
              <span className="font-display text-[30px] tracking-[0.16em] text-shimmer leading-none">
                RARE BREED
              </span>
              <span
                className="font-mono text-[15px] uppercase tracking-[0.45em] leading-none"
                style={{ color: "rgba(74,18,89,0.78)" }}
              >
                Operating System™
              </span>
            </div>
          </Link>

          <button
            onClick={handleSignOut}
            className="font-mono text-[10px] uppercase tracking-[0.2em] transition-colors hover:text-[#E0249C]"
            style={{ color: "rgba(74,18,89,0.35)" }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main
        className={`mx-auto px-6 pt-10 ${
          showBottomNav ? "max-w-2xl pb-44" : "max-w-6xl pb-40"
        }`}
      >
        {children}
      </main>

      {/* BOTTOM NAV — only on pages that opt in with showBottomNav=true */}
      {showBottomNav && (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t"
          style={{
            borderColor: "rgba(74,18,89,0.07)",
            background: "rgba(245,239,224,0.97)",
            backdropFilter: "blur(24px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <div className="mx-auto flex h-24 max-w-2xl items-center justify-around px-6">
            {BOTTOM_NAV.map((n) => {
              const active =
                path === n.to ||
                (n.to !== "/dash" && path.startsWith(n.to));
              return (
                <Link
                  key={n.to}
                  to={n.to as any}
                  className="flex flex-col items-center gap-2 px-4 py-2 transition-all"
                >
                  <span
                    className="font-display text-[22px] tracking-[0.18em] transition-colors"
                    style={{
                      color: active ? "#E0249C" : "rgba(74,18,89,0.55)",
                    }}
                  >
                    {n.label}
                  </span>
                  {active && (
                    <div
                      className="h-[3px] w-8 rounded-full"
                      style={{
                        background: "linear-gradient(90deg, #E0249C, #c9a84c)",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-12">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-4 font-display text-6xl leading-[0.9] text-shimmer md:text-7xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-5 max-w-2xl font-serif text-xl font-light italic text-[#4A1259]/60">
          {subtitle}
        </p>
      )}
      <div className="hr-gold mt-8 h-px w-24" />
    </div>
  );
}

export function EdgeCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border border-[rgba(74,18,89,0.12)] bg-white/80 p-8 ${className}`}
    >
      {children}
    </div>
  );
}

// Alias so existing imports don't break
export const VelvetCard = EdgeCard;
