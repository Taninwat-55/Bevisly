/**
 * 🧩 EmployerReviewProof.tsx
 *
 * Enhanced "Review Wizard" for employers:
 *  - Fetches all submissions for a job once (cached in memory)
 *  - Allows next/previous navigation
 *  - Displays review progress (e.g. 3 of 7)
 *  - Includes "View Candidate CV" link if uploaded
 *  - Includes "Back to Submissions"
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createFeedback } from "@/lib/api/feedback";
import { updateSubmissionStatus } from "@/lib/api/mutations";
import { getSubmissionById, getSubmissionsByJob } from "@/lib/api/submissions";
import { useAuth } from "@/hooks/useAuth";
import type { EmployerSubmission } from "@/types";
import { Loader2, Star, ArrowRight, ArrowLeft, FileText } from "lucide-react";

export default function EmployerReviewProof() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // 🧠 Cache all submissions for the job
  const submissionsCache = useRef<EmployerSubmission[]>([]);

  const [submission, setSubmission] = useState<
    | (EmployerSubmission & {
        jobs?: { id: string; title: string; company?: string | null } | null;
      })
    | null
  >(null);

  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [stars, setStars] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  /* ─── Fetch submission & prefetch others ─────────────────────────────── */
  useEffect(() => {
    if (!id) return;
    const loadSubmission = async () => {
      try {
        const data = await getSubmissionById(id);
        setSubmission(data);

        // If job submissions not cached yet, load all
        if (data?.job_id && submissionsCache.current.length === 0) {
          const allSubs = await getSubmissionsByJob(data.job_id);
          submissionsCache.current = allSubs;
        }

        // Find index of this submission within cached list
        const idx = submissionsCache.current.findIndex((s) => s.id === id);
        if (idx !== -1) setCurrentIndex(idx);
      } catch (err) {
        console.error("Error fetching submission:", err);
        toast.error("Failed to load submission details");
      } finally {
        setFetching(false);
      }
    };
    loadSubmission();
  }, [id]);

  /* ─── Derived values ─────────────────────────────── */
  const totalSubmissions = submissionsCache.current.length;
  const prevCandidate =
    currentIndex > 0 ? submissionsCache.current[currentIndex - 1] : null;
  const nextCandidate =
    currentIndex < totalSubmissions - 1
      ? submissionsCache.current[currentIndex + 1]
      : null;

  const reviewedCount = useMemo(
    () =>
      submissionsCache.current.filter((s) => s.status === "reviewed").length,
    [submissionsCache.current]
  );

  /* ─── Submit feedback ─────────────────────────────── */
  async function handleSubmitFeedback(direction?: "next" | "previous") {
    if (!user?.id) return toast.error("You must be logged in.");
    if (!stars) return toast.error("Please provide a rating.");
    if (!submission) return;

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
      toast.success("✅ Feedback submitted successfully!");

      if (direction === "next" && nextCandidate) {
        navigate(`/employer/review/${nextCandidate.id}`);
      } else if (direction === "previous" && prevCandidate) {
        navigate(`/employer/review/${prevCandidate.id}`);
      } else if (direction && !nextCandidate) {
        toast("🎉 You've reviewed all submissions for this job!");
        navigate("/employer/submissions");
      } else {
        navigate("/employer/review/success");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  }

  /* ─── Keyboard navigation ─────────────────────────────── */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && nextCandidate) handleSubmitFeedback("next");
      if (e.key === "ArrowLeft" && prevCandidate)
        navigate(`/employer/review/${prevCandidate.id}`);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  /* ─── States ─────────────────────────────── */
  if (fetching)
    return (
      <div className="flex items-center justify-center min-h-screen text-[var(--color-text-muted)]">
        <Loader2 className="animate-spin mr-2" /> Loading submission details…
      </div>
    );

  if (!submission)
    return (
      <div className="text-center text-[var(--color-text-muted)] py-20">
        Submission not found or unavailable.
      </div>
    );

  /* ─── Main Layout ─────────────────────────────── */
  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-8 py-10 flex flex-col gap-6">
      {/* 🧭 Header */}
      <header className="max-w-3xl">
        <h1 className="heading-lg mb-1">
          Review Submission —{" "}
          <span className="text-[var(--color-employer-dark)]">
            {submission.proof_tasks?.title || "Untitled Proof"}
          </span>
        </h1>
        <p className="text-[var(--color-text-muted)] mb-1">
          Job: {submission.jobs?.title || "Unknown Job"} • Candidate ID:{" "}
          {submission.user_id}
        </p>
        {totalSubmissions > 1 && (
          <p className="text-xs text-[var(--color-text-muted)]">
            Reviewing {currentIndex + 1} of {totalSubmissions} ({reviewedCount}{" "}
            reviewed)
          </p>
        )}
      </header>

      {/* 🧾 Submission Info */}
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-soft)] rounded-[var(--radius-card)] p-6 max-w-3xl">
        <div className="space-y-3 text-sm text-[var(--color-text-muted)]">
          {/* Proof Link */}
          <p>
            <strong>Submission Link:</strong>{" "}
            {submission.submission_link ? (
              <a
                href={submission.submission_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-employer-dark)] underline"
              >
                {submission.submission_link}
              </a>
            ) : (
              "No submission link provided."
            )}
          </p>

          {/* 🆕 Candidate CV */}
          {submission.resume_url && (
            <p>
              <strong>Candidate CV:</strong>{" "}
              <a
                href={submission.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[var(--color-employer-dark)] underline"
              >
                <FileText size={14} /> View CV
              </a>
            </p>
          )}

          <p className="leading-relaxed">
            <strong>Candidate Reflection:</strong>{" "}
            {submission.reflection || "No reflection provided."}
          </p>
        </div>

        {/* 💬 Feedback Form */}
        <h2 className="heading-md mb-4 mt-8">Leave Feedback</h2>

        <div className="space-y-5">
          <div>
            <label className="block text-[var(--color-text)] text-sm font-medium mb-1">
              Strengths
            </label>
            <textarea
              placeholder="What stood out in this proof?"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              rows={3}
              className="w-full border border-[var(--color-border)] rounded-[var(--radius-input)] bg-[var(--color-bg)] p-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-employer)]"
            />
          </div>

          <div>
            <label className="block text-[var(--color-text)] text-sm font-medium mb-1">
              Improvements
            </label>
            <textarea
              placeholder="Suggestions for improvement"
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              rows={3}
              className="w-full border border-[var(--color-border)] rounded-[var(--radius-input)] bg-[var(--color-bg)] p-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-employer)]"
            />
          </div>

          <div>
            <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
              Rating
            </label>
            <div className="flex items-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((val) => (
                <Star
                  key={val}
                  size={24}
                  className={`cursor-pointer transition-colors ${
                    val <= stars
                      ? "text-[var(--color-employer)] fill-[var(--color-employer)]"
                      : "text-[var(--color-border)]"
                  }`}
                  onClick={() => setStars(val)}
                />
              ))}
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              {stars ? `${stars} / 5 stars` : "Click a star to rate"}
            </p>
          </div>
        </div>

        {/* 🚀 Actions */}
        <div className="flex flex-wrap gap-3 mt-8">
          {prevCandidate && (
            <button
              onClick={() => navigate(`/employer/review/${prevCandidate.id}`)}
              className="border border-[var(--color-border)] text-[var(--color-text-muted)] px-5 py-2 rounded-[var(--radius-button)] hover:bg-[var(--color-border)] transition flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Previous
            </button>
          )}

          <button
            onClick={() => handleSubmitFeedback()}
            disabled={loading}
            className="bg-[var(--color-employer)] text-white px-5 py-2 rounded-[var(--radius-button)] hover:bg-[var(--color-employer-dark)] disabled:opacity-60 transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>

          {nextCandidate && (
            <button
              onClick={() => handleSubmitFeedback("next")}
              disabled={loading}
              className="border border-[var(--color-employer)] text-[var(--color-employer)] px-5 py-2 rounded-[var(--radius-button)] hover:bg-[var(--color-employer)] hover:text-white transition flex items-center justify-center gap-2"
            >
              Next Candidate <ArrowRight size={16} />
            </button>
          )}

          {/* 🡐 Back to Submissions */}
          <button
            type="button"
            onClick={() => navigate("/employer/submissions")}
            className="ml-auto border border-[var(--color-border)] text-[var(--color-text-muted)] px-5 py-2 rounded-[var(--radius-button)] hover:bg-[var(--color-border)] transition"
          >
            ← Back to Submissions
          </button>
        </div>
      </section>
    </div>
  );
}
