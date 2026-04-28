import { useState } from "react";
import { useProofs } from "@/hooks/useProofs";
import { ChevronDown, ChevronUp, Globe, Lock } from "lucide-react";
import toast from "react-hot-toast";

interface ProofCardsGridProps {
  allowTogglePublic?: boolean;
}

export default function ProofCardsGrid({ allowTogglePublic = false }: ProofCardsGridProps) {
  const { cards, loading, toggleProofPublic } = useProofs();
  const [showAll, setShowAll] = useState(false);
  const [toggling, setToggling] = useState<Record<string, boolean>>({});

  if (loading)
    return (
      <p className="text-center text-[var(--color-text-muted)] py-6">
        Loading proof cards…
      </p>
    );

  if (!cards.length)
    return (
      <p className="text-[var(--color-text-muted)]">
        No proof cards yet — complete a task and get feedback ≥ 4★ to earn one!
      </p>
    );

  const visibleCards = showAll ? cards : cards.slice(0, 6);

  const handleToggle = async (submissionId: string | null, currentStatus: boolean) => {
    if (!submissionId) return;
    setToggling(prev => ({ ...prev, [submissionId]: true }));
    const result = await toggleProofPublic(submissionId, currentStatus);
    if (result.success) {
      toast.success(`Proof is now ${result.is_public ? 'public' : 'private'}`);
    } else {
      toast.error("Failed to update visibility");
    }
    setToggling(prev => ({ ...prev, [submissionId]: false }));
  };

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleCards.map((card) => (
          <div
            key={card.id ?? card.submission_id ?? Math.random()}
            className="bg-[var(--color-surface)] border border-[var(--color-border)]
                       rounded-[var(--radius-card)] shadow-[var(--shadow-soft)]
                       p-4 hover:shadow-lg transition flex flex-col h-full"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--color-text)] mb-1">
                {card.job_title}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-2 flex items-center justify-between">
                <span>⭐ {card.rating?.toFixed(1) ?? "–"} · {new Date(card.reviewed_at ?? "").toLocaleDateString()}</span>
              </p>
              <p className="text-sm text-[var(--color-text-muted)] line-clamp-3">
                {card.comments || "No comment"}
              </p>
            </div>
            
            {allowTogglePublic && card.submission_id && (
              <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--color-text-muted)] flex items-center gap-1.5">
                  {card.is_public ? <Globe size={14} className="text-green-500" /> : <Lock size={14} />}
                  {card.is_public ? "Public on Profile" : "Private"}
                </span>
                <button
                  onClick={() => handleToggle(card.submission_id, card.is_public)}
                  disabled={toggling[card.submission_id]}
                  className={`
                    relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2
                    ${card.is_public ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}
                    ${toggling[card.submission_id] ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  title={card.is_public ? "Make Private" : "Make Public on Profile"}
                >
                  <span className="sr-only">Make Public on Profile</span>
                  <span
                    aria-hidden="true"
                    className={`
                      pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                      ${card.is_public ? 'translate-x-4' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {cards.length > 6 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="flex items-center gap-1 text-sm text-[var(--color-candidate)] hover:underline transition"
          >
            {showAll ? (
              <>
                <ChevronUp size={14} /> Collapse
              </>
            ) : (
              <>
                <ChevronDown size={14} /> View All ({cards.length})
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}
