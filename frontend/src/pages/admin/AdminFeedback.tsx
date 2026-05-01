import { useEffect, useState, useMemo } from "react";
import { getAllFeedbackLogs } from "@/lib/api/admin";
import type { AdminFeedback } from "@/types/admin";
import toast from "react-hot-toast";
import { ArrowDownUp, Star, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState<AdminFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await getAllFeedbackLogs();
      setFeedbacks(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      toast.error(`Failed to load feedback logs: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter, search, and sort
  const filteredFeedbacks = useMemo(() => {
    let result = feedbacks;
    const term = searchTerm.toLowerCase();

    if (term.trim()) {
      result = result.filter(
        (f) =>
          f.job_title.toLowerCase().includes(term) ||
          f.candidate_email.toLowerCase().includes(term) ||
          f.employer_email.toLowerCase().includes(term)
      );
    }

    if (ratingFilter !== "all") {
      result = result.filter((f) => Math.round(f.rating ?? 0) === ratingFilter);
    }

    result = [...result].sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });

    return result;
  }, [feedbacks, searchTerm, ratingFilter, sortOrder]);

  const totalPages = Math.ceil(filteredFeedbacks.length / perPage);
  const paginated = filteredFeedbacks.slice(
    (page - 1) * perPage,
    page * perPage
  );

  // Reset to page 1 when filters/search/perPage change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, ratingFilter, perPage]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-text-muted)]">
        Loading feedback logs…
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors pb-20">

      {/* ── Fancy Banner / Header ── */}
      <div className="relative pt-12 pb-24 px-8 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white shadow-2xl overflow-hidden rounded-b-[3rem] md:rounded-b-[4rem]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-purple-300 text-[10px] font-bold uppercase tracking-widest mb-6"
              >
                <Star size={12} />
                Quality Assurance
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4">
                Feedback Logs
              </h1>
              <p className="text-slate-300 max-w-2xl text-lg leading-relaxed">
                Monitor system-wide satisfaction, audit candidate experiences, and ensure the 
                quality of interaction across all active roles.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center gap-4 shadow-2xl">
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Total Logs</p>
                  <p className="text-lg font-bold text-white">{feedbacks.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-20 space-y-8">
        
        {/* Controls Bar */}
        <div className="glass-panel p-4 rounded-[1.5rem] border border-[var(--color-border)] bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search by job or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-4 focus:ring-[var(--color-brand-primary)]/10 focus:border-[var(--color-brand-primary)] outline-none transition-all font-medium"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
            <div className="flex items-center gap-2 p-1 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-xl">
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="bg-transparent border-0 rounded-lg px-4 py-2 text-sm font-bold outline-none focus:ring-0 cursor-pointer text-[var(--color-text)]"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <button
              onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
              className="flex items-center gap-2 px-5 py-3 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-xl text-sm font-bold hover:bg-[var(--color-surface-hover)] transition-all shadow-sm group"
            >
              <ArrowDownUp size={16} className="text-[var(--color-brand-primary)] group-hover:rotate-180 transition-transform" />
              {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
            </button>
          </div>
        </div>

        {/* Data Grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel border border-[var(--color-border)] rounded-[2rem] overflow-hidden shadow-2xl bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-[var(--color-bg)]/50 border-b border-[var(--color-border)]">
                  <th className="py-5 px-8 font-bold text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest">Job Opportunity</th>
                  <th className="py-5 px-6 font-bold text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest">Participants</th>
                  <th className="py-5 px-6 font-bold text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest text-center">Rating</th>
                  <th className="py-5 px-6 font-bold text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest">Comment</th>
                  <th className="py-5 px-8 font-bold text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]/30">
                {paginated.length > 0 ? (
                  paginated.map((f) => (
                    <tr key={f.id} className="group hover:bg-[var(--color-brand-primary)]/5 transition-all">
                      <td className="py-6 px-8">
                        <div className="flex flex-col gap-1">
                          <p className="font-bold text-[var(--color-text)] text-base group-hover:text-[var(--color-brand-primary)] transition-colors">{f.job_title}</p>
                          <div className="flex items-center gap-2">
                             <a 
                              href={`/employer/review/${f.submission_id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-indigo-500 hover:underline uppercase tracking-widest"
                            >
                              View Proof →
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)]">
                            <span className="text-[10px] uppercase text-indigo-500 tracking-widest w-12 shrink-0">Cand</span>
                            <span className="truncate max-w-[180px]">{f.candidate_email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-muted)]">
                            <span className="text-[10px] uppercase text-slate-400 tracking-widest w-12 shrink-0">Empl</span>
                            <span className="truncate max-w-[180px]">{f.employer_email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-6 text-center">
                        <div className="flex items-center justify-center gap-1 bg-[var(--color-surface)]/80 border border-[var(--color-border)] px-3 py-1.5 rounded-xl shadow-inner w-fit mx-auto">
                          <Star size={14} className={f.rating && f.rating >= 1 ? "text-yellow-400" : "text-slate-300"} fill={f.rating && f.rating >= 1 ? "currentColor" : "none"} />
                          <span className="font-bold text-sm ml-1">{f.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 max-w-xs font-medium italic">
                          {f.comment || 'No comment provided'}
                        </p>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <p className="text-xs font-bold text-[var(--color-text)]">
                          {new Date(f.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center opacity-20">
                          <Star size={32} />
                        </div>
                        <p className="font-bold text-[var(--color-text-muted)]">No feedback entries matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredFeedbacks.length > 0 && (
            <div className="border-t border-[var(--color-border)] p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-[var(--color-bg)]/30 backdrop-blur-md">
              <div className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                Showing <span className="text-[var(--color-text)]">{(page - 1) * perPage + 1}</span> - <span className="text-[var(--color-text)]">{Math.min(page * perPage, filteredFeedbacks.length)}</span> of {filteredFeedbacks.length} Entries
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-bold hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Previous
                </button>
                <div className="text-xs font-bold text-[var(--color-text)] bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">
                  {page} / {totalPages || 1}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-bold hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Next
                </button>

                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[var(--color-brand-primary)] cursor-pointer"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}