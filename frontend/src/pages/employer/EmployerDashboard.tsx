import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getEmployerJobs,
  getEmployerSubmissions,
  getEmployerJobSummary,
  toggleJobStatus,
  toggleJobFeatured,
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
  Clock,
  ArrowRight,
  Search,
  Plus,
  Activity,
} from "lucide-react";
import { deleteJob } from "@/lib/api/jobs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function EmployerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [submissions, setSubmissions] = useState<EmployerSubmission[]>([]);
  const [summaries, setSummaries] = useState<EmployerJobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Load employer data
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        setLoading(true);
        const [jobsData, subsData, summariesData] = await Promise.all([
          getEmployerJobs(user.id),
          getEmployerSubmissions(user.id),
          getEmployerJobSummary(user.id),
        ]);
        setJobs(jobsData);
        setSubmissions(subsData);
        setSummaries(summariesData);
      } catch (err) {
        console.error("Employer dashboard error:", err);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  // Quick metrics
  const totalJobs = jobs.length;
  const totalSubmissions = submissions.length;
  const totalHires = submissions.filter((s) => s.status === "hired").length;
  const avgRating = useMemo(() => {
    const ratings = summaries
      .map((s) => s.avg_score)
      .filter((v): v is number => v !== null);
    if (!ratings.length) return "—";
    return (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1);
  }, [summaries]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        const matchesSearch = job.title
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && job.status === "active") ||
          (statusFilter === "closed" && job.status === "closed") ||
          (statusFilter === "featured" && job.featured);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [jobs, searchTerm, statusFilter]);

  const findSummary = (jobId: string) =>
    summaries.find((s) => s.job_id === jobId);

  // Universal job action handler
  const handleJobAction = async (
    e: React.MouseEvent,
    job: EmployerJob,
    action: "status" | "featured"
  ) => {
    e.stopPropagation();

    try {
      const updated =
        action === "status"
          ? await toggleJobStatus(job.id, job.status || "active")
          : await toggleJobFeatured(job.id, job.featured || false);

      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id
            ? {
              ...j,
              ...(action === "status"
                ? {
                  status:
                    updated.status === "active" ||
                      updated.status === "closed"
                      ? updated.status
                      : null,
                }
                : { featured: !!updated.featured }),
            }
            : j
        )
      );

      toast.success(
        action === "status"
          ? updated.status === "active"
            ? "✅ Job reopened successfully."
            : "🛑 Job closed successfully."
          : updated.featured
            ? "⭐ Job featured successfully!"
            : "Job unfeatured."
      );
    } catch (err) {
      console.error(err);
      toast.error(
        action === "status"
          ? "Failed to update job status."
          : "Failed to toggle featured state."
      );
    }
  };

  const handleDelete = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this job? Submissions will be lost.")) return;
    try {
      await deleteJob(jobId);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      toast.success("Job deleted.");
    } catch {
      toast.error("Failed to delete job.");
    }
  };

  // Loading state
  if (loading)
    return (
      <div className="flex items-center justify-center h-full text-[var(--color-text-muted)] p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--color-brand-primary)] border-t-transparent rounded-full animate-spin" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-[var(--color-text)]">Employer Dashboard</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            Manage jobs, review proofs, and track hiring performance.
          </p>
        </div>
        <Button onClick={() => navigate("/employer/jobs/new")} leftIcon={<Plus size={18} />}>
          Post New Job
        </Button>
      </div>

      {/* Metrics Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Jobs Posted"
          value={totalJobs}
          icon={<Briefcase size={20} />}
          color="blue"
        />
        <MetricCard
          title="Total Submissions"
          value={totalSubmissions}
          icon={<Users size={20} />}
          color="purple"
        />
        <MetricCard
          title="Average Rating"
          value={avgRating}
          icon={<Star size={20} />}
          color="amber"
        />
        <MetricCard
          title="Hires Made"
          value={totalHires}
          icon={<CheckCircle2 size={20} />}
          color="emerald"
        />
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Col: Jobs List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-[var(--color-text)]">Your Jobs</h2>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={14} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 text-[var(--color-text)] w-32 md:w-48 transition-all"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="featured">Featured</option>
              </select>
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <Card variant="flat" className="p-8 text-center flex flex-col items-center justify-center dashed-border">
              <div className="w-12 h-12 bg-[var(--color-surface)] rounded-full flex items-center justify-center mb-3">
                <Briefcase className="text-[var(--color-text-muted)]" />
              </div>
              <p className="text-[var(--color-text-muted)] italic">No jobs found matching your criteria.</p>
              {jobs.length === 0 && (
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => navigate("/employer/jobs/new")}>
                  Create your first job
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => {
                const summary = findSummary(job.id);
                return (
                  <Card
                    key={job.id}
                    variant={job.featured ? "glass-hover" : "default"}
                    padding="none"
                    className="group"
                    onClick={() => navigate(`/employer/job/${job.id}`)}
                  >
                    <div className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {job.featured && <span title="Featured Job" className="text-amber-500"><Star size={14} fill="currentColor" /></span>}
                          <h3 className="font-bold text-[var(--color-text)] text-lg group-hover:text-[var(--color-brand-primary)] transition-colors">
                            {job.title}
                          </h3>
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${job.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                            }`}>
                            {job.status}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--color-text-muted)] line-clamp-1 mb-3">
                          {job.description || "No description provided."}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                          <span className="flex items-center gap-1"><Clock size={12} /> {new Date(job.created_at || "").toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Users size={12} /> {summary?.submissions_count || 0} applicants</span>
                          {summary?.avg_score && <span className="flex items-center gap-1"><Activity size={12} /> {Number(summary.avg_score).toFixed(1)} avg score</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-center">
                        <div className="flex items-center bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)] p-1">
                          <button
                            onClick={(e) => handleJobAction(e, job, "status")}
                            className="p-1.5 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] transition-colors"
                            title={job.status === "active" ? "Close Job" : "Reopen Job"}
                          >
                            {job.status === "active" ? "Close" : "Open"}
                          </button>
                          <div className="w-[1px] h-4 bg-[var(--color-border)] mx-1" />
                          <button
                            onClick={(e) => handleDelete(e, job.id)}
                            className="p-1.5 rounded hover:bg-red-500/10 text-red-500 transition-colors"
                            title="Delete Job"
                          >
                            Delete
                          </button>
                        </div>
                        <Button size="sm" variant="ghost" rightIcon={<ArrowRight size={14} />}>
                          Manage
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Recent Activity */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-display text-[var(--color-text)]">Recent Activity</h2>
          <Card className="overflow-hidden">
            {submissions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[var(--color-text-muted)] text-sm">No activity yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {submissions.slice(0, 5).map((s) => (
                  <li
                    key={s.id}
                    onClick={() => navigate(`/employer/review/${s.id}`)}
                    className="p-4 hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center text-[10px] font-bold text-blue-600 border border-blue-500/20 shrink-0">
                      Candidate
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)] line-clamp-1">{s.proof_tasks?.title || "Untitled Task"}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Submitted a new proof</p>
                      <span className={`inline-block mt-2 text-[10px] px-1.5 py-0.5 rounded border ${s.status === 'hired' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                        s.status === 'reviewed' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' :
                          'bg-amber-500/10 border-amber-500/20 text-amber-600'
                        }`}>
                        {s.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-[var(--color-text-muted)] ml-auto whitespace-nowrap">
                      {new Date(s.created_at || "").toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {submissions.length > 5 && (
              <div className="p-3 border-t border-[var(--color-border)] text-center">
                <button onClick={() => navigate("/employer/submissions")} className="text-xs font-medium text-[var(--color-brand-primary)] hover:underline">
                  View All Submissions
                </button>
              </div>
            )}
          </Card>

          {/* Tips Card */}
          <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Star size={80} />
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Pro Tip</h3>
              <p className="text-indigo-100 text-sm mb-4">
                Quality proofs depend on clear instructions. Try adding a loom video to your next job post to explain exactly what you're looking for.
              </p>
              <button
                onClick={() => navigate('/employer/jobs/new')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-medium transition-colors"
              >
                Create Job with Video
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Subcomponent: MetricCard ─────────────────────────────── */
function MetricCard({
  title,
  value,
  icon,
  color = "blue"
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
    <Card className="p-5 flex items-start gap-4 hover:-translate-y-1 transition-transform cursor-default">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${colorStyles[color]} border shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-[var(--color-text-muted)] font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold font-display text-[var(--color-text)] tracking-tight">
          {value}
        </p>
      </div>
    </Card>
  );
}
