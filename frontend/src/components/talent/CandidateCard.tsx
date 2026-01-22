import { useState, useEffect, useRef, useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, FileText, Clock, CheckCircle2, Circle, AlertCircle } from "lucide-react";
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

// Skill colors for badges (cycling palette)
const SKILL_COLORS = [
  { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300" },
  { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300" },
  { bg: "bg-violet-100 dark:bg-violet-900/40", text: "text-violet-700 dark:text-violet-300" },
  { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300" },
  { bg: "bg-rose-100 dark:bg-rose-900/40", text: "text-rose-700 dark:text-rose-300" },
];

// Extract skill keywords from task title
function extractSkills(title: string | null | undefined): string[] {
  if (!title) return [];

  // Common tech/skill keywords to extract
  const knownSkills = [
    "React", "Vue", "Angular", "TypeScript", "JavaScript", "Python", "Java", "Go",
    "API", "REST", "GraphQL", "SQL", "NoSQL", "MongoDB", "PostgreSQL", "AWS", "GCP",
    "Docker", "Kubernetes", "CI/CD", "Testing", "Design", "Figma", "UI", "UX",
    "Frontend", "Backend", "Fullstack", "Mobile", "iOS", "Android", "Node", "Next.js"
  ];

  // Match known skills (case-insensitive)
  const found = knownSkills.filter(skill =>
    title.toLowerCase().includes(skill.toLowerCase())
  );

  // If no known skills, extract capitalized words as potential skills
  if (found.length === 0) {
    const words = title.split(/[\s\-_:]+/);
    return words
      .filter(w => w.length > 2 && /^[A-Z]/.test(w))
      .slice(0, 3);
  }

  return found.slice(0, 3);
}

// Format relative time
function formatTimeAgo(dateString: string | null | undefined): string {
  if (!dateString) return "—";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

// Status indicator component
function StatusIndicator({ status, stars }: { status: string | null; stars?: number | null }) {
  if (status === "reviewed" || stars) {
    return (
      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400" title="Reviewed">
        <CheckCircle2 size={12} />
      </div>
    );
  }
  if (status === "submitted") {
    return (
      <div className="flex items-center gap-1 text-amber-500" title="Pending Review">
        <AlertCircle size={12} />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-[var(--color-text-muted)]" title="Draft">
      <Circle size={12} />
    </div>
  );
}

export default function CandidateCard({
  submission,
}: {
  submission: EmployerSubmission;
}) {
  const {
    id,
    proof_tasks,
    feedback,
    employer_notes,
    hiring_stage,
    profiles,
    created_at,
    status
  } = submission;

  // Local state for notes (instant update fix)
  const [currentNotes, setCurrentNotes] = useState(employer_notes);
  const [open, setOpen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({ id });

  // Memoize extracted skills
  const skills = useMemo(() => extractSkills(proof_tasks?.title), [proof_tasks?.title]);
  const timeAgo = useMemo(() => formatTimeAgo(created_at), [created_at]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s, box-shadow 0.2s",
    opacity: isDragging ? 0.6 : 1,
  };

  // Sync local state if prop updates
  useEffect(() => {
    setCurrentNotes(employer_notes);
  }, [employer_notes]);

  // Close dropdown on outside click
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
      await updateHiringStage(id, stage, currentNotes ?? "");
      toast.success(`Moved to ${stage}`);
      setOpen(false);
    } catch {
      toast.error("Failed to move candidate");
    }
  }

  // Helper to get the best display name
  const displayName = profiles?.full_name || profiles?.email?.split("@")[0] || "Unknown Candidate";
  const stars = feedback?.[0]?.stars;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group relative glass-card rounded-xl p-4 cursor-grab
        hover:shadow-[var(--shadow-card)] 
        ${isDragging ? "shadow-[var(--shadow-card)] scale-[1.02] z-50" : ""}
        transition-all duration-200
      `}
    >
      {/* Top Row: Name + Status + Actions */}
      <div className="flex justify-between items-start gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-[var(--color-text)] truncate" title={displayName}>
              {displayName}
            </h4>
            <StatusIndicator status={status} stars={stars} />
          </div>

          {/* Time indicator */}
          <div className="flex items-center gap-1 mt-0.5 text-[var(--color-text-muted)]">
            <Clock size={10} className="opacity-60" />
            <span className="text-[10px]">{timeAgo}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {status === "reviewed" && submission.resume_url && (
            <a
              href={submission.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              onPointerDown={(e) => e.stopPropagation()}
              title="View CV"
              className="p-1.5 rounded-lg hover:bg-[var(--color-employer-light)] text-[var(--color-employer-dark)] hover:text-[var(--color-employer)] transition-all"
            >
              <FileText size={14} strokeWidth={1.8} />
            </a>
          )}

          <div ref={dropdownRef} className="relative">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setOpen((p) => !p)}
              className="p-1.5 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all"
            >
              <MoreHorizontal size={14} />
            </button>

            {open && (
              <div className="absolute text-[var(--color-text)] right-0 top-8 z-[999] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg text-sm min-w-[140px] overflow-hidden animate-slide-in">
                {STAGES.map((stage) => (
                  <button
                    key={stage}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(stage);
                    }}
                    disabled={stage === hiring_stage}
                    className={`block w-full text-left px-3 py-2 hover:bg-[var(--color-bg)] transition-colors capitalize ${stage === hiring_stage
                        ? "text-[var(--color-text-muted)] bg-[var(--color-bg)] cursor-default"
                        : ""
                      }`}
                  >
                    {stage === hiring_stage ? "✓ " : ""}{stage.replace("_", " ")}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skill Badges */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {skills.map((skill, idx) => {
            const color = SKILL_COLORS[idx % SKILL_COLORS.length];
            return (
              <span
                key={skill}
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${color.bg} ${color.text}`}
              >
                {skill}
              </span>
            );
          })}
        </div>
      )}

      {/* Task Title */}
      <p className="text-xs text-[var(--color-text-muted)] truncate mb-2" title={proof_tasks?.title || "Untitled task"}>
        {proof_tasks?.title || "Untitled task"}
      </p>

      {/* Bottom Row: Rating + Notes */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]/50">
        {/* Rating */}
        {stars ? (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`text-[10px] ${i <= stars ? "text-amber-400" : "text-[var(--color-border)]"}`}
              >
                ★
              </span>
            ))}
            <span className="text-[10px] font-medium text-[var(--color-text-muted)] ml-1">
              {stars}/5
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-[var(--color-text-muted)]">Not rated</span>
        )}

        {/* Notes Button */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setShowNotes(true)}
          className={`text-[10px] px-2 py-1 rounded-md transition-all ${currentNotes
              ? "bg-[var(--color-employer-light)] text-[var(--color-employer-dark)] hover:bg-[var(--color-employer)]/20"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-employer-dark)] hover:bg-[var(--color-employer-light)]"
            }`}
        >
          {currentNotes ? "📝 Notes" : "+ Note"}
        </button>
      </div>

      {/* Notes Preview */}
      {currentNotes && (
        <p className="text-[10px] text-[var(--color-text-muted)] italic mt-2 truncate opacity-70">
          {currentNotes}
        </p>
      )}

      {showNotes && (
        <NotesModal
          submission={{ ...submission, employer_notes: currentNotes }}
          onClose={() => setShowNotes(false)}
          onSave={(updated) => {
            if (updated.employer_notes !== undefined) {
              setCurrentNotes(updated.employer_notes);
            }
          }}
        />
      )}
    </div>
  );
}