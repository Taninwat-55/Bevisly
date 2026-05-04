import { useEffect, useState, useMemo } from "react";
import { getAllJobs, toggleFeaturedJob } from "@/lib/api/admin";
import type { AdminJob } from "@/types/admin";
import toast from "react-hot-toast";
import { ArrowDownUp, Search, Star, Building, MapPin, Clock, FlaskConical, Briefcase } from "lucide-react";
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
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors pb-20">

      {/* ── Fancy Banner / Header ── */}
      <div className="relative pt-12 pb-24 px-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white shadow-2xl overflow-hidden rounded-b-[3rem] md:rounded-b-[4rem]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-6"
              >
                <Briefcase size={12} />
                Job Oversight
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4">
                Listings Portal
              </h1>
              <p className="text-slate-300 max-w-2xl text-lg leading-relaxed">
                Monitor active opportunities, feature high-impact roles, and maintain the quality 
                of the Bevisly marketplace.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center gap-4 shadow-2xl">
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Open</p>
                  <p className="text-lg font-bold text-white">{jobs.filter(j => j.status === 'open').length}</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Featured</p>
                  <p className="text-lg font-bold text-yellow-400">{jobs.filter(j => j.featured).length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-20 space-y-8">
        
        {/* Controls Bar */}
        <div className="glass-panel p-4 rounded-[1.5rem] border border-[var(--color-border)] bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xl flex flex-col xl:flex-row gap-4 items-center justify-between">
          
          {/* Search */}
          <div className="relative w-full xl:w-96">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search jobs, companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-4 focus:ring-[var(--color-brand-primary)]/10 focus:border-[var(--color-brand-primary)] outline-none transition-all font-medium"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 p-1 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-xl">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "open" | "closed")}
                className="bg-transparent border-0 rounded-lg px-4 py-2 text-sm font-bold outline-none focus:ring-0 cursor-pointer text-[var(--color-text)]"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex items-center gap-2 p-1 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-xl">
              <select
                value={employerFilter}
                onChange={(e) => setEmployerFilter(e.target.value)}
                className="bg-transparent border-0 rounded-lg px-4 py-2 text-sm font-bold outline-none focus:ring-0 cursor-pointer text-[var(--color-text)] max-w-[160px]"
              >
                <option value="all">All Employers</option>
                {uniqueEmployers.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <button
              onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
              className="flex items-center gap-2 px-5 py-3 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-xl text-sm font-bold hover:bg-[var(--color-surface-hover)] transition-all shadow-sm group"
            >
              <ArrowDownUp size={16} className="text-[var(--color-brand-primary)] group-hover:rotate-180 transition-transform" />
              {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
            </button>

            <button
              onClick={() => setDemoFilter(prev => !prev)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all border ${
                demoFilter
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-inner'
                  : 'bg-[var(--color-bg)]/50 border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              <FlaskConical size={16} className={demoFilter ? "animate-bounce" : ""} />
              Demo Data
            </button>
          </div>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel border border-[var(--color-border)] rounded-[2rem] overflow-hidden shadow-2xl bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-[var(--color-bg)]/50 border-b border-[var(--color-border)]">
                  <th className="py-5 px-8 font-bold text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest">Opportunity</th>
                  <th className="py-5 px-6 font-bold text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest">Status</th>
                  <th className="py-5 px-6 font-bold text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest text-center">Featured</th>
                  <th className="py-5 px-8 font-bold text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest text-right">Published</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]/30">
                {paginated.length ? (
                  paginated.map((j) => (
                    <tr key={j.id} className="group hover:bg-[var(--color-brand-primary)]/5 transition-all">
                      <td className="py-6 px-8">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--color-text)] text-lg group-hover:text-[var(--color-brand-primary)] transition-colors">{j.title}</span>
                            {j.employer_email === 'demo@bevisly.com' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black border border-amber-500/20 uppercase tracking-widest">
                                <FlaskConical size={10} /> Demo
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs font-bold text-[var(--color-text-muted)]">
                            <span className="flex items-center gap-1.5"><Building size={14} className="text-blue-500/60" /> {j.company || 'Private Employer'}</span>
                            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-red-500/60" /> {j.location || 'Remote'}</span>
                          </div>
                          <div className="text-[10px] font-mono text-[var(--color-brand-primary)]/70 uppercase tracking-tighter mt-1">{j.employer_email}</div>
                        </div>
                      </td>

                      <td className="py-6 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm ${j.status === "open"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                            }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${j.status === 'open' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-400'}`} />
                          {j.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-6 px-6 text-center">
                        {isDemoAdmin ? (
                          <div
                            className={`
                                w-10 h-10 rounded-xl inline-flex items-center justify-center border shadow-inner transition-all
                                ${j.featured 
                                  ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-yellow-500/10' 
                                  : 'bg-[var(--color-bg)]/50 text-[var(--color-text-muted)] border-transparent'}
                             `}
                          >
                            <Star size={18} fill={j.featured ? "currentColor" : "none"} />
                          </div>
                        ) : (
                          <button
                            onClick={async () => {
                              try {
                                await toggleFeaturedJob(j.id, !j.featured);
                                toast.success(j.featured ? "Removed from featured" : "Added to featured");
                                setJobs((prev) => prev.map((job) => job.id === j.id ? { ...job, featured: !j.featured } : job));
                              } catch (err) {
                                console.error(err);
                                toast.error("Failed to update status");
                              }
                            }}
                            className={`
                                w-10 h-10 rounded-xl inline-flex items-center justify-center transition-all border
                                ${j.featured 
                                  ? 'bg-yellow-400 text-white border-yellow-400 shadow-glow-orange scale-110' 
                                  : 'bg-[var(--color-bg)]/50 text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-yellow-400 hover:text-yellow-500'}
                             `}
                          >
                            <Star size={18} fill={j.featured ? "currentColor" : "none"} />
                          </button>
                        )}
                      </td>

                      <td className="py-6 px-8 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text)]">
                            <Clock size={14} className="text-[var(--color-text-muted)]" />
                            {new Date(j.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-tighter">System Verified</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center opacity-20">
                          <Briefcase size={32} />
                        </div>
                        <p className="font-bold text-[var(--color-text-muted)]">No jobs found in the database.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredJobs.length > 0 && (
            <div className="border-t border-[var(--color-border)] p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-[var(--color-bg)]/30 backdrop-blur-md">
              <div className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                Displaying <span className="text-[var(--color-text)]">{(page - 1) * perPage + 1}</span> - <span className="text-[var(--color-text)]">{Math.min(page * perPage, filteredJobs.length)}</span> of {filteredJobs.length} Positions
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-bold hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Previous
                </button>
                <div className="text-xs font-bold text-[var(--color-text)] bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                  {page} / {totalPages || 1}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-bold hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
