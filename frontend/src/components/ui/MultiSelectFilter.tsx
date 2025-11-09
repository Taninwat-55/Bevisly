import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export default function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // --- Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch(""); // clear search when closing
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Filtered options based on search
  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.toLowerCase().includes(search.toLowerCase().trim())
    );
  }, [options, search]);

  const toggleOption = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  const clearSelection = () => onChange([]);

  return (
    <div className="relative" ref={ref}>
      {/* --- Button --- */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)]"
      >
        <span className="truncate">
          {selected.length > 0
            ? `${label}: ${selected.slice(0, 2).join(", ")}${
                selected.length > 2 ? ` +${selected.length - 2}` : ""
              }`
            : `All ${label.toLowerCase()}`}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {/* --- Dropdown --- */}
      {open && (
        <div className="absolute left-0 right-0 z-20 mt-1 rounded-md border border-[color-mix(in srgb,var(--color-border) 90%,transparent)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)]">
            <Search size={14} className="text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm focus:outline-none text-[var(--color-text)] placeholder-[var(--color-text-muted)]"
            />
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto scroll-smooth">
            {filteredOptions.length === 0 && (
              <p className="p-3 text-sm text-[var(--color-text-muted)]">
                No matches
              </p>
            )}

            {filteredOptions.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[color-mix(in srgb,var(--color-text-muted) 5%,transparent)] cursor-pointer rounded-sm"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => toggleOption(opt)}
                  className="accent-[var(--color-employer-dark)] cursor-pointer"
                />
                <span className="truncate">{opt}</span>
              </label>
            ))}
          </div>

          {/* Footer (clear selection) */}
          {selected.length > 0 && (
            <div className="flex justify-end border-t border-[var(--color-border)] bg-[var(--color-surface)] p-2">
              <button
                onClick={clearSelection}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
