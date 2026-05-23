export function TextAreaField({ label, value, onChange, placeholder, rows = 12 }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink-700">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="min-h-[140px] w-full resize-y rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 shadow-sm outline-none transition placeholder:text-ink-400 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:min-h-0"
      />
    </label>
  );
}
