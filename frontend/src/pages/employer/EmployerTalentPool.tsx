import { useEffect, useState, type ChangeEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getEmployerSubmissionsWithFeedback } from "@/lib/api/submissions";
import { getEmployerJobs } from "@/lib/api/jobs";
import type { EmployerSubmission } from "@/types";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Loader2,
  Star,
  ArrowUpDown,
  UserCheck,
  Filter,
  Award,
  Trophy,
  Briefcase,
} from "lucide-react";

export default function EmployerTalentPool() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<EmployerSubmission[]>([]);
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<
    "all" | "reviewed" | "pending"
  >("all");
  const [sortBy, setSortBy] = useState<"date" | "rating" | "job">("date");
  const [topOnly, setTopOnly] = useState(false);

  /* ─── Fetch Data ─────────────────────────────── */
  useEffect(() => {
    if (!user?.id) return;
    async function loadData() {
      try {
        setLoading(true);
        const [subsData, jobsData] = await Promise.all([
          getEmployerSubmissionsWithFeedback(user!.id),
          getEmployerJobs(user!.id),
        ]);
        setSubmissions(subsData);
        setJobs(jobsData); // ✅ Save jobs
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  /* ─── Derived Computations ─────────────────────────────── */
  const reviewed = submissions.filter((s) => s.status === "reviewed");
  const avgRating =
    reviewed.length > 0
      ? (
        reviewed.reduce((sum, s) => sum + (s.feedback?.[0]?.stars ?? 0), 0) /
        reviewed.length
      ).toFixed(1)
      : null;

  let filtered = submissions.filter((s) => {
    const statusMatch =
      statusFilter === "all" ? true : s.status === statusFilter;
    const jobMatch = selectedJob === "all" ? true : s.job_id === selectedJob; // ✅ Job logic
    return statusMatch && jobMatch;
  });

  if (topOnly) {
    filtered = filtered.filter((s) => (s.feedback?.[0]?.stars ?? 0) >= 4);
  }

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "rating": {
        const ratingA = a.feedback?.[0]?.stars ?? 0;
        const ratingB = b.feedback?.[0]?.stars ?? 0;
        return ratingB - ratingA;
      }
      case "job": {
        const jobA = a.jobs?.title?.toLowerCase() ?? "";
        const jobB = b.jobs?.title?.toLowerCase() ?? "";
        return jobA.localeCompare(jobB);
      }
      default:
        return (
          new Date(b.created_at ?? "").getTime() -
          new Date(a.created_at ?? "").getTime()
        );
    }
  });

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-[var(--color-text-muted)]">
        <Loader2 className="animate-spin mr-2" /> Loading candidates…
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-8 py-10 space-y-8">
      {/* 🧭 Header */}
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="heading-lg text-[var(--color-employer-dark)] flex items-center gap-2">
            <Trophy size={26} className="text-[var(--color-employer-dark)]" />
            Talent Pool
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Reviewed & pending candidates from your job postings
          </p>
        </div>
      </header>

      {/* 📊 Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-5 text-center shadow-[var(--shadow-soft)]">
          <UserCheck className="mx-auto mb-1 text-[var(--color-success)]" />
          <h3 className="text-sm text-[var(--color-text-muted)]">
            Total Reviewed
          </h3>
          <p className="text-2xl font-semibold text-[var(--color-text)] mt-1">
            {reviewed.length}
          </p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-5 text-center shadow-[var(--shadow-soft)]">
          <Star className="mx-auto mb-1 text-[var(--color-employer-dark)]" />
          <h3 className="text-sm text-[var(--color-text-muted)]">
            Average Rating
          </h3>
          <p className="text-2xl font-semibold text-[var(--color-text)] mt-1">
            {avgRating ?? "—"}
          </p>
        </div>
      </section>

      {/* 🔍 Filters & Sort */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">

          {/* ✅ Job Filter */}
          <div className="flex items-center gap-2">
            <Briefcase size={14} className="text-[var(--color-text-muted)]" />
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="border border-[var(--color-border)] rounded-[var(--radius-button)] px-2 py-1.5 text-sm bg-[var(--color-surface)] text-[var(--color-text)] max-w-[200px] truncate"
            >
              <option value="all">All Jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[var(--color-text-muted)]" />
            <select
              value={statusFilter}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setStatusFilter(
                  e.target.value as "all" | "reviewed" | "pending"
                )
              }
              className="border border-[var(--color-border)] rounded-[var(--radius-button)] px-2 py-1.5 text-sm bg-[var(--color-surface)] text-[var(--color-text)]"
            >
              <option value="all">All Status</option>
              <option value="reviewed">Reviewed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-[var(--color-text-muted)]" />
            <select
              value={sortBy}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setSortBy(e.target.value as "date" | "rating" | "job")
              }
              className="border border-[var(--color-border)] rounded-[var(--radius-button)] px-2 py-1.5 text-sm bg-[var(--color-surface)] text-[var(--color-text)]"
            >
              <option value="date">Date</option>
              <option value="rating">Rating</option>
              <option value="job">Job</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--color-text-muted)] select-none">
            <input
              type="checkbox"
              checked={topOnly}
              onChange={(e) => setTopOnly(e.target.checked)}
              className="accent-[var(--color-employer-dark)] cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <Award
                size={14}
                className={
                  topOnly
                    ? "text-[var(--color-employer-dark)]"
                    : "text-[var(--color-text-muted)]"
                }
              />
              Top Performers (4★+)
            </span>
          </label>
        </div>
      </section>

      {/* 👥 Candidate List */}
      <section className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-[var(--shadow-soft)] transition-colors">
        {/* (Table code remains the same as before) */}
        {/* ... table ... */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)]">
                <th className="py-2 px-3">Candidate</th>
                <th className="py-2 px-3">Job</th>
                <th className="py-2 px-3">Task</th>
                <th className="py-2 px-3">CV</th>
                <th className="py-2 px-3">Rating</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {sorted.map((s) => {
                const rating = s.feedback?.[0]?.stars;
                const isTop = rating && rating >= 4;
                return (
                  <tr
                    key={s.id}
                    className={`border-b border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] cursor-pointer transition ${isTop
                      ? "bg-[color-mix(in srgb,var(--color-employer) 6%,transparent)]"
                      : ""
                      }`}
                    onClick={() => navigate(`/employer/review/${s.id}`)}
                  >
                    {/* 1. CANDIDATE NAME (Uncommented & Fixed) */}
                    <td className="py-2 px-3 text-[var(--color-text)] font-medium">
                      <div className="flex items-center gap-2">
                        {/* Fallback to email if name is missing */}
                        <span>{s.profiles?.full_name || s.profiles?.email || "Candidate"}</span>
                      </div>
                    </td>

                    {/* 2. JOB TITLE */}
                    <td className="py-2 px-3 text-[var(--color-text-muted)]">
                      {s.jobs?.title || "—"}
                    </td>

                    {/* 3. TASK TITLE */}
                    <td className="py-2 px-3 text-[var(--color-text-muted)]">
                      {s.proof_tasks?.title || "—"}
                    </td>

                    {/* 4. CV Link */}
                    <td className="py-2 px-3">
                      {s.resume_url ? (
                        <a href={s.resume_url} target="_blank" rel="noreferrer" className="text-[var(--color-employer-dark)] underline text-xs" onClick={e => e.stopPropagation()}>View</a>
                      ) : "-"}
                    </td>

                    {/* 5. RATING */}
                    <td className="py-2 px-3">
                      {rating ? <span className="font-medium text-yellow-600">⭐ {rating}/5</span> : "-"}
                    </td>

                    {/* 6. STATUS (Moved here to match header) */}
                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${s.status === "reviewed"
                          ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                          : s.status === "hired"
                            ? "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                            : "bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
                          }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    {/* 7. ACTION */}
                    <td className="py-2 px-3"><button className="text-[var(--color-employer-dark)] underline">View</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}