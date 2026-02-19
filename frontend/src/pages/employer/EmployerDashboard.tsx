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
  Search,
  Plus,
  LayoutDashboard,
  ChevronRight,
  Menu,
  Settings,
  LogOut,
  MoreVertical,
  Pause,
  Play,
  Trash2,
  Archive,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import TalentBoard from "@/components/talent/TalentBoard";
import EmployerTalentPool from "@/pages/employer/EmployerTalentPool";
import EmployerReviewProof from "./EmployerReviewProof";
import UserSettings from "@/pages/shared/UserSettings";
import EmployerJobForm from "./EmployerJobForm";
import type { ProofTask } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

export default function EmployerDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Data State
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [submissions, setSubmissions] = useState<EmployerSubmission[]>([]);
  const [summaries, setSummaries] = useState<EmployerJobSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  type DashboardView = "overview" | "kanban" | "talent-pool" | "settings";
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showJobActions, setShowJobActions] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [editJobData, setEditJobData] = useState<Partial<EmployerJob & { proof_tasks: ProofTask[] }> | null>(null);
  const [editJobLoading, setEditJobLoading] = useState(false);

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
  
  // Filter jobs for sidebar
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [jobs, searchTerm]);

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
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden bg-[var(--color-bg)]">
      {/* ── Sidebar ───────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 bg-[var(--color-surface)]/50 backdrop-blur-xl border-r border-[var(--color-border)]/50 flex flex-col transition-all duration-300 md:relative md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0 shadow-2xl w-72" : "-translate-x-full"
        } ${isSidebarCollapsed ? "md:w-20" : "md:w-72"}`}
      >
        {/* ── Toggle Button (Desktop) ── */}
        <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-end"} px-3 pt-4 pb-2`}>
          {!isSidebarCollapsed && (
            <div className="flex items-center justify-between w-full md:hidden">
              <span className="font-bold text-lg text-[var(--color-text)]">Menu</span>
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>Close</Button>
            </div>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex items-center justify-center p-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] hover:border-[var(--color-brand-primary)]/50 transition-all"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <ArrowRight size={16} strokeWidth={2.5} /> : <ArrowLeft size={16} strokeWidth={2.5} />}
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="px-3 pb-4 space-y-1.5">
          <Button
            onClick={() => {
              setActiveView("overview");
              setSelectedJobId(null);
              setMobileMenuOpen(false);
            }}
            variant="ghost"
            className={`w-full justify-start h-10 transition-all duration-200 group ${
                activeView === "overview" 
                ? "bg-blue-500/10 text-blue-600 border-l-2 border-blue-500 rounded-r-lg rounded-l-none pl-3 font-medium" 
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
            } ${isSidebarCollapsed ? "px-2 justify-center" : ""}`}
            title={isSidebarCollapsed ? "Overview" : undefined}
          >
             <LayoutDashboard size={18} className={`shrink-0 ${activeView === "overview" ? "text-blue-500" : ""}`} />
             {!isSidebarCollapsed && <span className="ml-3">Overview</span>}
          </Button>

          <Button
            onClick={() => {
              setActiveView("talent-pool");
              setSelectedJobId(null);
              setMobileMenuOpen(false);
            }}
            variant="ghost"
            className={`w-full justify-start h-10 transition-all duration-200 group ${
                activeView === "talent-pool" 
                ? "bg-purple-500/10 text-purple-600 border-l-2 border-purple-500 rounded-r-lg rounded-l-none pl-3 font-medium" 
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
            } ${isSidebarCollapsed ? "px-2 justify-center" : ""}`}
            title={isSidebarCollapsed ? "Talent Pool" : undefined}
          >
             <Users size={18} className={`shrink-0 ${activeView === "talent-pool" ? "text-purple-500" : ""}`} />
             {!isSidebarCollapsed && <span className="ml-3">Talent Pool</span>}
          </Button>

          <div className="pt-2">
            <Button
                onClick={() => navigate("/employer/jobs/new")}
                className={`w-full justify-start h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 border-0 ${isSidebarCollapsed ? "px-2 justify-center" : ""}`}
                title={isSidebarCollapsed ? "Post New Job" : undefined}
            >
                <Plus size={16} className="shrink-0" />
                {!isSidebarCollapsed && <span className="ml-2">Post New Job</span>}
            </Button>
          </div>
        </nav>

        {/* ── Search ── */}
        {!isSidebarCollapsed && (
            <div className="px-3 pb-3">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Filter jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)] text-[var(--color-text)]"
                />
              </div>
            </div>
        )}

        {/* ── Job List (Scrollable, fills remaining space) ── */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 border-t border-[var(--color-border)]/50 pt-3">
          {filteredJobs.length === 0 ? (
            !isSidebarCollapsed && <p className="text-xs text-center text-[var(--color-text-muted)] py-6">No jobs found.</p>
          ) : (
            filteredJobs.map((job) => (
              <button
                key={job.id}
                onClick={() => {
                  setActiveView("kanban");
                  setSelectedJobId(job.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-3 rounded-xl text-sm transition-all duration-200 flex items-center group border border-transparent ${
                  activeView === "kanban" && selectedJobId === job.id
                    ? "bg-[var(--color-surface)] shadow-sm border-[var(--color-border)] text-[var(--color-text)] font-medium ring-1 ring-black/5 dark:ring-white/10"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                } ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}
                title={isSidebarCollapsed ? job.title : undefined}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${job.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-400'}`} />
                  {!isSidebarCollapsed && <span className="truncate">{job.title}</span>}
                </div>
                {!isSidebarCollapsed && activeView === "kanban" && selectedJobId === job.id && (
                    <motion.div layoutId="activeJobIndicator">
                        <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
                    </motion.div>
                )}
              </button>
            ))
          )}
        </div>
        
        {/* ── User Info / Footer (pinned to bottom) ── */}
        <div className={`p-4 border-t border-[var(--color-border)] space-y-3 ${isSidebarCollapsed ? "flex flex-col items-center" : ""}`}>
             <div className={`flex items-center gap-3 ${isSidebarCollapsed ? "justify-center" : ""}`}>
                 <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                     {user?.email?.[0].toUpperCase()}
                 </div>
                 {!isSidebarCollapsed && (
                     <div className="flex-1 min-w-0">
                         <p className="text-sm font-medium text-[var(--color-text)] truncate">{user?.email}</p>
                         <p className="text-xs text-slate-500 dark:text-slate-400">Employer Account</p>
                     </div>
                 )}
             </div>
             
             <div className={`flex items-center gap-2 ${isSidebarCollapsed ? "flex-col w-full" : ""}`}>
                 <Button 
                   variant={activeView === "settings" ? "primary" : "ghost"} 
                   size="sm" 
                   className={`flex-1 justify-start h-9 px-2.5 ${isSidebarCollapsed ? "w-full justify-center" : ""}`}
                   title={isSidebarCollapsed ? "Settings" : undefined}
                   onClick={() => {
                     setActiveView("settings");
                     setSelectedJobId(null);
                     setMobileMenuOpen(false);
                   }}
                 >
                   <Settings size={14} className="shrink-0" />
                   {!isSidebarCollapsed && <span className="ml-2">Settings</span>}
                 </Button>
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   className={`h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 ${isSidebarCollapsed ? "w-full" : ""}`}
                   onClick={signOut}
                   title="Log Out"
                 >
                   <LogOut size={14} />
                 </Button>
             </div>
        </div>
      </aside>

      {/* ── Overlay for Mobile ────────────────── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Main Content ──────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 bg-[var(--color-bg)]">
        {/* Top Bar (Mobile Only) */}
        <div className="md:hidden p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 text-[var(--color-text)]"
          >
            <Menu size={24} />
          </button>
          <span className="font-bold">Dashboard</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeView === "kanban" && selectedJobId ? (
            /* ── Job Detail View (Kanban) ── */
            <div className="space-y-6 h-full flex flex-col">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
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
          ) : activeView === "talent-pool" ? (
             /* ── Talent Pool View ── */
             <div className="h-full flex flex-col">
               <EmployerTalentPool />
             </div>
          ) : activeView === "settings" ? (
             /* ── Settings View ── */
             <div className="h-full flex flex-col">
               <UserSettings />
             </div>
          ) : (
            /* ── Overview View ── */
            <div className="space-y-8 max-w-5xl mx-auto">
              <div>
              <div>
                <h1 className="text-4xl font-bold font-display tracking-tight text-[var(--color-text)]">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">{user?.full_name || "Employer"}</span>
                </h1>
                <p className="text-[var(--color-text-muted)] mt-2 text-lg">
                  Here's what's happening internally across all your jobs.
                </p>
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

              {/* Recent Activity */}
              <div>
                <h2 className="text-xl font-bold font-display text-[var(--color-text)] mb-4">
                  Recent Applications
                </h2>
                <Card className="overflow-hidden">
                  {submissions.length === 0 ? (
                    <div className="p-8 text-center text-[var(--color-text-muted)]">
                      No submissions yet.
                    </div>
                  ) : (
                    <ul className="divide-y divide-[var(--color-border)]">
                      {submissions.slice(0, 5).map((s) => (
                        <li
                          key={s.id}
                          className="p-4 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer flex items-center gap-4"
                          onClick={() => {
                              setSelectedSubmissionId(s.id);
                          }}
                        >
                           <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                               <Users size={20} />
                           </div>
                           <div className="flex-1">
                               <p className="font-medium text-[var(--color-text)]">{s.proof_tasks?.title || "Submission"}</p>
                               <p className="text-xs text-[var(--color-text-muted)]">
                                   Applied to <span className="text-[var(--color-text)]">{jobs.find(j => j.id === s.job_id)?.title}</span>
                               </p>
                           </div>
                           <div className="text-right">
                               <span className={`text-xs px-2 py-1 rounded-full border ${
                                   s.status === 'reviewed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                   'bg-amber-500/10 text-amber-600 border-amber-500/20'
                               }`}>
                                   {s.status}
                               </span>
                               <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                                   {new Date(s.created_at || "").toLocaleDateString()}
                               </p>
                           </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

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
