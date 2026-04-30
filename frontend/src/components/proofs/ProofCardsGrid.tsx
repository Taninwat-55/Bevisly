import { useState } from "react";
import { useProofs } from "@/hooks/useProofs";
import { ChevronDown, ChevronUp, Globe, Lock, Share2, Star, BadgeCheck } from "lucide-react";
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
      <p className="text-center text-[var(--color-text-muted)] py-6 text-sm">
        Loading proof cards…
      </p>
    );

  if (!cards.length)
    return (
      <p className="text-[var(--color-text-muted)] text-sm">
        No proof cards yet — complete a task and get feedback ≥ 4★ to earn one!
      </p>
    );

  const visibleCards = showAll ? cards : cards.slice(0, 6);

  const handleShare = async (submissionId: string | null) => {
    if (!submissionId) return;
    await navigator.clipboard.writeText(`${window.location.origin}/proof/${submissionId}`);
    toast.success("Link copied!");
  };

  const handleToggle = async (submissionId: string | null, currentStatus: boolean) => {
    if (!submissionId) return;
    setToggling(prev => ({ ...prev, [submissionId]: true }));
    const result = await toggleProofPublic(submissionId, currentStatus);
    if (result.success) {
      toast.success(`Proof is now ${result.is_public ? "public" : "private"}`);
    } else {
      toast.error("Failed to update visibility");
    }
    setToggling(prev => ({ ...prev, [submissionId]: false }));
  };

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleCards.map((card) => {
          const key = card.id ?? card.submission_id ?? Math.random();
          const sid = card.submission_id;

          return (
            <div
              key={key}
              className="group relative p-px rounded-2xl transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.35) 0%, rgba(30,30,40,0) 50%, rgba(59,130,246,0.25) 100%)",
              }}
            >
              {/* Hover glow intensifier */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(139,92,246,0.55) 0%, rgba(30,30,40,0) 50%, rgba(59,130,246,0.45) 100%)",
                }}
              />

              {/* Card surface */}
              <div className="relative rounded-[calc(1rem-1px)] bg-[var(--color-surface)] flex flex-col h-full overflow-hidden">

                {/* Verified header strip */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                    <BadgeCheck size={13} className="text-violet-400 shrink-0" />
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-violet-400/80">
                      Verified
                    </span>
                  </div>
                  {card.reviewed_at && (
                    <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums">
                      {new Date(card.reviewed_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                  )}
                </div>

                {/* Main content */}
                <div className="flex-1 px-4 py-3 flex flex-col gap-2.5">
                  {/* Job title + company */}
                  <div>
                    <h3 className="font-semibold text-[var(--color-text)] text-sm leading-snug">
                      {card.job_title}
                    </h3>
                    {card.company_name && (
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {card.company_name}
                      </p>
                    )}
                  </div>

                  {/* Task pill */}
                  {card.task_title && (
                    <div className="inline-flex items-center self-start max-w-full px-2 py-1 rounded-md bg-violet-500/10 border border-violet-500/20">
                      <span className="text-[10px] font-medium text-violet-300 truncate">
                        {card.task_title}
                      </span>
                    </div>
                  )}

                  {/* Star rating */}
                  {card.rating != null && (
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            size={13}
                            className={
                              n <= Math.round(card.rating!)
                                ? "fill-amber-400 text-amber-400"
                                : "text-white/10 fill-white/10"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-amber-400">
                        {card.rating.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">/ 5</span>
                    </div>
                  )}

                  {/* Feedback quote */}
                  {card.comments && (
                    <div className="relative">
                      <span className="absolute -top-1 -left-0.5 text-2xl leading-none text-violet-500/30 font-serif select-none">
                        "
                      </span>
                      <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed pl-3">
                        {card.comments}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer toggle */}
                {allowTogglePublic && sid && (
                  <div className="px-4 pb-4">
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)]">
                        {card.is_public
                          ? <Globe size={12} className="text-emerald-400" />
                          : <Lock size={12} className="opacity-50" />}
                        {card.is_public ? "Public" : "Private"}
                      </span>

                      <div className="flex items-center gap-2.5">
                        {card.is_public && (
                          <button
                            onClick={() => handleShare(sid)}
                            title="Copy shareable link"
                            className="text-[var(--color-text-muted)] hover:text-violet-400 transition-colors"
                          >
                            <Share2 size={13} />
                          </button>
                        )}

                        {/* Toggle switch */}
                        <button
                          onClick={() => handleToggle(sid, card.is_public)}
                          disabled={toggling[sid]}
                          title={card.is_public ? "Make Private" : "Make Public"}
                          className={[
                            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
                            card.is_public ? "bg-emerald-500" : "bg-white/10",
                            toggling[sid] ? "opacity-50 cursor-not-allowed" : "",
                          ].join(" ")}
                        >
                          <span className="sr-only">Toggle visibility</span>
                          <span
                            className={[
                              "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                              card.is_public ? "translate-x-4" : "translate-x-0",
                            ].join(" ")}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {cards.length > 6 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
          >
            {showAll ? (
              <><ChevronUp size={14} /> Collapse</>
            ) : (
              <><ChevronDown size={14} /> View All ({cards.length})</>
            )}
          </button>
        </div>
      )}
    </>
  );
}
