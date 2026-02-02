import { Star, Calendar, ArrowRight } from "lucide-react";
import type { CandidateFeedbackEntry } from "@/types/candidate";

interface ProofCardProps {
  proof: CandidateFeedbackEntry;
  onClick: () => void;
}

export default function ProofCard({ proof, onClick }: ProofCardProps) {
  const fb = proof.feedback?.[0];
  const reviewed = proof.status === "reviewed" && fb;

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col p-6 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand-primary)]/30 transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--color-brand-primary)]/5 cursor-pointer overflow-hidden"
    >
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--color-brand-primary)]/10 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-[var(--color-text)] mb-1 group-hover:text-[var(--color-brand-primary)] transition-colors">
            {proof.proof_tasks?.title || "Proof Task"}
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] font-medium">
            {proof.jobs?.title} {proof.jobs?.company && <span className="text-[var(--color-text-muted)] opacity-60">• {proof.jobs.company}</span>}
          </p>
        </div>

        {/* Status Badge */}
        {reviewed ? (
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <Star size={12} fill="currentColor" />
            <span>Reviewed</span>
          </div>
        ) : (
          <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider">
            Pending
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        {reviewed ? (
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1 bg-[var(--color-bg)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
              <span className="font-bold text-[var(--color-text)] mr-1">{fb.stars}</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < (fb.stars || 0)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-[var(--color-border)]"
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-4 text-sm text-[var(--color-text-muted)] italic">
            <div className="w-2 h-2 rounded-full bg-amber-500/50 animate-pulse" />
            Awaiting employer feedback...
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-[var(--color-border)]/50 flex justify-between items-center text-xs text-[var(--color-text-muted)]">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} />
          {new Date(proof.created_at ?? "").toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
        <div className="flex items-center gap-1 bg-[var(--color-surface-hover)] px-2 py-1 rounded text-[var(--color-text)] group-hover:bg-[var(--color-brand-primary)] group-hover:text-white transition-colors duration-300">
          View Details <ArrowRight size={12} />
        </div>
      </div>
    </div>
  );
}
