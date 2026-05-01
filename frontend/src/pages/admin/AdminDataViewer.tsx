import { useEffect, useState } from "react";
import { getTableData, getTableSchema } from "@/lib/api/admin";
import toast from "react-hot-toast";
import { ArrowDownUp, Database, RefreshCw, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDataViewer() {
  const [table, setTable] = useState("profiles");
  const [data, setData] = useState<{
    columns: string[];
    rows: Record<string, unknown>[];
  }>({
    columns: [],
    rows: [],
  });
  const [schema, setSchema] = useState<
    { column_name: string; data_type: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    loadData();
    loadSchema();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, page, perPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * perPage;
      const result = await getTableData(table, perPage, offset);
      setData(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      toast.error(`Failed to load data: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadSchema = async () => {
    try {
      const cols = await getTableSchema(table);
      setSchema(cols);
    } catch (err) {
      console.error("Schema fetch failed:", err);
    }
  };

  // Filter and sort
  const filteredRows = data.rows.filter((row) =>
    searchTerm
      ? Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      : true
  );
  const sortedRows = [...filteredRows].sort((a, b) => {
    const da = new Date(String(a["created_at"] || 0)).getTime();
    const db = new Date(String(b["created_at"] || 0)).getTime();
    return sortOrder === "desc" ? db - da : da - db;
  });
  const paginatedRows = sortedRows.slice(0, perPage);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors pb-20">

      {/* ── Fancy Banner / Header ── */}
      <div className="relative pt-12 pb-24 px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-2xl overflow-hidden rounded-b-[3rem] md:rounded-b-[4rem]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-slate-300 text-[10px] font-bold uppercase tracking-widest mb-6"
              >
                <Database size={12} />
                Schema Inspector
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4">
                Data Viewer
              </h1>
              <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">
                Direct read-only access to the Supabase core tables. Audit raw records, 
                verify schema integrity, and monitor low-level data structures.
              </p>
            </div>

            <div className="flex items-center gap-3">
               <div className="px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center gap-4 shadow-2xl">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Source</p>
                  <p className="text-lg font-mono font-bold text-emerald-400">Postgres</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-20 space-y-8">
        
        {/* Controls Bar */}
        <div className="glass-panel p-4 rounded-[1.5rem] border border-[var(--color-border)] bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xl flex flex-col xl:flex-row gap-4 items-center justify-between">
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Table Selector */}
            <div className="flex items-center gap-2 p-1 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-xl">
              <select
                value={table}
                onChange={(e) => setTable(e.target.value)}
                className="bg-transparent border-0 rounded-lg px-4 py-2 text-sm font-bold outline-none focus:ring-0 cursor-pointer text-[var(--color-text)]"
              >
                <option value="profiles">profiles</option>
                <option value="jobs">jobs</option>
                <option value="submissions">submissions</option>
                <option value="feedback">feedback</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Global search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-4 focus:ring-[var(--color-brand-primary)]/10 focus:border-[var(--color-brand-primary)] outline-none transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto">
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-2 px-5 py-3 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-xl text-sm font-bold hover:bg-[var(--color-surface-hover)] transition-all shadow-sm group"
            >
              <ArrowDownUp size={16} className="text-[var(--color-brand-primary)] group-hover:rotate-180 transition-transform" />
              {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </button>

            <button
              onClick={loadData}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-glow-green"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Data Grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel border border-[var(--color-border)] rounded-[2.5rem] overflow-hidden shadow-2xl bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-slate-400 border-t-transparent animate-spin" />
              <p className="font-bold text-[var(--color-text-muted)] uppercase tracking-widest text-xs">Querying database...</p>
            </div>
          ) : data.rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] text-left">
                <thead>
                  <tr className="bg-[var(--color-bg)]/50 border-b border-[var(--color-border)]">
                    {data.columns.map((col) => (
                      <th
                        key={col}
                        className="py-5 px-6 font-bold text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]/30">
                  {paginatedRows.map((row, i) => (
                    <tr
                      key={i}
                      className="group hover:bg-[var(--color-brand-primary)]/5 transition-all"
                    >
                      {data.columns.map((col) => (
                        <td
                          key={col}
                          className="py-4 px-6 text-[var(--color-text)] font-mono text-[11px] max-w-[280px] truncate"
                          title={String(row[col] ?? "—")}
                        >
                          {row[col] === null ? (
                            <span className="opacity-30 italic">NULL</span>
                          ) : (
                            String(row[col])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-full bg-[var(--color-surface)] flex items-center justify-center opacity-20 mb-6">
                <Database size={40} />
              </div>
              <p className="font-bold text-[var(--color-text-muted)]">No records found in this table.</p>
            </div>
          )}

          {/* Footer */}
          {!loading && data.rows.length > 0 && (
            <div className="border-t border-[var(--color-border)] p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-[var(--color-bg)]/30 backdrop-blur-md">
              <div className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                Showing <span className="text-[var(--color-text)]">{(page - 1) * perPage + 1}</span> - <span className="text-[var(--color-text)]">{Math.min(page * perPage, filteredRows.length)}</span> of {filteredRows.length} Records
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-bold hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Previous
                </button>
                <div className="text-xs font-bold text-[var(--color-text)] bg-slate-500/10 px-3 py-1.5 rounded-lg border border-slate-500/20">
                  Page {page}
                </div>
                <button
                  onClick={() => {
                    if (page * perPage < filteredRows.length) {
                      setPage((p) => p + 1);
                    }
                  }}
                  disabled={page * perPage >= filteredRows.length}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-bold hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Next
                </button>

                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
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

        {/* Schema Info */}
        {schema.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 rounded-[2.5rem] bg-slate-900/5 dark:bg-white/5 border border-[var(--color-border)] backdrop-blur-sm"
          >
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text)] mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Table Schema Metadata
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {schema.map((col) => (
                <div key={col.column_name} className="p-3 rounded-2xl bg-white/50 dark:bg-black/20 border border-[var(--color-border)] shadow-sm">
                  <p className="text-[10px] font-black text-[var(--color-brand-primary)] uppercase tracking-tighter mb-1 truncate" title={col.column_name}>
                    {col.column_name}
                  </p>
                  <p className="text-[9px] font-mono font-bold text-[var(--color-text-muted)] uppercase opacity-60">
                    {col.data_type}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
