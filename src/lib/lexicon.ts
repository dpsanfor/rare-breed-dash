// Dana Hayes brand lexicon — these terms are non-negotiable.
// Used everywhere in copy. See PRD Section 2.

export const SECTIONS = [
  {
    slug: "sexy-unicorn-offer",
    title: "Sexy Unicorn Offer",
    blurb: "Your core premium offer. The one every gumdrop trail leads to.",
    flavor: "fuchsia",
  },
  {
    slug: "magic-gumdrop",
    title: "Magic Gumdrop",
    blurb: "The 10x positioning. The X-factor that makes unicorns drool.",
    flavor: "iridescent",
  },
  {
    slug: "brand-unicorn",
    title: "Brand Unicorn",
    blurb: "The overarching unicorn you're calling in across all your work.",
    flavor: "amethyst",
  },
  {
    slug: "rainbow-roads",
    title: "Rainbow Roads",
    blurb: "Your proprietary frameworks. The pads you teach inside the offer.",
    flavor: "gold",
  },
  {
    slug: "metamorphosis",
    title: "Metamorphosis",
    blurb: "The becoming. You don't get what you want — you get what you become.",
    flavor: "violet",
  },
  {
    slug: "gumdrop-trails",
    title: "Saved Gumdrop Trails",
    blurb: "Every trail you've dropped. Pull one back when the season shifts.",
    flavor: "champagne",
  },
] as const;

export type SectionSlug = (typeof SECTIONS)[number]["slug"];

export const WIZARD_STEPS = [
  { n: 1, title: "Anchor", sub: "Which Sexy Unicorn Offer does this lead to?" },
  { n: 2, title: "Aligned Avatar & Tagline", sub: "Who is this trail for? Let's build her together." },
  { n: 3, title: "Rainbow Road", sub: "The framework she'll move through." },
  { n: 4, title: "Wireframe Sales Page", sub: "9-section structure with copy." },
  { n: 5, title: "Landing Page", sub: "Optional, for ad-driven funnels." },
  { n: 6, title: "Welcome Email", sub: "Onboarding email for buyers." },
  { n: 7, title: "Launch Plan", sub: "7–14 day content calendar." },
];
