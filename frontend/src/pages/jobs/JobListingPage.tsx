/**
 * Unified job listing for candidates & employers.
 * Combines modern filtering + search + back navigation.
 */

import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useJobs } from "@/hooks/useJobs";
import { getEmployerJobs, getSavedJobIds, toggleSavedJob } from "@/lib/api/jobs";
import { supabase } from "@/lib/supabaseClient";
import {
  Loader2,
  Search,
  Plus,
  XCircle,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Heart,
  DollarSign,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

import type { SessionUser } from "@/context/AuthContext";
import type { Job } from "@/types/job";
import type { ProofTask } from "@/types";

// UI Components
import MultiSelectFilter from "@/components/common/MultiSelectFilter";
import FilterChips from "@/components/common/FilterChips";
import JobCard from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/Button";

/* ─── Helpers ─────────────────────────────── */
type JobListItem = Job & { proof_tasks?: ProofTask[] };

function hasProofTasks(
  job: JobListItem
): job is JobListItem & { proof_tasks: ProofTask[] } {
  return Array.isArray((job as { proof_tasks?: unknown }).proof_tasks);
}

/* ─── Constants ─────────────────────────────── */
const DEPARTMENTS = [
  "Frontend", "Backend", "Full-Stack", "Mobile",
  "Data & ML", "DevOps", "Design", "Product",
  "Sales", "Marketing", "Operations", "Other",
];

const WORK_MODES = ["Remote", "Hybrid", "On-site"];
const WORK_MODE_MAP: Record<string, string> = { "Remote": "remote", "Hybrid": "hybrid", "On-site": "onsite" };

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];
const JOB_TYPE_MAP: Record<string, string> = {
  "Full-time": "fulltime", "Part-time": "parttime",
  "Contract": "contract", "Internship": "internship", "Freelance": "freelance",
};

