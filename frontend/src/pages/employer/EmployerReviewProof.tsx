import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import DOMPurify from "dompurify";
import { motion } from "framer-motion";
import { createFeedback } from "@/lib/api/feedback";
import { suggestFeedback } from "@/lib/api/ai";
import SubmissionBreakdownCard, { type AIBreakdownResult } from "@/components/employer/SubmissionBreakdownCard";
import {
  updateSubmissionStatus,
  getSubmissionById,
  getSubmissionsByJob,
  requestDiscussion,
} from "@/lib/api/submissions";
import { useAuth } from "@/hooks/useAuth";
import type { EmployerSubmission, RubricCriterion, RubricScore } from "@/types";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  FileText,
  ExternalLink,
  User,
  Download,
  AlignLeft,
  Quote,
  Video,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Paperclip,
  MessageSquare,
  CalendarCheck,
} from "lucide-react";

import { Star, Sparkles } from "lucide-react";

// Inline TaskRequirementsPanel (original was deleted)
interface TaskInfo {
  title: string | null;
  description: string | null;
  expected_time: string | null;
  submission_type: "link" | "file" | "text";
}

function TaskRequirementsPanel({ task }: { task: TaskInfo | null }) {
  if (!task) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
          Task Requirements
        </h3>
        <p className="text-sm text-[var(--color-text-muted)]">
          No task information available.
        </p>
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
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            {task.description}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {task.expected_time && (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)]">
            <Clock size={12} /> {task.expected_time}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)]">
          <Paperclip size={12} /> {task.submission_type}
        </span>
      </div>
    </div>
  );
}

// Inline Scorecard (original was deleted)
interface ScorecardProps {
  rubricCriteria: RubricCriterion[] | null;
  rubricScores: RubricScore[];
  setRubricScores: (next: RubricScore[]) => void;
  legacyStars: number;
  setLegacyStars: (v: number) => void;
  strengths: string;
  setStrengths: (v: string) => void;
  improvements: string;
  setImprovements: (v: string) => void;
  isLocked: boolean;
  onSuggestAI: () => void;
  isSuggesting: boolean;
  canAIEvaluate: boolean;
  aiSuggested: boolean;
}

function getScoreFor(scores: RubricScore[], name: string): number {
  return scores.find((s) => s.name === name)?.score ?? 0;
}

function getNoteFor(scores: RubricScore[], name: string): string {
  return scores.find((s) => s.name === name)?.note ?? "";
}

function upsertScore(
  scores: RubricScore[],
  name: string,
  patch: Partial<RubricScore>,
): RubricScore[] {
  const idx = scores.findIndex((s) => s.name === name);
  if (idx === -1) {
    return [...scores, { name, score: 0, note: "", ...patch }];
  }
  const next = [...scores];
  next[idx] = { ...next[idx], ...patch };
  return next;
}

function computeWeightedOverall(
  criteria: RubricCriterion[],
  scores: RubricScore[],
): number {
  const totalWeight = criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
  if (totalWeight <= 0) return 0;
  const weighted = criteria.reduce((sum, c) => {
    const score = getScoreFor(scores, c.name);
    return sum + score * (Number(c.weight) || 0);
  }, 0);
  return weighted / totalWeight;
}

