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
        <div className="rounded-2xl p-6 md:p-8 lg:p-10 border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm mb-8">
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-display text-[var(--color-text)] mb-2">
                  Welcome back,{" "}
                  <span className="text-[var(--color-brand-primary)] capitalize">
                    {user?.full_name || user?.company_name || "Employer"}
                  </span>
                </h1>
                <p className="text-[var(--color-text-muted)] text-lg max-w-xl">
                  {jobs.length === 0
                    ? "Let's get your first role live. It only takes a few minutes."
                    : "Here's what's happening internally across all your jobs."}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                {company?.slug && (
                  <a
                    href={`/company/${company.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-sm font-semibold text-[var(--color-text)] transition-colors"
                  >
                    <ArrowUpRight size={15} className="text-[var(--color-text-muted)]" />
                    View public page
                  </a>
                )}
                {jobs.length === 0 && (
                  <Button
                    onClick={() => {
                      setPostJobData(null);
                      setPostJobCreationMode("select");
                      setIsPostingJob(true);
                    }}
                    size="lg"
                    className=""
                    leftIcon={<Plus size={18} strokeWidth={3} />}
                  >
                    Post a Job
                  </Button>
                )}
              </div>
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
            <div className="shrink-0">
              <ResponsibilityScoreBadge score={company.responsibility_score} size="lg" showLabel={false} />
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
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">Post your first role</h3>
              <p className="text-[var(--color-text-muted)] max-w-lg mx-auto mb-6">
                On Bevisly, every job listing includes a <strong className="text-[var(--color-text)]">Proof Task</strong> — a short, real-work challenge (1–3 hours) 
                that candidates complete instead of sending a CV. You review their actual output, not résumés.
              </p>

              {/* Quick visual flow */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-8 text-sm text-[var(--color-text-muted)]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-brand-primary)] text-white text-xs font-bold flex items-center justify-center">1</div>
                  <span>Describe the role</span>
                </div>
                <ArrowRight size={14} className="hidden sm:block text-[var(--color-border)]" />
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-brand-primary)] text-white text-xs font-bold flex items-center justify-center">2</div>
                  <span>AI builds the listing + task</span>
                </div>
                <ArrowRight size={14} className="hidden sm:block text-[var(--color-border)]" />
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-brand-primary)] text-white text-xs font-bold flex items-center justify-center">3</div>
                  <span>Review & publish</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setPostJobData(null);
                  setPostJobCreationMode("select");
                  setIsPostingJob(true);
                }}
                size="lg"
                className=""
                leftIcon={<Plus size={18} strokeWidth={3} />}
              >
                Post Your First Role
              </Button>
              <p className="text-xs text-[var(--color-text-muted)] mt-3">
                Takes about 2 minutes with AI generation
              </p>
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
                    <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-brand-primary)]">
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
                className={`fixed top-0 right-0 z-50 h-full w-full border-l border-[var(--color-border)] shadow-2xl overflow-y-auto ${
                  postJobCreationMode === "ai" && !postJobData
                    ? "max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
                    : postJobData
                    ? "max-w-4xl bg-[var(--color-bg)]"
                    : "max-w-2xl bg-[var(--color-bg)]"
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
                        <div className="w-14 h-14 rounded-xl bg-[var(--color-brand-primary)] flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                          <Sparkles size={28} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-[var(--color-text)] mb-1 flex items-center gap-2">
                            Auto-Generate with AI
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-[var(--color-brand-subtle)] text-[var(--color-brand-primary)] border border-[var(--color-brand-subtle-border)]">
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

                    {/* Proof Task Explainer */}
                    <div className="mt-4 p-4 rounded-xl bg-[var(--color-brand-primary)]/5 border border-[var(--color-brand-primary)]/15 text-left">
                      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                        <strong className="text-[var(--color-text)]">💡 What's a Proof Task?</strong> A short, real-work challenge (1–3 hours) attached to your listing. 
                        Candidates complete it to apply — so you review their actual output instead of résumés. AI can generate one based on your role description.
                      </p>
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
                      onLaunched={async () => {
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
                        defaultValues={{
                          ...postJobData,
                          company: postJobData?.company || company?.name || user?.company_name || undefined,
                        }}
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
  const iconColorClass = {
    blue: "text-[var(--color-brand-primary)]",
    purple: "text-[var(--color-brand-primary)]",
    emerald: "text-[var(--color-success)]",
    amber: "text-[var(--color-score-accent)]",
  };

  return (
    <Card className="relative p-6 flex flex-col justify-between gap-4 cursor-default border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm hover:shadow-md transition-shadow duration-150">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)] ${iconColorClass[color]}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm text-[var(--color-text-muted)] font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold font-display text-[var(--color-text)] tracking-tight">
          {value}
        </p>
        {subValue && <div>{subValue}</div>}
      </div>
    </Card>
  );
}
