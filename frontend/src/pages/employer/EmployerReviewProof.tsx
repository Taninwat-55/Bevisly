import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { createFeedback } from "@/lib/api/feedback";
import { updateSubmissionStatus } from "@/lib/api/mutations";
import { getSubmissionById, getSubmissionsByJob } from "@/lib/api/submissions";
import { useAuth } from "@/hooks/useAuth";
import type { EmployerSubmission } from "@/types";
import { Loader2, Star, ArrowRight, ArrowLeft, FileText, ExternalLink, User, Lock } from "lucide-react";

export default function EmployerReviewProof() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const submissionsCache = useRef<EmployerSubmission[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [submission, setSubmission] = useState<any | null>(null);

  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [stars, setStars] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // ✅ CHECK: Is it already reviewed?
  const isReviewed = submission?.status === "reviewed" || (submission?.feedback && submission.feedback.length > 0);

  useEffect(() => {
    if (!id) return;
    const loadSubmission = async () => {
      try {
        const data = await getSubmissionById(id);
        setSubmission(data);
        
        // ✅ Pre-fill if reviewed
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
    if (!user?.id) return;
    
    // ✅ Skip API call if just navigating on a locked review
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

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-8 py-10 flex flex-col gap-6">
      {/* Header */}
      <header className="max-w-4xl mx-auto w-full">
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

      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT: Submission Content */}
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-6 space-y-6 h-fit">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Candidate</h3>
            <div className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-candidate)]/10 flex items-center justify-center text-[var(--color-candidate-dark)]">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-medium text-[var(--color-text)]">{submission.profiles?.full_name || "Anonymous Candidate"}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{submission.profiles?.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                 {/* Profile Link */}
                 <Link to={`/candidate/${submission.user_id}`} target="_blank" className="p-2 hover:bg-[var(--color-surface)] rounded-md text-[var(--color-text-muted)]" title="View Profile">
                    <ExternalLink size={18} />
                 </Link>
                 {/* Resume Link */}
                 {submission.resume_url && (
                    <a href={submission.resume_url} target="_blank" rel="noreferrer" className="p-2 hover:bg-[var(--color-surface)] rounded-md text-[var(--color-text-muted)]" title="View Resume">
                        <FileText size={18} />
                    </a>
                 )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Submission</h3>
            
            {/* Reflection / Text Answer */}
            <div className="bg-[var(--color-bg)] p-4 rounded-lg border border-[var(--color-border)] text-sm leading-relaxed whitespace-pre-line min-h-[100px]">
               {submission.reflection || <span className="italic text-[var(--color-text-muted)]">No written reflection provided.</span>}
            </div>

            {/* Link / File */}
            {submission.submission_link && (
                <div className="mt-4">
                    <a href={submission.submission_link} target="_blank" rel="noreferrer" 
                       className="flex items-center gap-2 text-[var(--color-employer)] hover:underline font-medium break-all">
                        <ExternalLink size={16} />
                        {submission.submission_link}
                    </a>
                </div>
            )}
          </div>
        </section>

        {/* RIGHT: Feedback Form */}
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-6 h-fit relative overflow-hidden">
          {/* ✅ LOCKED STATE OVERLAY */}
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
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    disabled={isReviewed}
                    onClick={() => setStars(val)}
                    className={`transition-transform hover:scale-110 ${isReviewed ? 'cursor-default' : ''}`}
                  >
                    <Star 
                        size={28} 
                        className={val <= stars ? "fill-[var(--color-employer)] text-[var(--color-employer)]" : "text-[var(--color-border)]"} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Strengths</label>
              <textarea
                disabled={isReviewed}
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                rows={4}
                className="w-full border border-[var(--color-border)] rounded-lg p-3 bg-[var(--color-bg)] text-sm disabled:opacity-60"
                placeholder="What did they do well?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Improvements</label>
              <textarea
                disabled={isReviewed}
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                rows={4}
                className="w-full border border-[var(--color-border)] rounded-lg p-3 bg-[var(--color-bg)] text-sm disabled:opacity-60"
                placeholder="What could be better?"
              />
            </div>
          </div>

          {/* Navigation / Action Buttons */}
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
  );
}