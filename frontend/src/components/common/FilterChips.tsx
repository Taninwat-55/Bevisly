import { X } from "lucide-react";

interface FilterChipsProps {
  query?: string;
  paidOnly: boolean;
  remoteOnly: boolean;
  companies: string[];
  locations: string[];
  categories: string[];
  onRemove: (type: string, value?: string) => void;
  onClearAll: () => void;
}

export default function FilterChips({
  query,
  paidOnly,
  remoteOnly,
  companies,
  locations,
  categories,
  onRemove,
  onClearAll,
}: FilterChipsProps) {
  const chips: { type: string; label: string; value?: string }[] = [];

  if (query) chips.push({ type: "query", label: `Search: “${query}”` });
  if (paidOnly) chips.push({ type: "paidOnly", label: "Paid only" });
  if (remoteOnly) chips.push({ type: "remoteOnly", label: "Remote" });
  companies.forEach((c) => chips.push({ type: "company", label: c, value: c }));
  locations.forEach((l) =>
    chips.push({ type: "location", label: l, value: l })
  );
  categories.forEach((cat) =>
    chips.push({ type: "category", label: cat, value: cat })
  );

  if (chips.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((chip, i) => (
        <button
          key={i}
          onClick={() => onRemove(chip.type, chip.value)}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[color-mix(in srgb,var(--color-text-muted) 60%,transparent)] focus:ring-1 focus:ring-[var(--color-candidate-dark)] transition"
        >
          {chip.label}
          <X size={12} />
        </button>
      ))}

      {chips.length > 1 && (
        <button
          onClick={onClearAll}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-error)] hover:text-white hover:bg-[var(--color-error)] transition"
        >
          Clear all
          <X size={12} />
        </button>
      )}
    </div>
  );
}
