import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";

const NAV = [
  { to: "/leap/", label: "OS" },
  { to: "/leap/installations/", label: "Installations" },
  { to: "/leap/constitution", label: "Constitution" },
  { to: "/leap/decision-filter", label: "Decision Filter" },
  { to: "/leap/weekly-audit", label: "Audit" },
  { to: "/leap/os", label: "Dashboard" },
  { to: "/leap/updates", label: "Updates" },
];

export function BrandShell({
  children,
  hideStickyCta = false,
}: {
  children: ReactNode;
  hideStickyCta?: boolean;
}) {
  const { location } = useRouterState();
  const path = location.pathname;

  return (
    <div className="surface-bone min-h-screen text-foreground">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-[rgba(74,18,89,0.1)] bg-[rgba(245,239,224,0.92)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <Link to="/leap/" className="group flex items-center gap-3">
            <div className="flex flex-col leading-none">
              <span className="font-display text-[22px] tracking-[0.14em] text-shimmer">
                RARE BREED
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[rgba(74,18,89,0.4)]">
                OS™ · 10X Leap
              </span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden items-center gap-6 sm:flex">
            {NAV.map((n) => {
              const active =
                n.to === "/leap/"
                  ? path === "/leap/" || path === "/leap"
                  : path.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`text-[13px] uppercase tracking-[0.2em] transition-colors ${
                    active
                      ? "text-[#E0249C]"
                      : "text-[rgba(74,18,89,0.45)] hover:text-[#E0249C]"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-40 pt-12">{children}</main>
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
