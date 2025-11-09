import { useState } from "react";
import { useProofs } from "@/hooks/useProofs";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ProofCardsGrid() {
  const { cards, loading } = useProofs();
  const [showAll, setShowAll] = useState(false);

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

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleCards.map((card) => (
          <div
            key={card.id}
            className="bg-[var(--color-surface)] border border-[var(--color-border)]
                       rounded-[var(--radius-card)] shadow-[var(--shadow-soft)]
                       p-4 hover:shadow-lg transition"
          >
            <h3 className="font-semibold text-[var(--color-text)] mb-1">
              {card.job_title}
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-2">
              ⭐ {card.rating?.toFixed(1) ?? "–"} ·{" "}
              {new Date(card.reviewed_at ?? "").toLocaleDateString()}
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              {card.comments || "No comment"}
            </p>
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
