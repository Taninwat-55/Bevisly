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
} from "lucide-react";
import { motion } from "framer-motion";
import { deleteJob } from "@/lib/api/jobs";

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
      <div className="flex items-center justify-center min-h-screen text-[var(--color-text-muted)]">
        Loading dashboard…
      </div>
    );

  return (
    <motion.div
      className="min-h-screen bg-[var(--color-bg)] px-8 py-10 space-y-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="heading-lg">Employer Dashboard</h1>
          <p className="text-[var(--color-text-muted)]">
            Manage jobs, review proofs, and track hiring performance.
          </p>
        </div>
        <button
          onClick={() => navigate("/employer/jobs/new")}
          className="bg-[var(--color-employer)] text-white px-4 py-2 rounded-[var(--radius-button)] shadow-[var(--shadow-soft)] hover:bg-[var(--color-employer-dark)] transition"
        >
          + Post Job
        </button>
      </div>

      {/* Metrics Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Jobs Posted"
          value={totalJobs}
          icon={<Briefcase />}
        />
        <MetricCard
          title="Total Submissions"
          value={totalSubmissions}
          icon={<Users />}
        />
        <MetricCard title="Average Rating" value={avgRating} icon={<Star />} />
        <MetricCard
          title="Hires Made"
          value={totalHires}
          icon={<CheckCircle2 />}
        />
      </section>

      {/* Search + Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search job title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] rounded-[var(--radius-button)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-employer-light)]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] rounded-[var(--radius-button)] px-3 py-2 text-sm"
        >
          <option value="all">All Jobs</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="featured">Featured</option>
        </select>
      </div>

      {/* Job Performance */}
      <section>
        <h2 className="heading-md mb-4">Your Jobs Overview</h2>
        {filteredJobs.length === 0 ? (
          <p className="text-[var(--color-text-muted)] italic">
            No jobs match your criteria.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredJobs.map((job) => {
              const summary = findSummary(job.id);
              return (
                <motion.div
                  key={job.id}
                  onClick={() => navigate(`/employer/job/${job.id}`)}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-5 hover:shadow-[var(--shadow-hover)] transition group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-employer-dark)] transition line-clamp-2 flex items-center gap-1">
                      {job.title}
                      {job.featured && (
                        <span
                          className="text-yellow-500 text-sm"
                          title="Featured"
                        >
                          ⭐
                        </span>
                      )}
                    </h3>
                    <ArrowRight
                      size={16}
                      className="opacity-60 group-hover:translate-x-1 transition-transform"
                    />
                  </div>

                  <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2">
                    {job.description || "No description provided."}
                  </p>

                  <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-2">
                    <span>
                      📅{" "}
                      {job.created_at
                        ? new Date(job.created_at).toLocaleDateString()
                        : "—"}
                    </span>
                    {summary && (
                      <span>
                        {summary.submissions_count ?? 0} submissions · ⭐{" "}
                        {summary.avg_score
                          ? Number(summary.avg_score).toFixed(1)
                          : "—"}
                      </span>
                    )}
                  </div>

                  {/* Status + Actions */}
                  <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border)] mt-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${job.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {job.status === "active" ? "Active" : "Closed"}
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => handleJobAction(e, job, "status")}
                        className="text-xs text-[var(--color-employer)] hover:underline"
                      >
                        {job.status === "active" ? "Close" : "Reopen"}
                      </button>
                      <button
                        onClick={(e) => handleJobAction(e, job, "featured")}
                        className={`text-xs ${job.featured
                            ? "text-yellow-600 hover:underline"
                            : "text-[var(--color-employer)] hover:underline"
                          }`}
                      >
                        {job.featured ? "Unfeature ⭐" : "Feature ⭐"}
                      </button>
                      <button onClick={(e) => handleDelete(e, job.id)} className="text-xs text-[var(--color-error)] hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Submissions */}
      <section>
        <h2 className="heading-md mb-4">Recent Proof Submissions</h2>
        {submissions.length === 0 ? (
          <p className="text-[var(--color-text-muted)]">
            No submissions yet — candidates’ proofs will appear here as soon as
            they apply.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)] rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-[var(--shadow-soft)]">
            {submissions.slice(0, 6).map((s) => (
              <li
                key={s.id}
                onClick={() => navigate(`/employer/review/${s.id}`)}
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-[var(--color-bg-hover)] transition"
              >
                <div>
                  <p className="font-medium text-[var(--color-text)]">
                    {s.proof_tasks?.title || "Untitled Proof"}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                    <Clock size={12} />{" "}
                    {s.created_at
                      ? new Date(s.created_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${s.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : s.status === "reviewed"
                        ? "bg-blue-100 text-blue-700"
                        : s.status === "hired"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                >
                  {s.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </motion.div>
  );
}

/* ─── Subcomponent: MetricCard ─────────────────────────────── */
function MetricCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="flex items-center gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-soft)]"
    >
      <div className="p-3 rounded-full bg-[var(--color-employer)]/10 text-[var(--color-employer)]">
        {icon}
      </div>
      <div>
        <h3 className="text-sm text-[var(--color-text-muted)]">{title}</h3>
        <p className="text-xl font-semibold text-[var(--color-text)] mt-1">
          {value}
        </p>
      </div>
    </motion.div>
  );
}
