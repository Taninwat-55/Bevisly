import { useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import DOMPurify from "dompurify";
import {
  Bold, Italic, Strikethrough,
  List, ListOrdered, Code,
  Eye, Pencil,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minHeight?: string;
  monoFont?: boolean;
  className?: string;
}

function wrapSelection(
  el: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder: string,
  onChange: (v: string) => void
) {
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = el.value.slice(start, end) || placeholder;
  const next =
    el.value.slice(0, start) + before + selected + after + el.value.slice(end);
  onChange(next);
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(
      start + before.length,
      start + before.length + selected.length
    );
  });
}

function prefixLine(
  el: HTMLTextAreaElement,
  prefix: string,
  onChange: (v: string) => void
) {
  const pos = el.selectionStart;
  const lineStart = el.value.lastIndexOf("\n", pos - 1) + 1;
  const next =
    el.value.slice(0, lineStart) + prefix + el.value.slice(lineStart);
  onChange(next);
  requestAnimationFrame(() => {
    el.focus();
    const cursor = lineStart + prefix.length;
    el.setSelectionRange(cursor, cursor);
  });
}

export default function MarkdownEditorIDE({
  value,
  onChange,
  disabled = false,
  placeholder = "Write your response here…",
  minHeight = "12rem",
  monoFont = false,
  className = "",
}: Props) {
  const [preview, setPreview] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const exec = useCallback(
    (fn: (el: HTMLTextAreaElement) => void) => {
      if (disabled || !ref.current) return;
      fn(ref.current);
    },
    [disabled]
  );

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!e.ctrlKey && !e.metaKey) return;
    if (e.key === "b") {
      e.preventDefault();
      exec((el) => wrapSelection(el, "**", "**", "bold text", onChange));
    } else if (e.key === "i") {
      e.preventDefault();
      exec((el) => wrapSelection(el, "*", "*", "italic text", onChange));
    }
  }

  const tools: (
    | { icon: React.ComponentType<{ size?: number }>; title: string; action: () => void }
    | { divider: true }
  )[] = [
    {
      icon: Bold,
      title: "Bold (Ctrl+B)",
      action: () => exec((el) => wrapSelection(el, "**", "**", "bold text", onChange)),
    },
    {
      icon: Italic,
      title: "Italic (Ctrl+I)",
      action: () => exec((el) => wrapSelection(el, "*", "*", "italic text", onChange)),
    },
    {
      icon: Strikethrough,
      title: "Strikethrough",
      action: () => exec((el) => wrapSelection(el, "~~", "~~", "text", onChange)),
    },
    { divider: true },
    {
      icon: List,
      title: "Bullet list",
      action: () => exec((el) => prefixLine(el, "- ", onChange)),
    },
    {
      icon: ListOrdered,
      title: "Numbered list",
      action: () => exec((el) => prefixLine(el, "1. ", onChange)),
    },
    { divider: true },
    {
      icon: Code,
      title: "Inline code",
      action: () => exec((el) => wrapSelection(el, "`", "`", "code", onChange)),
    },
  ];

  return (
    <div
      className={`flex flex-col min-w-0 rounded border border-[#3e3e42] overflow-hidden bg-[#252526] ${className}`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-[#2d2d30] border-b border-[#3e3e42] shrink-0">
        <div className="flex items-center gap-0.5">
          {tools.map((t, i) =>
            "divider" in t ? (
              <div key={i} className="w-px h-4 bg-[#3e3e42] mx-1.5 shrink-0" />
            ) : (
              <button
                key={i}
                type="button"
                title={t.title}
                disabled={disabled || preview}
                onClick={t.action}
                className="w-7 h-7 flex items-center justify-center rounded text-slate-400
                  hover:text-slate-200 hover:bg-[#3e3e42]
                  disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <t.icon size={13} />
              </button>
            )
          )}
        </div>

        <button
          type="button"
          title={preview ? "Back to editing" : "Preview rendered output"}
          onClick={() => setPreview((p) => !p)}
          className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded transition-colors ${
            preview
              ? "bg-blue-500/20 text-blue-400"
              : "text-slate-500 hover:text-slate-300 hover:bg-[#3e3e42]"
          }`}
        >
          {preview ? <Pencil size={11} /> : <Eye size={11} />}
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {/* Content */}
      {preview ? (
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden p-4
            prose prose-invert prose-sm max-w-none
            prose-p:text-slate-300 prose-p:leading-7 prose-p:mb-3
            prose-strong:text-slate-100 prose-strong:font-semibold
            prose-em:text-slate-300
            prose-ul:my-3 prose-ul:pl-5 prose-li:text-slate-300 prose-li:mb-1
            prose-ol:my-3 prose-ol:pl-5 prose-ol:text-slate-300
            prose-code:text-orange-400 prose-code:bg-[#1e1e1e] prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-headings:text-slate-200
            [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:overflow-x-auto
            [&_code]:break-words"
          style={{ minHeight }}
        >
          {value.trim() ? (
            <ReactMarkdown>{DOMPurify.sanitize(value)}</ReactMarkdown>
          ) : (
            <p className="not-prose text-sm text-slate-600 italic">
              Nothing to preview yet.
            </p>
          )}
        </div>
      ) : (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          spellCheck={!monoFont}
          style={{ minHeight }}
          className={`flex-1 w-full bg-transparent border-none outline-none text-sm text-slate-300
            resize-y p-4 leading-relaxed placeholder:text-slate-600
            disabled:opacity-50 disabled:cursor-not-allowed
            ${monoFont ? "font-mono" : "font-sans"}`}
        />
      )}
    </div>
  );
}
