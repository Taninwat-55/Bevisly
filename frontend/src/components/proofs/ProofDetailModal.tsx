import { X, Star, CheckCircle, AlertCircle, MessageSquare, ExternalLink, Calendar } from "lucide-react";
import type { CandidateFeedbackEntry } from "@/types/candidate";

interface ProofDetailModalProps {
  proof: CandidateFeedbackEntry;
  onClose: () => void;
}

export default function ProofDetailModal({ proof, onClose }: ProofDetailModalProps) {
  const fb = proof.feedback?.[0];
  const reviewed = proof.status === "reviewed" && fb;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div
        className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-[var(--glass-border)] relative animate-in zoom-in-50 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 glass-panel border-b border-[var(--color-border)] px-6 py-4 flex items-start justify-between backdrop-blur-xl">
          <div>
            <h2 className="text-xl font-bold font-display text-[var(--color-text)] mb-1">
              {proof.proof_tasks?.title || "Proof Task"}
            </h2>
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <span className="font-medium">{proof.jobs?.company}</span>
              <span>•</span>
              <span>{proof.jobs?.title}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Status Section */}
          {reviewed ? (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Rating Card */}
              <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] flex flex-col items-center justify-center text-center">
                <span className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Overall Rating</span>
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={28}
                      className={i < (fb.stars || 0) ? "text-yellow-400 fill-yellow-400" : "text-[var(--color-border)]"}
                    />
                  ))}
                </div>
                <div className="text-3xl font-bold text-[var(--color-text)] font-display">{fb.stars}<span className="text-lg text-[var(--color-text-muted)] font-sans font-normal">/5</span></div>
              </div>

              {/* Summary Card */}
              <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] flex flex-col justify-center">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1 font-semibold text-sm">
                      <CheckCircle size={16} /> Strengths
                    </div>
                    <p className="text-sm text-[var(--color-text)] leading-relaxed pl-6">
                      {fb.strengths || "No specific strengths noted."}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1 font-semibold text-sm">
                      <AlertCircle size={16} /> Areas for Improvement
                    </div>
                    <p className="text-sm text-[var(--color-text)] leading-relaxed pl-6">
                      {fb.improvements || "No specific improvements noted."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-[var(--color-surface)] rounded-xl border border-dashed border-[var(--color-border)] text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 mb-4 animate-pulse">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">Review in Progress</h3>
              <p className="text-[var(--color-text-muted)] max-w-sm">
                The employer has received your submission and is currently reviewing it. You will be notified once feedback is available.
              </p>
            </div>
          )}

          {/* Detailed Feedback & Comments */}
          {reviewed && fb.comments && (
            <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider mb-3 flex items-center gap-2">
                <MessageSquare size={16} /> Additional Comments
              </h3>
              <p className="text-[var(--color-text)] leading-loose text-sm whitespace-pre-wrap">
                {fb.comments}
              </p>
            </div>
          )}

          {/* Helper Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Your Submission Link */}
            <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
              <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-2">Submission</span>
              {proof.submission_link ? (
                <a
                  href={proof.submission_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[var(--color-brand-primary)] hover:underline font-medium"
                >
                  View your work <ExternalLink size={14} />
                </a>
              ) : (
                <span className="text-sm text-[var(--color-text-muted)] italic">No link provided</span>
              )}
            </div>

            {/* Metadata */}
            <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
              <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-2">Details</span>
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <Calendar size={14} />
                Submitted on {new Date(proof.created_at ?? "").toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Candidate Reflection */}
          {proof.reflection && (
            <div className="pt-6 border-t border-[var(--color-border)]">
              <h3 className="text-sm font-bold text-[var(--color-text)] mb-2">Your Reflection</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed italic border-l-2 border-[var(--color-border)] pl-4">
                "{proof.reflection}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}