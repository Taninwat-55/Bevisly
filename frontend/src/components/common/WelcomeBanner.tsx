import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Briefcase, FileCheck, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface WelcomeBannerProps {
  role: "candidate" | "employer";
  userName?: string;
  onDismiss?: () => void;
}

const STORAGE_KEY = "bevisly_onboarding_dismissed";

const EMPLOYER_STEPS = [
  {
    icon: Briefcase,
    number: "1",
    title: "Post a Job",
    description: "Create your first role and describe what you're looking for.",
    color: "from-blue-500 to-indigo-500",
    iconBg: "bg-blue-500/15 text-blue-500",
  },
  {
    icon: FileCheck,
    number: "2",
    title: "Add a Proof Task",
    description: "Design a real-world task that candidates will complete to prove their skills.",
    color: "from-emerald-500 to-teal-500",
    iconBg: "bg-emerald-500/15 text-emerald-500",
  },
  {
    icon: Trophy,
    number: "3",
    title: "Review & Hire",
    description: "Evaluate submissions, leave feedback, and hire the best talent.",
    color: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-500/15 text-amber-500",
  },
];

const CANDIDATE_STEPS = [
  {
    icon: Briefcase,
    number: "1",
    title: "Browse Jobs",
    description: "Find roles that match your skills and interests.",
    color: "from-blue-500 to-indigo-500",
    iconBg: "bg-blue-500/15 text-blue-500",
  },
  {
    icon: FileCheck,
    number: "2",
    title: "Complete a Proof Task",
    description: "Show what you can do with a real-world challenge. No resumes needed.",
    color: "from-emerald-500 to-teal-500",
    iconBg: "bg-emerald-500/15 text-emerald-500",
  },
  {
    icon: Trophy,
    number: "3",
    title: "Get Hired",
    description: "Companies review your work and hire based on proven ability.",
    color: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-500/15 text-amber-500",
  },
];

export default function WelcomeBanner({ role, userName, onDismiss }: WelcomeBannerProps) {
  const [dismissed, setDismissed] = useState(true); // Start hidden, show after check

  useEffect(() => {
    const storageVal = localStorage.getItem(STORAGE_KEY);
    if (storageVal) {
      const parsed = JSON.parse(storageVal) as Record<string, boolean>;
      if (parsed[role]) {
        setDismissed(true);
        return;
      }
    }
    setDismissed(false);
  }, [role]);

  const handleDismiss = () => {
    setDismissed(true);
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    existing[role] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    onDismiss?.();
  };

  const steps = role === "employer" ? EMPLOYER_STEPS : CANDIDATE_STEPS;
  const displayName = userName || (role === "employer" ? "Employer" : "Candidate");

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="overflow-hidden mb-8"
        >
          <div className="relative rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[var(--color-brand-primary)]/8 to-[var(--color-brand-secondary)]/8 rounded-full blur-[80px] -z-10 translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-emerald-500/5 to-blue-500/5 rounded-full blur-[60px] -z-10 -translate-x-1/4 translate-y-1/4" />

            {/* Top accent */}
            <div className="h-1 bg-gradient-to-r from-[var(--color-brand-primary)] via-emerald-500 to-amber-500" />

            <div className="p-8 lg:p-10">
              {/* Header row */}
              <div className="flex items-start justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary)] text-xs font-semibold mb-3">
                    ✨ Getting Started
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold font-display text-[var(--color-text)] mb-2">
                    Welcome to Bevisly, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] capitalize">{displayName}</span>!
                  </h2>
                  <p className="text-[var(--color-text-muted)] text-lg max-w-2xl">
                    {role === "employer"
                      ? "Here's how to find your next great hire in three simple steps."
                      : "Here's how to land your next job by proving what you can do."
                    }
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="shrink-0 p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  aria-label="Dismiss welcome banner"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Steps */}
              <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (i + 1) }}
                    className="relative p-5 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-brand-primary)]/30 hover:shadow-md transition-all group"
                  >
                    {/* Step number */}
                    <div className="absolute -top-3 -left-2">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${step.color} text-white text-xs font-bold flex items-center justify-center shadow-md`}>
                        {step.number}
                      </div>
                    </div>

                    {/* Connector line (between cards on md+) */}
                    {i < steps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 -right-3 lg:-right-4 w-4 lg:w-6 z-10">
                        <ArrowRight size={16} className="text-[var(--color-border)] group-hover:text-[var(--color-brand-primary)]/50 transition-colors" />
                      </div>
                    )}

                    <div className="flex items-start gap-4 mt-2">
                      <div className={`shrink-0 w-11 h-11 rounded-xl ${step.iconBg} flex items-center justify-center`}>
                        <step.icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--color-text)] mb-1">{step.title}</h3>
                        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Dismiss CTA */}
              <div className="flex justify-center mt-8">
                <Button
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  Got it, let's go! →
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
