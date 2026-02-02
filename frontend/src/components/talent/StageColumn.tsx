import CandidateCard from "./CandidateCard";
import type { EmployerSubmission, HiringStage } from "@/types";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion } from "framer-motion";

interface StageColumnProps {
  stage: HiringStage;
  label: string;
  submissions: EmployerSubmission[];
}

const stageStyles: Record<
  HiringStage,
  { bg: string; accent: string; border: string; countBg: string }
> = {
  new: {
    bg: "bg-blue-50/50 dark:bg-blue-950/20",
    accent: "bg-blue-500",
    border: "border-blue-200 dark:border-blue-800",
    countBg: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  },
  shortlisted: {
    bg: "bg-amber-50/50 dark:bg-amber-950/20",
    accent: "bg-amber-500",
    border: "border-amber-200 dark:border-amber-800",
    countBg: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  },
  interview: {
    bg: "bg-cyan-50/50 dark:bg-cyan-950/20",
    accent: "bg-cyan-500",
    border: "border-cyan-200 dark:border-cyan-800",
    countBg: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
  },
  hold: {
    bg: "bg-slate-50/50 dark:bg-slate-900/20",
    accent: "bg-slate-400",
    border: "border-slate-200 dark:border-slate-700",
    countBg: "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400",
  },
  hired: {
    bg: "bg-emerald-50/50 dark:bg-emerald-950/20",
    accent: "bg-emerald-500",
    border: "border-emerald-200 dark:border-emerald-800",
    countBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  },
  rejected: {
    bg: "bg-red-50/50 dark:bg-red-950/20",
    accent: "bg-red-500",
    border: "border-red-200 dark:border-red-800",
    countBg: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  },
};

export default function StageColumn({
  stage,
  label,
  submissions,
}: StageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage, data: { stage } });
  const style = stageStyles[stage];

  return (
    <motion.div
      layout
      ref={setNodeRef}
      className={`flex flex-col w-[300px] shrink-0 h-[70vh] rounded-2xl border ${style.border
        } p-4 shadow-sm relative overflow-hidden transition-all duration-200 ${style.bg
        } ${isOver ? "ring-2 ring-[var(--color-brand-primary)] scale-[1.01] shadow-lg" : ""}`}
    >
      {/* Accent bar */}
      <div className={`absolute top-0 left-0 h-1.5 w-full rounded-t-2xl ${style.accent}`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 mt-1">
        <h3 className="font-bold text-sm text-[var(--color-text)]">
          {label}
        </h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.countBg}`}>
          {submissions.length}
        </span>
      </div>

      {/* Scrollable cards container */}
      <div className="relative flex-1 overflow-y-auto -mx-1 px-1">
        <SortableContext
          id={stage}
          items={submissions.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 pb-4">
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-3">
                  <span className="text-2xl">🕊️</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  No candidates here yet
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                  Drag cards here to move candidates
                </p>
              </div>
            ) : (
              submissions.map((submission) => (
                <CandidateCard key={submission.id} submission={submission} />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </motion.div>
  );
}
