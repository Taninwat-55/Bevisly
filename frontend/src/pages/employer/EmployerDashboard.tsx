import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getEmployerJobs,
  getEmployerSubmissionsWithFeedback,
  getEmployerJobSummary,
} from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type {
  EmployerJob,
  EmployerSubmission,
  EmployerJobSummary,
} from "@/types";
import {
  Briefcase,
  Star,
  Users,
  CheckCircle2,
  Plus,
  Sparkles,
  PenTool,
  ArrowRight,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { useCompany } from "@/hooks/useCompany";
import ResponsibilityScoreBadge from "@/components/employer/ResponsibilityScoreBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import EmployerJobForm from "./EmployerJobForm";
import EmployerJobIntentForm from "@/components/employer/EmployerJobIntentForm";
import WelcomeBanner from "@/components/common/WelcomeBanner";
import SuccessCelebration from "@/components/common/SuccessCelebration";
import type { ProofTask } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

export default function EmployerDashboard() {
  const { user } = useAuth();
  const { company } = useCompany();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Data State
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [submissions, setSubmissions] = useState<EmployerSubmission[]>([]);
  const [summaries, setSummaries] = useState<EmployerJobSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Post Job State
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [postJobCreationMode, setPostJobCreationMode] = useState<"select" | "ai" | "manual">("select");
  const [postJobData, setPostJobData] = useState<Partial<EmployerJob & { proof_tasks: ProofTask[] }> | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Listen for global "Post Job" trigger via URL
  useEffect(() => {
    if (searchParams.get("post") === "true") {
      setPostJobData(null);
      setPostJobCreationMode("select");
      setIsPostingJob(true);

      const newParams = new URLSearchParams(searchParams);
      newParams.delete("post");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Load Data
  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const [jobsData, subsData, summariesData] = await Promise.all([
          getEmployerJobs(user.id),
          getEmployerSubmissionsWithFeedback(user.id),
          getEmployerJobSummary(user.id),
        ]);

        if (mounted) {
          setJobs(jobsData);
          setSubmissions(subsData);
          setSummaries(summariesData);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        toast.error("Failed to load dashboard data.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Metrics (Global)
  const metrics = useMemo(() => {
    const totalJobs = jobs.length;
    const totalSubmissions = submissions.length;
    const totalHires = submissions.filter((s) => s.status === "hired").length;

    const startedSubmissions = submissions.filter((s) => s.status === "in_progress").length;
    const finishedSubmissions = submissions.filter((s) => s.status !== "in_progress").length;

    const validRatings = summaries
      .map((s) => s.avg_score)
      .filter((v): v is number => v !== null);

    const avgRating = validRatings.length
      ? (validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1)
      : "—";

    return { totalJobs, totalSubmissions, totalHires, avgRating, startedSubmissions, finishedSubmissions };
  }, [jobs, submissions, summaries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-bg)] text-[var(--color-text-muted)]">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-8 h-8 border-2 border-[var(--color-brand-primary)] border-t-transparent rounded-full animate-spin" />
          <p>Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* ── Overview ── */}
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* ── Welcome Banner (first visit) ── */}
        <WelcomeBanner
          role="employer"
          userName={user?.full_name || user?.company_name || undefined}
        />

        {/* ── Hero Section ── */}
        <div className="relative group overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl mb-8">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[var(--color-brand-primary)]/10 to-[var(--color-brand-secondary)]/10 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-display text-[var(--color-text)] mb-2">
                  Welcome back,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] capitalize">
                    {user?.full_name || user?.company_name || "Employer"}
                  </span>
                </h1>
                <p className="text-[var(--color-text-muted)] text-lg max-w-xl">
                  Here's what's happening internally across all your jobs.
                </p>
              </div>
              {jobs.length === 0 && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => {
                      setPostJobData(null);
                      setPostJobCreationMode("select");
                      setIsPostingJob(true);
                    }}
                    size="lg"
                    className="bg-gradient-to-br from-[var(--color-brand-primary)] to-blue-400 hover:from-blue-500 hover:to-blue-300 border-0 text-white font-bold"
                    leftIcon={<Plus size={18} strokeWidth={3} />}
                  >
                    Post a Job
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Jobs"
            value={metrics.totalJobs}
            icon={<Briefcase size={20} />}
            color="blue"
          />
          <MetricCard
            title="Total Candidates"
            value={metrics.totalSubmissions}
            subValue={
              <div className="flex items-center gap-2 text-xs font-medium mt-1">
                <span className="text-amber-500">{metrics.startedSubmissions} Started</span>
                <span className="text-[var(--color-border)]">•</span>
                <span className="text-emerald-500">{metrics.finishedSubmissions} Finished</span>
              </div>
            }
            icon={<Users size={20} />}
            color="purple"
          />
          <MetricCard
            title="Hires Made"
            value={metrics.totalHires}
            icon={<CheckCircle2 size={20} />}
            color="emerald"
          />
          <MetricCard
            title="Avg Rating"
            value={metrics.avgRating}
            icon={<Star size={20} />}
            color="amber"
          />
        </div>

        {/* Responsibility Score Widget */}
        {company && (
          <div className="mt-4 p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-text)] text-sm">Responsibility Score</h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {company.responsibility_score === null || company.responsibility_score === undefined
                    ? "Review your first proof submission to start building your score."
                    : "Visible to candidates on your job listings. Review promptly to keep it high."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <ResponsibilityScoreBadge score={company.responsibility_score} size="lg" showLabel={false} />
              {company.slug && (
                <a
                  href={`/company/${company.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[var(--color-brand-primary)] hover:underline font-medium"
                >
                  View page <ArrowUpRight size={12} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Active Jobs List */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-display text-[var(--color-text)]">Active Jobs</h2>
          </div>
          {jobs.length === 0 ? (
            <div className="text-center p-8 md:p-12 border border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)] shadow-sm">
              <div className="w-16 h-16 mx-auto bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] rounded-full flex items-center justify-center mb-4">
                <Briefcase size={32} />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">Welcome to Bevisly!</h3>
              <p className="text-[var(--color-text-muted)] max-w-md mx-auto mb-6">
                You don't have any active jobs yet. Create your first role with an AI-generated Proof Task and start hiring based on actual skills.
              </p>
              <Button
                onClick={() => {
                  setPostJobData(null);
                  setPostJobCreationMode("select");
                  setIsPostingJob(true);
                }}
                size="lg"
                className="bg-gradient-to-br from-[var(--color-brand-primary)] to-blue-400 hover:from-blue-500 hover:to-blue-300 border-0 text-white font-bold"
                leftIcon={<Plus size={18} strokeWidth={3} />}
              >
                Post Your First Role
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => navigate(`/employer/talent-board?jobId=${job.id}`)}
                  className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm hover:shadow-md hover:border-[var(--color-brand-primary)]/50 transition-all text-left flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          job.status === "active"
                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                            : "bg-slate-400"
                        }`}
                      />
                      <span className="text-xs font-semibold text-[var(--color-text-muted)] capitalize">
                        {job.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-[var(--color-text)] mb-1 truncate">{job.title}</h3>
                    <p className="text-sm text-[var(--color-text-muted)] truncate">
                      {job.location} • {job.job_type}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400">
                      <Users size={16} />
                      <span>{submissions.filter((s) => s.job_id === job.id).length} Candidates</span>
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      Manage pipeline &rarr;
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Post Job Slide-Over Panel ── */}
      {createPortal(
        <AnimatePresence>
          {isPostingJob && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={() => { setIsPostingJob(false); setPostJobData(null); }}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className={`fixed top-0 right-0 z-50 h-full w-full bg-[var(--color-bg)] border-l border-[var(--color-border)] shadow-2xl overflow-y-auto ${
                  postJobCreationMode === "select"
                    ? "max-w-2xl"
                    : postJobData
                    ? "max-w-4xl"
                    : "max-w-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800"
                }`}
              >
                {postJobCreationMode === "select" ? (
                  /* ── Choice View ── */
                  <div className="w-full min-h-screen p-8 md:p-12 flex flex-col justify-start pt-20 pb-12">
                    <div className="mb-10 text-center">
                      <h2 className="text-3xl font-bold font-display text-[var(--color-text)] mb-3">Post a New Job</h2>
                      <p className="text-[var(--color-text-muted)]">How would you like to build this listing?</p>
                    </div>

                    <div className="grid gap-6">
                      <button
                        onClick={() => setPostJobCreationMode("ai")}
                        className="group relative flex items-start gap-5 p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-primary)] hover:shadow-xl hover:shadow-[var(--color-brand-primary)]/5 transition-all text-left"
                      >
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-blue-400 flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                          <Sparkles size={28} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-[var(--color-text)] mb-1 flex items-center gap-2">
                            Auto-Generate with AI
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                              Recommended
                            </span>
                          </h3>
                          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                            Briefly describe the role, and AI will write the description, requirements, and build a tailored proof task for you in seconds.
                          </p>
                        </div>
                        <ArrowRight size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-primary)] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                      </button>

                      <button
                        onClick={() => {
                          setPostJobData({});
                          setPostJobCreationMode("manual");
                        }}
                        className="group relative flex items-start gap-5 p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-primary)] hover:shadow-xl hover:shadow-[var(--color-brand-primary)]/5 transition-all text-left"
                      >
                        <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 border border-[var(--color-border)] group-hover:scale-110 transition-transform">
                          <PenTool size={28} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-[var(--color-text)] mb-1">
                            Start from Scratch
                          </h3>
                          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                            Write your own job details and requirements. You can optionally add proof tasks later to verify candidate skills.
                          </p>
                        </div>
                        <ArrowRight size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-primary)] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                      </button>
                    </div>

                    <button
                      onClick={() => setIsPostingJob(false)}
                      className="mt-10 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                    >
                      Cancel and return to dashboard
                    </button>
                  </div>
                ) : !postJobData ? (
                  /* ── Step 1: Intent Form ── */
                  <div className="w-full px-6 py-20 min-h-screen flex flex-col justify-start">
                    <EmployerJobIntentForm
                      onClose={() => setIsPostingJob(false)}
                      companyName={user?.company_name || "your company"}
                      onGenerated={(data) => setPostJobData(data)}
                    />
                  </div>
                ) : (
                  /* ── Step 2: Full Form (Pre-filled) ── */
                  <>
                    <div className="sticky top-0 z-10 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
                      <h2 className="text-lg font-bold text-[var(--color-text)]">Review & Publish Job</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setIsPostingJob(false); setPostJobData(null); }}
                      >
                        ✕ Close
                      </Button>
                    </div>
                    <div className="p-6">
                      <EmployerJobForm
                        mode="create"
                        defaultValues={postJobData}
                        submitLabel="Publish Job"
                        onSuccess={async () => {
                          setIsPostingJob(false);
                          setPostJobData(null);
                          setShowCelebration(true);
                          if (user?.id) {
                            const updatedJobs = await getEmployerJobs(user.id);
                            setJobs(updatedJobs);
                          }
                        }}
                      />
                    </div>
                  </>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Success Celebration Overlay */}
      <SuccessCelebration
        isVisible={showCelebration}
        onDismiss={() => setShowCelebration(false)}
        variant="job-posted"
        onAction={() => {}}
      />
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  subValue,
  color = "blue",
}: {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  subValue?: React.ReactNode;
  color?: "blue" | "purple" | "emerald" | "amber";
}) {
  const colorStyles = {
    blue: "from-blue-500/20 to-indigo-500/20 text-blue-600 border-blue-500/20",
    purple: "from-purple-500/20 to-pink-500/20 text-purple-600 border-purple-500/20",
    emerald: "from-emerald-500/20 to-teal-500/20 text-emerald-600 border-emerald-500/20",
    amber: "from-amber-500/20 to-orange-500/20 text-amber-600 border-amber-500/20",
  };

  return (
    <Card className="relative overflow-hidden p-6 flex flex-col justify-between gap-4 hover:-translate-y-1 transition-all duration-300 cursor-default group border border-[var(--color-border)]/50 bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-bg)] shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${colorStyles[color]} shadow-inner ring-1 ring-inset ring-white/10`}>
          {icon}
        </div>
        <div className="text-xs font-bold px-2 py-1 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-muted)]">
          Last 30d
        </div>
      </div>
      <div>
        <p className="text-sm text-[var(--color-text-muted)] font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold font-display text-[var(--color-text)] tracking-tight">
          {value}
        </p>
        {subValue && <div>{subValue}</div>}
      </div>
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-10 bg-gradient-to-br ${colorStyles[color]}`} />
    </Card>
  );
}
