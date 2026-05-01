import { Star, Calendar, ArrowRight, CheckCircle2, Clock, Building2 } from "lucide-react";
import type { CandidateFeedbackEntry } from "@/types/candidate";

interface ProofCardProps {
  proof: CandidateFeedbackEntry;
  onClick: () => void;
}

export default function ProofCard({ proof, onClick }: ProofCardProps) {
  const fb = proof.feedback?.[0];
  const reviewed = proof.status === "reviewed" && fb;
  const company = proof.jobs?.company;
  const companyInitial = company?.[0]?.toUpperCase() ?? "?";

  return (
    <div
      onClick={onClick}
      className="group relative flex rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand-primary)]/40 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-brand-primary)]/5 cursor-pointer overflow-hidden"
    >
      {/* Left accent strip */}
      <div
        className={`w-1 shrink-0 transition-all duration-300 ${
          reviewed
            ? "bg-gradient-to-b from-emerald-400 to-emerald-600"
            : "bg-gradient-to-b from-amber-400 to-amber-600"
        }`}
      />

      {/* Card body */}
      <div className="flex-1 p-6 min-w-0">

        {/* ── Top Row: avatar + task info + status ── */}
        <div className="flex items-start gap-4 mb-5">

          {/* Company avatar */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)]/15 to-[var(--color-brand-secondary)]/15 border border-[var(--color-border)] flex items-center justify-center text-[var(--color-brand-primary)] font-bold text-xl shrink-0 group-hover:scale-105 transition-transform duration-300">
            {companyInitial}
          </div>

          {/* Task + job info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-[var(--color-text)] leading-tight mb-1 group-hover:text-[var(--color-brand-primary)] transition-colors duration-200 truncate">
              {proof.proof_tasks?.title || "Proof Task"}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
              {company && <Building2 size={13} className="shrink-0" />}
              <span className="truncate">
                {proof.jobs?.title}
                {company && (
                  <span className="text-[var(--color-text-muted)]/60"> · {company}</span>
                )}
              </span>
            </div>
          </div>

          {/* Status badge */}
          {reviewed ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-bold uppercase tracking-wider shrink-0">
              <CheckCircle2 size={12} />
              Reviewed
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] font-bold uppercase tracking-wider shrink-0">
              <Clock size={12} />
              Pending
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-[var(--color-border)]/60 mb-5" />

        {/* ── Content: rating + feedback OR pending ── */}
        {reviewed ? (
          <div className="space-y-3">
            {/* Star rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={
                      i < (fb.stars ?? 0)
                        ? "text-amber-400 fill-amber-400"
                        : "text-[var(--color-border)] fill-[var(--color-border)]"
                    }
                  />
                ))}
              </div>
              <span className="text-2xl font-bold text-[var(--color-text)]">
                {fb.stars}
              </span>
              <span className="text-sm text-[var(--color-text-muted)]">/ 5</span>
            </div>

            {/* Feedback snippet */}
            {fb.comments && (
              <div className="pl-4 border-l-2 border-[var(--color-brand-primary)]/25 group-hover:border-[var(--color-brand-primary)]/50 transition-colors duration-300">
                <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 leading-relaxed italic">
                  "{fb.comments}"
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 py-1">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <p className="text-sm text-[var(--color-text-muted)] italic">
              Awaiting employer feedback...
            </p>
          </div>
        )}

        {/* ── Footer: date + CTA ── */}
        <div className="mt-5 pt-4 border-t border-[var(--color-border)]/60 flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <Calendar size={13} />
            {new Date(proof.created_at ?? "").toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-brand-primary)] group-hover:gap-3 transition-all duration-200">
            View Details
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </div>
        </div>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--color-brand-primary)]/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}
