import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  getPracticeTask,
  getMySubmissionForTask,
  upsertPracticeSubmission,
  gradePracticeSubmission,
} from "@/lib/api/practice";
import type { PracticeTask, PracticeSubmission } from "@/lib/api/practice";
import { ArrowLeft, Clock, Zap } from "lucide-react";
import toast from "react-hot-toast";

type GradeResult = {
  score: number;
  feedback: string;
  strengths: string;
  improvements: string;
  credits_earned: number;
};

function scoreLabel(score: number): string {
  if (score >= 9) return "Exceptional";
  if (score >= 7) return "Strong";
  if (score >= 5) return "Developing";
  return "Needs Work";
}

function scoreColor(score: number): string {
  if (score >= 7) return "text-emerald-400";
  if (score >= 5) return "text-amber-400";
  return "text-red-400";
}

function scoreBg(score: number): string {
  if (score >= 7) return "border-emerald-500/30 bg-emerald-500/10";
  if (score >= 5) return "border-amber-500/30 bg-amber-500/10";
  return "border-red-500/30 bg-red-500/10";
}

const categoryColors: Record<string, string> = {
  Marketing: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Design: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  Frontend: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Product: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Data: "bg-green-500/15 text-green-400 border-green-500/30",
  Backend: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  advanced: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function PracticeWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState<PracticeTask | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<PracticeSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<"workspace" | "result">("workspace");
  const [grading, setGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);

  const [textContent, setTextContent] = useState("");
  const [linkContent, setLinkContent] = useState("");
  const [linkNotes, setLinkNotes] = useState("");

  useEffect(() => {
    if (!id || !user?.id) return;

    Promise.all([getPracticeTask(id), getMySubmissionForTask(user.id, id)])
      .then(([t, s]) => {
        setTask(t);
        if (s) {
          setExistingSubmission(s);
          if (s.submission_content) setTextContent(s.submission_content);
          if (s.submission_link) setLinkContent(s.submission_link);
          if (s.ai_score != null) {
            setGradeResult({
              score: s.ai_score,
              feedback: s.ai_feedback ?? "",
              strengths: s.ai_strengths ?? "",
              improvements: s.ai_improvements ?? "",
              credits_earned: s.credits_awarded,
            });
            setView("result");
          }
        }
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [id, user?.id]);

  const isEmpty =
    task?.submission_format === "link"
      ? linkContent.trim().length === 0
      : textContent.trim().length === 0;

  async function handleSubmit() {
    if (!user?.id || !task || !id) return;
    setGrading(true);
    try {
      const submissionInput: {
        user_id: string;
        practice_task_id: string;
        submission_content?: string;
        submission_link?: string;
      } = {
        user_id: user.id,
        practice_task_id: id,
      };

      if (task.submission_format === "link") {
        submissionInput.submission_link = linkContent.trim();
        if (linkNotes.trim()) submissionInput.submission_content = linkNotes.trim();
      } else {
        submissionInput.submission_content = textContent.trim();
      }

      const saved = await upsertPracticeSubmission(submissionInput);
      const result = await gradePracticeSubmission(saved.id);
      setGradeResult(result);
      setView("result");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Grading failed";
      toast.error(msg);
    } finally {
      setGrading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[var(--color-text-muted)]">
        <div className="w-10 h-10 border-4 border-[var(--color-brand-primary)] border-t-transparent rounded-full animate-spin mb-4" />
        Loading task...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[var(--color-text-muted)]">
        <p>Task not found.</p>
        <Link to="/candidate/practice" className="mt-4 text-[var(--color-brand-primary)] underline text-sm">
          Back to Practice Tasks
        </Link>
      </div>
    );
  }

  if (view === "result" && gradeResult) {
    return (
      <div className="space-y-8 pb-10 max-w-2xl mx-auto">
        <Link
          to="/candidate/practice"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft size={15} />
          All Practice Tasks
        </Link>

        {/* Score Card */}
        <div className={`glass-panel rounded-2xl border p-8 text-center ${scoreBg(gradeResult.score)}`}>
          <div className={`text-7xl font-bold mb-2 ${scoreColor(gradeResult.score)}`}>
            {gradeResult.score}
          </div>
          <div className="text-sm text-[var(--color-text-muted)] mb-1">out of 10</div>
          <div className={`text-lg font-semibold mb-4 ${scoreColor(gradeResult.score)}`}>
            {scoreLabel(gradeResult.score)}
          </div>

          {gradeResult.credits_earned > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-semibold text-sm">
              <Zap size={15} />
              +{gradeResult.credits_earned} Credits Earned
            </div>
          )}
        </div>

        {/* Feedback */}
        <div className="glass-panel rounded-2xl border border-[var(--color-border)] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Overall Feedback</h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed">{gradeResult.feedback}</p>
        </div>

        {/* Your Submission */}
        {(textContent || linkContent) && (
          <div className="glass-panel rounded-2xl border border-[var(--color-border)] p-6 space-y-3">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Your Submission</h2>
            {linkContent && (
              <a
                href={linkContent}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-[var(--color-brand-primary)] hover:underline break-all"
              >
                {linkContent}
              </a>
            )}
            {textContent && (
              <p className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">{textContent}</p>
            )}
          </div>
        )}

        {/* Strengths + Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gradeResult.strengths && (
            <div className="glass-panel rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
              <h3 className="text-sm font-semibold text-emerald-400 mb-2">What You Did Well</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{gradeResult.strengths}</p>
            </div>
          )}
          {gradeResult.improvements && (
            <div className="glass-panel rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
              <h3 className="text-sm font-semibold text-amber-400 mb-2">Areas to Improve</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{gradeResult.improvements}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/candidate/practice")}
            className="flex-1 py-3 rounded-xl bg-[var(--color-brand-primary)] text-white font-semibold hover:bg-[var(--color-brand-primary)]/90 transition-colors"
          >
            Try Another Task
          </button>
          <button
            onClick={() => navigate("/candidate/practice")}
            className="flex-1 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] font-semibold hover:bg-[var(--color-bg)] transition-colors"
          >
            View All My Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 max-w-3xl mx-auto">
      <Link
        to="/candidate/practice"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
      >
        <ArrowLeft size={15} />
        All Practice Tasks
      </Link>

      {/* Task Header */}
      <div className="glass-panel rounded-2xl border border-[var(--color-border)] p-6 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${categoryColors[task.category] ?? "bg-slate-500/15 text-slate-400 border-slate-500/30"}`}>
            {task.category}
          </span>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${difficultyColors[task.difficulty] ?? "bg-slate-500/15 text-slate-400 border-slate-500/30"}`}>
            {task.difficulty}
          </span>
          <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
            <Clock size={12} />
            {task.expected_time}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">{task.title}</h1>
      </div>

      {/* Task Description */}
      <div className="glass-panel rounded-2xl border border-[var(--color-border)] p-6">
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
          Task Instructions
        </h2>
        <div className="text-[var(--color-text)] text-sm leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
          {task.description}
        </div>
      </div>

      {/* Submission Area */}
      <div className="glass-panel rounded-2xl border border-[var(--color-border)] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          Your Submission
        </h2>

        {task.submission_format === "link" ? (
          <div className="space-y-3">
            <input
              type="url"
              value={linkContent}
              onChange={(e) => setLinkContent(e.target.value)}
              placeholder="https://github.com/your-repo or https://codesandbox.io/..."
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/30 transition"
            />
            <textarea
              value={linkNotes}
              onChange={(e) => setLinkNotes(e.target.value)}
              rows={4}
              placeholder="Optional: Add any notes about your submission, design decisions, or context..."
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/30 transition"
            />
          </div>
        ) : (
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            rows={12}
            placeholder="Write your response here..."
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/30 transition"
          />
        )}

        <button
          onClick={handleSubmit}
          disabled={isEmpty || grading}
          className="w-full py-3 rounded-xl bg-[var(--color-brand-primary)] text-white font-semibold text-sm hover:bg-[var(--color-brand-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {grading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Grading your submission...
            </>
          ) : (
            <>
              <Zap size={16} />
              Submit & Get AI Feedback
            </>
          )}
        </button>

        {existingSubmission && !existingSubmission.ai_score && (
          <p className="text-xs text-[var(--color-text-muted)] text-center">
            Your previous draft has been loaded. Edit and resubmit to get graded.
          </p>
        )}
      </div>
    </div>
  );
}
