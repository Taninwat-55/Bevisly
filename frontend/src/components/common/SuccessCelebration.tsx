import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle2, PartyPopper, Rocket } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SuccessCelebrationProps {
  isVisible: boolean;
  onDismiss: () => void;
  variant?: "job-posted" | "proof-submitted" | "generic";
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const VARIANT_CONFIG = {
  "job-posted": {
    icon: Rocket,
    title: "Job Posted Successfully! 🚀",
    subtitle: "Your job is now live and candidates can start applying. You'll get notified when someone submits a proof.",
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-500/20 text-blue-400",
    actionLabel: "View Dashboard",
  },
  "proof-submitted": {
    icon: PartyPopper,
    title: "Proof Deployed! 🎉",
    subtitle: "Great work! Your submission has been sent to the hiring team for review. You'll receive feedback soon.",
    gradient: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-500/20 text-emerald-400",
    actionLabel: "Back to Dashboard",
  },
  "generic": {
    icon: CheckCircle2,
    title: "Success!",
    subtitle: "Your action was completed successfully.",
    gradient: "from-blue-500 to-purple-600",
    iconBg: "bg-purple-500/20 text-purple-400",
    actionLabel: "Continue",
  },
};

export default function SuccessCelebration({
  isVisible,
  onDismiss,
  variant = "generic",
  title,
  subtitle,
  actionLabel,
  onAction,
}: SuccessCelebrationProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  const fireConfetti = useCallback(() => {
    // Left burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.15, y: 0.6 },
      colors: ["#3B82F6", "#6366F1", "#10B981", "#F59E0B", "#EF4444"],
      ticks: 200,
      gravity: 1.2,
      scalar: 1.1,
    });
    // Right burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.85, y: 0.6 },
      colors: ["#3B82F6", "#6366F1", "#10B981", "#F59E0B", "#EF4444"],
      ticks: 200,
      gravity: 1.2,
      scalar: 1.1,
    });
    // Center rain
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 100,
        origin: { x: 0.5, y: 0.3 },
        colors: ["#3B82F6", "#6366F1", "#10B981"],
        ticks: 300,
        gravity: 0.8,
      });
    }, 300);
  }, []);

  useEffect(() => {
    if (isVisible) {
      // Small delay so the modal animation starts first
      const timer = setTimeout(fireConfetti, 200);
      return () => clearTimeout(timer);
    }
  }, [isVisible, fireConfetti]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.1 }}
            className="relative w-full max-w-md bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gradient bar */}
            <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />

            <div className="p-8 text-center">
              {/* Animated icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.3 }}
                className="mx-auto mb-6"
              >
                <div className={`w-20 h-20 rounded-full ${config.iconBg} flex items-center justify-center mx-auto`}>
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <Icon size={36} />
                  </motion.div>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold font-display text-[var(--color-text)] mb-3"
              >
                {title || config.title}
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-[var(--color-text-muted)] leading-relaxed max-w-sm mx-auto mb-8"
              >
                {subtitle || config.subtitle}
              </motion.p>

              {/* Action button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  size="lg"
                  className="shadow-glow-primary w-full sm:w-auto px-8"
                  onClick={() => {
                    onDismiss();
                    onAction?.();
                  }}
                >
                  {actionLabel || config.actionLabel}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
