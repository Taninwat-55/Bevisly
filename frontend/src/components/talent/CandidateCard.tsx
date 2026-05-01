import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExternalLink, GripVertical, User, Mail, Star, FileText, MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import { updateHiringStage, sendRejectionFeedbackEmail } from "@/lib/api/submissions";
import type { EmployerSubmission, HiringStage } from "@/types";
import NotesModal from "./NotesModal";
import { useNavigate } from "react-router-dom";

const STAGES: { key: HiringStage; label: string; emoji: string }[] = [
  { key: "new", label: "New", emoji: "🆕" },
  { key: "shortlisted", label: "Shortlisted", emoji: "⭐" },
  { key: "interview", label: "Interview", emoji: "💬" },
  { key: "hold", label: "On Hold", emoji: "⏸" },
  { key: "hired", label: "Hired", emoji: "🎉" },
  { key: "rejected", label: "Rejected", emoji: "❌" },
];

function getRelativeTime(dateString?: string | null) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

// Inner presentation component
function InnerCard({
  submission,
  isOverlay = false,
  setNodeRef,
  style,
  attributes,
  listeners,
  isDragging = false,
  onReview,
  onUpdateSubmission,
}: {
  submission: EmployerSubmission;
  isOverlay?: boolean;
  setNodeRef?: (node: HTMLElement | null) => void;
  style?: React.CSSProperties;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listeners?: Record<string, any>;
  onReview?: (id: string) => void;
  isDragging?: boolean;
  onUpdateSubmission?: (id: string, updated: Partial<EmployerSubmission>) => void;
}) {
  const navigate = useNavigate();
  const { id, profiles, proof_tasks, feedback, employer_notes, hiring_stage, jobs, created_at } =
    submission;
  const [open, setOpen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const dropdownRef = useRef<HTMLButtonElement>(null);

  const rating = feedback?.[0]?.stars;
  const candidateName = profiles?.full_name || profiles?.email?.split("@")[0] || "Unknown";
  const initials = candidateName.charAt(0).toUpperCase();
  const jobTitle = jobs?.title || "Unknown Role";

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // If clicking inside the trigger button (dropdownRef), don't close here (toggle logic handles it)
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
        return;
      }
      setOpen(false);
    };

    // Only add listener if open
    if (open) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function handleMove(stage: HiringStage) {
    try {
      await updateHiringStage(id, stage, employer_notes ?? "");
      onUpdateSubmission?.(id, { hiring_stage: stage });
      toast.success(`Moved to ${stage}`);
      
      // 📧 Auto-send feedback email when rejected
      if (stage === "rejected") {
        toast.promise(sendRejectionFeedbackEmail(id), {
          loading: "Sending rejection email...",
          success: () => {
            onUpdateSubmission?.(id, { rejection_email_sent: true });
            return "Rejection email sent ✓";
          },
          error: "Failed to send rejection email",
        });
      }
      
      setOpen(false);
    } catch {
      toast.error("Failed to move candidate");
    }
  }

  function handleViewProof(e: React.MouseEvent) {
    e.stopPropagation();
    if (onReview) {
        onReview(id);
    }
  }

  // Derive a status tag
  const statusTag = (() => {
    if (rating && rating >= 4) return { label: "Strong Match", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" };
    if (rating) return { label: "Rated", color: "text-amber-600 bg-amber-500/10 border-amber-500/20" };
    if (proof_tasks?.title) return { label: "Proof Submitted", color: "text-blue-600 bg-blue-500/10 border-blue-500/20" };
    return { label: "New", color: "text-slate-500 bg-slate-500/10 border-slate-500/20" };
  })();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative flex flex-col gap-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] 
      rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-[var(--color-brand-primary)]/40 
      transition-all duration-200 select-none touch-none ${isDragging ? "shadow-none ring-0 opacity-30" : "cursor-grab active:cursor-grabbing"} 
      ${isOverlay ? "cursor-grabbing rotate-2 shadow-xl ring-2 ring-[var(--color-brand-primary)]/20 bg-[var(--color-surface)]" : ""}`}
    >
      {/* Row 1: Name + Status Tag */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm
            ${rating && rating >= 4
              ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-600 border border-amber-500/30"
              : "bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-600 border border-blue-500/20"
            }`}>
            {initials}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-[var(--color-text)] truncate text-[13px] leading-tight">
              {candidateName}
            </h4>
            <p className="text-[11px] text-[var(--color-text-muted)] truncate mt-0.5">
              {jobTitle}
            </p>
          </div>
        </div>

        {/* Drag Handle */}
        <div className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-50 transition-opacity p-0.5">
          <GripVertical size={14} />
        </div>
      </div>

      {/* Row 2: Score + Status Tag (the main decision signals) */}
      <div
        className="flex items-center justify-between gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleViewProof}
        onPointerDown={(e) => e.stopPropagation()}
        role="button"
      >
        {/* Rating (prominent) */}
        {rating ? (
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md text-sm font-bold text-amber-600 border border-amber-100 dark:border-amber-800">
            <Star size={13} fill="currentColor" />
            {rating.toFixed(1)}
          </div>
        ) : (
          <span className="text-[11px] text-[var(--color-text-muted)] italic">No score yet</span>
        )}

        {/* Status Tag */}
        <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${statusTag.color}`}>
          {statusTag.label}
        </span>
      </div>

      {/* Row 3: Quick Actions (compact) */}
      <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border)]">
        <span className="text-[10px] text-[var(--color-text-muted)]">
          {getRelativeTime(created_at)}
        </span>

        <div className="flex items-center gap-1.5">
          {submission.rejection_email_sent && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-200/50">
              <Mail size={10} /> Email sent
            </span>
          )}
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setShowNotes(true); }}
            className={`p-1 rounded-md transition-colors ${employer_notes
              ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]"}`}
            title={employer_notes ? "Edit Note" : "Add Note"}
          >
            <FileText size={13} />
          </button>
          <div className="relative">
            <button
              ref={dropdownRef}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
              className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
            >
              <MoreHorizontal size={13} />
            </button>

            {open && typeof document !== "undefined" && createPortal(
              <div
                className="fixed z-[9999] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl text-sm min-w-[160px] py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                style={{
                  top: (dropdownRef.current?.getBoundingClientRect().bottom ?? 0) + 4,
                  left: (dropdownRef.current?.getBoundingClientRect().right ?? 0),
                  transform: "translateX(-100%)"
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleViewProof}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-[var(--color-bg)] text-[var(--color-text)] text-xs font-medium transition-colors"
                >
                  <ExternalLink size={14} className="text-[var(--color-text-muted)]" /> View Proof
                </button>
                {submission.user_id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(false);
                      navigate(`/candidate/${submission.user_id}`);
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-[var(--color-bg)] text-[var(--color-text)] text-xs font-medium transition-colors"
                  >
                    <User size={14} className="text-[var(--color-text-muted)]" /> View Profile
                  </button>
                )}
                <a
                  href={`mailto:${profiles?.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-[var(--color-bg)] text-[var(--color-text)] text-xs font-medium transition-colors"
                >
                  <Mail size={14} className="text-[var(--color-text-muted)]" /> Email Candidate
                </a>

                <div className="h-[1px] bg-[var(--color-border)] my-1" />
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">
                  Move to
                </div>
                {STAGES.map(({ key, label, emoji }) => (
                  <button
                    key={key}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(key);
                    }}
                    disabled={key === hiring_stage}
                    className={`flex items-center gap-2 w-full text-left px-3 py-1.5 hover:bg-[var(--color-bg)] transition-colors ${key === hiring_stage
                      ? "text-[var(--color-text-muted)] opacity-50 cursor-not-allowed"
                      : "text-[var(--color-text)]"
                      }`}
                  >
                    <span>{emoji}</span> <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>,
              document.body
            )}
          </div>
        </div>
      </div>

      {showNotes && (
        <NotesModal
          submission={submission}
          onClose={() => setShowNotes(false)}
          onSave={(updated: Partial<EmployerSubmission>) => onUpdateSubmission?.(id, updated)}
        />
      )}
    </div>
  );
}

// 🟢 Standard Sortable Card
export default function CandidateCard({
  submission,
  onReview,
  onUpdateSubmission,
}: {
  submission: EmployerSubmission;
  onReview?: (id: string) => void;
  onUpdateSubmission?: (id: string, updated: Partial<EmployerSubmission>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({ id: submission.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: "transform 0.15s ease, opacity 0.15s, box-shadow 0.15s",
    opacity: isDragging ? 0.3 : 1, // Make original item very faint while dragging
  };

  return (
    <InnerCard
      submission={submission}
      setNodeRef={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
      isDragging={isDragging}
      onReview={onReview}
      onUpdateSubmission={onUpdateSubmission}
    />
  );
}

// 🔵 Overlay Card (Pure Visual, no sortable logic)
export function CandidateCardOverlay({
  submission,
  onUpdateSubmission,
}: {
  submission: EmployerSubmission;
  onUpdateSubmission?: (id: string, updated: Partial<EmployerSubmission>) => void;
}) {
  return (
    <InnerCard
      submission={submission}
      isOverlay={true}
      onUpdateSubmission={onUpdateSubmission}
    />
  );
}
