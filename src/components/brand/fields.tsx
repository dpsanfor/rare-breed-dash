// Shared form fields (moved here from the retired sexy-unicorn-offer route).

export function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-[rgba(201,168,76,0.25)] bg-black/40 px-4 py-3 font-serif text-lg text-rb-champagne placeholder:font-sans placeholder:text-sm placeholder:font-light placeholder:text-[rgba(240,223,160,0.3)] focus:border-rb-fuchsia focus:outline-none"
    />
  );
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-lg border border-[rgba(201,168,76,0.25)] bg-black/40 px-4 py-3 font-serif text-lg leading-relaxed text-rb-champagne placeholder:font-sans placeholder:text-sm placeholder:font-light placeholder:text-[rgba(240,223,160,0.3)] focus:border-rb-fuchsia focus:outline-none"
    />
  );
}
