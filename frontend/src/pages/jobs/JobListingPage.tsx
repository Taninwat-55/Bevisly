/**
 * 🧭 JobListingPage.tsx
 * Unified job listing for candidates & employers.
 * Combines modern filtering + search + back navigation.
 */

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
import type { Job } from "@/types/job"; // ✅ unified global type
import type { ProofTask } from "@/types";

import BackButton from "@/components/ui/BackButton";
import MultiSelectFilter from "@/components/ui/MultiSelectFilter";
import FilterChips from "@/components/ui/FilterChips";

/* ─── Helpers ─────────────────────────────── */
type JobListItem = Job & { proof_tasks?: ProofTask[] };

function hasProofTasks(
  job: JobListItem
): job is JobListItem & { proof_tasks: ProofTask[] } {
  return Array.isArray((job as { proof_tasks?: unknown }).proof_tasks);
}

/* ─── Component ─────────────────────────────── */
export default function JobListingPage() {
  const { user } = useAuth();
  const role: SessionUser["role"] = user?.role ?? null;
  const navigate = useNavigate();

  // Candidate/public jobs
  const { jobs: publicJobs, loading, error } = useJobs();

  // Employer jobs
  const [employerJobs, setEmployerJobs] = useState<JobListItem[]>([]);
  const [employerLoading, setEmployerLoading] = useState(false);

  /* ─── Filters ─────────────────────────────── */
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    paid: false,
    aiAllowed: false,
    short: false,
  });

  const [companies, setCompanies] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  /* ─── Fetch employer jobs ─────────────────────────────── */
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

  /* ─── Debounced Search ─────────────────────────────── */
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handler);
  }, [query]);

  /* ─── Data source ─────────────────────────────── */
  const jobs: JobListItem[] = useMemo(() => {
    return role === "employer" ? employerJobs : (publicJobs as JobListItem[]);
  }, [role, employerJobs, publicJobs]);

  const isLoading = loading || employerLoading;

  /* ─── Unique filter options ─────────────────────────────── */
  const allCompanies = useMemo(
    () =>
      Array.from(
        new Set(jobs.map((j) => j.company).filter((c): c is string => !!c))
      ),
    [jobs]
  );

  const allLocations = useMemo(
    () =>
      Array.from(
        new Set(jobs.map((j) => j.location).filter((l): l is string => !!l))
      ),
    [jobs]
  );

  const allCategories = useMemo(() => {
    const departments = jobs
      .map((j) => j.department ?? undefined)
      .filter((d): d is string => !!d);

    const proofTitles = jobs.flatMap((j) =>
      hasProofTasks(j) ? j.proof_tasks.map((p) => p.title) : []
    );

    return Array.from(new Set([...departments, ...proofTitles]));
  }, [jobs]);

  /* ─── Filtering Logic ─────────────────────────────── */
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

      const locationMatch =
        locations.length > 0 ? locations.includes(job.location || "") : true;
      const companyMatch =
        companies.length > 0 ? companies.includes(job.company || "") : true;
      const categoryMatch =
        categories.length > 0
          ? hasProofTasks(job) &&
            job.proof_tasks.some((p) =>
              categories.some((c) =>
                p.title.toLowerCase().includes(c.toLowerCase())
              )
            )
          : true;

      return (
        textMatch &&
        paidMatch &&
        aiMatch &&
        shortMatch &&
        locationMatch &&
        companyMatch &&
        categoryMatch
      );
    });
  }, [jobs, debouncedQuery, filters, locations, companies, categories]);

  /* ─── Handlers ─────────────────────────────── */
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
    setCompanies([]);
    setLocations([]);
    setCategories([]);
  };

  /* ─── Empty/Loading States ─────────────────────────────── */
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

  /* ─── Employer empty state ─────────────────────────────── */
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

  /* ─── Candidate empty state ─────────────────────────────── */
  if (!jobs.length)
    return (
      <div className="p-10 text-center text-[var(--color-text-muted)]">
        No jobs available right now — check back soon!
      </div>
    );

  /* ─── Main Layout ─────────────────────────────── */
  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-8 py-10">
      <BackButton to="/" className="mb-6" />

      {/* Header */}
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

      {/* Candidate/Public Filters */}
      {role !== "employer" && (
        <>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-4 mb-4 space-y-4">
            {/* Search */}
            <div className="relative">
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

            {/* Multi-select filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <MultiSelectFilter
                label="Companies"
                options={allCompanies}
                selected={companies}
                onChange={setCompanies}
              />
              <MultiSelectFilter
                label="Locations"
                options={allLocations}
                selected={locations}
                onChange={setLocations}
              />
              <MultiSelectFilter
                label="Categories"
                options={allCategories}
                selected={categories}
                onChange={setCategories}
              />
            </div>

            {/* Toggles + Reset */}
            <div className="flex flex-wrap justify-between items-center text-sm">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters((f) => ({ ...f, paid: !f.paid }))}
                  className={`px-3 py-1.5 rounded-full border transition-all ${
                    filters.paid
                      ? "bg-[var(--color-candidate)] text-white border-[var(--color-candidate)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-candidate-light)] hover:text-[var(--color-candidate-dark)]"
                  }`}
                >
                  💰 Paid Only
                </button>
                <button
                  onClick={() => setFilters((f) => ({ ...f, short: !f.short }))}
                  className={`px-3 py-1.5 rounded-full border transition-all ${
                    filters.short
                      ? "bg-[var(--color-candidate)] text-white border-[var(--color-candidate)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-candidate-light)] hover:text-[var(--color-candidate-dark)]"
                  }`}
                >
                  ⏱ Under 30 min
                </button>
                <button
                  onClick={() =>
                    setFilters((f) => ({ ...f, aiAllowed: !f.aiAllowed }))
                  }
                  className={`px-3 py-1.5 rounded-full border transition-all ${
                    filters.aiAllowed
                      ? "bg-[var(--color-candidate)] text-white border-[var(--color-candidate)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-candidate-light)] hover:text-[var(--color-candidate-dark)]"
                  }`}
                >
                  🤖 AI Allowed
                </button>
              </div>

              {(!!query ||
                Object.values(filters).some(Boolean) ||
                companies.length > 0 ||
                locations.length > 0 ||
                categories.length > 0) && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition"
                >
                  <XCircle size={14} /> Clear All
                  {companies.length + locations.length + categories.length >
                    0 && (
                    <span className="ml-1 text-xs opacity-70">
                      ({companies.length + locations.length + categories.length}
                      )
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Filter Chips */}
          <FilterChips
            query={query || undefined}
            paidOnly={filters.paid}
            remoteOnly={false}
            companies={companies}
            locations={locations}
            categories={categories}
            onRemove={handleRemoveChip}
            onClearAll={handleClearAll}
          />
        </>
      )}

      {/* Job Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
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
                <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] mb-2">
                  <Clock size={13} className="opacity-80" /> Expected:{" "}
                  {proof.expected_time}
                </div>
              )}

              {/* 💰 Salary Range */}
              {job.show_salary_range && job.salary_min && job.salary_max && (
                <p className="text-sm text-[var(--color-text)] font-medium mb-3">
                  💰 {job.salary_min.toLocaleString()} –{" "}
                  {job.salary_max.toLocaleString()}{" "}
                  {job.payment_currency ?? "EUR"} /{job.pay_period ?? "month"}
                </p>
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
