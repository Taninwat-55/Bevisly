// src/pages/jobs/JobListingPage.tsx
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useJobs } from "@/hooks/useJobs";
import { getEmployerJobs } from "@/lib/api/jobs";
import {
  Loader2,
  Briefcase,
  Clock,
  Search,
  LogIn,
  Edit3,
  FolderOpen,
  Plus,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import type { SessionUser } from "@/context/AuthContext";
import type { ProofTask, CandidateJob, EmployerJob } from "@/types";
import FilterChips from "@/components/ui/FilterChips";

/* ─── Types ─────────────────────────────── */
type JobListItem =
  | (CandidateJob & { proof_tasks?: ProofTask[] })
  | (EmployerJob & { proof_tasks?: ProofTask[] });

function hasProofTasks(
  job: JobListItem
): job is JobListItem & { proof_tasks: ProofTask[] } {
  return Array.isArray((job as { proof_tasks?: unknown }).proof_tasks);
}

/* ─── Unified Job Listing Page ─────────────────────────────── */
export default function JobListingPage() {
  const { user } = useAuth();
  const role: SessionUser["role"] = user?.role ?? null;
  const navigate = useNavigate();

  // Candidate & Public jobs
  const { jobs: publicJobs, loading, error } = useJobs();

  // Employer jobs
  const [employerJobs, setEmployerJobs] = useState<
    (EmployerJob & { proof_tasks?: ProofTask[] })[]
  >([]);
  const [employerLoading, setEmployerLoading] = useState(false);

  /* ─── Filters ─────────────────────────────── */
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    paid: false,
    aiAllowed: false,
    short: false,
  });

  /* 🧭 Fetch employer jobs when role = employer */
  useEffect(() => {
    if (role !== "employer" || !user?.id) return;
    const loadEmployerJobs = async () => {
      setEmployerLoading(true);
      try {
        const data = await getEmployerJobs(user.id);
        setEmployerJobs(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load your jobs");
      } finally {
        setEmployerLoading(false);
      }
    };
    loadEmployerJobs();
  }, [role, user?.id]);

  /* 🕓 Debounced Search */
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handler);
  }, [query]);

  /* 🎯 Data source depends on role (wrapped in useMemo for stability) */
  const jobs: JobListItem[] = useMemo(() => {
    return (
      (role === "employer" ? employerJobs : (publicJobs as JobListItem[])) ?? []
    );
  }, [role, employerJobs, publicJobs]);

  const isLoading = loading || employerLoading;

  /* 🎯 Filtering logic */
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const proof = hasProofTasks(job) ? job.proof_tasks[0] : undefined;
      const textMatch =
        job.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        job.company?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        proof?.title?.toLowerCase().includes(debouncedQuery.toLowerCase());

      const paidMatch = filters.paid ? job.paid === true : true;
      const aiMatch = filters.aiAllowed
        ? proof?.ai_tools_allowed === true
        : true;
      const shortMatch = filters.short
        ? proof?.expected_time?.toLowerCase().includes("30")
        : true;

      return textMatch && paidMatch && aiMatch && shortMatch;
    });
  }, [jobs, debouncedQuery, filters]);

  /* 🧩 Handlers for FilterChips */
  const handleRemoveChip = (type: string) => {
    switch (type) {
      case "query":
        setQuery("");
        break;
      case "paidOnly":
        setFilters((f) => ({ ...f, paid: false }));
        break;
      default:
        break;
    }
  };

  const handleClearAll = () => {
    setFilters({ paid: false, aiAllowed: false, short: false });
    setQuery("");
  };

  /* 🧭 Loading + Empty States */
  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen text-[var(--color-text-muted)]">
        <Loader2 className="animate-spin mr-2" size={18} /> Loading jobs…
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-center text-[var(--color-error)]">
        ⚠️ {error}
      </div>
    );

  if (role === "employer" && !employerJobs.length)
    return (
      <div className="min-h-screen bg-[var(--color-bg)] px-8 py-10 text-center">
        <h1 className="heading-lg text-[var(--color-employer-dark)] mb-3">
          My Jobs
        </h1>
        <p className="text-[var(--color-text-muted)] mb-6">
          You haven’t posted any jobs yet.
        </p>
        <button
          onClick={() => navigate("/employer/jobs/new")}
          className="bg-[var(--color-employer)] text-white px-4 py-2 rounded-[var(--radius-button)] hover:bg-[var(--color-employer-dark)] transition inline-flex items-center gap-2"
        >
          <Plus size={16} /> Post New Job
        </button>
      </div>
    );

  if (!jobs.length)
    return (
      <div className="p-10 text-center text-[var(--color-text-muted)]">
        No jobs available right now — check back soon!
      </div>
    );

  /* 🧭 Normal Display */
  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-8 py-10">
      {/* 🏁 Header */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="heading-lg mb-1">
            {role === "employer" ? "My Jobs" : "🔍 Browse Proof Opportunities"}
          </h1>
          <p className="text-[var(--color-text-muted)]">
            {role === "employer"
              ? "Manage and edit your proof-based roles."
              : "Find open proof tasks and start building your verified record."}
          </p>
        </div>

        {role === "employer" && (
          <button
            onClick={() => navigate("/employer/jobs/new")}
            className="bg-[var(--color-employer)] text-white px-4 py-2 rounded-[var(--radius-button)] hover:bg-[var(--color-employer-dark)] transition inline-flex items-center gap-2"
          >
            <Plus size={16} /> Post New Job
          </button>
        )}
      </header>

      {/* 🧭 Search + Filters (for candidates/public only) */}
      {role !== "employer" && (
        <>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-4 mb-4">
            <div className="relative mb-3">
              <Search
                size={16}
                className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                  query
                    ? "text-[var(--color-candidate)]"
                    : "text-[var(--color-text-muted)]"
                }`}
              />
              <input
                type="text"
                placeholder="Search by job, company, or proof task…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-[var(--radius-button)]
                           border border-[var(--color-border)] bg-[var(--color-bg)]
                           focus:outline-none focus:ring-1 focus:ring-[var(--color-candidate)]"
              />
            </div>

            {/* 🧩 Inline filter toggles */}
            <div className="flex flex-wrap gap-2 justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters((f) => ({ ...f, paid: !f.paid }))}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                    filters.paid
                      ? "bg-[var(--color-candidate)] text-white border-[var(--color-candidate)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-candidate-light)] hover:text-[var(--color-candidate-dark)]"
                  }`}
                >
                  💰 Paid Only
                </button>

                <button
                  onClick={() => setFilters((f) => ({ ...f, short: !f.short }))}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                    filters.short
                      ? "bg-[var(--color-candidate)] text-white border-[var(--color-candidate)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-candidate-light)] hover:text-[var(--color-candidate-dark)]"
                  }`}
                >
                  ⏱ Under 30m
                </button>

                <button
                  onClick={() =>
                    setFilters((f) => ({ ...f, aiAllowed: !f.aiAllowed }))
                  }
                  className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                    filters.aiAllowed
                      ? "bg-[var(--color-candidate)] text-white border-[var(--color-candidate)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-candidate-light)] hover:text-[var(--color-candidate-dark)]"
                  }`}
                >
                  🤖 AI Allowed
                </button>
              </div>

              {(query || Object.values(filters).some(Boolean)) && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition"
                >
                  <XCircle size={14} /> Reset
                </button>
              )}
            </div>
          </div>

          {/* ✅ Shared FilterChips */}
          <FilterChips
            query={query || undefined}
            paidOnly={filters.paid}
            remoteOnly={false}
            companies={[]}
            locations={[]}
            categories={[]}
            onRemove={handleRemoveChip}
            onClearAll={handleClearAll}
          />
        </>
      )}

      {/* 💼 Job Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobs.map((job) => {
          const proof = hasProofTasks(job) ? job.proof_tasks[0] : undefined;

          const handleCTA = () => {
            if (role === "employer") navigate(`/jobs/${job.id}`);
            else if (!user) navigate("/auth");
            else navigate(`/jobs/${job.id}`);
          };

          return (
            <div
              key={job.id}
              className="group bg-[var(--color-surface)] border border-[var(--color-border)]
                         rounded-[var(--radius-card)] shadow-[var(--shadow-soft)]
                         p-6 transition-all hover:shadow-[var(--shadow-hover)] hover:-translate-y-[2px]"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-[var(--color-text)] leading-tight">
                  {job.title}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    job.paid
                      ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                      : "bg-[var(--color-candidate-light)]/10 text-[var(--color-candidate-dark)]"
                  }`}
                >
                  {job.paid ? "Paid" : "XP only"}
                </span>
              </div>

              <p className="text-sm text-[var(--color-text-muted)] mb-3">
                <Briefcase size={14} className="inline mr-1 opacity-80" />
                {job.company || "Unknown"} {job.location && `• ${job.location}`}
              </p>

              {proof && (
                <div className="mb-3 text-sm text-[var(--color-text-muted)]">
                  <p className="font-medium text-[var(--color-text)] mb-1">
                    {proof.title}
                  </p>
                  <p className="line-clamp-2">
                    {proof.description || "A proof task is available."}
                  </p>
                </div>
              )}

              {proof?.expected_time && (
                <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] mb-4">
                  <Clock size={13} className="opacity-80" /> Expected:{" "}
                  {proof.expected_time}
                </div>
              )}

              {role === "employer" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/employer/jobs/${job.id}/edit`)}
                    className="flex-1 bg-[var(--color-employer)] text-white py-2 rounded-[var(--radius-button)] hover:bg-[var(--color-employer-dark)] transition flex items-center justify-center gap-1"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => navigate(`/employer/submissions`)}
                    className="flex-1 border border-[var(--color-border)] text-[var(--color-text-muted)] py-2 rounded-[var(--radius-button)] hover:bg-[var(--color-border)] transition flex items-center justify-center gap-1"
                  >
                    <FolderOpen size={14} /> Submissions
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCTA}
                  className={`w-full py-2.5 rounded-[var(--radius-button)] font-medium transition ${
                    !user
                      ? "bg-[var(--color-bg-hover)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-candidate-dark)]"
                      : "bg-[var(--color-candidate)] text-white hover:bg-[var(--color-candidate-dark)]"
                  }`}
                >
                  {!user ? (
                    <span className="inline-flex items-center gap-1 justify-center">
                      <LogIn size={14} /> Sign in to Apply
                    </span>
                  ) : (
                    "View Details →"
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