function Scorecard({
  rubricCriteria,
  rubricScores,
  setRubricScores,
  legacyStars,
  setLegacyStars,
  strengths,
  setStrengths,
  improvements,
  setImprovements,
  isLocked,
  onSuggestAI,
  isSuggesting,
  canAIEvaluate,
  aiSuggested,
}: ScorecardProps) {
  const hasRubric = !!rubricCriteria && rubricCriteria.length > 0;
  const weightedOverall = hasRubric
    ? computeWeightedOverall(rubricCriteria!, rubricScores)
    : 0;

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-employer)]">
          Your Review
        </h3>
        {!isLocked &&
          (canAIEvaluate ? (
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={onSuggestAI}
                disabled={isSuggesting}
                className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                {isSuggesting ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Sparkles size={12} />
                )}
                AI Evidence Summary
              </button>
              <Link
                to="/docs#how-ai-works"
                className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] transition-colors"
              >
                How Bevisly uses AI →
              </Link>
            </div>
          ) : (
            <span className="text-xs text-[var(--color-text-muted)] italic">
              AI summary unavailable for links &amp; files
            </span>
          ))}
      </div>

      {hasRubric ? (
        <>
          <div className="space-y-4">
            {rubricCriteria!.map((c) => {
              const score = getScoreFor(rubricScores, c.name);
              const note = getNoteFor(rubricScores, c.name);
              return (
                <div
                  key={c.name}
                  className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/40 space-y-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                        {c.name}
                        <span className="ml-2 text-[10px] font-medium text-[var(--color-text-muted)]">
                          weight {c.weight}
                        </span>
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] truncate">
                        {c.description}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          disabled={isLocked}
                          onClick={() =>
                            setRubricScores(
                              upsertScore(rubricScores, c.name, { score: n }),
                            )
                          }
                          className={`p-0.5 transition-transform ${
                            isLocked ? "cursor-not-allowed" : "hover:scale-110"
                          }`}
                          aria-label={`${c.name}: ${n} of 5`}
                        >
                          <Star
                            size={20}
                            className={
                              n <= score
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-[var(--color-border)]"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={note}
                    onChange={(e) =>
                      setRubricScores(
                        upsertScore(rubricScores, c.name, { note: e.target.value }),
                      )
                    }
                    placeholder="Optional: cite the part of the submission that drove this score"
                    className="w-full text-xs p-2 rounded-md border border-[var(--color-border)] bg-[var(--color-input-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-employer)] disabled:opacity-60"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3">
            <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
              Weighted overall
            </span>
            <span className="text-base font-bold text-[var(--color-text)]">
              {weightedOverall.toFixed(2)} / 5
            </span>
          </div>
        </>
      ) : (
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
                onClick={() => setLegacyStars(n)}
                className={`p-1 transition-colors ${
                  isLocked ? "cursor-not-allowed" : "hover:scale-110"
                }`}
              >
                <Star
                  size={24}
                  className={
                    n <= legacyStars
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-[var(--color-border)]"
                  }
                />
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)] italic mt-2">
            Legacy task — no rubric defined. Edit the task to add one.
          </p>
        </div>
      )}

      {/* Strengths */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
          Overall strengths
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
          Overall areas for improvement
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
      {aiSuggested && !isLocked && (
        <p className="text-xs text-[var(--color-text-muted)] italic leading-snug">
          Suggested by AI based on submission content. Final decision is yours.
        </p>
      )}
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
    else if (url.includes("youtu.be/"))
      videoId = url.split("youtu.be/")[1]?.split("?")[0];

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

export default function EmployerReviewProof({
  submissionId,
  onBack,
  onNavigate,
}: EmployerReviewProofProps) {
  const params = useParams();
  const id = submissionId || params.id;
  const { user } = useAuth();
  const navigate = useNavigate();

  const submissionsCache = useRef<EmployerSubmission[]>([]);
  const [submission, setSubmission] = useState<EmployerSubmission | null>(null);

  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [stars, setStars] = useState<number>(0);
  const [rubricScores, setRubricScores] = useState<RubricScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestingAI, setSuggestingAI] = useState(false);
  const [strengthsFromAI, setStrengthsFromAI] = useState(false);
  const [improvementsFromAI, setImprovementsFromAI] = useState(false);
  const [scoresFromAI, setScoresFromAI] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [requestingDiscussion, setRequestingDiscussion] = useState(false);
  const [discussionRequested, setDiscussionRequested] = useState(false);
  const [aiResult, setAiResult] = useState<AIBreakdownResult | null>(null);

  const rubricCriteria = submission?.proof_tasks?.rubric_criteria ?? null;
  const hasRubric = Array.isArray(rubricCriteria) && rubricCriteria.length > 0;

  const isReviewed =
    submission?.status === "reviewed" ||
    (submission?.feedback && submission.feedback.length > 0);

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
          if (Array.isArray(data.feedback[0].rubric_scores)) {
            setRubricScores(data.feedback[0].rubric_scores);
          }
        }
        if (data.discussion_requested_at) {
          setDiscussionRequested(true);
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

  useEffect(() => {
    setAiResult(null);
  }, [id]);

  const totalSubmissions = submissionsCache.current.length;
  const prevCandidate =
    currentIndex > 0 ? submissionsCache.current[currentIndex - 1] : null;
  const nextCandidate =
    currentIndex < totalSubmissions - 1
      ? submissionsCache.current[currentIndex + 1]
      : null;

  const handleSuggestFeedback = async () => {
    if (!submission?.text_response) {
      toast(
        "AI summary is only available for text submissions. Please review this submission manually.",
      );
      return;
    }
    setSuggestingAI(true);
    const toastId = toast.loading("AI is summarising evidence...");
    try {
      const criteria = submission?.proof_tasks?.title || "General";
      const content =
        submission?.text_response ||
        submission?.submission_link ||
        "Checked file/link.";
      const taskDescription = submission?.proof_tasks?.description ?? null;
      const reflection = submission?.reflection ?? null;

      const result = await suggestFeedback(
        stars || 0,
        criteria,
        content,
        taskDescription,
        reflection,
        rubricCriteria ?? undefined,
      );

      if (
        result &&
        (result.strengths || result.improvements || result.rubric_scores)
      ) {
        setAiResult({
          rubricScores: result.rubric_scores ?? undefined,
          strengths: result.strengths ?? undefined,
          improvements: result.improvements ?? undefined,
          suggestedRating: result.suggested_rating ?? undefined,
        });
        toast.success(
          "AI evidence summary ready. Review before applying.",
          { id: toastId },
        );
      }
    } catch (e: unknown) {
      console.error(e);
      const errorMessage =
        e instanceof Error ? e.message : "Failed to suggest feedback.";
      // Display the actual error message rather than assuming it's the API key
      toast.error(errorMessage, { id: toastId });
    } finally {
      setSuggestingAI(false);
    }
  };

  function handleApplyAIToReview() {
    if (!aiResult) return;
    if (Array.isArray(aiResult.rubricScores) && aiResult.rubricScores.length > 0) {
      setRubricScores(aiResult.rubricScores);
      setScoresFromAI(true);
    } else if (typeof aiResult.suggestedRating === "number") {
      setStars(aiResult.suggestedRating);
    }
    if (aiResult.strengths) {
      setStrengths(aiResult.strengths);
      setStrengthsFromAI(true);
    }
    if (aiResult.improvements) {
      setImprovements(aiResult.improvements);
      setImprovementsFromAI(true);
    }
    toast.success("AI summary applied. Edit before submitting.");
  }

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

    let finalStars = stars;
    let finalRubricScores: RubricScore[] | null = null;

    if (hasRubric) {
      const incomplete = rubricCriteria!.filter(
        (c) => (getScoreFor(rubricScores, c.name) || 0) <= 0,
      );
      if (incomplete.length > 0) {
        return toast.error(
          `Score every criterion: ${incomplete.map((c) => c.name).join(", ")}`,
        );
      }
      const weighted = computeWeightedOverall(rubricCriteria!, rubricScores);
      finalStars = Math.max(1, Math.min(5, Math.round(weighted)));
      // Drop any stale entries that don't match the locked rubric.
      finalRubricScores = rubricCriteria!.map((c) => {
        const s = rubricScores.find((r) => r.name === c.name);
        return {
          name: c.name,
          score: s?.score ?? 0,
          note: s?.note ?? "",
        };
      });
    } else if (!stars) {
      return toast.error("Please provide a rating.");
    }

    setLoading(true);
    try {
      await createFeedback({
        submission_id: submission.id,
        employer_id: user.id,
        strengths,
        improvements,
        stars: finalStars,
        rubric_scores: finalRubricScores,
      });

      await updateSubmissionStatus(submission.id, "reviewed");

      toast.success("Feedback submitted");

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

  async function handleRequestDiscussion() {
    if (!submission?.id || discussionRequested) return;
    setRequestingDiscussion(true);
    try {
      await requestDiscussion(submission.id);
      setDiscussionRequested(true);
      toast.success("Proof Discussion requested. The candidate will be notified.");
    } catch {
      toast.error("Failed to send discussion request.");
    } finally {
      setRequestingDiscussion(false);
    }
  }

  if (fetching) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-3">
        <Loader2
          className="animate-spin text-[var(--color-employer)]"
          size={32}
        />
        <p className="text-sm text-[var(--color-text-muted)]">
          Loading submission...
        </p>
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
    if (
      rawLink &&
      (rawLink.includes("/storage/v1/object/public/") ||
        /\.(pdf|zip|docx|png|jpg|jpeg)$/i.test(rawLink))
    ) {
      displayFile = rawLink;
      displayLink = null;
    } else if (rawLink && !rawLink.startsWith("http")) {
      displayText = rawLink;
      displayLink = null;
    }
  }

  const hasAnySubmission = displayFile || displayLink || displayText;
  const canAIEvaluate = !!displayText;

  // Get task info for requirements panel
  const taskInfo = submission.proof_tasks
    ? {
        title: submission.proof_tasks.title,
        description: submission.proof_tasks.description ?? null,
        expected_time: null,
        submission_type: "link" as const,
      }
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full bg-[var(--color-bg)] px-4 md:px-8 py-6 md:py-10 flex flex-col"
    >
      {/* Header */}
      <header className="max-w-5xl mx-auto mb-6">
        <button
          onClick={() => {
            if (onBack) onBack();
            else navigate("/employer");
          }}
          className="flex items-center gap-1 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-4 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Submissions
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1">
              {submission.proof_tasks?.title || "Review Submission"}
            </h1>
            <p className="text-[var(--color-text-muted)] font-medium">
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

      {/* Main Content - Single Column Layout */}
      <main className="max-w-5xl mx-auto space-y-6">
        {/* Task Requirements */}
        <TaskRequirementsPanel task={taskInfo} />

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
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all"
              title="View Profile"
            >
              <ExternalLink size={18} />
            </Link>
            {submission.resume_url && (
              <a
                href={submission.resume_url}
                target="_blank"
                rel="noopener noreferrer"
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
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-bg-hover)] transition group"
                >
                  <span className="text-sm text-[var(--color-text)] underline decoration-dotted truncate max-w-[300px]">
                    {submission.video_url}
                  </span>
                  <ExternalLink
                    size={14}
                    className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]"
                  />
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
                <p className="text-sm font-medium text-[var(--color-text)]">
                  Uploaded File
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Click to download
                </p>
              </div>
              <a
                href={displayFile}
                target="_blank"
                rel="noopener noreferrer"
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
                <p className="text-sm font-medium text-[var(--color-text)]">
                  External Link
                </p>
                <a
                  href={displayLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--color-employer-dark)] hover:underline truncate block"
                >
                  {displayLink}
                </a>
              </div>
              <a
                href={displayLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] rounded-xl hover:bg-[var(--color-bg)] text-sm font-medium transition"
              >
                Open <ArrowRight size={14} />
              </a>
            </div>
          )}

          {/* Text Block */}
          {displayText && (
            <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 mb-2 text-[var(--color-candidate)]">
                <AlignLeft size={16} />
                <span className="text-xs font-bold uppercase">
                  Text Response
                </span>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--color-text)] break-words [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:break-words">
                <ReactMarkdown>{DOMPurify.sanitize(displayText)}</ReactMarkdown>
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
                  <p className="font-medium text-[var(--color-text)]">
                    {submission.profiles?.full_name}'s Resume
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Available for review
                  </p>
                </div>
              </div>
              <a
                href={
                  submission.resume_url ||
                  submission.profiles?.resume_url ||
                  undefined
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg)] rounded-xl text-sm font-semibold text-[var(--color-text)] transition"
              >
                <Download size={16} /> Download
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
              <Quote
                size={20}
                className="absolute top-4 left-4 text-[var(--color-border)] opacity-50"
              />
              <div className="pl-8 prose prose-sm dark:prose-invert max-w-none text-[var(--color-text)]">
                <ReactMarkdown>
                  {DOMPurify.sanitize(submission.reflection)}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Follow-up Answers */}
        {Array.isArray(submission.follow_up_answers) && submission.follow_up_answers.length > 0 && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-[var(--color-employer)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-employer)]">
                Follow-up Answers
              </h3>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              The candidate answered these after submitting. AI can write the plan — this is their reasoning in their own voice.
            </p>
            <div className="space-y-4">
              {submission.follow_up_answers.map((item, idx) => (
                <div key={idx} className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl space-y-2">
                  <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                    Q{idx + 1}. {item.question}
                  </p>
                  <p className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
                    {item.answer || <span className="italic text-[var(--color-text-muted)]">No answer provided.</span>}
                  </p>
                </div>
              ))}
            </div>

            {/* Request Proof Discussion */}
            <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">Proof Discussion</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Request a 15-minute call to discuss their submission directly.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRequestDiscussion}
                disabled={requestingDiscussion || discussionRequested}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  discussionRequested
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-default"
                    : "bg-[var(--color-employer)] text-white hover:brightness-110 disabled:opacity-50"
                }`}
              >
                {requestingDiscussion ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : discussionRequested ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <CalendarCheck size={14} />
                )}
                {discussionRequested ? "Requested" : "Request Discussion"}
              </button>
            </div>
          </div>
        )}

        {/* Request Discussion standalone (when no follow-up answers yet) */}
        {(!submission.follow_up_answers || submission.follow_up_answers.length === 0) && (
          <div className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CalendarCheck size={18} className="text-[var(--color-employer)] shrink-0" />
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">Proof Discussion</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Request a 15-minute call to talk through the submission with the candidate.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRequestDiscussion}
              disabled={requestingDiscussion || discussionRequested}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                discussionRequested
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-default"
                  : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-50"
              }`}
            >
              {requestingDiscussion ? (
                <Loader2 size={14} className="animate-spin" />
              ) : discussionRequested ? (
                <CheckCircle2 size={14} />
              ) : (
                <CalendarCheck size={14} />
              )}
              {discussionRequested ? "Requested" : "Request Discussion"}
            </button>
          </div>
        )}

        {/* AI Breakdown Card */}
        {aiResult && (
          <SubmissionBreakdownCard
            result={aiResult}
            rubricCriteria={submission.proof_tasks?.rubric_criteria ?? null}
            onApply={handleApplyAIToReview}
            isLocked={!!isReviewed}
          />
        )}

        {/* Scorecard */}
        <Scorecard
          rubricCriteria={rubricCriteria}
          rubricScores={rubricScores}
          setRubricScores={(next) => {
            setRubricScores(next);
            setScoresFromAI(false);
          }}
          legacyStars={stars}
          setLegacyStars={setStars}
          strengths={strengths}
          setStrengths={(v) => {
            setStrengths(v);
            setStrengthsFromAI(false);
          }}
          improvements={improvements}
          setImprovements={(v) => {
            setImprovements(v);
            setImprovementsFromAI(false);
          }}
          isLocked={!!isReviewed || user?.role === "demo_admin"}
          onSuggestAI={handleSuggestFeedback}
          isSuggesting={suggestingAI}
          canAIEvaluate={canAIEvaluate}
          aiSuggested={strengthsFromAI || improvementsFromAI || scoresFromAI}
        />

        {/* Action Bar */}
        <div className="sticky bottom-0 z-20 flex items-center justify-between p-4 glass-panel rounded-2xl shadow-xl border border-[var(--color-border)] mt-8">
          <button
            onClick={() =>
              prevCandidate && navigate(`/employer/review/${prevCandidate.id}`)
            }
            disabled={!prevCandidate}
            className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <motion.button
            onClick={() => handleSubmitFeedback("next")}
            disabled={
              loading ||
              (!isReviewed &&
                (hasRubric
                  ? rubricCriteria!.some(
                      (c) => (getScoreFor(rubricScores, c.name) || 0) <= 0,
                    )
                  : !stars))
            }
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all
              ${
                isReviewed
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
            className={`flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30 transition-colors ${!isReviewed ? "invisible" : ""}`}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </main>
    </motion.div>
  );
}
