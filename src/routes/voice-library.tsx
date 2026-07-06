import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BrandShell } from "@/components/brand/BrandShell";
import { readProfile, saveArtifact, type UserProfile } from "@/lib/profile";

export const Route = createFileRoute("/voice-library")({
  head: () => ({
    meta: [{ title: "Your Voice Library · Rare Breed OS" }],
  }),
  component: VoiceLibraryPage,
});

type FieldKey =
  | "voice_emails"
  | "voice_social"
  | "voice_curriculum"
  | "voice_aspirational"
  | "voice_testimonials"
  | "voice_transcripts";

const FIELDS: {
  key: FieldKey;
  label: string;
  hint: string;
  placeholder: string;
}[] = [
  {
    key: "voice_emails",
    label: "Emails You're Proud Of",
    hint: "Newsletters, sales emails, personal notes. Paste as many as you like.",
    placeholder: "Paste full emails here, separated by a line or two...",
  },
  {
    key: "voice_social",
    label: "Social Posts You're Proud Of",
    hint: "Captions, threads, stories you actually wrote. The ones that felt like you.",
    placeholder: "Paste your posts here...",
  },
  {
    key: "voice_curriculum",
    label: "Your Own Curriculum & Training Writing",
    hint: "A lesson, a module, a worksheet, a framework you wrote. Your teaching voice.",
    placeholder: "Paste writing from your own programs or trainings...",
  },
  {
    key: "voice_aspirational",
    label: "Writers You Aspire To Write Like",
    hint: "A few posts or passages from others whose voice you're reaching toward. This is direction, not your voice, and it's labeled that way for the AI.",
    placeholder: "Paste writing from people whose voice you admire...",
  },
  {
    key: "voice_testimonials",
    label: "Testimonials & Client Words",
    hint: "Real testimonials in your clients' own words. For screenshots, see the note below.",
    placeholder: "Paste testimonial text here, one per line or block...",
  },
  {
    key: "voice_transcripts",
    label: "Transcripts From Your Trainings",
    hint: "Raw transcripts from recordings of your talks or trainings. Unpolished is best.",
    placeholder: "Paste transcripts here...",
  },
];

