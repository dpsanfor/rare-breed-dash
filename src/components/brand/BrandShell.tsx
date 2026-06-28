import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";

const NAV = [
  { to: "/", label: "Macro Hub" },
  { to: "/leap/", label: "10X Leap" },
  { to: "/test-kitchen", label: "Test Kitchen" },
  { to: "/settings", label: "Settings" },
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
      <header className="sticky top-0 z-40 border-b border-[rgba(201,168,76,0.15)] bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="font-display text-2xl tracking-[0.12em] text-shimmer">
              RARE BREED
            </span>
            <span className="hidden text-[10px] font-serif italic text-[rgba(240,223,160,0.55)] sm:inline">
              the dashboard
            </span>
          </Link>
          <nav className="flex items-center gap-7">
            {NAV.map((n) => {
              const active =
                n.to === "/" ? path === "/" : path.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`text-[11px] uppercase tracking-[0.25em] transition-colors ${
                    active
                      ? "text-rb-champagne"
                      : "text-[rgba(240,223,160,0.5)] hover:text-rb-fuchsia"
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

      {!hideStickyCta && <StickyCta />}
    </div>
  );
}

function StickyCta() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center px-6">
      <Link
        to="/test-kitchen"
        className="pointer-events-auto group relative inline-flex items-center gap-3 rounded-full px-7 py-4 transition-transform hover:-translate-y-0.5 active:scale-95"
        style={{
          background:
            "linear-gradient(135deg, #d946ef 0%, #ec4899 50%, #c9a84c 100%)",
          boxShadow:
            "0 10px 40px -10px rgba(217,70,239,0.5), 0 0 0 1px rgba(240,223,160,0.3) inset",
        }}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/30 text-rb-champagne">
          +
        </span>
        <span className="font-display text-[15px] tracking-[0.18em] text-rb-black">
          Drop a New Gumdrop Trail
        </span>
      </Link>
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
