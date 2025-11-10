import { useState, useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { updateHiringStage } from "@/lib/api/mutations";
import type { EmployerSubmission, HiringStage } from "@/types";
import NotesModal from "./NotesModal";

const STAGES: HiringStage[] = [
  "new",
  "shortlisted",
  "interview",
  "hold",
  "hired",
  "rejected",
];

export default function CandidateCard({
  submission,
}: {
  submission: EmployerSubmission;
}) {
  const { id, user_id, proof_tasks, feedback, employer_notes, hiring_stage } =
    submission;
  const [open, setOpen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: "transform 0.2s ease, opacity 0.2s",
    opacity: isDragging ? 0.5 : 1,
  };

  // 🧠 Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleMove(stage: HiringStage) {
    try {
      await updateHiringStage(id, stage, employer_notes ?? "");
      toast.success(`Moved to ${stage}`);
      setOpen(false);
    } catch {
      toast.error("Failed to move candidate");
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative bg-[var(--color-surface)] border border-[var(--color-border)] 
      rounded-[var(--radius-button)] p-3 cursor-grab hover:shadow-[var(--shadow-soft)] transition`}
    >
      <div className="flex justify-between items-center mb-1">
        <h4 className="font-medium text-sm text-[var(--color-text)] truncate flex items-center gap-1">
          👤 {user_id || "Unknown"}
          {submission.status === "reviewed" && submission.resume_url && (
            <a
              href={submission.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              onPointerDown={(e) => e.stopPropagation()}
              title="View Candidate CV"
              className="text-[var(--color-employer-dark)] hover:text-[var(--color-employer)] transition-colors"
            >
              <FileText size={13} strokeWidth={1.8} />
            </a>
          )}
        </h4>

        <div ref={dropdownRef} className="relative">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setOpen((p) => !p)}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            <MoreHorizontal size={14} />
          </button>

          {open && (
            <div
              className="absolute text-[var(--color-text)] right-0 top-6 z-[999] bg-[var(--color-surface)] border border-[var(--color-border)]
              rounded-[var(--radius-card)] shadow-lg text-sm"
            >
              {STAGES.map((stage) => (
                <button
                  key={stage}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMove(stage);
                  }}
                  disabled={stage === hiring_stage}
                  className={`block w-full text-left px-3 py-1.5 hover:bg-[var(--color-bg-hover)] ${
                    stage === hiring_stage
                      ? "text-[var(--color-text-muted)] opacity-70"
                      : ""
                  }`}
                >
                  Move to {stage}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Candidate Info */}
      <p className="text-xs text-[var(--color-text-muted)] truncate">
        {proof_tasks?.title || "Untitled task"}
      </p>

      {/* 🆕 Candidate CV */}
      {submission.status === "reviewed" && submission.resume_url && (
        <a
          href={submission.resume_url}
          target="_blank"
          rel="noopener noreferrer"
          onPointerDown={(e) => e.stopPropagation()}
          className="text-xs text-[var(--color-employer-dark)] hover:underline block mt-0.5"
        >
          📄 View CV
        </a>
      )}

      {/* Rating */}
      {feedback?.[0]?.stars ? (
        <span className="text-xs text-yellow-500 font-medium">
          ⭐ {feedback[0].stars}/5
        </span>
      ) : (
        <span className="text-xs text-[var(--color-text-muted)]">—</span>
      )}

      {employer_notes && (
        <p className="text-xs text-[var(--color-text-muted)] italic mt-1 truncate">
          📝 {employer_notes}
        </p>
      )}

      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setShowNotes(true)}
        className="text-xs text-[var(--color-employer-dark)] hover:underline mt-1"
      >
        {employer_notes ? "Edit Notes" : "Add Note"}
      </button>

      {showNotes && (
        <NotesModal
          submission={submission}
          onClose={() => setShowNotes(false)}
          onSave={(updated) => console.log("Updated:", updated)}
        />
      )}
    </div>
  );
}
