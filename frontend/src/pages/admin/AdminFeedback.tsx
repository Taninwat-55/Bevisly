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

  // 🔍 Filter, search, and sort
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
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] px-6 md:px-10 py-12 transition-colors">
      {/* 🧭 Header */}
      <header className="mb-8 flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="heading-lg flex items-center gap-2">
            🗂️ Feedback Logs
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <input
                type="text"
                placeholder="Search by job or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-[var(--color-border)] rounded-[var(--radius-button)] pl-8 pr-3 py-2 text-sm bg-[var(--color-surface)] focus:ring-1 focus:ring-[var(--color-candidate)] focus:outline-none"
              />
            </div>

            <select
              value={ratingFilter}
              onChange={(e) =>
                setRatingFilter(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
              className="border border-[var(--color-border)] rounded-[var(--radius-button)] px-3 py-2 text-sm bg-[var(--color-surface)]"
            >
              <option value="all">All Ratings</option>
              <option value="5">⭐ 5 Stars</option>
              <option value="4">⭐ 4 Stars</option>
              <option value="3">⭐ 3 Stars</option>
              <option value="2">⭐ 2 Stars</option>
              <option value="1">⭐ 1 Star</option>
              <option value="0">No Rating</option>
            </select>

            <button
              onClick={() =>
                setSortOrder((prev) =>
                  prev === "newest" ? "oldest" : "newest"
                )
              }
              className="flex items-center gap-1.5 border border-[var(--color-border)] rounded-[var(--radius-button)] px-3 py-2 text-sm bg-[var(--color-surface)] hover:bg-[var(--color-bg-hover)] transition"
            >
              <ArrowDownUp size={14} />
              {sortOrder === "newest" ? "Newest First" : "Oldest First"}
            </button>
          </div>
        </div>
        <p className="body-base text-[var(--color-text-muted)]">
          View all employer feedback to evaluate fairness and candidate
          experience.
        </p>
      </header>

      {/* 📋 Table */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-surface)] rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-[var(--shadow-soft)] overflow-auto"
      >
        <table className="w-full text-sm">
          <thead className="bg-[color-mix(in srgb,var(--color-employer)10%,var(--color-surface))] border-b border-[var(--color-border)] sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4 text-left font-medium">Job Title</th>
              <th className="py-3 px-4 text-left font-medium">Candidate</th>
              <th className="py-3 px-4 text-left font-medium">Employer</th>
              <th className="py-3 px-4 text-left font-medium">Rating</th>
              <th className="py-3 px-4 text-left font-medium">Comments</th>
              <th className="py-3 px-4 text-left font-medium">Created</th>
              <th className="py-3 px-4 text-left font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((f, i) => (
                <tr
                  key={f.id}
                  className={`border-b border-[var(--color-border)] ${
                    i % 2 === 0
                      ? "bg-[color-mix(in srgb,var(--color-bg)95%,transparent)]"
                      : ""
                  } hover:bg-[var(--color-bg-hover)] transition`}
                >
                  <td className="py-3 px-4 font-medium">{f.job_title}</td>
                  <td className="py-3 px-4 text-[var(--color-text-muted)]">
                    {f.candidate_email}
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-muted)]">
                    {f.employer_email}
                  </td>
                  <td className="py-3 px-4">
                    {f.rating ? (
                      <div className="flex items-center gap-1 text-yellow-500 font-medium">
                        <Star size={14} fill="currentColor" /> {f.rating}
                      </div>
                    ) : (
                      <span className="text-[var(--color-text-muted)]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-muted)] max-w-xs truncate">
                    {f.comment || "—"}
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-muted)] whitespace-nowrap">
                    {new Date(f.created_at).toLocaleDateString()}
                  </td>      
                  <td className="py-3 px-4">
          <a 
            href={`/employer/review/${f.submission_id}`} 
            target="_blank" 
            rel="noreferrer"
            className="text-[var(--color-employer)] hover:underline font-medium"
          >
            View Proof
          </a>
        </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-6 text-[var(--color-text-muted)]"
                >
                  No feedback found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* 📄 Pagination */}
      {filteredFeedbacks.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 text-sm">
          <div className="text-[var(--color-text-muted)]">
            Showing {(page - 1) * perPage + 1}–
            {Math.min(page * perPage, filteredFeedbacks.length)} of{" "}
            {filteredFeedbacks.length} feedbacks
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-[var(--color-border)] rounded disabled:opacity-40 hover:bg-[var(--color-bg-hover)]"
            >
              Prev
            </button>
            <span>
              Page {page} / {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 border border-[var(--color-border)] rounded disabled:opacity-40 hover:bg-[var(--color-bg-hover)]"
            >
              Next
            </button>

            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="border border-[var(--color-border)] rounded px-2 py-1 bg-[var(--color-surface)]"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}