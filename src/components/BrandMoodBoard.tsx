import { useMemo, useState } from "react";

type Swatch = { name: string; hex: string };
type Img = { name: string; dataUrl: string };

function section(md: string, header: string): string {
  const esc = header.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`##\\s*${esc}[^\\n]*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, "i");
  const m = md.match(re);
  return m ? m[1].trim() : "";
}

function firstLine(s: string): string {
  const line = s.split("\n").map((l) => l.trim()).find(Boolean) ?? "";
  return line.replace(/^[-*•\d.]+\s*/, "").replace(/\*\*/g, "").trim();
}

function parseSwatches(md: string): Swatch[] {
  const body = section(md, "COLOR PALETTE");
  const source = body || md;
  const out: Swatch[] = [];
  const seen = new Set<string>();
  for (const raw of source.split("\n")) {
    const hexM = raw.match(/#[0-9a-fA-F]{6}\b/);
    if (!hexM) continue;
    const hex = hexM[0].toUpperCase();
    if (seen.has(hex)) continue;
    seen.add(hex);
    const before = raw.slice(0, hexM.index).replace(/[-*•>#]/g, "").replace(/\|/g, "").trim();
    const name = (before || "").split(/[:–—(]/)[0].trim() || "Color";
    out.push({ name, hex });
  }
  return out.slice(0, 8);
}

function parseKeywords(md: string): string[] {
  const body = section(md, "MOOD WORDS") || section(md, "KEYWORDS") || section(md, "BRAND ENERGY");
  if (!body) return [];
  return body
    .replace(/\n/g, ",")
    .split(/[,•|]/)
    .map((w) => w.replace(/^[-*\d.\s]+/, "").replace(/\*\*/g, "").trim())
    .filter((w) => w && w.length <= 28)
    .slice(0, 10);
}

function firstTwo(s: string): string {
  return s
    .split("\n")
    .map((l) => l.replace(/^[-*•]\s*/, "").replace(/\*\*/g, "").trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");
}

function isLight(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 155;
}

function darken(hex: string, amount = 0.35): string {
  const h = hex.replace("#", "");
  const r = Math.round(parseInt(h.slice(0, 2), 16) * (1 - amount));
  const g = Math.round(parseInt(h.slice(2, 4), 16) * (1 - amount));
  const b = Math.round(parseInt(h.slice(4, 6), 16) * (1 - amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

const DISPLAY_FONTS = [
  "Bebas Neue", "Big Shoulders Display", "Cinzel", "Bodoni Moda", "Anton",
  "Black Han Sans", "Alfa Slab One", "Teko", "Oswald",
];
const SERIF_FONTS = [
  "Cormorant Garamond", "EB Garamond", "Lora", "Libre Baskerville",
  "DM Serif Display", "Fraunces", "Literata", "Playfair Display",
  "Source Serif 4", "Crimson Pro", "Spectral", "Josefin Slab",
];
const ACCENT_FONTS = [
  "Montserrat", "Space Grotesk", "DM Mono", "Space Mono", "Raleway",
  "Jost", "Inter", "Josefin Sans", "Nunito", "Karla", "Poppins",
];

function extractFonts(typText: string): { display: string; serif: string; accent: string } {
  const t = typText.toLowerCase();
  const find = (list: string[]) => list.find((f) => t.includes(f.toLowerCase())) ?? list[0];

  const dispIdx = Math.max(t.indexOf("display"), t.indexOf("headline"), 0);
  const serifIdx = Math.max(t.indexOf("body"), t.indexOf("serif"), dispIdx + 1);
  const accentIdx = Math.max(t.indexOf("accent"), t.indexOf("eyebrow"), serifIdx + 1);

  const dispChunk = typText.slice(dispIdx, serifIdx + 50);
  const serifChunk = typText.slice(serifIdx, accentIdx + 50);
  const accentChunk = typText.slice(accentIdx);

  return {
    display: DISPLAY_FONTS.find((f) => dispChunk.toLowerCase().includes(f.toLowerCase())) ?? find(DISPLAY_FONTS),
    serif: SERIF_FONTS.find((f) => serifChunk.toLowerCase().includes(f.toLowerCase())) ?? find(SERIF_FONTS),
    accent: ACCENT_FONTS.find((f) => accentChunk.toLowerCase().includes(f.toLowerCase())) ?? find(ACCENT_FONTS),
  };
}

function googleFontsUrl(fonts: { display: string; serif: string; accent: string }): string {
  const families = [
    fonts.display.replace(/ /g, "+") + ":wght@400;700",
    fonts.serif.replace(/ /g, "+") + ":ital,wght@0,400;0,600;1,400",
    fonts.accent.replace(/ /g, "+") + ":wght@300;400;700",
  ];
  return `https://fonts.googleapis.com/css2?family=${families.join("&family=")}&display=swap`;
}

function PaletteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[#E0249C]">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
    </svg>
  );
}

export function BrandMoodBoard({ artifact, images }: { artifact: string; images: Img[] }) {
  const [downloading, setDownloading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const brandName = useMemo(
    () => firstLine(section(artifact, "BRAND NAME")),
    [artifact]
  );
  const vibe = useMemo(
    () => firstLine(section(artifact, "THE ONE-LINE VIBE")) || firstLine(section(artifact, "BRAND ESSENCE")),
    [artifact]
  );
  const essence = useMemo(() => section(artifact, "BRAND ESSENCE"), [artifact]);
  const metaphor = useMemo(() => firstLine(section(artifact, "BRAND METAPHOR")), [artifact]);
  const swatches = useMemo(() => parseSwatches(artifact), [artifact]);
  const typography = useMemo(() => section(artifact, "TYPOGRAPHY DIRECTION"), [artifact]);
  const textures = useMemo(() => section(artifact, "TEXTURES & MATERIALS"), [artifact]);
  const keywords = useMemo(() => parseKeywords(artifact), [artifact]);

  function richMoodBoardHtml(): string {
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    const palette = swatches;
    const fonts = extractFonts(typography);
    const fontsUrl = googleFontsUrl(fonts);

    const lightSwatches = palette.filter((s) => isLight(s.hex));
    const darkSwatches = palette.filter((s) => !isLight(s.hex));

    const bg = lightSwatches[0]?.hex || "#F5EFE0";
    const panel1 = darkSwatches[0]?.hex || "#4A1259";
    const panel2 = darkSwatches[1]?.hex || "#1F1623";
    const accent1 = palette[0]?.hex || "#E0249C";
    const accent2 = palette[1]?.hex || "#c9a84c";
    const accent3 = palette[2]?.hex || "#C084FC";

    const panelText = isLight(panel1) ? "#1A0F26" : "#F5EFE0";
    const panelSub = isLight(panel1) ? "rgba(26,15,38,0.65)" : "rgba(245,239,224,0.7)";
    const panelAccent = isLight(panel1) ? darken(accent1, 0.1) : accent2;

    const heroGrad = palette.length >= 3
      ? `linear-gradient(135deg, ${palette[0].hex} 0%, ${palette[1].hex} 40%, ${palette[2].hex} 70%, ${palette[Math.min(3, palette.length - 1)].hex} 100%)`
      : `linear-gradient(135deg, ${accent1} 0%, ${accent2} 100%)`;

    const cards = keywords.slice(0, 5);
    const cardSymbols = ["✦", "◆", "◇", "✿", "★"];
    const cardBgs = [
      `linear-gradient(135deg, ${accent1} 0%, ${darken(accent1, 0.2)} 100%)`,
      `linear-gradient(135deg, ${accent2} 0%, ${darken(accent2, 0.25)} 100%)`,
      `linear-gradient(160deg, ${bg} 0%, ${lightSwatches[1]?.hex || bg} 100%)`,
      `linear-gradient(135deg, ${accent3} 0%, ${darken(accent3, 0.2)} 100%)`,
      `linear-gradient(160deg, ${panel1} 0%, ${panel2} 100%)`,
    ];
    const cardTextColors = [
      isLight(accent1) ? "#1A0F26" : "#F5EFE0",
      isLight(accent2) ? "#1A0F26" : "#F5EFE0",
      "#1A0F26",
      isLight(accent3) ? "#1A0F26" : "#F5EFE0",
      isLight(panel1) ? "#1A0F26" : "#F5EFE0",
    ];

    const swatchHtml = palette
      .map(
        (s) => `
        <div class="swatch" style="background:${esc(s.hex)}">
          <div class="swatch-label">${esc(s.name)}<br/><span style="opacity:.7">${esc(s.hex)}</span></div>
        </div>`
      )
      .join("");

    const texItems = textures
      .split("\n")
      .map((l) => l.replace(/^[-*•]\s*/, "").replace(/\*\*/g, "").trim())
      .filter(Boolean)
      .slice(0, 4);
    while (texItems.length < 4) texItems.push("");
    const texBgs = [
      `linear-gradient(135deg, ${accent2} 0%, ${darken(accent2, 0.15)} 100%)`,
      `linear-gradient(135deg, ${bg} 0%, ${lightSwatches[1]?.hex || bg} 100%)`,
      `linear-gradient(135deg, ${accent1} 0%, ${darken(accent1, 0.25)} 100%)`,
      `linear-gradient(135deg, ${accent3} 0%, ${accent1} 100%)`,
    ];
    const texTextColors = [
      isLight(accent2) ? "#1A0F26" : "#F5EFE0",
      "#1A0F26",
      isLight(accent1) ? "#1A0F26" : "#F5EFE0",
      isLight(accent3) ? "#1A0F26" : "#F5EFE0",
    ];
    const texHtml = texItems
      .map(
        (t, i) => `<div class="tex-card" style="background:${texBgs[i]};color:${texTextColors[i]}">
          <span class="tex-sym">✦</span>
          <span class="tex-label">${esc(t.slice(0, 40))}</span>
        </div>`
      )
      .join("");

    const moodCardsHtml = cards
      .map(
        (word, i) => `
        <div class="mood-card${i === 0 ? " tall" : ""}" style="background:${cardBgs[i % cardBgs.length]}">
          <div class="card-tag" style="color:${cardTextColors[i % cardTextColors.length]};opacity:.6">${["Identity", "Aesthetic", "Energy", "Spirit", "Voice"][i]}</div>
          <div class="card-sym" style="color:${cardTextColors[i % cardTextColors.length]}">${cardSymbols[i % cardSymbols.length]}</div>
          <div class="card-word" style="color:${cardTextColors[i % cardTextColors.length]}">${esc(word.toUpperCase())}</div>
          ${essence ? `<div class="card-desc" style="color:${cardTextColors[i % cardTextColors.length]};opacity:.75">${esc(firstLine(essence).slice(0, 60))}</div>` : ""}
        </div>`
      )
      .join("");

    const imgHtml = images
      .slice(0, 9)
      .map(
        (im) => `<div class="ref-img"><img src="${im.dataUrl}" alt="${esc(im.name)}"/></div>`
      )
      .join("");

    const positioning = firstLine(section(artifact, "POSITIONING STATEMENT")) || firstTwo(essence);

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(brandName || vibe || "Brand Mood Board")}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Bebas+Neue&family=Montserrat:wght@300;400;700&display=swap" rel="stylesheet">
<link href="${esc(fontsUrl)}" rel="stylesheet">
<style>
:root{
  --bg:${bg};
  --ink:#1A0F26;
  --panel1:${panel1};
  --panel2:${panel2};
  --a1:${accent1};
  --a2:${accent2};
  --a3:${accent3};
  --ptext:${panelText};
  --psub:${panelSub};
  --pacc:${panelAccent};
  --font-display:'${fonts.display}','Bebas Neue',sans-serif;
  --font-serif:'${fonts.serif}','Cormorant Garamond',Georgia,serif;
  --font-accent:'${fonts.accent}','Montserrat',sans-serif;
}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:var(--font-serif);overflow-x:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact}

.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:80px 24px;text-align:center}
.hero-bg{position:absolute;inset:0;background:${heroGrad};background-size:300% 300%;animation:shift 10s ease infinite;z-index:0}
@keyframes shift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
.holo{position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.12) 0%,rgba(255,255,255,0.04) 30%,rgba(255,255,255,0.14) 60%,rgba(255,255,255,0.06) 100%);background-size:300% 300%;animation:shift 7s ease infinite;mix-blend-mode:screen;pointer-events:none;z-index:1}
.sparkles{position:absolute;inset:0;z-index:2;pointer-events:none}
.sparkle{position:absolute;border-radius:50%;animation:twinkle var(--dur,3s) ease-in-out infinite;animation-delay:var(--delay,0s)}
@keyframes twinkle{0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:.95;transform:scale(1.2)}}
.hero-content{position:relative;z-index:3;max-width:900px}
.hero-ey{font-family:var(--font-accent);font-size:10px;font-weight:700;letter-spacing:7px;text-transform:uppercase;color:var(--ptext);opacity:.75;margin-bottom:20px}
.hero-title{font-family:var(--font-display);font-size:clamp(64px,14vw,160px);line-height:.9;letter-spacing:.03em;color:var(--ptext);text-shadow:0 6px 32px rgba(0,0,0,0.3);animation:fadeUp 1s ease forwards .4s;opacity:0}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.hero-rule{width:160px;height:1px;background:linear-gradient(90deg,transparent,${panelText},transparent);margin:24px auto;opacity:.5}
.hero-sub{font-family:var(--font-serif);font-size:clamp(18px,2.5vw,28px);font-style:italic;color:var(--ptext);opacity:.85;margin-top:12px;animation:fadeUp .8s ease forwards .8s;opacity:0}
.hero-tag{font-family:var(--font-accent);font-size:9px;letter-spacing:5px;text-transform:uppercase;color:var(--ptext);opacity:.65;margin-top:20px;animation:fadeUp .8s ease forwards 1.1s}

