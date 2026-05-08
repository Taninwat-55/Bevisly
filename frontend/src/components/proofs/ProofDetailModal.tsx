import { Fragment, useState } from "react";
import { createPortal } from "react-dom";
import { Dialog, Transition } from "@headlessui/react";
import { X, Star, CheckCircle, ArrowRight, Globe, Lock, Share2, ExternalLink } from "lucide-react";
import type { ProofCard } from "@/hooks/useProofs";
import ShareModal from "@/components/sharing/ShareModal";

interface ProofDetailModalProps {
  card: ProofCard | null;
  isOpen: boolean;
  onClose: () => void;
  username?: string | null;
}

export default function ProofDetailModal({ card, isOpen, onClose, username }: ProofDetailModalProps) {
  const [showShare, setShowShare] = useState(false);
  if (!card) return null;

  const strengthLines = card.strengths
    ? card.strengths.split("\n").filter((l) => l.trim())
    : [];
  const improvementLines = card.improvements
    ? card.improvements.split("\n").filter((l) => l.trim())
    : [];

  return (
    <>
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl transition-all">

                <div
                  className="h-1.5 w-full"
                  style={{ background: "linear-gradient(90deg, #7c3aed, #3b82f6)" }}
                />

                <div className="sticky top-0 z-10 flex items-start justify-between px-6 py-5 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                  <div>
                    <Dialog.Title className="text-xl font-bold text-[var(--color-text)] leading-tight">
                      {card.job_title || "Proof Details"}
                    </Dialog.Title>
                    {card.company_name && (
                      <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                        {card.company_name}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="ml-4 p-2 rounded-full hover:bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors shrink-0"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-10rem)]">

                  {card.rating != null && (
                    <div className="flex flex-col items-center justify-center py-6 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-3">
                        Overall Rating
                      </p>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            size={28}
                            className={
                              n <= Math.round(card.rating!)
                                ? "fill-amber-400 text-amber-400"
                                : "fill-white/10 text-white/10"
                            }
                          />
                        ))}
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-bold text-amber-400">
                          {card.rating.toFixed(1)}
                        </span>
                        <span className="text-base text-[var(--color-text-muted)]">/ 5</span>
                      </div>
                    </div>
                  )}

                  {card.task_title && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
                        Task Completed
                      </p>
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-sm font-medium text-violet-300">
                        {card.task_title}
                      </span>
                    </div>
                  )}

                  {card.comments && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-3">
                        Employer Feedback
                      </p>
                      <blockquote className="pl-4 py-3 pr-4 rounded-r-xl bg-violet-500/8 border-l-4 border-violet-500/50 text-sm text-[var(--color-text)] leading-relaxed">
                        {card.comments}
                      </blockquote>
                    </div>
                  )}

                  {strengthLines.length > 0 && (
                    <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                      <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-1.5">
                        <CheckCircle size={13} /> Strengths
                      </p>
                      <ul className="space-y-1.5">
                        {strengthLines.map((line, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text)]">
                            <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                            {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {improvementLines.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/8 border border-amber-500/20">
                      <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-1.5">
                        <ArrowRight size={13} /> Areas for Improvement
                      </p>
                      <ul className="space-y-1.5">
                        {improvementLines.map((line, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text)]">
                            <ArrowRight size={14} className="text-amber-400 mt-0.5 shrink-0" />
                            {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                      {card.reviewed_at && (
                        <span>
                          Reviewed{" "}
                          {new Date(card.reviewed_at).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {card.is_public ? (
                        <>
                          <Globe size={13} className="text-emerald-400 shrink-0" />
                          <span className="text-xs text-emerald-400 font-medium">
                            This proof is visible on your public profile
                          </span>
                          {username && (
                            <a
                              href={`/@${username}`}
                              className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors ml-1"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View on Public Profile
                            </a>
                          )}
                        </>
                      ) : (
                        <>
                          <Lock size={13} className="text-[var(--color-text-muted)] shrink-0" />
                          <span className="text-xs text-[var(--color-text-muted)]">
                            Only you can see this proof.
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Share / Certificate actions */}
                {card.is_public && card.submission_id && (
                  <div className="px-6 pb-5 pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setShowShare(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--color-brand-primary)] text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-[var(--shadow-glow-cta)]"
                    >
                      <Share2 size={15} />
                      Share this Achievement
                    </button>
                    <a
                      href={`/proof/${card.submission_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] text-sm font-medium hover:bg-[var(--color-bg)] transition-colors"
                    >
                      <ExternalLink size={15} />
                      View Certificate
                    </a>
                  </div>
                )}

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>

    {/* Share Modal — portaled to escape Dialog focus trap */}
    {card.is_public && createPortal(
      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        taskTitle={card.task_title || card.job_title || "Proof Task"}
        companyName={card.company_name || "Bevisly"}
        rating={card.rating ?? undefined}
        username={username}
      />,
      document.body
    )}
    </>
  );
}
