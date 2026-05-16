import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import type { RubricCriterion, RubricScore } from "@/types";

export type RecommendedAction = "shortlist" | "discuss" | "pass";

export interface AIBreakdownResult {
  rubricScores?: RubricScore[];
  strengths?: string;
  improvements?: string;
  suggestedRating?: number;
}

export interface SubmissionBreakdownCardProps {
  result: AIBreakdownResult;
  rubricCriteria: RubricCriterion[] | null;
  onApply: () => void;
  isLocked?: boolean;
}

function computeWeightedScore(criteria: RubricCriterion[], scores: RubricScore[]): number {
  const totalWeight = criteria.reduce((s, c) => s + (Number(c.weight) || 0), 0);
  if (totalWeight <= 0) return 0;
  return criteria.reduce((s, c) => {
    const match = scores.find(r => r.name === c.name);
    return s + (match?.score ?? 0) * (Number(c.weight) || 0);
  }, 0) / totalWeight;
}

function deriveAction(score: number): RecommendedAction {
  if (score >= 4.0) return "shortlist";
  if (score >= 3.0) return "discuss";
  return "pass";
}

function parseBullets(text: string, max = 3): string[] {
  return text
    .split(/\n|•|,(?=[A-Z])/)
    .map(s => s.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, max);
}

const ACTION_CONFIG: Record<RecommendedAction, { label: string; bg: string; text: string; dot: string }> = {
  shortlist: {
    label: "Shortlist recommended",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  discuss: {
    label: "Discuss recommended",
    bg: "bg-amber-100 dark:bg-amber-900/20",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  pass: {
    label: "Pass recommended",
    bg: "bg-red-100 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
};

function ScorePips({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${i < score ? "bg-[var(--color-brand-primary)]" : "bg-[var(--color-border)]"}`}
        />
      ))}
    </div>
  );
}

function RubricBreakdownSection({
  criteria,
  scores,
}: {
  criteria: RubricCriterion[];
  scores: RubricScore[];
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
        Rubric Breakdown
      </p>
      {criteria.map(c => {
        const match = scores.find(r => r.name === c.name);
        const score = match?.score ?? 0;
        const note = match?.note;
        return (
          <div key={c.name} className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                  {c.name}
                  <span className="ml-2 text-[10px] font-medium text-[var(--color-text-muted)]">
                    weight {c.weight}%
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <ScorePips score={score} />
                <span className="text-xs font-medium text-[var(--color-text-muted)] w-8 text-right">
                  {score}/5
                </span>
              </div>
            </div>
            {note && (
              <p className="text-xs text-[var(--color-text-muted)] italic leading-relaxed pl-1 border-l-2 border-[var(--color-border)]">
                "{note}"
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function LegacyBreakdownSection({ rating }: { rating: number }) {
  return (
    <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--color-text)]">Suggested Rating</p>
        <div className="flex items-center gap-2.5">
          <ScorePips score={rating} />
          <span className="text-xs font-medium text-[var(--color-text-muted)] w-8 text-right">
            {rating}/5
          </span>
        </div>
      </div>
    </div>
  );
}

function StrengthsImprovementsSection({
  strengths,
  improvements,
}: {
  strengths?: string;
  improvements?: string;
}) {
  const strengthBullets = strengths ? parseBullets(strengths) : [];
  const improvementBullets = improvements ? parseBullets(improvements) : [];

  if (strengthBullets.length === 0 && improvementBullets.length === 0) return null;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {strengthBullets.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Strengths
          </p>
          <ul className="space-y-1.5">
            {strengthBullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}
      {improvementBullets.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Areas to Address
          </p>
          <ul className="space-y-1.5">
            {improvementBullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function SubmissionBreakdownCard({
  result,
  rubricCriteria,
  onApply,
  isLocked = false,
}: SubmissionBreakdownCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  const hasRubric =
    Array.isArray(rubricCriteria) &&
    rubricCriteria.length > 0 &&
    Array.isArray(result.rubricScores) &&
    result.rubricScores.length > 0;

  const weightedScore = hasRubric
    ? computeWeightedScore(rubricCriteria!, result.rubricScores!)
    : (result.suggestedRating ?? 0);

  const action = deriveAction(weightedScore);
  const actionCfg = ACTION_CONFIG[action];

  return (
    <div className="glass-panel rounded-2xl border border-[var(--color-border)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-2.5">
          <Sparkles size={16} className="text-purple-500 shrink-0" />
          <span className="text-sm font-semibold text-[var(--color-text)]">
            AI Evidence Summary
          </span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${actionCfg.bg} ${actionCfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${actionCfg.dot}`} />
            {actionCfg.label}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(c => !c)}
          className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
          aria-label={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {/* Collapsible body */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 pb-5 space-y-5 border-t border-[var(--color-border)] pt-5">
              {hasRubric ? (
                <RubricBreakdownSection
                  criteria={rubricCriteria!}
                  scores={result.rubricScores!}
                />
              ) : (
                result.suggestedRating != null && (
                  <LegacyBreakdownSection rating={result.suggestedRating} />
                )
              )}

              <StrengthsImprovementsSection
                strengths={result.strengths}
                improvements={result.improvements}
              />

              {!isLocked && (
                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                  <Link
                    to="/docs#how-ai-works"
                    className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] transition-colors"
                  >
                    How Bevisly uses AI →
                  </Link>
                  <button
                    type="button"
                    onClick={onApply}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    Apply to my review
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
              {isLocked && (
                <p className="text-[10px] text-[var(--color-text-muted)] italic text-right">
                  Review already submitted.{" "}
                  <Link to="/docs#how-ai-works" className="hover:text-[var(--color-brand-primary)] transition-colors">
                    How Bevisly uses AI →
                  </Link>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