.sec-lbl{font-family:var(--font-accent);font-size:9px;font-weight:700;letter-spacing:6px;text-transform:uppercase;color:var(--a1);margin-bottom:36px;display:flex;align-items:center;gap:14px}
.sec-lbl::before,.sec-lbl::after{content:'';flex:1;height:1px;background:rgba(0,0,0,0.12)}
.dark-lbl{color:var(--pacc)}
.dark-lbl::before,.dark-lbl::after{background:rgba(255,255,255,0.18)}

.palette-sec{padding:80px 40px;background:var(--bg)}
.palette-inner{max-width:1100px;margin:0 auto}
.swatches{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px}
.swatch{aspect-ratio:1;border-radius:3px;position:relative;overflow:hidden;cursor:pointer;transition:transform .3s;box-shadow:0 6px 20px rgba(0,0,0,0.15)}
.swatch:hover{transform:scale(1.04)}
.swatch-label{position:absolute;bottom:0;left:0;right:0;padding:7px 8px;background:rgba(0,0,0,0.7);color:#F5EFE0;font-family:var(--font-accent);font-size:8px;letter-spacing:1.5px;text-transform:uppercase;text-align:center;font-weight:700;line-height:1.5}

.type-sec{padding:80px 40px;background:var(--panel1)}
.type-inner{max-width:1100px;margin:0 auto}
.type-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.type-display{font-family:var(--font-display);font-size:clamp(60px,10vw,110px);line-height:.9;color:var(--ptext);text-shadow:0 4px 20px rgba(0,0,0,0.25)}
.type-serif-sample{font-family:var(--font-serif);font-size:36px;font-style:italic;font-weight:400;color:var(--ptext);line-height:1.2;margin-bottom:16px;opacity:.9}
.type-body-sample{font-family:var(--font-accent);font-size:10px;letter-spacing:4px;text-transform:uppercase;color:var(--pacc);line-height:2;font-weight:700}
.type-accent-sample{font-family:var(--font-serif);font-size:64px;font-style:italic;color:var(--ptext);line-height:1;margin-top:12px;opacity:.85}
.type-note{font-family:var(--font-accent);font-size:8px;letter-spacing:4px;text-transform:uppercase;color:var(--pacc);margin-top:8px;opacity:.8}

.imgs-sec{padding:80px 40px;background:var(--bg)}
.imgs-inner{max-width:1100px;margin:0 auto}
.imgs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.ref-img{aspect-ratio:1;overflow:hidden;border-radius:3px;border:1px solid rgba(0,0,0,0.08);box-shadow:0 8px 24px rgba(0,0,0,0.12)}
.ref-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s}
.ref-img:hover img{transform:scale(1.04)}

