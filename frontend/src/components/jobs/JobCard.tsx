import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
    Briefcase,
    MapPin,
    Clock,
    DollarSign,
    ArrowRight,
    ShieldCheck,
    Heart
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CandidateJob } from "@/types";
import ResponsibilityScoreBadge from "@/components/employer/ResponsibilityScoreBadge";

interface JobCardProps {
    job: CandidateJob;
    compact?: boolean;
    isSaved?: boolean;
    onToggleSave?: (e: React.MouseEvent) => void;
}

export default function JobCard({ job, compact = false, isSaved, onToggleSave }: JobCardProps) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const role = user?.role;

    const handleCardClick = () => {
        if (role === 'employer') {
            navigate(`/jobs/${job.id}`);
        } else if (role === 'candidate') {
            navigate(`/candidate/job/${job.id}`);
        } else {
            navigate(`/jobs/${job.id}`);
        }
    };

    // Format salary
    const formatSalary = () => {
        const type = job.compensation_type;
        const periodLabel = job.pay_period === 'yearly' ? '/yr' : job.pay_period === 'hourly' ? '/hr' : '/mo';
        const equityStr = job.equity_min && job.equity_max
            ? `${job.equity_min}%–${job.equity_max}% equity`
            : null;
        const salaryStr = job.salary_min && job.salary_max
            ? `${job.payment_currency} ${job.salary_min.toLocaleString()}–${job.salary_max.toLocaleString()}${periodLabel}`
            : job.payment_amount
                ? `${job.payment_currency} ${job.payment_amount.toLocaleString()}${periodLabel}`
                : null;

        if (type === 'volunteer' || (!type && !job.paid)) return "Volunteer / Unpaid";
        if (type === 'equity_only') return equityStr || "Equity";
        if (type === 'salary_and_equity') return [salaryStr, equityStr].filter(Boolean).join(' + ') || "Competitive";
        return salaryStr || "Competitive";
    };

    const tasksCount = job.proof_tasks?.length || 0;
    const timeEstimate = job.proof_tasks?.[0]?.expected_time || "Top-tier";

    return (
        <div
            className={`group relative flex flex-col bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:shadow-md transition-all duration-150 overflow-hidden ${compact ? 'p-5' : 'p-6'} cursor-pointer`}
            onClick={handleCardClick}
        >

            {/* Wishlist Button (Optional) */}
            {onToggleSave && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(e);
                    }}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    title={isSaved ? "Unsave" : "Save for later"}
                >
                    <Heart
                        size={18}
                        className={isSaved ? "fill-red-500 text-red-500" : ""}
                    />
                </button>
            )}

            {/* Header */}
            <div className="flex items-start gap-4 mb-4 pr-2">
                {!compact && (
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] font-bold shadow-sm overflow-hidden">
                        {job.company_logo ? (
                            <img src={job.company_logo} alt={job.company ?? "Company"} className="w-full h-full object-cover" />
                        ) : (
                            job.company ? job.company.charAt(0).toUpperCase() : <Briefcase size={20} />
                        )}
                    </div>
                )}
                <div className="flex-1 min-w-0 pt-0.5">
                    <h3
                        className="font-bold font-display text-lg text-[var(--color-text)] leading-tight truncate"
                        title={job.title}
                    >
                        {job.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <p className="text-sm text-[var(--color-text-muted)] font-medium truncate">
                            {job.company}
                        </p>
                        {job.employer_verified && (
                            <span title="Verified Employer" className="inline-flex items-center gap-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                                <ShieldCheck size={13} className="text-blue-500" />
                                Verified
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-muted)]">
                    <MapPin size={12} />
                    {job.location}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-muted)]">
                    <DollarSign size={12} />
                    {formatSalary()}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-brand-subtle)] border border-[var(--color-brand-subtle-border)] text-xs font-medium text-[var(--color-brand-primary)]">
                    <ShieldCheck size={12} />
                    {tasksCount} Proof Task{tasksCount !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Footer / CTA */}
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-[var(--color-border)]/50">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                        <Clock size={12} />
                        <span>{timeEstimate}</span>
                    </div>
                    {(job.company_responsibility_score !== undefined) && (
                        <span onClick={(e) => e.stopPropagation()}>
                            <ResponsibilityScoreBadge score={job.company_responsibility_score} size="sm" showLabel={false} />
                        </span>
                    )}
                </div>

                <Button
                    size="sm"
                    variant="ghost"
                    className="text-[var(--color-brand-primary)] p-0 px-3 h-8"
                    rightIcon={<ArrowRight size={14} />}
                >
                    View Role
                </Button>
            </div>
        </div>
    );
}
