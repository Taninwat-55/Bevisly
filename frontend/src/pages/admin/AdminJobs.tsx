import { useEffect, useState, useMemo } from "react";
import { getAllJobs, toggleFeaturedJob } from "@/lib/api/admin";
import type { AdminJob } from "@/types/admin";
import toast from "react-hot-toast";
import { ArrowDownUp, Search, Star, Building, MapPin, Clock, FlaskConical } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export default function AdminJobs() {
  const { user } = useAuth();
  const isDemoAdmin = user?.role === "demo_admin";
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");
  const [employerFilter, setEmployerFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [demoFilter, setDemoFilter] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await getAllJobs();
      setJobs(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      toast.error(`Failed to load jobs: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────── Filter + Sort ─────────────────────── */
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    const term = searchTerm.toLowerCase().trim();
    if (term) {
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(term) ||
          j.employer_email.toLowerCase().includes(term) ||
          (j.company ?? "").toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "all")
      result = result.filter((j) => j.status === statusFilter);
    if (employerFilter !== "all")
      result = result.filter((j) => j.employer_email === employerFilter);
    if (demoFilter)
      result = result.filter((j) => j.employer_email === "demo@bevisly.com");

    result.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });

    return result;
  }, [jobs, searchTerm, statusFilter, employerFilter, sortOrder, demoFilter]);

  const uniqueEmployers = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.employer_email))).sort(),
    [jobs]
  );

  const totalPages = Math.ceil(filteredJobs.length / perPage);
  const paginated = filteredJobs.slice((page - 1) * perPage, page * perPage);

  useEffect(
    () => setPage(1),
    [searchTerm, statusFilter, employerFilter, perPage]
  );

  /* ─────────────────────── Render ─────────────────────── */
  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-[var(--color-text-muted)] gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-brand-primary)] border-t-transparent animate-spin" />
        <p>Syncing job database...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] px-6 md:px-10 py-12 transition-colors font-sans">

      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-[var(--color-text)] mb-2">Job Listings</h1>
          <p className="text-[var(--color-text-muted)]">Monitor job posts, feature roles, and status.</p>
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-1 shadow-sm">
          <div className="px-4 py-2 rounded-lg bg-[var(--color-bg)] text-xs font-medium text-[var(--color-text-muted)]">
            Active: <span className="text-[var(--color-text)] font-bold ml-1">{jobs.filter(j => j.status === 'open').length}</span>
          </div>
        </div>
      </header>


      {/* Controls Bar */}
      <div className="glass-panel p-4 rounded-xl border border-[var(--color-border)] mb-6 flex flex-col xl:flex-row gap-4 items-center justify-between">

        {/* Search */}
        <div className="relative w-full xl:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search jobs, companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand-primary)] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={employerFilter}
            onChange={(e) => setEmployerFilter(e.target.value)}
            className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand-primary)] cursor-pointer max-w-[200px]"
          >
            <option value="all">All Employers</option>
            {uniqueEmployers.map(e => <option key={e} value={e}>{e}</option>)}
          </select>

          <button
            onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm hover:bg-[var(--color-surface-hover)] transition"
          >
            <ArrowDownUp size={16} className="text-[var(--color-text-muted)]" />
            {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
          </button>

          <button
            onClick={() => setDemoFilter(prev => !prev)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition border ${
              demoFilter
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            <FlaskConical size={16} />
            Demo Only
          </button>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm"
      >
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
              <th className="py-4 px-6 font-semibold text-[var(--color-text-muted)] uppercase text-xs tracking-wider">Job Details</th>
              <th className="py-4 px-6 font-semibold text-[var(--color-text-muted)] uppercase text-xs tracking-wider">Status</th>
              <th className="py-4 px-6 font-semibold text-[var(--color-text-muted)] uppercase text-xs tracking-wider text-center">Featured</th>
              <th className="py-4 px-6 font-semibold text-[var(--color-text-muted)] uppercase text-xs tracking-wider text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]/50">
            {paginated.length ? (
              paginated.map((j) => (
                <tr key={j.id} className="group hover:bg-[var(--color-bg)]/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--color-text)] text-base">{j.title}</span>
                        {j.employer_email === 'demo@bevisly.com' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20 uppercase tracking-wider">
                            <FlaskConical size={10} /> Demo
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                        <span className="flex items-center gap-1"><Building size={12} /> {j.company || 'Unknown Company'}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} /> {j.location || 'Remote'}</span>
                      </div>
                      <div className="mt-1 text-xs text-[var(--color-brand-primary)] opacity-80">{j.employer_email}</div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${j.status === "open"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-slate-200 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                        }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${j.status === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      {j.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-center">
                    {isDemoAdmin ? (
                      <div
                        className={`
                            w-8 h-8 rounded-lg inline-flex items-center justify-center
                            ${j.featured ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400' : 'bg-[var(--color-bg)]/50 text-[var(--color-text-muted)]'}
                         `}
                        title="Featured toggle disabled in demo mode"
                      >
                        <Star size={16} fill={j.featured ? "currentColor" : "none"} />
                      </div>
                    ) : (
                      <button
                        onClick={async () => {
                          try {
                            await toggleFeaturedJob(j.id, !j.featured);
                            toast.success(j.featured ? "Removed from featured" : "Added to featured ⭐");
                            setJobs((prev) => prev.map((job) => job.id === j.id ? { ...job, featured: !j.featured } : job));
                          } catch (err) {
                            console.error(err);
                            toast.error("Failed to update status");
                          }
                        }}
                        className={`
                            w-8 h-8 rounded-lg inline-flex items-center justify-center transition-all
                            ${j.featured ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400' : 'bg-[var(--color-bg)]/50 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]'}
                         `}
                        title="Toggle Featured"
                      >
                        <Star size={16} fill={j.featured ? "currentColor" : "none"} />
                      </button>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex flex-col items-end gap-1 text-xs text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(j.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-12 text-center text-[var(--color-text-muted)]">
                  No jobs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filteredJobs.length > 0 && (
          <div className="border-t border-[var(--color-border)] p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--color-bg)]/30">
            <div className="text-xs text-[var(--color-text-muted)]">
              Showing <span className="font-medium text-[var(--color-text)]">{(page - 1) * perPage + 1}</span> to <span className="font-medium text-[var(--color-text)]">{Math.min(page * perPage, filteredJobs.length)}</span> of {filteredJobs.length} jobs
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-md border border-[var(--color-border)] text-xs font-medium hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:hover:bg-transparent transition"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-md border border-[var(--color-border)] text-xs font-medium hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:hover:bg-transparent transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
