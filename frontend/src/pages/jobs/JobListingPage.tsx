/**
 * Unified job listing for candidates & employers.
 * Combines modern filtering + search + back navigation.
 */

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useJobs } from "@/hooks/useJobs";
import { getEmployerJobs, deleteJob, getSavedJobIds, toggleSavedJob } from "@/lib/api/jobs";
import { supabase } from "@/lib/supabaseClient";
import {
  Loader2,
  Briefcase,
  Search,
  Edit3,
  FolderOpen,
  Plus,
  XCircle,
  Trash2,
  Clock,
  Heart
} from "lucide-react";
import toast from "react-hot-toast";

import type { SessionUser } from "@/context/AuthContext";
import type { Job } from "@/types/job";
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
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  // Candidate/public jobs
  const { jobs: publicJobs, loading, error } = useJobs();

  // Employer jobs
  const [employerJobs, setEmployerJobs] = useState<JobListItem[]>([]);
  const [employerLoading, setEmployerLoading] = useState(false);

  // Track which jobs the candidate has already applied to
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

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

  /* Fetch Applied Jobs (Candidate Only) */
  useEffect(() => {
    if (role === "employer" || !user?.id) return;

    const fetchApplied = async () => {
      const { data } = await supabase
        .from("submissions")
        .select("job_id")
        .eq("user_id", user.id);

      if (data) {
        const ids = data.map((s) => s.job_id).filter((id): id is string => !!id);
        setAppliedJobIds(new Set(ids));
      }
    };
    fetchApplied();
  }, [role, user?.id]);

  // Load saved jobs when user logs in
  useEffect(() => {
    if (user) {
      getSavedJobIds(user.id).then(setSavedJobIds);
    }
  }, [user]);

  // Handle the click
  const handleToggleSave = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault(); // Stop clicking the whole card
    e.stopPropagation();

    if (!user) {
      toast.error("Sign in to save jobs");
      return;
    }

    // Optimistic Update (Immediate UI change)
    const isSaved = savedJobIds.includes(jobId);
    setSavedJobIds(prev => isSaved ? prev.filter(id => id !== jobId) : [...prev, jobId]);

    if (isSaved) toast.success("Removed from wishlist");
    else toast.success("Saved to wishlist");

    // Database Update
    await toggleSavedJob(user.id, jobId);
  };

  /* ─── Handle Delete ─────────────────────────────── */
  const handleDelete = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      await deleteJob(jobId);
      setEmployerJobs((prev) => prev.filter((job) => job.id !== jobId));
      toast.success("Job removed successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove job");
    }
  };

  /* ─── Debounced Search ─────────────────────────────── */
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handler);
  }, [query]);

  /* ─── Data source ─────────────────────────────── */
  const jobs: JobListItem[] = useMemo(() => {
    if (role === "employer") return employerJobs;

    // Filter out applied jobs for candidates
    return (publicJobs as JobListItem[]).filter(
      (job) => !appliedJobIds.has(job.id)
    );
  }, [role, employerJobs, publicJobs, appliedJobIds]);

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

  /* ─── Candidate empty state (After filtering applied jobs) ─── */
  if (role !== "employer" && !filteredJobs.length) {
    // Check if publicJobs has items but they were all filtered out by "applied" logic
    if (publicJobs.length > 0 && appliedJobIds.size > 0 && jobs.length === 0) {
      return (
        <div className="min-h-screen bg-[var(--color-bg)] px-8 py-10 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-[var(--color-success)]/10 rounded-full mb-4 text-[var(--color-success)]">
            <Clock size={32} />
          </div>
          <h2 className="heading-md mb-2">All caught up!</h2>
          <p className="text-[var(--color-text-muted)] max-w-md">
            You've applied to all currently available jobs. Check your dashboard for updates on your submissions.
          </p>
          <button
            onClick={() => navigate("/candidate/dashboard")}
            className="mt-6 px-5 py-2 bg-[var(--color-candidate)] text-white rounded-[var(--radius-button)] hover:brightness-110 transition"
          >
            Go to Dashboard
          </button>
        </div>
      );
    }

    return (
      <div className="p-10 text-center text-[var(--color-text-muted)]">
        No jobs match your search — try adjusting filters!
      </div>
    );
  }

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
            <div className="relative">
              <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${query ? "text-[var(--color-candidate)]" : "text-[var(--color-text-muted)]"}`} />
              <input type="text" placeholder="Search by job, company, or proof task…" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:ring-1 focus:ring-[var(--color-candidate)]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <MultiSelectFilter label="Companies" options={allCompanies} selected={companies} onChange={setCompanies} />
              <MultiSelectFilter label="Locations" options={allLocations} selected={locations} onChange={setLocations} />
              <MultiSelectFilter label="Categories" options={allCategories} selected={categories} onChange={setCategories} />
            </div>
            <div className="flex flex-wrap justify-between items-center text-sm">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilters((f) => ({ ...f, paid: !f.paid }))} className={`px-3 py-1.5 rounded-full border transition-all ${filters.paid ? "bg-[var(--color-candidate)] text-white border-[var(--color-candidate)]" : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-candidate-light)] hover:text-[var(--color-candidate-dark)]"}`}>💰 Paid Only</button>
                <button onClick={() => setFilters((f) => ({ ...f, short: !f.short }))} className={`px-3 py-1.5 rounded-full border transition-all ${filters.short ? "bg-[var(--color-candidate)] text-white border-[var(--color-candidate)]" : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-candidate-light)] hover:text-[var(--color-candidate-dark)]"}`}>⏱ Under 30 min</button>
                <button onClick={() => setFilters((f) => ({ ...f, aiAllowed: !f.aiAllowed }))} className={`px-3 py-1.5 rounded-full border transition-all ${filters.aiAllowed ? "bg-[var(--color-candidate)] text-white border-[var(--color-candidate)]" : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-candidate-light)] hover:text-[var(--color-candidate-dark)]"}`}>🤖 AI Allowed</button>
              </div>
              {(!!query || Object.values(filters).some(Boolean) || companies.length > 0 || locations.length > 0 || categories.length > 0) && (
                <button onClick={handleClearAll} className="flex items-center gap-1 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition"><XCircle size={14} /> Clear All</button>
              )}
            </div>
          </div>
          <FilterChips query={query || undefined} paidOnly={filters.paid} remoteOnly={false} companies={companies} locations={locations} categories={categories} onRemove={handleRemoveChip} onClearAll={handleClearAll} />
        </>
      )}

      {/* Job Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
        {filteredJobs.map((job) => {
          const proof = hasProofTasks(job) ? job.proof_tasks[0] : undefined;
          const handleCTA = () => {
            if (role === "employer") navigate(`/employer/jobs/${job.id}`);
            else navigate(`/jobs/${job.id}`);
          };

          let daysLeft: number | null = null;
          if (job.expires_at) {
            const diff = new Date(job.expires_at).getTime() - new Date().getTime();
            daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
          }

          return (
            <div
              key={job.id}
              className="group bg-[var(--color-surface)] border border-[var(--color-border)]
                         rounded-[var(--radius-card)] shadow-[var(--shadow-soft)]
                         p-6 transition-all hover:shadow-[var(--shadow-hover)] hover:-translate-y-[2px]"
            >
              {/* WISHLIST BUTTON */}
              <button
                onClick={(e) => handleToggleSave(e, job.id)}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white border border-[var(--color-border)] shadow-sm text-[var(--color-text-muted)] hover:text-red-500 hover:border-red-200 transition-all"
                title={savedJobIds.includes(job.id) ? "Unsave" : "Save for later"}
              >
                <Heart
                  size={18}
                  className={
                    savedJobIds.includes(job.id)
                      ? "fill-red-500 text-red-500"
                      : "text-gray-400"
                  }
                />
              </button>

              {/* Header Container - Added padding-right to avoid Heart button */}
              <div className="flex flex-col items-start gap-2 mb-3 pr-12">
                <h3 className="text-lg font-semibold text-[var(--color-text)] leading-tight">
                  {job.title}
                </h3>

                {/* XP Badge - Only Shows if Internal Job (!apply_url) */}
                {!job.apply_url && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${job.paid
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                  >
                    {job.paid ? "💰 Paid" : "⚡ 150 XP"}
                  </span>
                )}
              </div>

              <p className="text-sm text-[var(--color-text-muted)] mb-3">
                <Briefcase size={14} className="inline mr-1 opacity-80" />
                {job.company || "Unknown"} {job.location && `• ${job.location}`}

                {daysLeft !== null && daysLeft > 0 && (
                  <span className={`ml-2 inline-flex items-center gap-1 text-xs font-medium ${daysLeft <= 3 ? "text-[var(--color-error)]" : "text-[var(--color-warning)]"
                    }`}>
                    <Clock size={12} />
                    {daysLeft}d left
                  </span>
                )}
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
                    <FolderOpen size={14} /> Subs
                  </button>

                  <button
                    onClick={(e) => handleDelete(e, job.id)}
                    className="px-3 border border-[var(--color-border)] text-[var(--color-error)] py-2 rounded-[var(--radius-button)] hover:bg-[var(--color-error)] hover:text-white transition flex items-center justify-center"
                    title="Delete Job"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCTA}
                  className={`w-full py-2.5 rounded-[var(--radius-button)] font-medium transition flex items-center justify-center gap-2 ${!user
                    ? "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    : "bg-[var(--color-candidate)] text-white hover:bg-[var(--color-candidate-dark)]"
                    }`}
                >
                  {!user ? "View Details →" : "View Details →"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}