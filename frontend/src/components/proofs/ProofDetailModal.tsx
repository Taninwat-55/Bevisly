import { X, Star } from "lucide-react";
import type { CandidateFeedbackEntry } from "@/types/candidate";

interface ProofDetailModalProps {
  proof: CandidateFeedbackEntry;
  onClose: () => void;
}

export default function ProofDetailModal({ proof, onClose }: ProofDetailModalProps) {
  const fb = proof.feedback?.[0];
  const reviewed = proof.status === "reviewed" && fb;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl rounded-[var(--radius-card)] p-6 w-[90%] max-w-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          <X size={18} />
        </button>

        <h2 className="heading-md mb-1">{proof.proof_tasks?.title}</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          {proof.jobs?.title} {proof.jobs?.company && `• ${proof.jobs.company}`}
        </p>

        <div className="space-y-4">
          {reviewed ? (
            <>
              <div className="bg-[var(--color-bg)] p-4 rounded-xl border border-[var(--color-border)] text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={24}
                      className={i < (fb.stars || 0) ? "text-yellow-400 fill-yellow-400" : "text-[var(--color-border)]"}
                    />
                  ))}
                </div>
                <p className="text-sm font-medium text-[var(--color-text)]">{fb.stars}/5 Rating</p>
              </div>

              <div className="grid gap-4">
                <div className="p-3 rounded-lg bg-green-50 border border-green-100 dark:bg-green-900/20 dark:border-green-900">
                  <strong className="text-green-700 dark:text-green-400 text-xs uppercase tracking-wide block mb-1">Strengths</strong>
                  <p className="text-sm text-[var(--color-text)]">{fb.strengths || "–"}</p>
                </div>
                
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 dark:bg-red-900/20 dark:border-red-900">
                  <strong className="text-red-700 dark:text-red-400 text-xs uppercase tracking-wide block mb-1">Areas for Improvement</strong>
                  <p className="text-sm text-[var(--color-text)]">{fb.improvements || "–"}</p>
                </div>
              </div>

              {fb.comments && (
                <div className="mt-2 text-sm text-[var(--color-text-muted)]">
                  <strong className="text-[var(--color-text)] block mb-1">Additional Comments:</strong>
                  <p className="leading-relaxed">{fb.comments}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 bg-[var(--color-bg)] rounded-xl border border-dashed border-[var(--color-border)]">
              <p className="text-sm italic text-[var(--color-text-muted)]">Awaiting feedback from employer.</p>
            </div>
          )}

          {/* Candidate Reflection */}
          {proof.reflection && (
            <div className="mt-4 text-sm border-t border-[var(--color-border)] pt-4">
              <strong className="block mb-1 text-[var(--color-text)]">Your Reflection:</strong>
              <p className="text-[var(--color-text-muted)] leading-relaxed">{proof.reflection}</p>
            </div>
          )}

          {proof.submission_link && (
            <>
              <a href={proof.submission_link} target="_blank" rel="noopener noreferrer" className="inline-block text-[var(--color-candidate-dark)] text-sm mt-2 hover:underline">
                View submitted proof →
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}