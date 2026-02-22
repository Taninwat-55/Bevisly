import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { createFeedback } from "@/lib/api/feedback";
import { suggestFeedback } from "@/lib/api/ai";
import { updateSubmissionStatus } from "@/lib/api/mutations";
import { getSubmissionById, getSubmissionsByJob } from "@/lib/api/submissions";
import { useAuth } from "@/hooks/useAuth";
import type { EmployerSubmission } from "@/types";
import {
    Loader2, ArrowRight, ArrowLeft, FileText, ExternalLink, User,
    Download, AlignLeft, Quote, Video, ChevronLeft, ChevronRight,
    CheckCircle2
} from "lucide-react";
import { distributeCredits } from "@/lib/api/credits";
import { Star, Sparkles } from "lucide-react";


// Inline TaskRequirementsPanel (original was deleted)
interface TaskInfo {
    title: string | null;
    description: string | null;
    expected_time: string | null;
    submission_type: "link" | "file" | "text";
    ai_tools_allowed: boolean;
}

function TaskRequirementsPanel({ task }: { task: TaskInfo | null }) {
    if (!task) {
        return (
            <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
                    Task Requirements
                </h3>
                <p className="text-sm text-[var(--color-text-muted)]">No task information available.</p>
            </div>
        );
    }

    return (
        <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-employer)] mb-2">
                Task Requirements
            </h3>
            <div>
                <p className="font-semibold text-[var(--color-text)]">{task.title}</p>
                {task.description && (
                    <p className="text-sm text-[var(--color-text-muted)] mt-2">{task.description}</p>
                )}
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
                {task.expected_time && (
                    <span className="px-2 py-1 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)]">
                        ⏱ {task.expected_time}
                    </span>
                )}
                <span className="px-2 py-1 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)]">
                    📎 {task.submission_type}
                </span>
                <span className="px-2 py-1 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)]">
                    {task.ai_tools_allowed ? "🤖 AI Allowed" : "🚫 No AI"}
                </span>
            </div>
        </div>
    );
}

// Inline Scorecard (original was deleted)
interface ScorecardProps {
    stars: number;
    setStars: (v: number) => void;
    strengths: string;
    setStrengths: (v: string) => void;
    improvements: string;
    setImprovements: (v: string) => void;
    isLocked: boolean;
    onSuggestAI: () => void;
    isSuggesting: boolean;
}

function Scorecard({
    stars,
    setStars,
    strengths,
    setStrengths,
    improvements,
    setImprovements,
    isLocked,
    onSuggestAI,
    isSuggesting,
}: ScorecardProps) {
    return (
        <div className="glass-panel rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-employer)]">
                    Your Review
                </h3>
                {!isLocked && (
                    <button
                        type="button"
                        onClick={onSuggestAI}
                        disabled={isSuggesting}
                        className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        {isSuggesting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        Auto-Draft
                    </button>
                )}
            </div>

            {/* Star Rating */}
            <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Rating
                </label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <button
                            key={n}
                            type="button"
                            disabled={isLocked}
                            onClick={() => setStars(n)}
                            className={`p-1 transition-colors ${isLocked ? "cursor-not-allowed" : "hover:scale-110"}`}
                        >
                            <Star
                                size={24}
                                className={n <= stars ? "fill-yellow-400 text-yellow-400" : "text-[var(--color-border)]"}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Strengths */}
            <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Strengths
                </label>
                <textarea
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    disabled={isLocked}
                    placeholder="What did the candidate do well?"
                    className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-employer)] disabled:opacity-60"
                    rows={3}
                />
            </div>

            {/* Improvements */}
            <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Areas for Improvement
                </label>
                <textarea
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    disabled={isLocked}
                    placeholder="What could be improved?"
                    className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-employer)] disabled:opacity-60"
                    rows={3}
                />
            </div>
        </div>
    );
}

// Helper function to detect video links
const getVideoEmbed = (url: string | null) => {
    if (!url) return null;

    // Loom Embed
    if (url.includes("loom.com/share")) {
        const videoId = url.split("share/")[1]?.split("?")[0];
        return (
            <iframe
                src={`https://www.loom.com/embed/${videoId}`}
                frameBorder="0"
                allowFullScreen
                className="w-full aspect-video rounded-xl"
            />
        );
    }

    // YouTube Embed
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
        let videoId = "";
        if (url.includes("v=")) videoId = url.split("v=")[1]?.split("&")[0];
        else if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1]?.split("?")[0];

        return (
            <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                allowFullScreen
                className="w-full aspect-video rounded-xl"
            />
        );
    }

    return null;
};

