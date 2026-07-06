import { useState, type ReactNode } from "react";
import { generatePhotoshootOutfits, generatePhotoshootShotList } from "@/lib/anthropic";
import { saveArtifact, readProfile } from "@/lib/profile";

type Doc = { text: string; savedAt: string };

function downloadDoc(text: string, title: string, slug: string) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@300;400;700&display=swap" rel="stylesheet">
<style>
:root{--ink:#1F1623;--purple:#4A1259;--magenta:#E0249C;--cream:#F9F5EF;--gold:#c9a84c}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--cream);color:var(--ink);font-family:'Cormorant Garamond',Georgia,serif;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.cover{background:linear-gradient(135deg,var(--purple) 0%,var(--magenta) 60%,var(--gold) 100%);padding:80px 60px;color:#F9F5EF;min-height:260px;display:flex;flex-direction:column;justify-content:flex-end}
.cover-ey{font-family:'Montserrat',sans-serif;font-size:10px;font-weight:700;letter-spacing:6px;text-transform:uppercase;opacity:.75;margin-bottom:16px}
.cover-title{font-size:clamp(36px,6vw,64px);font-weight:600;line-height:1.05;letter-spacing:.01em}
.cover-date{font-family:'Montserrat',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-top:16px;opacity:.6}
.body{max-width:780px;margin:0 auto;padding:60px 40px 120px}
h2{font-size:clamp(28px,4vw,40px);font-weight:600;margin:56px 0 20px;padding-bottom:12px;border-bottom:1px solid rgba(74,18,89,.15)}
h2:first-child{margin-top:0}
h3{font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:var(--magenta);margin:36px 0 14px}
h4{font-size:22px;font-weight:600;margin:28px 0 10px;color:var(--purple)}
p{font-size:17px;line-height:1.75;margin-bottom:12px;color:rgba(31,22,35,.82)}
strong{font-weight:600;color:var(--ink)}
em{font-style:italic}
ul{margin:8px 0 16px 20px}
li{font-size:17px;line-height:1.7;margin-bottom:6px;color:rgba(31,22,35,.82)}
li::marker{color:var(--magenta)}
.checkbox{list-style:none;margin-left:0}
.checkbox li::before{content:"☐ ";color:var(--purple);font-size:14px}
hr{border:none;border-top:1px solid rgba(74,18,89,.12);margin:40px 0}
@media print{.cover{min-height:200px;padding:60px 40px}h2{page-break-before:auto}li,p{page-break-inside:avoid}}
</style>
</head>
<body>
<div class="cover">
  <div class="cover-ey">Rare Breed™ Brand Studio</div>
  <div class="cover-title">${title}</div>
  <div class="cover-date">Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
</div>
<div class="body">
${renderMarkdownToHtml(text)}
</div>
</body>
</html>`;
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug}.html`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function renderMarkdownToHtml(md: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const lines = md.split("\n");
  const out: string[] = [];
  let inList = false;
  let listClass = "";

  function closeList() {
    if (inList) { out.push("</ul>"); inList = false; listClass = ""; }
  }

  for (const raw of lines) {
    const l = raw.trim();
    if (!l) { closeList(); out.push(""); continue; }

    if (l.startsWith("## ")) { closeList(); out.push(`<h2>${esc(l.slice(3))}</h2>`); continue; }
    if (l.startsWith("### ")) { closeList(); out.push(`<h3>${esc(l.slice(4))}</h3>`); continue; }
    if (l.startsWith("#### ")) { closeList(); out.push(`<h4>${esc(l.slice(5))}</h4>`); continue; }
    if (l === "---") { closeList(); out.push("<hr/>"); continue; }

    const isCheckbox = l.startsWith("- [ ]") || l.startsWith("- [x]") || l.startsWith("- [X]");
    const isBullet = l.match(/^[-*•]\s/);

    if (isCheckbox || isBullet) {
      const cls = isCheckbox ? "checkbox" : "";
      if (!inList || listClass !== cls) {
        closeList();
        out.push(`<ul${cls ? ` class="${cls}"` : ""}>`);
        inList = true;
        listClass = cls;
      }
      const content = isCheckbox
        ? l.replace(/^- \[[ xX]\]\s*/, "")
        : l.replace(/^[-*•]\s*/, "");
      out.push(`<li>${inlineFormat(esc(content))}</li>`);
      continue;
    }

    closeList();
    out.push(`<p>${inlineFormat(esc(l))}</p>`);
  }
  closeList();
  return out.join("\n");
}

function inlineFormat(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

// ─── ICONS ───────────────────────────────────────────────────────────────────

function HangerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[#E0249C]">
      <path d="M20.38 18H3.62a1 1 0 0 1-.7-1.7L12 8"/>
      <path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
      <path d="M12 8v2.5"/>
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[#E0249C]">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
  );
}

// ─── ASSET CARD ──────────────────────────────────────────────────────────────

type AssetCardProps = {
  label: string;
  title: string;
  icon: ReactNode;
  docKey: "brand_photoshoot_outfits" | "brand_photoshoot_shotlist";
  doc: Doc | null;
  generating: boolean;
  onGenerate: (notes: string) => Promise<void>;
  downloadSlug: string;
  downloadTitle: string;
  hint: string;
};

function AssetCard({
  label,
  title,
  icon,
  docKey,
  doc,
  generating,
  onGenerate,
  downloadSlug,
  downloadTitle,
  hint,
}: AssetCardProps) {
  const [notes, setNotes] = useState("");
  const [showRefine, setShowRefine] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(doc?.text ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleGenerate() {
    setSubmitting(true);
    try {
      await onGenerate(notes);
      setNotes("");
      setShowRefine(false);
    } finally {
      setSubmitting(false);
    }
  }

  const currentText = doc?.text ?? "";
  const isWorking = submitting || (generating && !submitting);

  return (
    <div className="flex flex-col rounded-2xl border border-[rgba(74,18,89,0.1)] bg-white/60 p-5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2.5">
        {icon}
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#4A1259]/40">{label}</span>
      </div>

      {/* Title */}
      <p className="font-serif text-[17px] font-semibold leading-snug text-[#1F1623]">{title}</p>

      {/* Status */}
      <p className={`mt-3 font-mono text-[9px] uppercase tracking-[0.25em] ${doc ? "text-[#E0249C]" : "text-[#4A1259]/30"}`}>
        {doc ? "✦ Saved" : "Not yet generated"}
      </p>

      {/* Working state */}
      {isWorking && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className="h-1 w-1 animate-bounce rounded-full bg-[#E0249C]/60" style={{ animationDelay: "0ms" }} />
          <span className="h-1 w-1 animate-bounce rounded-full bg-[#E0249C]/60" style={{ animationDelay: "150ms" }} />
          <span className="h-1 w-1 animate-bounce rounded-full bg-[#E0249C]/60" style={{ animationDelay: "300ms" }} />
          <span className="ml-1 font-serif text-[12px] italic text-[#4A1259]/50">Generating...</span>
        </div>
      )}

      {/* Generate state (no doc yet) */}
      {!doc && !isWorking && (
        <div className="mt-4 flex flex-col gap-2">
          <p className="font-serif text-[12px] italic leading-snug text-[#4A1259]/50">{hint}</p>
          <button
            onClick={() => handleGenerate()}
            disabled={submitting}
            className="mt-1 rounded-full border border-[#E0249C]/40 bg-[rgba(224,36,156,0.08)] px-4 py-2 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-[#E0249C] hover:bg-[rgba(224,36,156,0.16)] transition-colors disabled:opacity-40"
          >
            Generate →
          </button>
        </div>
      )}

      {/* Saved state */}
      {doc && !isWorking && (
        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={() => { setEditing((v) => !v); setEditText(currentText); }}
            className="rounded-full border border-[rgba(74,18,89,0.18)] bg-white/60 px-4 py-2 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-[#4A1259]/55 hover:border-[#E0249C]/30 hover:text-[#E0249C] transition-colors"
          >
            {editing ? "Close editor" : "Open / edit"}
          </button>
          <button
            onClick={() => downloadDoc(currentText, downloadTitle, downloadSlug)}
            className="rounded-full border border-[#E0249C]/40 bg-[rgba(224,36,156,0.08)] px-4 py-2 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-[#E0249C] hover:bg-[rgba(224,36,156,0.16)] transition-colors"
          >
            ↓ Download
          </button>
          <button
            onClick={() => setShowRefine((v) => !v)}
            className="rounded-full border border-[rgba(74,18,89,0.18)] bg-white/60 px-4 py-2 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-[#4A1259]/55 hover:border-[#E0249C]/30 hover:text-[#E0249C] transition-colors"
          >
            {showRefine ? "Cancel" : "Update with my finds"}
          </button>

          {editing && (
            <div className="mt-1">
              <textarea
                value={editText}
                onChange={(e) => {
                  setEditText(e.target.value);
                  saveArtifact(docKey, e.target.value);
                }}
                rows={12}
                className="w-full resize-y rounded-xl border border-[rgba(74,18,89,0.15)] bg-white/80 px-4 py-3 font-serif text-[14px] leading-relaxed text-[#1F1623] outline-none focus:border-[#E0249C]/40"
              />
              <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.2em] text-[#4A1259]/30">Edits save automatically</p>
            </div>
          )}

          {showRefine && (
            <div className="mt-1 rounded-xl border border-[rgba(74,18,89,0.1)] bg-[rgba(74,18,89,0.03)] p-4">
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#4A1259]/45">
                Tell us what you actually found
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. I found a cream silk blouse from Zara and vintage gold hoops..."
                rows={3}
                className="mb-3 w-full resize-none rounded-lg border border-[rgba(74,18,89,0.15)] bg-white px-3 py-2.5 font-serif text-[14px] leading-relaxed text-[#1F1623] outline-none placeholder:text-[#4A1259]/30 focus:border-[#E0249C]/40"
              />
              <button
                onClick={() => handleGenerate()}
                disabled={!notes.trim() || submitting}
                className="rounded-full border border-[#E0249C]/40 bg-[rgba(224,36,156,0.08)] px-4 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#E0249C] hover:bg-[rgba(224,36,156,0.16)] disabled:opacity-40"
              >
                {submitting ? "Updating..." : "Regenerate →"}
              </button>
            </div>
          )}

          <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.18em] text-[#4A1259]/25">
            Saved · {doc.savedAt}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function BrandPhotoshoot({ brandArtifact }: { brandArtifact: string }) {
  const p = readProfile();
  const [outfitDoc, setOutfitDoc] = useState<Doc | null>(
    p.brand_photoshoot_outfits
      ? { text: p.brand_photoshoot_outfits, savedAt: "previously" }
      : null
  );
  const [shotDoc, setShotDoc] = useState<Doc | null>(
    p.brand_photoshoot_shotlist
      ? { text: p.brand_photoshoot_shotlist, savedAt: "previously" }
      : null
  );
  const [generatingOutfits, setGeneratingOutfits] = useState(false);
  const [generatingShots, setGeneratingShots] = useState(false);

  async function handleGenerateOutfits(notes: string) {
    setGeneratingOutfits(true);
    try {
      const result = await generatePhotoshootOutfits({
        data: { brandArtifact, refinementNotes: notes || undefined },
      });
      const ts = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      saveArtifact("brand_photoshoot_outfits", result);
      setOutfitDoc({ text: result, savedAt: ts });
    } finally {
      setGeneratingOutfits(false);
    }
  }

  async function handleGenerateShots(notes: string) {
    setGeneratingShots(true);
    try {
      const result = await generatePhotoshootShotList({
        data: {
          brandArtifact,
          outfitRundown: outfitDoc?.text,
          refinementNotes: notes || undefined,
        },
      });
      const ts = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      saveArtifact("brand_photoshoot_shotlist", result);
      setShotDoc({ text: result, savedAt: ts });
    } finally {
      setGeneratingShots(false);
    }
  }

  return (
    <>
      <AssetCard
        label="Photoshoot"
        title="Outfit Rundown"
        icon={<HangerIcon />}
        docKey="brand_photoshoot_outfits"
        doc={outfitDoc}
        generating={generatingOutfits}
        onGenerate={handleGenerateOutfits}
        downloadSlug="brand-photoshoot-outfit-rundown"
        downloadTitle="Photoshoot Outfit Rundown"
        hint="4 complete outfits with pieces to buy, where to shop, and styling notes — built from your brand direction."
      />
      <AssetCard
        label="Photoshoot"
        title="Shot List"
        icon={<CameraIcon />}
        docKey="brand_photoshoot_shotlist"
        doc={shotDoc}
        generating={generatingShots}
        onGenerate={handleGenerateShots}
        downloadSlug="brand-photoshoot-shot-list"
        downloadTitle="Photographer Shot List"
        hint="A complete shot list for your photographer — locations, setups, must-have shots, and prop list. Generate your Outfit Rundown first for best results."
      />
    </>
  );
}
