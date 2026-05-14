import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";
import type { HiringStage } from "@/types";

type Application = {
  id: string;
  hiring_stage: HiringStage | string | null;
  status: string | null;
  proof_task_id: string | null;
  jobs: { id: string; title: string; company: string } | null;
  created_at: string | null;
};

interface Props {
  applications: Application[];
}

const STEPS = [
  { key: "applied", label: "Applied" },
  { key: "under_review", label: "Under Review" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "decision", label: "Decision" },
] as const;

function getStepIndex(hiring_stage: string | null, status: string | null): number {
  if (!hiring_stage || hiring_stage === "new") {
    if (status === "submitted" || status === "reviewed") return 1;
    return 0;
  }
  if (hiring_stage === "shortlisted") return 2;
  if (hiring_stage === "interview") return 3;
  if (hiring_stage === "offer_sent") return 4;
  if (hiring_stage === "hired" || hiring_stage === "rejected") return 5;
  if (hiring_stage === "hold") return 1;
  return 0;
}

function TerminalBadge({ stage }: { stage: string }) {
  if (stage === "hired") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
        Hired
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 border border-red-500/20">
      Not Selected
    </span>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {STEPS.map((step, index) => {
        const isDone = index < currentStep;
        const isCurrent = index === currentStep;
        return (
          <div key={step.key} className="flex items-center">
            <div
              title={step.label}
              className={`w-2 h-2 rounded-full transition-colors ${
                isDone
                  ? "bg-[var(--color-brand-primary)]"
                  : isCurrent
                  ? "bg-[var(--color-brand-primary)] ring-2 ring-[var(--color-brand-primary)]/30"
                  : "bg-[var(--color-border)]"
              }`}
            />
            {index < STEPS.length - 1 && (
              <div
                className={`w-4 h-px ${isDone ? "bg-[var(--color-brand-primary)]" : "bg-[var(--color-border)]"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ApplicationStatusTracker({ applications }: Props) {
  const visible = applications.slice(0, 5);

  return (
    <div className="space-y-3">
      {visible.map((app) => {
        const isTerminal =
          app.hiring_stage === "hired" || app.hiring_stage === "rejected";
        const stepIndex = getStepIndex(app.hiring_stage, app.status);
        const company = app.jobs?.company ?? "";
        const initial = company.charAt(0).toUpperCase() || "?";

        return (
          <div
            key={app.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/20 flex items-center justify-center text-xs font-bold text-[var(--color-brand-primary)] shrink-0">
              {initial || <Briefcase size={14} />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                {app.jobs?.title ?? "Unknown Role"}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">
                {company}
              </p>
            </div>

            <div className="shrink-0">
              {isTerminal ? (
                <TerminalBadge stage={app.hiring_stage!} />
              ) : app.status === "in_progress" && app.proof_task_id ? (
                <Link
                  to={`/candidate/proof/${app.proof_task_id}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Continue
                </Link>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  <StepIndicator currentStep={stepIndex} />
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {STEPS[stepIndex]?.label}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {applications.length > 5 && (
        <Link
          to="/candidate/proofs"
          className="block text-center text-xs text-[var(--color-brand-primary)] hover:underline pt-1"
        >
          View all {applications.length} applications
        </Link>
      )}
    </div>
  );
}