function VoiceLibraryPage() {
  const [profile, setProfile] = useState<UserProfile>({});
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [images, setImages] = useState<{ name: string; dataUrl: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = readProfile();
    setProfile(p);
    if (p.voice_images) {
      try {
        setImages(JSON.parse(p.voice_images));
      } catch {
        /* ignore malformed */
      }
    }
  }, []);

  function update(key: FieldKey, value: string) {
    setProfile((p) => ({ ...p, [key]: value }));
    saveArtifact(key, value);
    setSavedKey(key);
    window.clearTimeout((update as any)._t);
    (update as any)._t = window.setTimeout(() => setSavedKey(null), 1500);
  }

  function readAsText(file: File): Promise<string> {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result ?? ""));
      r.onerror = () => rej(r.error);
      r.readAsText(file);
    });
  }
  function readAsDataURL(file: File): Promise<string> {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result ?? ""));
      r.onerror = () => rej(r.error);
      r.readAsDataURL(file);
    });
  }

  async function handleFiles(files: FileList | File[]) {
    setUploadNote(null);
    const arr = Array.from(files);
    let docText = "";
    let nextImages = images;
    const skipped: string[] = [];
    for (const file of arr) {
      if (file.type.startsWith("image/")) {
        nextImages = [...nextImages, { name: file.name, dataUrl: await readAsDataURL(file) }];
      } else if (
        file.type.startsWith("text/") ||
        /\.(txt|md|markdown|csv|rtf|vtt|srt|log)$/i.test(file.name)
      ) {
        docText += `\n\n--- ${file.name} ---\n${await readAsText(file)}`;
      } else {
        skipped.push(file.name);
      }
    }
    if (docText) {
      const combined = ((profile.voice_documents ?? "") + docText).trim();
      setProfile((p) => ({ ...p, voice_documents: combined }));
      saveArtifact("voice_documents", combined);
    }
    if (nextImages !== images) {
      const json = JSON.stringify(nextImages);
      if (json.length > 4_000_000) {
        setUploadNote(
          "Those images are too large to store here. Add fewer or smaller screenshots, or paste the testimonial text instead."
        );
      } else {
        setImages(nextImages);
        saveArtifact("voice_images", json);
      }
    }
    if (skipped.length) {
      setUploadNote(
        `Added what I could. These aren't readable yet (open them and paste the text instead): ${skipped.join(", ")}`
      );
    }
  }

  function removeImage(idx: number) {
    const next = images.filter((_, i) => i !== idx);
    setImages(next);
    saveArtifact("voice_images", JSON.stringify(next));
  }

  return (
    <BrandShell hideStickyCta>
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 mt-4">
          <p
            className="font-mono text-[11px] uppercase tracking-[0.32em]"
            style={{ color: "rgba(224,36,156,0.85)" }}
          >
            Rare Breed OS™ · Your Voice
          </p>
          <h1
            className="font-display text-shimmer leading-[0.92] tracking-wide mt-4"
            style={{ fontSize: "clamp(40px, 9vw, 72px)" }}
          >
            Your Voice Library
          </h1>
          <p
            className="mt-5 max-w-2xl font-serif font-light italic text-[#4A1259]/80"
            style={{ fontSize: "clamp(18px, 2.6vw, 24px)" }}
          >
            The more of your real writing you add here, the more every Studio in Rare
            Breed OS sounds exactly like you. Add what you have now, and come back
            anytime to make it richer. It saves automatically.
          </p>
        </div>

        <div className="space-y-8">
          {FIELDS.map((f) => (
            <div
              key={f.key}
              className="rounded-2xl border border-[rgba(74,18,89,0.12)] bg-white/70 p-6 sm:p-8"
            >
              <div className="mb-1 flex items-baseline justify-between gap-4">
                <p className="font-display text-xl tracking-[0.04em] text-[#1F1623]">
                  {f.label}
                </p>
                {savedKey === f.key && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#c9a84c]">
                    ✦ Saved
                  </span>
                )}
              </div>
              <p className="mb-4 font-serif text-sm italic text-[#4A1259]/60">
                {f.hint}
              </p>
              <textarea
                value={(profile[f.key] as string | undefined) ?? ""}
                onChange={(e) => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                rows={6}
                className="w-full resize-y rounded-xl border border-[rgba(74,18,89,0.15)] bg-white/80 px-4 py-3 font-serif text-[15px] leading-relaxed text-[#1F1623] outline-none placeholder:text-[#4A1259]/30 focus:border-[#E0249C]/40"
              />
            </div>
          ))}
        </div>

        {/* Upload files / drag & drop */}
        <div className="mt-8">
          <p className="mb-2 font-display text-xl tracking-[0.04em] text-[#1F1623]">
            Add Files &amp; Testimonial Screenshots
          </p>
          <p className="mb-4 font-serif text-sm italic text-[#4A1259]/60">
            Drag files in, or open them from your computer. Documents and transcripts
            (.txt, .md, .csv) get read into your voice. Images (testimonial
            screenshots) get saved for your future sales pages.
          </p>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all"
            style={{
              borderColor: dragging ? "#E0249C" : "rgba(74,18,89,0.25)",
              background: dragging ? "rgba(224,36,156,0.06)" : "rgba(255,255,255,0.5)",
            }}
          >
            <p className="font-serif text-lg italic text-[#4A1259]/70">
              {dragging ? "Drop them here" : "Drag files here, or click to open files from your computer"}
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#4A1259]/40">
              Documents, transcripts, and testimonial screenshots
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,text/*,.txt,.md,.markdown,.csv,.rtf,.vtt,.srt,.log"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />

          {uploadNote && (
            <p className="mt-3 font-serif text-sm italic text-[#E0249C]/80">{uploadNote}</p>
          )}

          {images.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-xl border border-[rgba(74,18,89,0.15)] bg-white/70"
                >
                  <img
                    src={img.dataUrl}
                    alt={img.name}
                    className="h-40 w-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    Remove
                  </button>
                  <p className="truncate px-3 py-2 font-mono text-[10px] text-[#4A1259]/50">
                    {img.name}
                  </p>
                </div>
              ))}
            </div>
          )}

          {profile.voice_documents && (
            <div className="mt-6 rounded-2xl border border-[rgba(74,18,89,0.12)] bg-white/70 p-6">
              <p className="mb-3 font-display text-lg tracking-[0.04em] text-[#1F1623]">
                Text From Your Files
              </p>
              <textarea
                value={profile.voice_documents ?? ""}
                onChange={(e) => {
                  setProfile((p) => ({ ...p, voice_documents: e.target.value }));
                  saveArtifact("voice_documents", e.target.value);
                }}
                rows={8}
                className="w-full resize-y rounded-xl border border-[rgba(74,18,89,0.15)] bg-white/80 px-4 py-3 font-serif text-[14px] leading-relaxed text-[#1F1623] outline-none focus:border-[#E0249C]/40"
              />
            </div>
          )}
        </div>

        <div className="mt-10 mb-6 flex items-center justify-between gap-4">
          <Link
            to={"/dash" as any}
            className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#4A1259]/45 hover:text-[#E0249C]"
          >
            ← Back to Dashboard
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4A1259]/40">
            Everything here saves automatically
          </p>
        </div>
      </div>
    </BrandShell>
  );
}
