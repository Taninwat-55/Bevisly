/**
 * 
 * A lightweight text editor with markdown shortcuts.
 */
import { Bold, Italic, List, Heading1, Link as LinkIcon, Quote } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  rows?: number;
  error?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
  label,
  rows = 6,
  error,
}: MarkdownEditorProps) {
  const insertFormat = (symbol: string, mode: "wrap" | "block" | "link" = "wrap") => {
    // Unique ID for this instance based on label
    const id = `md-editor-${label?.replace(/\s+/g, "-") || "default"}`;
    const textarea = document.getElementById(id) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let newText = "";
    let newCursorPos = 0;

    if (mode === "wrap") {
      newText = text.substring(0, start) + symbol + selected + symbol + text.substring(end);
      newCursorPos = start + symbol.length + selected.length + symbol.length; 
      if (!selected) newCursorPos = start + symbol.length; 
    } else if (mode === "block") {
      newText = text.substring(0, start) + symbol + " " + selected + text.substring(end);
      newCursorPos = start + symbol.length + 1 + selected.length;
    } else if (mode === "link") {
      newText = text.substring(0, start) + `[${selected || "text"}](url)` + text.substring(end);
      newCursorPos = start + (selected ? selected.length + 3 : 6); 
    }

    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-[var(--color-text)]">{label}</label>}
      
      <div className={`border rounded-[var(--radius-input)] bg-[var(--color-bg)] overflow-hidden transition-all focus-within:ring-2 focus-within:ring-[var(--color-employer)] ${error ? "border-[var(--color-error)]" : "border-[var(--color-border)]"}`}>
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-1.5 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <ToolbarBtn onClick={() => insertFormat("**")} icon={<Bold size={15} />} title="Bold" />
          <ToolbarBtn onClick={() => insertFormat("_")} icon={<Italic size={15} />} title="Italic" />
          <div className="w-px h-4 bg-[var(--color-border)] mx-1" />
          <ToolbarBtn onClick={() => insertFormat("-", "block")} icon={<List size={15} />} title="List" />
          <ToolbarBtn onClick={() => insertFormat("##", "block")} icon={<Heading1 size={15} />} title="Heading" />
          <ToolbarBtn onClick={() => insertFormat("> ", "block")} icon={<Quote size={15} />} title="Quote" />
          <div className="w-px h-4 bg-[var(--color-border)] mx-1" />
          <ToolbarBtn onClick={() => insertFormat("", "link")} icon={<LinkIcon size={15} />} title="Link" />
        </div>

        <textarea
          id={`md-editor-${label?.replace(/\s+/g, "-") || "default"}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full p-3 bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none resize-y block text-sm leading-relaxed font-sans"
        />
      </div>
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
}

function ToolbarBtn({ onClick, icon, title }: { onClick: () => void; icon: React.ReactNode; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
      title={title}
    >
      {icon}
    </button>
  );
}