/* ─── Component ─────────────────────────────── */
export default function JobListingPage() {
  const { user } = useAuth();
  const role: SessionUser["role"] = user?.role ?? null;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
    short: false,
    savedOnly: false,
  });

  const [companies, setCompanies] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [workModes, setWorkModes] = useState<string[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);

  /* ─── Pagination State ─────────────────────────────── */
  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, filters, companies, locations, categories, workModes, jobTypes, role]);

  // Pre-apply saved filter when arriving via ?saved=true
  useEffect(() => {
    if (searchParams.get("saved") === "true") {
      setFilters(f => ({ ...f, savedOnly: true }));
    }
  }, [searchParams]);

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


  /* ─── Filtering Logic ─────────────────────────────── */
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const proof = hasProofTasks(job) ? job.proof_tasks[0] : undefined;

      const textMatch =
        job.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        job.company?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        proof?.title?.toLowerCase().includes(debouncedQuery.toLowerCase());

      const paidMatch = filters.paid ? job.paid === true : true;
      const shortMatch = filters.short
        ? proof?.expected_time?.toLowerCase().includes("30")
        : true;

      const locationMatch =
        locations.length > 0 ? locations.includes(job.location || "") : true;
      const companyMatch =
        companies.length > 0 ? companies.includes(job.company || "") : true;
      const categoryMatch =
        categories.length > 0
          ? categories.some(c => job.department?.toLowerCase().includes(c.toLowerCase()))
          : true;

      const workModeMatch =
        workModes.length > 0
          ? workModes.some(m => WORK_MODE_MAP[m] === job.work_mode)
          : true;

      const jobTypeMatch =
        jobTypes.length > 0
          ? jobTypes.some(t => JOB_TYPE_MAP[t] === job.job_type)
          : true;

      const savedMatch = filters.savedOnly
        ? savedJobIds.includes(job.id)
        : true;

      return (
        textMatch &&
        paidMatch &&
        shortMatch &&
        savedMatch &&
        locationMatch &&
        companyMatch &&
        categoryMatch &&
        workModeMatch &&
        jobTypeMatch
      );
    });
  }, [jobs, debouncedQuery, filters, locations, companies, categories, workModes, jobTypes, savedJobIds]);

  /* ─── Pagination Logic (Computed) ─────────────────────────────── */
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredJobs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    setFilters({ paid: false, short: false, savedOnly: false });
    setQuery("");
    setCompanies([]);
    setLocations([]);
    setCategories([]);
    setWorkModes([]);
    setJobTypes([]);
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


  /* ─── Main Layout ─────────────────────────────── */
  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors">

      {/* ── Fancy Banner / Header ── */}
      <div className="relative py-12 px-8 bg-[var(--color-brand-primary)] text-white shadow-xl overflow-hidden mt-2 rounded-b-[3rem] mx-4">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold font-display leading-tight mb-2">
              {role === "employer" ? "Manage Your Listings" : "Find Junior Roles with Proof Tasks"}
            </h1>
            <p className="text-white/70 max-w-xl text-lg">
              {role === "employer"
                ? "Track performance and manage proof-based roles."
                : "Every role includes a practical proof task. Submit real work. Skip the CV black hole."}
            </p>
          </div>

          {role === "employer" && (
            <button
              onClick={() => navigate("/employer/jobs/new")}
              className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg bg-white text-[var(--color-brand-primary)] hover:bg-blue-50 font-bold shadow-lg transition-all active:scale-[0.98]"
            >
              <Plus size={16} />
              Post New Job
            </button>
          )}
        </div>
      </div>

      <div className="px-8 py-10 max-w-[1400px] mx-auto">

        {/* ── Filters ── */}
        {role !== "employer" && (
          <>
            <div className="glass-panel border border-[var(--color-border)] rounded-2xl shadow-sm p-5 mb-8 space-y-5 -mt-20 relative z-20">
              <div className="relative">
                <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${query ? "text-[var(--color-candidate)]" : "text-[var(--color-text-muted)]"}`} />
                <input
                  type="text"
                  placeholder="Search roles, companies, or specific technologies..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 text-base rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-candidate)]/20 transition-all font-medium placeholder:text-[var(--color-text-muted)] placeholder:opacity-70"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <MultiSelectFilter label="Companies" options={allCompanies} selected={companies} onChange={setCompanies} />
                <MultiSelectFilter label="Locations" options={allLocations} selected={locations} onChange={setLocations} />
                <MultiSelectFilter label="Role Type" options={DEPARTMENTS} selected={categories} onChange={setCategories} />
                <MultiSelectFilter label="Work Mode" options={WORK_MODES} selected={workModes} onChange={setWorkModes} />
                <MultiSelectFilter label="Job Type" options={JOB_TYPES} selected={jobTypes} onChange={setJobTypes} />
              </div>

              <div className="flex flex-wrap justify-between items-center text-sm pt-2 border-t border-[var(--color-border)]/50">
                <div className="flex flex-wrap gap-2 mt-2">
                  <button onClick={() => setFilters((f) => ({ ...f, paid: !f.paid }))} className={`px-4 py-2 rounded-full border transition-all font-medium flex items-center gap-2 ${filters.paid ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200" : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"}`}><DollarSign size={14} /> Paid Opportunities</button>
                  <button onClick={() => setFilters((f) => ({ ...f, short: !f.short }))} className={`px-4 py-2 rounded-full border transition-all font-medium flex items-center gap-2 ${filters.short ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200" : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"}`}><Clock size={14} /> Under 30 mins</button>
                  {user && (
                    <button onClick={() => setFilters((f) => ({ ...f, savedOnly: !f.savedOnly }))} className={`px-4 py-2 rounded-full border transition-all font-medium flex items-center gap-2 ${filters.savedOnly ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200" : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"}`}>
                      <Heart size={14} className={filters.savedOnly ? "fill-current" : ""} /> Saved Jobs{savedJobIds.length > 0 ? ` (${savedJobIds.length})` : ""}
                    </button>
                  )}
                </div>
                {(!!query || Object.values(filters).some(Boolean) || companies.length > 0 || locations.length > 0 || categories.length > 0 || workModes.length > 0 || jobTypes.length > 0) && (
                  <button onClick={handleClearAll} className="flex items-center gap-1 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition mt-2 font-medium px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg"><XCircle size={16} /> Clear Filters</button>
                )}
              </div>
            </div>
            <FilterChips query={query || undefined} paidOnly={filters.paid} remoteOnly={false} companies={companies} locations={locations} categories={categories} onRemove={handleRemoveChip} onClearAll={handleClearAll} />
          </>
        )}

        {/* ── Empty State Candidate ── */}
        {role !== "employer" && !filteredJobs.length && (
          <div className="py-20 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className="w-24 h-24 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Briefcase size={40} className="text-[var(--color-text-muted)] opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
              {publicJobs.length === 0 ? "No roles available yet" : "No roles found"}
            </h3>
            <p className="text-[var(--color-text-muted)] mb-6">
              {publicJobs.length > 0 && jobs.length === 0
                ? "You've caught up! Check your dashboard for updates on your applications."
                : publicJobs.length === 0
                  ? "Companies haven't posted any proof-based roles yet. Please check back soon!"
                  : "Try adjusting your filters or search query to see more results."}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleClearAll} variant="outline">Clear Filters</Button>
              {publicJobs.length > 0 && jobs.length === 0 && (
                <Button onClick={() => navigate('/candidate')} variant="primary">Go to Dashboard</Button>
              )}
            </div>
          </div>
        )}

        {/* ── Job Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6 pb-20">
          {paginatedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={savedJobIds.includes(job.id)}
              onToggleSave={(e) => handleToggleSave(e, job.id)}
            />
          ))}
        </div>

        {/* ── Pagination Controls ── */}
        {filteredJobs.length > ITEMS_PER_PAGE && (
          <div className="flex justify-center items-center gap-4 mt-8 pb-12">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              leftIcon={<ChevronLeft size={16} />}
            >
              Previous
            </Button>
            
            <span className="text-[var(--color-text-muted)] font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              rightIcon={<ChevronRight size={16} />}
            >
              Next
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}