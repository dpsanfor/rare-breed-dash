import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";

const NAV = [
  { to: "/leap/", label: "OS" },
  { to: "/leap/installations/", label: "Installations" },
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
    <div className="surface-velvet min-h-screen text-foreground">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-[rgba(201,168,76,0.12)] bg-[rgba(10,10,10,0.85)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <Link to="/leap/" className="flex items-center gap-3 group">
            <div className="flex flex-col leading-none">
              <span className="font-display text-[22px] tracking-[0.14em] text-shimmer">
                RARE BREED
              </span>
              <span className="font-mono text-[8px] tracking-[0.5em] text-[rgba(201,168,76,0.5)] uppercase">
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
                  className={`text-[10px] uppercase tracking-[0.3em] transition-colors ${
                    active
                      ? "text-rb-champagne"
                      : "text-[rgba(240,223,160,0.4)] hover:text-rb-fuchsia"
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
        <p className="mt-5 max-w-2xl font-serif text-xl italic font-light text-[rgba(240,223,160,0.75)]">
          {subtitle}
        </p>
      )}
      <div className="hr-gold mt-8 h-px w-24" />
    </div>
  );
}

export function VelvetCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border border-[rgba(201,168,76,0.18)] bg-gradient-to-br from-[#150828] via-[#0e0518] to-[#0a0a0a] p-8 ${className}`}
    >
      {children}
    </div>
  );
}
