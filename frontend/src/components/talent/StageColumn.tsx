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
  { bg: string; accent: string; border: string }
> = {
  new: {
    bg: "bg-[hsl(228,100%,97%)] dark:bg-[hsl(228,20%,16%)]",
    accent: "hsl(228,80%,60%)",
    border: "border-[hsl(228,70%,60%)]",
  },
  shortlisted: {
    bg: "bg-[hsl(45,100%,96%)] dark:bg-[hsl(45,20%,18%)]",
    accent: "hsl(45,90%,55%)",
    border: "border-[hsl(45,90%,55%)]",
  },
  interview: {
    bg: "bg-[hsl(200,100%,96%)] dark:bg-[hsl(200,25%,17%)]",
    accent: "hsl(200,85%,55%)",
    border: "border-[hsl(200,85%,55%)]",
  },
  hold: {
    bg: "bg-[hsl(0,0%,96%)] dark:bg-[hsl(0,0%,18%)]",
    accent: "hsl(0,0%,60%)",
    border: "border-[hsl(0,0%,60%)]",
  },
  hired: {
    bg: "bg-[hsl(140,60%,94%)] dark:bg-[hsl(140,20%,16%)]",
    accent: "hsl(140,70%,45%)",
    border: "border-[hsl(140,70%,45%)]",
  },
  rejected: {
    bg: "bg-[hsl(0,90%,96%)] dark:bg-[hsl(0,25%,16%)]",
    accent: "hsl(0,75%,50%)",
    border: "border-[hsl(0,75%,50%)]",
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
      className={`flex flex-col min-w-[17rem] h-[75vh] rounded-xl border ${
        style.border
      } p-4 shadow-sm relative overflow-hidden transition-all duration-200 ${
        style.bg
      } ${isOver ? "ring-2 ring-[var(--color-employer)] scale-[1.02]" : ""}`}
    >
      {/* Accent bar */}
      <div
        className="absolute top-0 left-0 h-1 w-full"
        style={{ backgroundColor: style.accent }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-[var(--color-text)]">
          {label}
        </h3>
        <span className="text-xs text-[var(--color-text-muted)] font-medium">
          {submissions.length}
        </span>
      </div>

      {/* Scroll shadow + cards */}
      <div className="relative flex-1 overflow-y-auto pr-1">
        <div className="absolute inset-x-0 top-0 h-4 from-[var(--color-bg)]/80 to-transparent pointer-events-none" />
        <SortableContext
          id={stage}
          items={submissions.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 pb-6">
            {submissions.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)] italic text-center mt-8">
                No candidates here yet 🕊
              </p>
            ) : (
              submissions.map((submission) => (
                <CandidateCard key={submission.id} submission={submission} />
              ))
            )}
          </div>
        </SortableContext>
        <div className="absolute inset-x-0 bottom-0 h-4 from-[var(--color-bg)]/80 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
}