interface EmployerReviewProofProps {
    submissionId?: string;
    onBack?: () => void;
    onNavigate?: (id: string) => void;
}

export default function EmployerReviewProof({ submissionId, onBack, onNavigate }: EmployerReviewProofProps) {
    const params = useParams();
    const id = submissionId || params.id;
    const { user } = useAuth();
    const navigate = useNavigate();

    const submissionsCache = useRef<EmployerSubmission[]>([]);
    const [submission, setSubmission] = useState<EmployerSubmission | null>(null);

    const [strengths, setStrengths] = useState("");
    const [improvements, setImprovements] = useState("");
    const [stars, setStars] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [suggestingAI, setSuggestingAI] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const isReviewed = submission?.status === "reviewed" || (submission?.feedback && submission.feedback.length > 0);

    useEffect(() => {
        if (!id) return;
        const loadSubmission = async () => {
            try {
                const data = await getSubmissionById(id);
                setSubmission(data);

                if (data.feedback?.[0]) {
                    setStrengths(data.feedback[0].strengths || "");
                    setImprovements(data.feedback[0].improvements || "");
                    setStars(data.feedback[0].stars || 0);
                }

                if (data?.job_id && submissionsCache.current.length === 0) {
                    const allSubs = await getSubmissionsByJob(data.job_id);
                    submissionsCache.current = allSubs;
                }
                const idx = submissionsCache.current.findIndex((s) => s.id === id);
                if (idx !== -1) setCurrentIndex(idx);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load submission");
            } finally {
                setFetching(false);
            }
        };
        loadSubmission();
    }, [id]);

    const totalSubmissions = submissionsCache.current.length;
    const prevCandidate = currentIndex > 0 ? submissionsCache.current[currentIndex - 1] : null;
    const nextCandidate = currentIndex < totalSubmissions - 1 ? submissionsCache.current[currentIndex + 1] : null;

    const handleSuggestFeedback = async () => {
        if (!stars) {
            toast.error("Please rate with stars first so AI knows the sentiment.");
            return;
        }
        setSuggestingAI(true);
        const toastId = toast.loading("Analyzing submission...");
        try {
            const criteria = submission?.proof_tasks?.title || "General";
            const content = submission?.text_response || "Checked file/link.";
            
            const feedback = await suggestFeedback(stars, criteria, content);

            if (feedback) {
                if (stars >= 4) {
                     setStrengths(prev => prev ? prev + "\n" + feedback : feedback);
                } else {
                     setImprovements(prev => prev ? prev + "\n" + feedback : feedback);
                }
                toast.success("Here's a draft! feel free to edit.", { id: toastId });
            }
        } catch (e: unknown) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : "Failed to suggest feedback.";
            // Display the actual error message rather than assuming it's the API key
            toast.error(errorMessage, { id: toastId });
        } finally {
            setSuggestingAI(false);
        }
    };

    async function handleSubmitFeedback(direction?: "next" | "previous") {
        if (!user?.id || !submission) return;

        if (isReviewed) {
            if (direction === "next" && nextCandidate) {
                if (onNavigate) onNavigate(nextCandidate.id);
                else navigate(`/employer/review/${nextCandidate.id}`);
            } else if (direction === "previous" && prevCandidate) {
                if (onNavigate) onNavigate(prevCandidate.id);
                else navigate(`/employer/review/${prevCandidate.id}`);
            }
            return;
        }

        if (!stars) return toast.error("Please provide a rating.");

        setLoading(true);
        try {
            await createFeedback({
                submission_id: submission.id,
                employer_id: user.id,
                strengths,
                improvements,
                stars,
            });

            await updateSubmissionStatus(submission.id, "reviewed");

            if (stars >= 4) {
                await distributeCredits(
                    submission.user_id || "",
                    50,
                    "quality_bonus",
                    submission.id
                );
                toast.success("✨ Quality Bonus (50 Credits) awarded!");
            }

            toast.success("✅ Feedback submitted!");

            if (direction === "next" && nextCandidate) {
                if (onNavigate) onNavigate(nextCandidate.id);
                else navigate(`/employer/review/${nextCandidate.id}`);
            } else if (direction === "previous" && prevCandidate) {
                if (onNavigate) onNavigate(prevCandidate.id);
                else navigate(`/employer/review/${prevCandidate.id}`);
            } else {
                if (onBack) onBack();
                else navigate("/employer");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit feedback.");
        } finally {
            setLoading(false);
        }
    }

    if (fetching) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen gap-3">
                <Loader2 className="animate-spin text-[var(--color-employer)]" size={32} />
                <p className="text-sm text-[var(--color-text-muted)]">Loading submission...</p>
            </div>
        );
    }

    if (!submission) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen gap-3">
                <p className="text-lg text-[var(--color-text)]">Submission not found</p>
                <button
                    onClick={() => navigate("/employer")}
                    className="text-sm text-[var(--color-employer)] hover:underline"
                >
                    ← Back to Submissions
                </button>
            </div>
        );
    }

    // Determine submission content
    const rawLink = submission.submission_link;
    const rawFile = submission.file_url;
    const rawText = submission.text_response;

    let displayFile = rawFile;
    let displayText = rawText;
    let displayLink = rawLink;

    // Legacy Support logic
    if (!displayFile && !displayText) {
        if (rawLink && (rawLink.includes("/storage/v1/object/public/") || /\.(pdf|zip|docx|png|jpg|jpeg)$/i.test(rawLink))) {
            displayFile = rawLink;
            displayLink = null;
        } else if (rawLink && !rawLink.startsWith("http")) {
            displayText = rawLink;
            displayLink = null;
        }
    }

    const hasAnySubmission = displayFile || displayLink || displayText;

    // Get task info for requirements panel
    const taskInfo = submission.proof_tasks ? {
        title: submission.proof_tasks.title,
        description: null, // Would need to fetch full task details
        expected_time: null,
        submission_type: "link" as const,
        ai_tools_allowed: true,
    } : null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[var(--color-bg)] px-4 md:px-8 py-6 md:py-10"
        >
            {/* Header */}
            <header className="max-w-7xl mx-auto mb-6">
                <button
                    onClick={() => {
                        if (onBack) onBack();
                        else navigate("/employer");
                    }}
                    className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-4 transition-colors"
                >
                    <ChevronLeft size={16} />
                    Back to Submissions
                </button>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="heading-lg mb-1">{submission.proof_tasks?.title || "Review Submission"}</h1>
                        <p className="text-[var(--color-text-muted)]">
                            Job: {submission.jobs?.title || "—"}
                        </p>
                    </div>

                    {/* Candidate Navigation */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                if (prevCandidate) {
                                    if (onNavigate) onNavigate(prevCandidate.id);
                                    else navigate(`/employer/review/${prevCandidate.id}`);
                                }
                            }}
                            disabled={!prevCandidate}
                            className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] 
                hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] 
                disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <span className="text-sm text-[var(--color-text-muted)] font-medium">
                            {currentIndex + 1} of {totalSubmissions || 1}
                        </span>

                        <button
                            onClick={() => {
                                if (nextCandidate) {
                                    if (onNavigate) onNavigate(nextCandidate.id);
                                    else navigate(`/employer/review/${nextCandidate.id}`);
                                }
                            }}
                            disabled={!nextCandidate}
                            className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] 
                hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] 
                disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content - Side by Side Layout */}
            <main className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* LEFT: Task Requirements (2 cols) */}
                    <aside className="lg:col-span-2">
                        <TaskRequirementsPanel task={taskInfo} />
                    </aside>

                    {/* RIGHT: Candidate Submission (3 cols) */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Candidate Info Bar */}
                        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[var(--color-candidate)]/10 flex items-center justify-center text-[var(--color-candidate-dark)]">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--color-text)]">
                                        {submission.profiles?.full_name || "Anonymous"}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-muted)]">
                                        {submission.profiles?.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link
                                    to={`/candidate/${submission.user_id}`}
                                    target="_blank"
                                    className="p-2 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all"
                                    title="View Profile"
                                >
                                    <ExternalLink size={18} />
                                </Link>
                                {submission.resume_url && (
                                    <a
                                        href={submission.resume_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-2 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all"
                                        title="View Resume"
                                    >
                                        <FileText size={18} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Submission Content */}
                        <div className="glass-panel rounded-2xl p-6 space-y-5">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-employer)] mb-4">
                                Candidate Submission
                            </h3>

                            {/* Video Section */}
                            {submission.video_url && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                                        <Video size={16} />
                                        Video Walkthrough
                                    </div>
                                    {getVideoEmbed(submission.video_url) || (
                                        <a
                                            href={submission.video_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-between p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-bg-hover)] transition group"
                                        >
                                            <span className="text-sm text-[var(--color-text)] underline decoration-dotted truncate max-w-[300px]">
                                                {submission.video_url}
                                            </span>
                                            <ExternalLink size={14} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]" />
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* File Block */}
                            {displayFile && (
                                <div className="flex items-center gap-4 p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                                    <div className="p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] text-[var(--color-candidate)]">
                                        <FileText size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-[var(--color-text)]">Uploaded File</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">Click to download</p>
                                    </div>
                                    <a
                                        href={displayFile}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-employer)] text-white rounded-xl hover:brightness-110 text-sm font-medium transition"
                                    >
                                        <Download size={16} />
                                        Download
                                    </a>
                                </div>
                            )}

                            {/* Link Block */}
                            {displayLink && (
                                <div className="flex items-center gap-4 p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                                    <div className="p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] text-[var(--color-candidate)]">
                                        <ExternalLink size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[var(--color-text)]">External Link</p>
                                        <a
                                            href={displayLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-[var(--color-employer-dark)] hover:underline truncate block"
                                        >
                                            {displayLink}
                                        </a>
                                    </div>
                                    <a
                                        href={displayLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] rounded-xl hover:bg-[var(--color-bg)] text-sm font-medium transition"
                                    >
                                        Open <ArrowRight size={14} />
                                    </a>
                                </div>
                            )}

                            {/* Text Block */}
                            {displayText && (
                                <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                                    <div className="flex items-center gap-2 mb-2 text-[var(--color-candidate)]">
                                        <AlignLeft size={16} />
                                        <span className="text-xs font-bold uppercase">Text Response</span>
                                    </div>
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--color-text)]">
                                        <ReactMarkdown>{displayText}</ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {/* Empty State */}
                            {!hasAnySubmission && !submission.video_url && (
                                <div className="p-8 text-center border border-dashed border-[var(--color-border)] rounded-xl text-[var(--color-text-muted)]">
                                    No submission content found. Check reflections below.
                                </div>
                            )}
                        </div>

                        {/* Resume / CV Panel */}
                        {(submission.resume_url || submission.profiles?.resume_url) && (
                            <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-employer)] mb-4 flex items-center gap-2">
                                <FileText size={16} /> Candidate Resume / CV
                                </h3>
                                
                                <div className="flex items-center justify-between p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-[var(--color-text)]">{submission.profiles?.full_name}'s Resume</p>
                                            <p className="text-xs text-[var(--color-text-muted)]">Available for review</p>
                                        </div>
                                    </div>
                                    <a
                                        href={submission.resume_url || submission.profiles?.resume_url || undefined}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg)] rounded-xl text-sm font-semibold transition"
                                    >
                                        <Download size={16} /> Download Open
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Reflection */}
                        {submission.reflection && (
                            <div className="glass-panel rounded-2xl p-6">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                                    Candidate Reflection
                                </h3>
                                <div className="relative p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                                    <Quote size={20} className="absolute top-4 left-4 text-[var(--color-border)] opacity-50" />
                                    <div className="pl-8 prose prose-sm dark:prose-invert max-w-none text-[var(--color-text)]">
                                        <ReactMarkdown>{submission.reflection}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Scorecard Section */}
                <div className="mt-8">
                    <Scorecard
                        stars={stars}
                        setStars={setStars}
                        strengths={strengths}
                        setStrengths={setStrengths}
                        improvements={improvements}
                        setImprovements={setImprovements}
                        isLocked={!!isReviewed}
                        onSuggestAI={handleSuggestFeedback}
                        isSuggesting={suggestingAI}
                    />
                </div>

                {/* Action Bar */}
                <div className="mt-6 flex items-center justify-between p-4 glass-panel rounded-2xl">
                    <button
                        onClick={() => prevCandidate && navigate(`/employer/review/${prevCandidate.id}`)}
                        disabled={!prevCandidate}
                        className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>

                    <motion.button
                        onClick={() => handleSubmitFeedback("next")}
                        disabled={loading || (!isReviewed && !stars)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all
              ${isReviewed
                                ? "bg-emerald-500 text-white"
                                : "bg-[var(--color-employer)] text-white hover:brightness-110"
                            } disabled:opacity-50`}
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {!loading && isReviewed && <CheckCircle2 size={16} />}
                        {isReviewed ? "Next Candidate" : "Submit Review"}
                    </motion.button>

                    <button
                        onClick={() => nextCandidate && handleSubmitFeedback("next")}
                        disabled={!nextCandidate}
                        className={`flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30 transition-colors ${!isReviewed ? 'invisible' : ''}`}
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </main>
        </motion.div>
    );
}