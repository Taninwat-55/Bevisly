import { useEffect, useState, useMemo } from "react";
import { getAllJobs, toggleFeaturedJob } from "@/lib/api/admin";
import type { AdminJob } from "@/types/admin";
import toast from "react-hot-toast";
import { ArrowDownUp, Search, Star } from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import { motion } from "framer-motion";

export default function AdminJobs() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">(
    "all"
  );
  const [employerFilter, setEmployerFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

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

    result.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });

    return result;
  }, [jobs, searchTerm, statusFilter, employerFilter, sortOrder]);

  const uniqueEmployers = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.employer_email))).sort(),
    [jobs]
  );

  const totalPages = Math.ceil(filteredJobs.length / perPage);
  const paginated = filteredJobs.slice((page - 1) * perPage, page * perPage);

  const stats = useMemo(
    () => ({
      open: jobs.filter((j) => j.status === "open").length,
      closed: jobs.filter((j) => j.status === "closed").length,
      total: jobs.length,
    }),
    [jobs]
  );

  useEffect(
    () => setPage(1),
    [searchTerm, statusFilter, employerFilter, perPage]
  );

  /* ─────────────────────── Render ─────────────────────── */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--color-text-muted)]">
        Loading jobs…
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] px-6 md:px-10 py-12 transition-colors">
      {/* 🧭 Header */}
      <header className="mb-8 flex flex-col gap-2">
        <BackButton to="/admin" label="Back to Dashboard" className="w-fit" />
        <h1 className="heading-lg flex items-center gap-2">💼 Job Overview</h1>
        <p className="body-base text-[var(--color-text-muted)]">
          Browse and manage all job postings across the platform.
        </p>
      </header>

      {/* 🧮 Job Counters */}
      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
      >
        <div className="p-4 text-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[color-mix(in srgb,var(--color-success)10%,var(--color-surface))]">
          <p className="text-sm text-[var(--color-text-muted)]">Open Jobs</p>
          <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">
            {stats.open}
          </h3>
        </div>
        <div className="p-4 text-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[color-mix(in srgb,var(--color-text-muted)10%,var(--color-surface))]">
          <p className="text-sm text-[var(--color-text-muted)]">Closed Jobs</p>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">
            {stats.closed}
          </h3>
        </div>
        <div className="p-4 text-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[color-mix(in srgb,var(--color-employer)10%,var(--color-surface))]">
          <p className="text-sm text-[var(--color-text-muted)]">Total Jobs</p>
          <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
            {stats.total}
          </h3>
        </div>
      </motion.section>

      {/* 🔍 Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          />
          <input
            type="text"
            placeholder="Search title, company, or employer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-[var(--color-border)] rounded-[var(--radius-button)] pl-8 pr-3 py-2 text-sm bg-[var(--color-surface)] focus:ring-1 focus:ring-[var(--color-candidate)]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | "open" | "closed")
          }
          className="border border-[var(--color-border)] rounded-[var(--radius-button)] px-3 py-2 text-sm bg-[var(--color-surface)]"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={employerFilter}
          onChange={(e) => setEmployerFilter(e.target.value)}
          className="border border-[var(--color-border)] rounded-[var(--radius-button)] px-3 py-2 text-sm bg-[var(--color-surface)]"
        >
          <option value="all">All Employers</option>
          {uniqueEmployers.map((email) => (
            <option key={email} value={email}>
              {email}
            </option>
          ))}
        </select>

        <button
          onClick={() =>
            setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))
          }
          className="flex items-center gap-1.5 border border-[var(--color-border)] rounded-[var(--radius-button)] px-3 py-2 text-sm bg-[var(--color-surface)] hover:bg-[var(--color-bg-hover)] transition"
        >
          <ArrowDownUp size={14} />
          {sortOrder === "newest" ? "Newest First" : "Oldest First"}
        </button>
      </div>

      {/* 📋 Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] overflow-auto"
      >
        <table className="w-full text-sm text-left">
          <thead className="bg-[color-mix(in srgb,var(--color-candidate)10%,var(--color-surface))] border-b border-[var(--color-border)] sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4 font-medium">Title</th>
              <th className="py-3 px-4 font-medium">Company</th>
              <th className="py-3 px-4 font-medium">Employer</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium text-center">⭐ Featured</th>
              <th className="py-3 px-4 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length ? (
              paginated.map((j, i) => (
                <tr
                  key={j.id}
                  className={`border-b border-[var(--color-border)] ${
                    i % 2 === 0
                      ? "bg-[color-mix(in srgb,var(--color-bg)96%,transparent)]"
                      : ""
                  } hover:bg-[var(--color-bg-hover)] transition`}
                >
                  <td className="py-3 px-4 font-medium">{j.title}</td>
                  <td className="py-3 px-4">{j.company ?? "—"}</td>
                  <td className="py-3 px-4 text-[var(--color-text-muted)]">
                    {j.employer_email}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        j.status === "open"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                      }`}
                    >
                      {j.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={async () => {
                        try {
                          await toggleFeaturedJob(j.id, !j.featured);
                          toast.success(
                            j.featured
                              ? "Job unfeatured successfully"
                              : "Job featured successfully ⭐"
                          );
                          setJobs((prev) =>
                            prev.map((job) =>
                              job.id === j.id
                                ? { ...job, featured: !j.featured }
                                : job
                            )
                          );
                        } catch (err) {
                          console.error(err);
                          toast.error("Failed to update featured state");
                        }
                      }}
                      className={`flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium transition ${
                        j.featured
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 hover:brightness-110"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:brightness-125"
                      }`}
                    >
                      <Star
                        size={14}
                        fill={j.featured ? "currentColor" : "none"}
                      />
                      {j.featured ? "Featured" : "Mark"}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-muted)]">
                    {new Date(j.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-6 text-[var(--color-text-muted)]"
                >
                  No jobs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* 📄 Pagination */}
      {filteredJobs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 text-sm">
          <div className="text-[var(--color-text-muted)]">
            Showing {(page - 1) * perPage + 1}–
            {Math.min(page * perPage, filteredJobs.length)} of{" "}
            {filteredJobs.length} jobs
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
