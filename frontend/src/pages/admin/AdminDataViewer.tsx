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

  // 🔍 Filter and sort
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
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] px-6 md:px-10 py-12 transition-colors">
      {/* 🧭 Header */}
      <header className="mb-8 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="heading-lg flex items-center gap-2">
            <Database size={22} /> Data Viewer
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={table}
              onChange={(e) => setTable(e.target.value)}
              className="border border-[var(--color-border)] rounded-[var(--radius-button)] px-3 py-2 text-sm bg-[var(--color-surface)]"
            >
              <option value="profiles">profiles</option>
              <option value="jobs">jobs</option>
              <option value="submissions">submissions</option>
              <option value="feedback">feedback</option>
            </select>

            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-[var(--color-border)] rounded-[var(--radius-button)] pl-8 pr-3 py-2 text-sm bg-[var(--color-surface)] focus:ring-1 focus:ring-[var(--color-candidate)] focus:outline-none"
              />
            </div>

            <button
              onClick={() =>
                setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
              }
              className="flex items-center gap-1.5 border border-[var(--color-border)] rounded-[var(--radius-button)] px-3 py-2 text-sm bg-[var(--color-surface)] hover:bg-[var(--color-bg-hover)] transition"
            >
              <ArrowDownUp size={14} />
              {sortOrder === "desc" ? "Newest" : "Oldest"}
            </button>

            <button
              onClick={loadData}
              className="flex items-center gap-1.5 border border-[var(--color-border)] rounded-[var(--radius-button)] px-3 py-2 text-sm bg-[var(--color-employer)] text-white hover:brightness-110 transition"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
        <p className="body-base text-[var(--color-text-muted)]">
          Inspect Supabase tables in read-only mode.
        </p>
      </header>

      {/* 📊 Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] overflow-auto"
      >
        {loading ? (
          <p className="p-8 text-[var(--color-text-muted)]">Loading data…</p>
        ) : data.rows.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-[color-mix(in srgb,var(--color-candidate)10%,var(--color-surface))] border-b border-[var(--color-border)] sticky top-0 z-10">
              <tr>
                {data.columns.map((col) => (
                  <th
                    key={col}
                    className="py-2 px-4 font-medium text-left text-[var(--color-text)]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-[var(--color-border)] ${
                    i % 2 === 0
                      ? "bg-[color-mix(in srgb,var(--color-bg)90%,transparent)]"
                      : ""
                  } hover:bg-[var(--color-bg-hover)] transition`}
                >
                  {data.columns.map((col) => (
                    <td
                      key={col}
                      className="py-2 px-4 text-[var(--color-text-muted)] max-w-[280px] truncate"
                      title={String(row[col] ?? "—")}
                    >
                      {String(row[col] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-8 text-[var(--color-text-muted)]">No data found.</p>
        )}
      </motion.div>

      {/* 📄 Pagination */}
      {!loading && data.rows.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 text-sm">
          <span className="text-[var(--color-text-muted)]">
            Showing {(page - 1) * perPage + 1}–
            {Math.min(page * perPage, filteredRows.length)} of{" "}
            {filteredRows.length} rows
          </span>

          <div className="flex items-center gap-3">
            {/* ⬅️ Prev */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-[var(--color-border)] rounded disabled:opacity-40 hover:bg-[var(--color-bg-hover)] transition"
            >
              Prev
            </button>

            <span>Page {page}</span>

            {/* ➡️ Next */}
            <button
              onClick={() => {
                // Only move forward if more results exist
                const totalShown = page * perPage;
                if (totalShown < filteredRows.length) {
                  setPage((p) => p + 1);
                }
              }}
              disabled={page * perPage >= filteredRows.length}
              className="px-3 py-1 border border-[var(--color-border)] rounded disabled:opacity-40 hover:bg-[var(--color-bg-hover)] transition"
            >
              Next
            </button>

            {/* Rows per page */}
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1); // Reset to first page
              }}
              className="border border-[var(--color-border)] rounded px-2 py-1 bg-[var(--color-surface)]"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
      )}

      {/* 🧬 Schema */}
      {schema.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-xs bg-[var(--color-bg-hover)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-4 overflow-x-auto"
        >
          <p className="font-medium text-[var(--color-text)] mb-2">
            Columns &amp; Types
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {schema.map((col) => (
              <span key={col.column_name}>
                <strong className="text-[var(--color-text)]">
                  {col.column_name}
                </strong>
                : <span className="italic">{col.data_type}</span>
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
