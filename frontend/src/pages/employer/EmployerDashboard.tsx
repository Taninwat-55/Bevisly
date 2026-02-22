import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getEmployerJobs,
  getEmployerSubmissionsWithFeedback,
  getEmployerJobSummary,
  updateJobStatus,
  deleteJob,
} from "@/lib/api";
import { getJobWithTasks, updateJobWithTasks } from "@/lib/api/jobs";
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
  MoreVertical,
  Pause,
  Play,
  Trash2,
  Archive,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import TalentBoard from "@/components/talent/TalentBoard";
import EmployerTalentPool from "@/pages/employer/EmployerTalentPool";
import EmployerReviewProof from "./EmployerReviewProof";
import UserSettings from "@/pages/shared/UserSettings";
import EmployerJobForm from "./EmployerJobForm";
import EmployerJobIntentForm from "@/components/employer/EmployerJobIntentForm";
import type { ProofTask } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

export default function EmployerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Data State
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [submissions, setSubmissions] = useState<EmployerSubmission[]>([]);
  const [summaries, setSummaries] = useState<EmployerJobSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  type DashboardView = "overview" | "kanban" | "settings";
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [showJobActions, setShowJobActions] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [editJobData, setEditJobData] = useState<Partial<EmployerJob & { proof_tasks: ProofTask[] }> | null>(null);
  const [editJobLoading, setEditJobLoading] = useState(false);

  // Post Job State
  const [isPostingJob, setIsPostingJob] = useState(false); // Controls the overlay visibility
  const [postJobData, setPostJobData] = useState<Partial<EmployerJob & { proof_tasks: ProofTask[] }> | null>(null); // Stores the unified data
  // Logic: if isPostingJob is true:
  //   - if postJobData is null -> Show Intent Form
  //   - if postJobData is set -> Show Main Form (pre-filled)

  const handleStatusUpdate = async (status: string) => {
    if (!selectedJobId) return;
    try {
        await updateJobStatus(selectedJobId, status);
        toast.success(`Job marked as ${status}`);
        // Optimistic update
        setJobs(jobs.map(j => j.id === selectedJobId ? { ...j, status } : j));
        setShowJobActions(false);
    } catch (error) {
        toast.error("Failed to update status");
        console.error(error);
    }
  };

  const handleDeleteJob = async () => {
    if (!selectedJobId || !confirm("Are you sure you want to delete this job? This cannot be undone.")) return;
    try {
        await deleteJob(selectedJobId);
        toast.success("Job deleted");
        setJobs(jobs.filter(j => j.id !== selectedJobId));
        setSelectedJobId(null);
        setActiveView("overview");
    } catch (error) {
        toast.error("Failed to delete job");
        console.error(error);
    }
  };

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

  /* ── Derived Data ─────────────────────────────── */
  


  // Selected Job Details
  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === selectedJobId),
    [jobs, selectedJobId]
  );

  // Submissions for the selected job (or all for metrics)
  const jobSubmissions = useMemo(() => {
    if (!selectedJobId) return submissions;
    return submissions.filter((s) => s.job_id === selectedJobId);
  }, [submissions, selectedJobId]);

  // Metrics (Global)
  const metrics = useMemo(() => {
    const totalJobs = jobs.length;
    const totalSubmissions = submissions.length;
    const totalHires = submissions.filter((s) => s.status === "hired").length;
    
    const validRatings = summaries
      .map((s) => s.avg_score)
      .filter((v): v is number => v !== null);
    
    const avgRating = validRatings.length
      ? (validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1)
      : "—";

    return { totalJobs, totalSubmissions, totalHires, avgRating };
  }, [jobs, submissions, summaries]);

  /* ── Render ───────────────────────────────────── */

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
      {activeView === "kanban" && selectedJobId ? (
            /* ── Job Detail View (Kanban) ── */
            <div className="space-y-6 h-full flex flex-col">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                  <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" onClick={() => { setActiveView("overview"); setSelectedJobId(null); }}>
                    <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                  </Button>
                  <h1 className="text-2xl font-bold font-display text-[var(--color-text)] flex items-center gap-2">
                    {selectedJob?.title}
                    <span 
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        selectedJob?.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                        : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                      }`}
                    >
                      {selectedJob?.status}
                    </span>
                  </h1>
                  <p className="text-[var(--color-text-muted)] text-sm mt-1">
                    Manage candidates and move them through the hiring pipeline.
                  </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={async () => {
                        if (!selectedJobId) return;
                        setEditJobLoading(true);
                        try {
                            const data = await getJobWithTasks(selectedJobId);
                            setEditJobData(data as unknown as EmployerJob & { proof_tasks: ProofTask[] });
                            setIsEditingJob(true);
                        } catch {
                            toast.error("Failed to load job for editing");
                        } finally {
                            setEditJobLoading(false);
                        }
                    }}>
                        {editJobLoading ? "Loading..." : "Edit Job"}
                    </Button>
                    
                    <div className="relative">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-9 w-9 p-0"
                            onClick={() => setShowJobActions(!showJobActions)}
                        >
                            <MoreVertical size={18} />
                        </Button>

                        {showJobActions && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => handleStatusUpdate(selectedJob?.status === 'active' ? 'paused' : 'active')}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--color-surface-hover)] flex items-center gap-2 text-[var(--color-text)] transition-colors"
                                >
                                    {selectedJob?.status === 'active' ? (
                                        <><Pause size={14} /> Pause Job</>
                                    ) : (
                                        <><Play size={14} /> Resume Job</>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('closed')}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--color-surface-hover)] flex items-center gap-2 text-[var(--color-text)] transition-colors"
                                >
                                    <Archive size={14} /> Close Job
                                </button>
                                <button
                                    onClick={() => navigate(`/jobs/${selectedJobId}`)}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--color-surface-hover)] flex items-center gap-2 text-[var(--color-text)] transition-colors"
                                >
                                    <Users size={14} /> View Public Page
                                </button>
                                <div className="h-px bg-[var(--color-border)] my-1" />
                                <button
                                    onClick={handleDeleteJob}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 flex items-center gap-2 transition-colors"
                                >
                                    <Trash2 size={14} /> Delete Job
                                </button>
                            </div>
                        )}
                        
                        {/* Overlay to close menu */}
                        {showJobActions && (
                            <div className="fixed inset-0 z-40" onClick={() => setShowJobActions(false)} />
                        )}
                    </div>
                </div>
              </div>

              {/* Kanban Board */}
              <div className="flex-1 min-h-0">
                <TalentBoard 
                  submissions={jobSubmissions} 
                  setSubmissions={setSubmissions} 
                  onReview={(id) => {
                    setSelectedSubmissionId(id);
                  }}
                />
              </div>
            </div>
          ) : activeView === "settings" ? (
             /* ── Settings View ── */
             <div className="h-full flex flex-col">
               <UserSettings />
             </div>
          ) : (
            /* ── Overview View ── */
            <div className="space-y-8 max-w-5xl mx-auto">
              {/* ── Hero Section ────────────────────────────── */}
              <div className="relative group overflow-hidden rounded-3xl p-8 lg:p-10 border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl mb-8">
                {/* Background Gradient/Mesh */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[var(--color-brand-primary)]/10 to-[var(--color-brand-secondary)]/10 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3" />

                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold font-display text-[var(--color-text)] mb-2">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] capitalize">{user?.full_name || user?.company_name || "Employer"}</span>
                      </h1>
                      <p className="text-[var(--color-text-muted)] text-lg max-w-xl">
                        Here's what's happening internally across all your jobs.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => {
                          setPostJobData(null);
                          setIsPostingJob(true);
                        }}
                        size="lg"
                        className="shadow-glow-primary"
                        leftIcon={<Plus size={18} />}
                      >
                        Post a Job
                      </Button>
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

              {/* Active Jobs List */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold font-display text-[var(--color-text)]">Active Jobs</h2>
                </div>
                {jobs.length === 0 ? (
                    <div className="text-center p-8 border border-dashed border-[var(--color-border)] rounded-2xl">
                        <p className="text-[var(--color-text-muted)]">No jobs posted yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {jobs.map(job => (
                            <button
                                key={job.id}
                                onClick={() => { setActiveView("kanban"); setSelectedJobId(job.id); }}
                                className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm hover:shadow-md hover:border-[var(--color-brand-primary)]/50 transition-all text-left flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-2 h-2 rounded-full ${job.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-400'}`} />
                                        <span className="text-xs font-semibold text-[var(--color-text-muted)] capitalize">{job.status}</span>
                                    </div>
                                    <h3 className="font-bold text-lg text-[var(--color-text)] mb-1 truncate">{job.title}</h3>
                                    <p className="text-sm text-[var(--color-text-muted)] truncate">{job.location} • {job.job_type}</p>
                                </div>
                                <div className="mt-4 flex items-center gap-4 text-sm font-medium">
                                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                                        <Users size={16} />
                                        <span>{submissions.filter(s => s.job_id === job.id).length} Candidates</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
              </div>

              {/* Integrated Talent Pool View */}
              <div className="mt-8 border-t border-[var(--color-border)] pt-8">
                <EmployerTalentPool 
                    onReview={(id) => {
                        setSelectedSubmissionId(id);
                    }}
                />
              </div>
            </div>
      )}

      {/* ── Post Job Slide-Over Panel ── */}
      <AnimatePresence>
        {isPostingJob && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => { setIsPostingJob(false); setPostJobData(null); }}
            />
            {/* Panel (Dynamic Width) */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`fixed top-0 right-0 z-50 h-full w-full bg-[var(--color-bg)] border-l border-[var(--color-border)] shadow-2xl overflow-y-auto ${
                 postJobData ? "max-w-2xl" : "max-w-xl flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800"
              }`}
            >
              {!postJobData ? (
                /* ── Step 1: Intent Form ── */
                <div className="w-full px-6">
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
                        toast.success("Job published successfully!");
                        setIsPostingJob(false);
                        setPostJobData(null);
                        // Refresh jobs data
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
      </AnimatePresence>

      {/* ── Edit Job Slide-Over Panel ── */}
      <AnimatePresence>
        {isEditingJob && editJobData && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => { setIsEditingJob(false); setEditJobData(null); }}
            />
            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 h-full w-full max-w-2xl bg-[var(--color-bg)] border-l border-[var(--color-border)] shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 z-10 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[var(--color-text)]">Edit Job</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                    onClick={async () => {
                      if (!selectedJobId || !confirm("Are you sure you want to delete this job?")) return;
                      try {
                        await deleteJob(selectedJobId);
                        toast.success("Job deleted");
                        setJobs(jobs.filter(j => j.id !== selectedJobId));
                        setSelectedJobId(null);
                        setActiveView("overview");
                        setIsEditingJob(false);
                        setEditJobData(null);
                      } catch {
                        toast.error("Failed to delete job");
                      }
                    }}
                  >
                    Delete Job
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setIsEditingJob(false); setEditJobData(null); }}
                  >
                    ✕ Close
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <EmployerJobForm
                  mode="edit"
                  defaultValues={editJobData}
                  onSubmit={async (values) => {
                    if (!selectedJobId) return;
                    await updateJobWithTasks(selectedJobId, values);
                  }}
                  submitLabel="Update Job"
                  onSuccess={async () => {
                    toast.success("Job updated!");
                    setIsEditingJob(false);
                    setEditJobData(null);
                    // Refresh jobs data
                    if (user?.id) {
                      const updatedJobs = await getEmployerJobs(user.id);
                      setJobs(updatedJobs);
                    }
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Review Proof Slide-Over Panel ── */}
      <AnimatePresence>
        {selectedSubmissionId && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedSubmissionId(null)}
            />
            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 h-full w-full max-w-3xl bg-[var(--color-bg)] border-l border-[var(--color-border)] shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 z-10 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[var(--color-text)]">Review Proof</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSubmissionId(null)}
                >
                  ✕ Close
                </Button>
              </div>
              <div className="p-0">
                <EmployerReviewProof
                  submissionId={selectedSubmissionId}
                  onBack={() => setSelectedSubmissionId(null)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  color = "blue",
}: {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
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
          <div className={`text-xs font-bold px-2 py-1 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-muted)]`}>
              Last 30d
          </div>
      </div>
      <div>
        <p className="text-sm text-[var(--color-text-muted)] font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold font-display text-[var(--color-text)] tracking-tight">
          {value}
        </p>
      </div>
      
      {/* Decorative gradient blur */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-10 bg-gradient-to-br ${colorStyles[color]}`} />
    </Card>
  );
}