.mood-sec{padding:80px 40px;background:var(--bg)}
.mood-inner{max-width:1100px;margin:0 auto}
.mood-grid{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:auto;gap:16px}
.mood-card{border-radius:3px;overflow:hidden;position:relative;aspect-ratio:3/4;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 20px;text-align:center;transition:transform .4s;box-shadow:0 12px 36px rgba(0,0,0,0.22)}
.mood-card:hover{transform:scale(1.02)}
.mood-card.tall{grid-row:span 2;aspect-ratio:auto;min-height:480px}
.card-tag{position:absolute;top:14px;right:14px;font-family:var(--font-accent);font-size:8px;letter-spacing:3px;text-transform:uppercase;font-weight:700}
.card-sym{font-size:40px;margin-bottom:16px;animation:float 4s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.card-word{font-family:var(--font-display);font-size:44px;letter-spacing:.04em;line-height:1;margin-bottom:10px}
.card-desc{font-family:var(--font-serif);font-size:15px;font-style:italic;line-height:1.5}

.tex-sec{padding:80px 40px;background:var(--panel1)}
.tex-inner{max-width:1100px;margin:0 auto}
.tex-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.tex-card{height:130px;border-radius:3px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;box-shadow:0 6px 20px rgba(0,0,0,0.25)}
.tex-sym{font-size:18px}
.tex-label{font-family:var(--font-accent);font-size:8px;letter-spacing:3px;text-transform:uppercase;font-weight:700;text-align:center;padding:0 12px}

.statement-sec{padding:120px 40px;text-align:center;position:relative;overflow:hidden;background:${heroGrad};background-size:300% 300%;animation:shift 12s ease infinite}
.statement-inner{position:relative;z-index:1;max-width:800px;margin:0 auto}
.statement-quote{font-family:var(--font-serif);font-size:clamp(24px,4vw,48px);font-style:italic;color:var(--ptext);line-height:1.35;margin-bottom:36px;text-shadow:0 4px 20px rgba(0,0,0,0.35);opacity:.95}
.statement-brand{font-family:var(--font-display);font-size:clamp(36px,7vw,90px);letter-spacing:.12em;color:var(--ptext);text-shadow:0 8px 40px rgba(0,0,0,0.35)}

@media(max-width:768px){
  .swatches{grid-template-columns:repeat(3,1fr)}
  .type-grid{grid-template-columns:1fr}
  .mood-grid{grid-template-columns:1fr 1fr}
  .mood-card.tall{grid-row:span 1;min-height:280px}
  .imgs-grid{grid-template-columns:repeat(2,1fr)}
  .tex-row{grid-template-columns:repeat(2,1fr)}
  .palette-sec,.type-sec,.mood-sec,.tex-sec,.imgs-sec,.statement-sec{padding:60px 20px}
}
@media print{
  .hero{min-height:auto;padding:60px 20px}
  .hero-title{font-size:80px}
  .statement-sec{padding:80px 20px}
}
</style>
</head>
<body>

<section class="hero">
  <div class="hero-bg"></div>
  <div class="holo"></div>
  <div class="sparkles" id="sparkles"></div>
  <div class="hero-content">
    <div class="hero-ey">Brand Mood Board</div>
    <div class="hero-title">${esc((brandName || vibe || "YOUR BRAND").toUpperCase())}</div>
    <div class="hero-rule"></div>
    ${vibe ? `<div class="hero-sub">${esc(vibe)}</div>` : ""}
    ${metaphor ? `<div class="hero-tag" style="font-family:var(--font-serif);font-style:italic;font-size:14px;letter-spacing:.06em;text-transform:none">${esc(metaphor)}</div>` : (keywords.length ? `<div class="hero-tag">${keywords.slice(0, 5).map((k) => esc(k)).join(" · ")}</div>` : "")}
  </div>
</section>

${palette.length ? `
<section class="palette-sec">
  <div class="palette-inner">
    <div class="sec-lbl">Color Palette</div>
    <div class="swatches">${swatchHtml}</div>
  </div>
</section>` : ""}

<section class="type-sec">
  <div class="type-inner">
    <div class="sec-lbl dark-lbl">Typography</div>
    <div class="type-grid">
      <div>
        <div class="type-display">${esc((brandName || vibe || "BRAND").split(" ").slice(0, 2).join("\n").toUpperCase())}</div>
        <div class="type-note" style="color:var(--pacc);margin-top:12px">${esc(fonts.display)} · Display</div>
      </div>
      <div>
        <div class="type-serif-sample">${vibe ? esc(vibe.slice(0, 60)) : "Her work speaks before she does."}</div>
        <div class="type-body-sample">${esc(fonts.accent)} · Body &amp; Labels</div>
        <div class="type-accent-sample">${brandName ? esc(brandName.split(" ")[0]) : vibe ? esc(firstLine(vibe).split(" ")[0]) : "Rare."}</div>
        <div class="type-note" style="margin-top:8px;color:var(--pacc)">${esc(fonts.serif)} · Accent &amp; Quotes</div>
      </div>
    </div>
  </div>
</section>

${images.length ? `
<section class="imgs-sec">
  <div class="imgs-inner">
    <div class="sec-lbl">Reference Images</div>
    <div class="imgs-grid">${imgHtml}</div>
  </div>
</section>` : ""}

${cards.length ? `
<section class="mood-sec">
  <div class="mood-inner">
    <div class="sec-lbl">Brand Aesthetic</div>
    <div class="mood-grid">${moodCardsHtml}</div>
  </div>
</section>` : ""}

${texItems.some(Boolean) ? `
<section class="tex-sec">
  <div class="tex-inner">
    <div class="sec-lbl dark-lbl">Textures &amp; Finishes</div>
    <div class="tex-row">${texHtml}</div>
  </div>
</section>` : ""}

${positioning ? `
<section class="statement-sec">
  <div class="holo"></div>
  <div class="sparkles" id="sparkles2"></div>
  <div class="statement-inner">
    <div class="statement-quote">${esc(positioning)}</div>
    ${(brandName || vibe) ? `<div class="statement-brand">${esc((brandName || vibe).toUpperCase())}</div>` : ""}
  </div>
</section>` : ""}

<script>
(function(){
  const colors = ${JSON.stringify(palette.map((s) => s.hex).concat(["#FFFFFF"]))};
  ["sparkles","sparkles2"].forEach(function(id){
    const c = document.getElementById(id);
    if(!c) return;
    for(var i=0;i<50;i++){
      var s=document.createElement("div");
      var sz=Math.random()*3+1;
      s.className="sparkle";
      s.style.cssText="width:"+sz+"px;height:"+sz+"px;left:"+(Math.random()*100)+"%;top:"+(Math.random()*100)+"%;background:"+colors[Math.floor(Math.random()*colors.length)]+";box-shadow:0 0 "+(sz*3)+"px "+colors[Math.floor(Math.random()*colors.length)]+";--dur:"+(Math.random()*3+2)+"s;--delay:"+(Math.random()*4)+"s";
      c.appendChild(s);
    }
  });
})();
</script>
</body>
</html>`;
  }

  function openLive() {
    const url = URL.createObjectURL(new Blob([richMoodBoardHtml()], { type: "text/html" }));
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 300000);
  }

  function downloadHtml() {
    const slug = (brandName || vibe || "brand-mood-board").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    const url = URL.createObjectURL(new Blob([richMoodBoardHtml()], { type: "text/html" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-mood-board.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  async function downloadPng() {
    setDownloading(true);
    try {
      const W = 1200;
      const pad = 56;
      const colW = W - pad * 2;
      const loaded: HTMLImageElement[] = [];
      for (const im of images.slice(0, 12)) {
        const el = await new Promise<HTMLImageElement | null>((res) => {
          const img = new Image();
          img.onload = () => res(img);
          img.onerror = () => res(null);
          img.src = im.dataUrl;
        });
        if (el) loaded.push(el);
      }
      const perRow = 3;
      const gap = 16;
      const cell = (colW - gap * (perRow - 1)) / perRow;
      const rows = Math.ceil(loaded.length / perRow);
      const gridH = rows > 0 ? rows * cell + (rows - 1) * gap : 0;
      const swatchH = swatches.length ? 150 : 0;
      const headerH = 210;
      const H = pad + headerH + (gridH ? gridH + 40 : 0) + (swatchH ? swatchH + 20 : 0) + pad;
      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = W * scale;
      canvas.height = H * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(scale, scale);
      ctx.fillStyle = "#FBF7F0";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#E0249C";
      ctx.font = "600 13px Georgia, serif";
      ctx.fillText("MOOD BOARD", pad, pad + 6);
      ctx.fillStyle = "#1F1623";
      ctx.font = "700 40px Georgia, serif";
      wrapText(ctx, vibe || "Your Brand Mood Board", pad, pad + 52, colW, 46);
      if (metaphor) {
        ctx.fillStyle = "#4A1259";
        ctx.font = "italic 20px Georgia, serif";
        ctx.fillText(metaphor.slice(0, 90), pad, pad + 150);
      }
      let y = pad + headerH;
      if (loaded.length) {
        loaded.forEach((img, i) => {
          const r = Math.floor(i / perRow);
          const c = i % perRow;
          const x = pad + c * (cell + gap);
          const yy = y + r * (cell + gap);
          const ratio = Math.max(cell / img.width, cell / img.height);
          const dw = img.width * ratio;
          const dh = img.height * ratio;
          ctx.save();
          roundRect(ctx, x, yy, cell, cell, 10);
          ctx.clip();
          ctx.drawImage(img, x + (cell - dw) / 2, yy + (cell - dh) / 2, dw, dh);
          ctx.restore();
        });
        y += gridH + 40;
      }
      if (swatches.length) {
        const sw = (colW - gap * (swatches.length - 1)) / swatches.length;
        swatches.forEach((s, i) => {
          const x = pad + i * (sw + gap);
          roundRect(ctx, x, y, sw, 96, 10);
          ctx.fillStyle = s.hex;
          ctx.fill();
          ctx.fillStyle = "#1F1623";
          ctx.font = "600 13px Georgia, serif";
          ctx.fillText(s.name.slice(0, 16), x, y + 120);
          ctx.fillStyle = "#4A1259";
          ctx.font = "12px monospace";
          ctx.fillText(s.hex, x, y + 138);
        });
      }
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "brand-mood-board.png";
      a.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-[rgba(74,18,89,0.1)] bg-white/60 p-5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2.5">
        <PaletteIcon />
        <span className="font-mono text-[13px] uppercase tracking-[0.3em] text-[#4A1259]/40">Mood Board</span>
      </div>

      {/* Brand name */}
      <p className="font-serif text-[17px] font-semibold leading-snug text-[#1F1623]">
        {brandName || "Brand Mood Board"}
      </p>
      {vibe && (
        <p className="mt-1 font-serif text-[13px] italic leading-snug text-[#4A1259]/55">{vibe}</p>
      )}

      {/* Status */}
      <p className="mt-3 font-mono text-[13px] uppercase tracking-[0.25em] text-[#E0249C]">✦ Ready</p>

      {/* Action buttons */}
      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={openLive}
          className="rounded-full border border-[#E0249C]/40 bg-[rgba(224,36,156,0.08)] px-4 py-2 text-left font-mono text-[13px] uppercase tracking-[0.2em] text-[#E0249C] hover:bg-[rgba(224,36,156,0.16)] transition-colors"
        >
          ↗ Open
        </button>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="rounded-full border border-[rgba(74,18,89,0.18)] bg-white/60 px-4 py-2 text-left font-mono text-[13px] uppercase tracking-[0.2em] text-[#4A1259]/55 hover:border-[#E0249C]/30 hover:text-[#E0249C] transition-colors"
        >
          ↓ Download {expanded ? "▴" : "▾"}
        </button>
      </div>

      {expanded && (
        <div className="mt-2 flex flex-col gap-1.5 pl-1">
          <button
            onClick={downloadHtml}
            className="text-left font-mono text-[13px] uppercase tracking-[0.18em] text-[#4A1259]/50 hover:text-[#E0249C] transition-colors"
          >
            → HTML file
          </button>
          <button
            onClick={downloadPng}
            disabled={downloading}
            className="text-left font-mono text-[13px] uppercase tracking-[0.18em] text-[#4A1259]/50 hover:text-[#E0249C] transition-colors disabled:opacity-40"
          >
            {downloading ? "Building..." : "→ PNG image"}
          </button>
        </div>
      )}
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy);
      line = w;
      yy += lineH;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
}
