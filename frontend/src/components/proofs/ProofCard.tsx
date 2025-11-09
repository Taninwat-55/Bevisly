import { Star } from "lucide-react";
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
      className={`cursor-pointer rounded-[var(--radius-card)] border border-[var(--color-border)]
                 shadow-[var(--shadow-soft)] p-6 transition-all hover:shadow-[var(--shadow-hover)]
                 ${
                   reviewed
                     ? "bg-[color-mix(in srgb,var(--color-candidate) 6%,transparent)] hover:bg-[color-mix(in srgb,var(--color-candidate) 10%,transparent)]"
                     : "bg-[var(--color-surface)] hover:bg-[color-mix(in srgb,var(--color-text-muted) 4%,transparent)]"
                 }`}
    >
      <h3 className="font-semibold text-[var(--color-text)] text-lg mb-1">
        {proof.proof_tasks?.title || "Proof Task"}
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-3">
        {proof.jobs?.title} {proof.jobs?.company && `• ${proof.jobs.company}`}
      </p>

      {reviewed ? (
        <div className="flex items-center mb-2">
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
      ) : (
        <p className="italic text-[var(--color-text-muted)] text-sm">
          Awaiting feedback…
        </p>
      )}

      <p className="text-xs text-[var(--color-text-muted)] mt-4 border-t border-[var(--color-border)] pt-2">
        {new Date(proof.created_at ?? "").toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
    </div>
  );
}
