import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { updateHiringStage } from "@/lib/api/submissions";
import toast from "react-hot-toast";
import type { EmployerSubmission } from "@/types";

interface NotesModalProps {
  submission: EmployerSubmission | null;
  onClose: () => void;
  onSave?: (updated: Partial<EmployerSubmission>) => void;
}

export default function NotesModal({
  submission,
  onClose,
  onSave,
}: NotesModalProps) {
  const [note, setNote] = useState(submission?.employer_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 🧠 Auto-save after typing delay (500ms)
  useEffect(() => {
    if (!submission) return;
    if (!note.trim()) return;
    const timeout = setTimeout(async () => {
      try {
        setSaving(true);
        await updateHiringStage(
          submission.id,
          submission.hiring_stage ?? "new",
          note
        );
        setSaved(true);
        onSave?.({ employer_notes: note });
        toast.success("Notes saved!");
        setTimeout(() => setSaved(false), 1500);
      } catch (err) {
        console.error(err);
        toast.error("Failed to save note");
      } finally {
        setSaving(false);
      }
    }, 600);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note]);

  if (!submission) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div className="bg-[var(--color-surface)] transition-colors rounded-[var(--radius-card)] shadow-xl w-full max-w-md p-6 border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="heading-md">📝 Candidate Notes</h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-[var(--color-text-muted)] mb-3">
          Candidate ID:{" "}
          <span className="font-medium text-[var(--color-text)]">
            {submission.user_id}
          </span>
        </p>

        <textarea
          className="w-full border border-[var(--color-border)] rounded-[var(--radius-button)] bg-[var(--color-bg)] p-2 text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-employer-light)]"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add your private notes or thoughts about this candidate..."
        />

        <div className="flex justify-between items-center mt-3 text-xs text-[var(--color-text-muted)]">
          <span>
            {saving
              ? "Saving..."
              : saved
                ? "✓ Saved"
                : note.trim()
                  ? "Auto-save enabled"
                  : "Type something..."}
          </span>
          <button
            onClick={onClose}
            className="border border-[var(--color-border)] text-[var(--color-text-muted)] px-3 py-1.5 rounded-[var(--radius-button)] hover:bg-[var(--color-border)] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
