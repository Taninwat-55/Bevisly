import { Clock, Brain, FileText, Link as LinkIcon, Code2 } from "lucide-react";
import type { ProofTask } from "@/types/shared";

interface TaskRequirementsPanelProps {
    task: {
        title?: string | null;
        description?: string | null;
        expected_time?: string | null;
        submission_type?: "link" | "file" | "text" | "mixed" | "github_repo";
        ai_tools_allowed?: boolean | null;
        recommended_platform?: string | null;
    } | null;
}

const SUBMISSION_TYPE_LABELS: Record<string, { label: string; icon: typeof FileText }> = {
    link: { label: "External Link", icon: LinkIcon },
    file: { label: "File Upload", icon: FileText },
    text: { label: "Written Response", icon: FileText },
    mixed: { label: "Multiple Formats", icon: FileText },
    github_repo: { label: "GitHub Repository", icon: Code2 },
};

export default function TaskRequirementsPanel({ task }: TaskRequirementsPanelProps) {
    if (!task) {
        return (
            <div className="glass-panel rounded-2xl p-6">
                <p className="text-sm text-[var(--color-text-muted)]">Task details not available</p>
            </div>
        );
    }

    const submissionInfo = SUBMISSION_TYPE_LABELS[task.submission_type || "link"];
    const SubmissionIcon = submissionInfo?.icon || FileText;

    return (
        <div className="glass-panel rounded-2xl p-6 h-full space-y-5">
            {/* Header */}
            <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-employer)] mb-2 block">
                    Task Requirements
                </span>
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    {task.title || "Untitled Task"}
                </h3>
            </div>

            {/* Description */}
            {task.description && (
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                        Description
                    </h4>
                    <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                        <p className="text-sm text-[var(--color-text)] whitespace-pre-wrap leading-relaxed">
                            {task.description}
                        </p>
                    </div>
                </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3">
                {/* Expected Time */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <Clock size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Time</p>
                        <p className="text-sm font-medium text-[var(--color-text)]">
                            {task.expected_time || "Flexible"}
                        </p>
                    </div>
                </div>

                {/* Submission Type */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                    <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                        <SubmissionIcon size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Format</p>
                        <p className="text-sm font-medium text-[var(--color-text)]">
                            {submissionInfo?.label || "Any"}
                        </p>
                    </div>
                </div>

                {/* AI Tools */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                    <div className={`p-2 rounded-lg ${task.ai_tools_allowed
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                        }`}>
                        <Brain size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">AI Tools</p>
                        <p className="text-sm font-medium text-[var(--color-text)]">
                            {task.ai_tools_allowed ? "Allowed" : "Not Allowed"}
                        </p>
                    </div>
                </div>

                {/* Platform */}
                {task.recommended_platform && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                            <Code2 size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Platform</p>
                            <p className="text-sm font-medium text-[var(--color-text)] truncate max-w-[100px]">
                                GitHub
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Evaluation Criteria */}
            <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Evaluation Focus
                </h4>
                <div className="flex flex-wrap gap-2">
                    {["Code Quality", "Completeness", "Documentation", "Best Practices"].map((criteria) => (
                        <span
                            key={criteria}
                            className="px-2.5 py-1 rounded-full text-xs font-medium 
                bg-[var(--color-employer-light)] text-[var(--color-employer-dark)]"
                        >
                            {criteria}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
