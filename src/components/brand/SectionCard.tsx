import { Link } from "@tanstack/react-router";

const FLAVOR_STYLES: Record<
  string,
  { dot: string; ring: string; glow: string }
> = {
  fuchsia: {
    dot: "bg-rb-fuchsia",
    ring: "hover:border-rb-fuchsia/40",
    glow: "from-rb-fuchsia/20",
  },
  iridescent: {
    dot: "bg-iridescent",
    ring: "hover:border-rb-iridescent/50",
    glow: "from-rb-iridescent/25",
  },
  amethyst: {
    dot: "bg-rb-amethyst",
    ring: "hover:border-rb-amethyst/50",
    glow: "from-rb-amethyst/20",
  },
  gold: {
    dot: "bg-rb-gold",
    ring: "hover:border-rb-gold/50",
    glow: "from-rb-gold/20",
  },
  violet: {
    dot: "bg-rb-violet",
    ring: "hover:border-rb-violet/60",
    glow: "from-rb-violet/30",
  },
  champagne: {
    dot: "bg-rb-champagne",
    ring: "hover:border-rb-champagne/40",
    glow: "from-rb-champagne/15",
  },
};

export function SectionCard({
  slug,
  title,
  blurb,
  status,
  preview,
  flavor,
  prominent = false,
}: {
  slug: string;
  title: string;
  blurb: string;
  status: string;
  preview?: string | null;
  flavor: string;
  prominent?: boolean;
}) {
  const f = FLAVOR_STYLES[flavor] ?? FLAVOR_STYLES.fuchsia;
  return (
    <Link
      to={`/${slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-[rgba(201,168,76,0.18)] bg-gradient-to-br from-[#150828] via-[#0e0518] to-[#0a0a0a] p-7 transition-all duration-500 hover:-translate-y-0.5 ${f.ring} ${
        prominent ? "md:col-span-1 md:row-span-1" : ""
      }`}
    >
      {/* glow */}
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-radial blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-70 bg-gradient-to-br ${f.glow} to-transparent`}
      />

      <div className="mb-5 flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${f.dot}`} />
        <span className="label-soft">{status}</span>
      </div>

      <h3 className="font-display text-3xl tracking-wider text-shimmer">
        {title}
      </h3>

      <p className="mt-2 max-w-[36ch] font-serif text-base italic font-light leading-snug text-[rgba(240,223,160,0.6)]">
        {blurb}
      </p>

      {preview && (
        <p className="mt-5 line-clamp-3 text-[13px] leading-relaxed text-[rgba(250,247,255,0.65)]">
          {preview}
        </p>
      )}

      <div className="mt-auto flex items-center gap-2 pt-7">
        <span className="eyebrow !text-rb-fuchsia">Open</span>
        <span className="text-rb-fuchsia transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}
