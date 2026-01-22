import CandidateCard from "./CandidateCard";
import type { EmployerSubmission, HiringStage } from "@/types";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";

interface StageColumnProps {
  stage: HiringStage;
  label: string;
  submissions: EmployerSubmission[];
}

// Glassmorphism-based stage styling with accent colors
const stageConfig: Record<
  HiringStage,
  { accent: string; accentRgb: string; icon: string }
> = {
  new: {
    accent: "hsl(228, 80%, 60%)",
    accentRgb: "99, 102, 241",
    icon: "🆕",
  },
  shortlisted: {
    accent: "hsl(45, 90%, 50%)",
    accentRgb: "234, 179, 8",
    icon: "⭐",
  },
  interview: {
    accent: "hsl(200, 85%, 55%)",
    accentRgb: "59, 130, 246",
    icon: "💬",
  },
  hold: {
    accent: "hsl(0, 0%, 50%)",
    accentRgb: "156, 163, 175",
    icon: "⏸",
  },
  hired: {
    accent: "hsl(140, 70%, 45%)",
    accentRgb: "34, 197, 94",
    icon: "🎉",
  },
  rejected: {
    accent: "hsl(0, 75%, 55%)",
    accentRgb: "239, 68, 68",
    icon: "❌",
  },
};

export default function StageColumn({
  stage,
  label,
  submissions,
}: StageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage, data: { stage } });
  const config = stageConfig[stage];

  return (
    <motion.div
      layout
      ref={setNodeRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col min-w-[18rem] max-w-[19rem] h-[78vh] snap-center"
    >
      {/* Glass Column Container */}
      <div
        className={`
          flex flex-col h-full rounded-2xl overflow-hidden
          relative transition-all duration-300
          ${isOver ? "scale-[1.02]" : ""}
        `}
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid var(--glass-border)`,
          boxShadow: isOver
            ? `0 0 0 2px rgba(${config.accentRgb}, 0.5), 0 0 30px rgba(${config.accentRgb}, 0.2), var(--glass-shadow)`
            : "var(--glass-shadow)",
        }}
      >
        {/* Accent Bar */}
        <div
          className="h-1 w-full transition-all duration-300"
          style={{
            background: config.accent,
            boxShadow: isOver ? `0 0 12px ${config.accent}` : undefined,
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--glass-border)]">
          <div className="flex items-center gap-2">
            <span className="text-base">{config.icon}</span>
            <h3 className="font-semibold text-sm text-[var(--color-text)]">
              {label.replace(/^[^\s]+\s/, "")} {/* Remove emoji from label since we use config.icon */}
            </h3>
          </div>
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `rgba(${config.accentRgb}, 0.15)`,
              color: config.accent,
            }}
          >
            <Users size={12} />
            {submissions.length}
          </div>
        </div>

        {/* Cards Container with scroll */}
        <div className="relative flex-1 overflow-hidden">
          {/* Top fade gradient */}
          <div
            className="absolute inset-x-0 top-0 h-4 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, var(--glass-bg), transparent)",
            }}
          />

          <div className="h-full overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--color-border)]">
            <SortableContext
              id={stage}
              items={submissions.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <AnimatePresence mode="popLayout">
                {submissions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                      style={{
                        backgroundColor: `rgba(${config.accentRgb}, 0.1)`,
                      }}
                    >
                      <span className="text-xl opacity-50">{config.icon}</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      No candidates yet
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)] opacity-50 mt-1">
                      Drag candidates here
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3 pb-4">
                    {submissions.map((submission, index) => (
                      <motion.div
                        key={submission.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{
                          duration: 0.2,
                          delay: index * 0.03,
                          layout: { duration: 0.25 }
                        }}
                      >
                        <CandidateCard submission={submission} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </SortableContext>
          </div>

          {/* Bottom fade gradient */}
          <div
            className="absolute inset-x-0 bottom-0 h-6 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to top, var(--glass-bg), transparent)",
            }}
          />
        </div>

        {/* Drop Zone Indicator (shows when dragging over) */}
        <AnimatePresence>
          {isOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at center, rgba(${config.accentRgb}, 0.08), transparent 70%)`,
                border: `2px dashed rgba(${config.accentRgb}, 0.4)`,
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
