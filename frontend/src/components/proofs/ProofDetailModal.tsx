import { X, Star } from "lucide-react";
import type { CandidateFeedbackEntry } from "@/types/candidate";

interface ProofDetailModalProps {
  proof: CandidateFeedbackEntry;
  onClose: () => void;
}

export default function ProofDetailModal({
  proof,
  onClose,
}: ProofDetailModalProps) {
  const fb = proof.feedback?.[0];
  const reviewed = proof.status === "reviewed" && fb;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl rounded-[var(--radius-card)] p-6 w-[90%] max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <X size={18} />
        </button>

        <h2 className="heading-md mb-1">{proof.proof_tasks?.title}</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          {proof.jobs?.title} {proof.jobs?.company && `• ${proof.jobs.company}`}
        </p>

        <div className="space-y-3">
          {reviewed ? (
            <>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < (fb.stars || 0)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-[var(--color-border)]"
                    }
                  />
                ))}
                <span className="ml-2 text-sm text-[var(--color-text-muted)]">
                  {fb.stars}/5
                </span>
              </div>

              <p className="text-sm">
                <strong className="text-[var(--color-success)]">
                  Strengths:
                </strong>{" "}
                {fb.strengths || "–"}
              </p>
              <p className="text-sm">
                <strong className="text-[var(--color-error)]">
                  Improvements:
                </strong>{" "}
                {fb.improvements || "–"}
              </p>

              {/* 💬 Employer Comments */}
              {fb.comments && (
                <div className="mt-3 text-sm text-[var(--color-text-muted)]">
                  <strong className="text-[var(--color-text)] block mb-1">
                    Employer Comments:
                  </strong>
                  <p className="leading-relaxed">{fb.comments}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm italic text-[var(--color-text-muted)]">
              Awaiting feedback from employer.
            </p>
          )}

          {/* 💡 Candidate Reflection */}
          {proof.reflection && (
            <div className="mt-3 text-sm">
              <strong className="block mb-1 text-[var(--color-text)]">
                Your Reflection:
              </strong>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                {proof.reflection}
              </p>
            </div>
          )}

          {/* 🔗 Proof link + inline preview */}
          {proof.submission_link && (
            <>
              <a
                href={proof.submission_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[var(--color-candidate-dark)] text-sm mt-2 hover:underline"
              >
                View submitted proof →
              </a>

              {/* Inline embedded preview */}
              <iframe
                src={proof.submission_link}
                title="Submitted Proof"
                className="w-full h-80 rounded-[var(--radius-card)] border border-[var(--color-border)] mt-3"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
