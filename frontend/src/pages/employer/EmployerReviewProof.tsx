import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { createFeedback } from "@/lib/api/feedback";
import { updateSubmissionStatus } from "@/lib/api/mutations";
import { getSubmissionById, getSubmissionsByJob } from "@/lib/api/submissions";
import { useAuth } from "@/hooks/useAuth";
import type { EmployerSubmission } from "@/types";
import { Loader2, Star, ArrowRight, ArrowLeft, FileText, ExternalLink, User, Lock, Download, AlignLeft, Quote, Video } from "lucide-react";
import { distributeCredits } from "@/lib/api/credits";


// Helper function to detect video links (add this outside component)
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
                className="w-full aspect-video rounded-lg"
            ></iframe>
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
                className="w-full aspect-video rounded-lg"
            ></iframe>
        );
    }

    return null;
};

export default function EmployerReviewProof() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const submissionsCache = useRef<EmployerSubmission[]>([]);
    const [submission, setSubmission] = useState<EmployerSubmission | null>(null);

    const [strengths, setStrengths] = useState("");
    const [improvements, setImprovements] = useState("");
    const [stars, setStars] = useState<number>(0);
    const [loading, setLoading] = useState(false);
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

    async function handleSubmitFeedback(direction?: "next" | "previous") {
        if (!user?.id || !submission) return;

        if (isReviewed) {
            if (direction === "next" && nextCandidate) navigate(`/employer/review/${nextCandidate.id}`);
            else if (direction === "previous" && prevCandidate) navigate(`/employer/review/${prevCandidate.id}`);
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
                navigate(`/employer/review/${nextCandidate.id}`);
            } else if (direction === "previous" && prevCandidate) {
                navigate(`/employer/review/${prevCandidate.id}`);
            } else {
                navigate("/employer/submissions");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit feedback.");
        } finally {
            setLoading(false);
        }
    }

    if (fetching) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin" /></div>;
    if (!submission) return <div className="p-10 text-center">Submission not found.</div>;

    // Logic to show ALL submission types if they exist
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
        }
        else if (rawLink && !rawLink.startsWith("http")) {
            displayText = rawLink;
            displayLink = null;
        }
    }

    const hasAnySubmission = displayFile || displayLink || displayText;

    return (
        <div className="min-h-screen bg-[var(--color-bg)] px-8 py-10 flex flex-col gap-6 transition-colors">
            <header className="max-w-5xl mx-auto w-full">
                <button onClick={() => navigate("/employer/submissions")} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-4">← Back to Submissions</button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="heading-lg mb-1">{submission.proof_tasks?.title}</h1>
                        <p className="text-[var(--color-text-muted)]">
                            Job: {submission.jobs?.title}
                        </p>
                    </div>
                    <div className="text-right text-xs text-[var(--color-text-muted)]">
                        Candidate {currentIndex + 1} of {totalSubmissions}
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN: CANDIDATE WORK */}
                <div className="lg:col-span-2 space-y-6">

                    {/* 1. Candidate Identity */}
                    <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-5">
                        <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Candidate</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[var(--color-candidate)]/10 flex items-center justify-center text-[var(--color-candidate-dark)]">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--color-text)]">{submission.profiles?.full_name || "Anonymous"}</p>
                                    <p className="text-xs text-[var(--color-text-muted)]">{submission.profiles?.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link to={`/candidate/${submission.user_id}`} target="_blank" className="p-2 hover:bg-[var(--color-bg)] rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)]" title="View Profile">
                                    <ExternalLink size={18} />
                                </Link>
                                {submission.resume_url && (
                                    <a href={submission.resume_url} target="_blank" rel="noreferrer" className="p-2 hover:bg-[var(--color-bg)] rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)]" title="View Resume">
                                        <FileText size={18} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* 2. Work Submission */}
                    <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-5 min-h-[160px]">
                        <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Proof Submission</h3>

                        <div className="space-y-4">

                            {/* DEDICATED VIDEO SECTION */}
                            {submission.video_url && (
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                                        <Video size={16} /> Video Walkthrough
                                    </div>
                                    {/* Use the helper to embed, or fallback to a link card */}
                                    {getVideoEmbed(submission.video_url || null) || (
                                        <a
                                            href={submission.video_url || "#"}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-between p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-hover)] transition group"
                                        >
                                            <span className="text-sm text-[var(--color-text)] underline decoration-dotted truncate max-w-[300px]">
                                                {submission.video_url}
                                            </span>
                                            <ExternalLink size={14} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]" />
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* FILE BLOCK (Keep as is) */}
                            {displayFile && (
                                <div className="flex items-center gap-4 p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-button)]">
                                    <div className="p-3 bg-[var(--color-surface)] rounded-full border border-[var(--color-border)] text-[var(--color-candidate)]">
                                        <FileText size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-[var(--color-text)]">Uploaded File</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">Click to download.</p>
                                    </div>
                                    <a href={displayFile} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[var(--color-employer)] text-white rounded-[var(--radius-button)] hover:brightness-110 text-sm font-medium transition">
                                        <Download size={16} /> Download
                                    </a>
                                </div>
                            )}

                            {/* LINK BLOCK (Keep as is) */}
                            {displayLink && (
                                <div className="flex items-center gap-4 p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-button)]">
                                    <div className="p-3 bg-[var(--color-surface)] rounded-full border border-[var(--color-border)] text-[var(--color-candidate)]">
                                        <ExternalLink size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[var(--color-text)]">External Link</p>
                                        <a href={displayLink} target="_blank" rel="noreferrer" className="text-xs text-[var(--color-employer-dark)] hover:underline truncate block">
                                            {displayLink}
                                        </a>
                                    </div>
                                    <a href={displayLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] rounded-[var(--radius-button)] hover:bg-[var(--color-bg-hover)] text-sm font-medium transition">
                                        Open <ArrowRight size={14} />
                                    </a>
                                </div>
                            )}

                            {/* TEXT BLOCK (Keep as is) */}
                            {displayText && (
                                <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-button)]">
                                    <div className="flex items-center gap-2 mb-2 text-[var(--color-candidate)]">
                                        <AlignLeft size={16} /> <span className="text-xs font-bold uppercase">Text Response</span>
                                    </div>
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--color-text)]">
                                        <ReactMarkdown>{displayText}</ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {/* Empty State */}
                            {!hasAnySubmission && !submission.video_url && (
                                <div className="p-6 text-center border border-dashed border-[var(--color-border)] rounded-xl text-[var(--color-text-muted)] italic">
                                    No primary submission found. Check reflections below.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 3. Reflection (with Markdown) */}
                    {submission.reflection && (
                        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-5">
                            <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Candidate Reflection</h3>
                            <div className="relative p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-button)]">
                                <Quote size={20} className="absolute top-4 left-4 text-[var(--color-border)] opacity-50" />
                                {/* Render with ReactMarkdown */}
                                <div className="pl-8 prose prose-sm dark:prose-invert max-w-none text-[var(--color-text)]">
                                    <ReactMarkdown>{submission.reflection}</ReactMarkdown>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* RIGHT COLUMN: FEEDBACK FORM */}
                <div className="lg:col-span-1">
                    <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-6 h-fit relative overflow-hidden sticky top-6">

                        {isReviewed && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-success)]" />
                        )}

                        <div className="flex items-center justify-between mb-6">
                            <h2 className="heading-md">Feedback</h2>
                            {isReviewed && (
                                <span className="flex items-center gap-1 text-xs font-bold text-[var(--color-success)] bg-[var(--color-success)]/10 px-2 py-1 rounded-full">
                                    <Lock size={12} /> LOCKED
                                </span>
                            )}
                        </div>

                        <div className="space-y-5">
                            {/* Rating (No Change) */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((val) => (
                                        <button
                                            key={val}
                                            disabled={!!isReviewed}
                                            onClick={() => setStars(val)}
                                            className={`transition-transform hover:scale-110 focus:outline-none ${isReviewed ? 'cursor-default' : ''}`}
                                        >
                                            <Star
                                                size={32}
                                                className={val <= stars ? "fill-[var(--color-employer)] text-[var(--color-employer)]" : "text-[var(--color-border)]"}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">Strengths</label>
                                <textarea
                                    disabled={!!isReviewed}
                                    value={strengths}
                                    onChange={(e) => setStrengths(e.target.value)}
                                    rows={4}
                                    className="w-full border border-[var(--color-border)] rounded-lg p-3 bg-[var(--color-bg)] text-[var(--color-text)] text-sm focus:ring-2 focus:ring-[var(--color-employer)] outline-none
                               disabled:opacity-100 disabled:bg-[var(--color-surface)] disabled:text-[var(--color-text-muted)]"
                                    placeholder="What stood out?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">Improvements</label>
                                <textarea
                                    disabled={!!isReviewed}
                                    value={improvements}
                                    onChange={(e) => setImprovements(e.target.value)}
                                    rows={4}
                                    className="w-full border border-[var(--color-border)] rounded-lg p-3 bg-[var(--color-bg)] text-[var(--color-text)] text-sm focus:ring-2 focus:ring-[var(--color-employer)] outline-none
                               disabled:opacity-100 disabled:bg-[var(--color-surface)] disabled:text-[var(--color-text-muted)]"
                                    placeholder="Constructive feedback..."
                                />
                            </div>
                        </div>

                        {/* Navigation Buttons (No Change) */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--color-border)]">
                            <button
                                onClick={() => prevCandidate && navigate(`/employer/review/${prevCandidate.id}`)}
                                disabled={!prevCandidate}
                                className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30"
                            >
                                <ArrowLeft size={16} /> Prev
                            </button>

                            <button
                                onClick={() => handleSubmitFeedback("next")}
                                disabled={loading || (!isReviewed && !stars)}
                                className="bg-[var(--color-employer)] text-white px-6 py-2 rounded-lg hover:brightness-110 disabled:opacity-50 transition font-medium shadow-sm"
                            >
                                {loading ? "Saving..." : isReviewed ? "Next Candidate" : "Submit Review"}
                            </button>

                            <button
                                onClick={() => nextCandidate && handleSubmitFeedback("next")}
                                disabled={!nextCandidate}
                                className={`flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30 ${!isReviewed ? 'hidden' : ''}`}
                            >
                                Next <ArrowRight size={16} />
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}