import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BrainCircuit,
  Search,
  Code,
  Layout,
  FileCheck,
  Wand2,
  Clock,
  type LucideIcon,
} from "lucide-react";

/* ─── Types ───────────────────────────────────────────── */

interface StepConfig {
  label: string;
  icon: LucideIcon;
}

interface AILoadingStateProps {
  /** Custom steps (label + icon). Falls back to defaults if omitted. */
  steps?: StepConfig[];
  /** Milliseconds between step transitions. Default 4 500 ms. */
  intervalMs?: number;
  /** Use "dark" when rendered inside a dark container (e.g. landing-page mock window). */
  variant?: "default" | "dark";
}

/* ─── Default Steps ───────────────────────────────────── */

const defaultSteps: StepConfig[] = [
  { label: "Analyzing your job requirements…",      icon: Search },
  { label: "Identifying core technical skills…",     icon: BrainCircuit },
  { label: "Designing a proof-of-work task…",        icon: Layout },
  { label: "Drafting clear instructions…",           icon: Code },
  { label: "Defining acceptance criteria…",          icon: FileCheck },
  { label: "Polishing the final result…",            icon: Wand2 },
];

/* ─── Sub-components ──────────────────────────────────── */

/** Floating particle that drifts around the orb */
function FloatingParticle({
  delay,
  x,
  y,
  size,
}: {
  delay: number;
  x: number;
  y: number;
  size: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full bg-blue-400/30"
      style={{ width: size, height: size }}
      initial={{ x, y, opacity: 0, scale: 0 }}
      animate={{
        x: [x, x + 20, x - 10, x],
        y: [y, y - 15, y + 10, y],
        opacity: [0, 0.7, 0.5, 0],
        scale: [0, 1, 0.8, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

/* ─── Main Component ──────────────────────────────────── */

export default function AILoadingState({
  steps = defaultSteps,
  intervalMs = 4500,
  variant = "default",
}: AILoadingStateProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Step cycling
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }, intervalMs);
    return () => clearInterval(id);
  }, [steps.length, intervalMs]);

  // Elapsed timer (ticks every second)
  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const formatTime = useCallback((s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  }, []);

  // Theme-aware colors
  const isDark = variant === "dark";
  const textPrimary = isDark ? "text-white" : "text-[var(--color-text)]";
  const textMuted = isDark ? "text-slate-400" : "text-[var(--color-text-muted)]";
  const dotBg = isDark ? "bg-slate-700" : "bg-[var(--color-border)]";
  const dotDone = "bg-emerald-500";
  const dotActive = "bg-[var(--color-brand-primary)]";

  const CurrentIcon = steps[currentStepIndex].icon;

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 space-y-8 w-full max-w-md mx-auto select-none">

      {/* ── Animated Orb ── */}
      <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
        {/* Glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Outer ring */}
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-blue-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          {/* Trailing dot on the ring */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_2px_rgba(96,165,250,0.6)]" />
        </motion.div>

        {/* Core orb */}
        <motion.div
          className="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #f97316 100%)",
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
            }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
          />

          {/* Icon with AnimatePresence for smooth swap */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 30 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative z-10 text-white"
            >
              <CurrentIcon className="w-8 h-8" strokeWidth={1.8} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Floating particles */}
        <FloatingParticle delay={0}   x={-30} y={-35} size={6} />
        <FloatingParticle delay={1.2} x={35}  y={-20} size={4} />
        <FloatingParticle delay={2.5} x={-25} y={30}  size={5} />
        <FloatingParticle delay={0.8} x={40}  y={25}  size={3} />
      </div>

      {/* ── Step Label (animated swap) ── */}
      <div className="h-14 flex flex-col items-center justify-center gap-2 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStepIndex}
            initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`text-lg font-semibold font-display ${textPrimary} text-center`}
          >
            {steps[currentStepIndex].label}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── Step Timeline ── */}
      <div className="flex items-center gap-1.5">
        {steps.map((_, i) => {
          let className = `rounded-full transition-all duration-500 `;
          if (i < currentStepIndex) {
            className += `w-2 h-2 ${dotDone}`;
          } else if (i === currentStepIndex) {
            className += `w-7 h-2 ${dotActive}`;
          } else {
            className += `w-2 h-2 ${dotBg}`;
          }
          return (
            <motion.div
              key={i}
              className={className}
              layout
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          );
        })}
      </div>

      {/* ── Elapsed Timer + Subtitle ── */}
      <div className="flex flex-col items-center gap-1.5">
        <motion.div
          className={`flex items-center gap-1.5 text-xs font-mono ${textMuted}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Clock className="w-3 h-3" />
          <span>{formatTime(elapsed)} elapsed</span>
        </motion.div>
        <p className={`text-xs ${textMuted} text-center max-w-xs leading-relaxed`}>
          Gemini AI is crafting your challenge — this usually takes 30–60 seconds.
        </p>
      </div>

      {/* ── Sparkle accent (bottom decoration) ── */}
      <motion.div
        className={`flex items-center gap-1 text-[10px] font-medium uppercase tracking-widest ${textMuted}`}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles className="w-3 h-3" />
        <span>Powered by Gemini AI</span>
      </motion.div>
    </div>
  );
}
