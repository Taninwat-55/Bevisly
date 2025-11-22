import { useEffect, useState, useMemo } from "react";
import { getAllUsers, updateUserRole } from "@/lib/api/admin";
import toast from "react-hot-toast";
import type { BevisUser } from "@/types/admin";
import { ArrowDownUp, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminUsers() {
  const [users, setUsers] = useState<BevisUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | BevisUser["role"]>(
    "all"
  );
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to load users: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (id: string, newRole: BevisUser["role"]) => {
    setUpdating(id);
    try {
      await updateUserRole(id, newRole);
      toast.success(`✅ Role updated to ${newRole}`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, role: newRole as BevisUser["role"] } : u
        )
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      toast.error(`Error updating role: ${message}`);
    } finally {
      setUpdating(null);
    }
  };

  /* ─────────────── Filter + Sort ─────────────── */
  const filteredUsers = useMemo(() => {
    let res = users;
    if (roleFilter !== "all") res = res.filter((u) => u.role === roleFilter);
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      res = res.filter((u) => u.email.toLowerCase().includes(term));
    }
    return [...res].sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });
  }, [users, searchTerm, roleFilter, sortOrder]);

  const roleCounts = useMemo(
    () => ({
      admin: users.filter((u) => u.role === "admin").length,
      employer: users.filter((u) => u.role === "employer").length,
      candidate: users.filter((u) => u.role === "candidate").length,
      total: users.length,
    }),
    [users]
  );

  const totalPages = Math.ceil(filteredUsers.length / perPage);
  const paginated = filteredUsers.slice((page - 1) * perPage, page * perPage);

  useEffect(() => setPage(1), [searchTerm, roleFilter, perPage]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--color-text-muted)]">
        Loading users…
      </div>
    );

  /* ─────────────── Render ─────────────── */
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] px-6 md:px-10 py-12 transition-colors">
      {/* 🧭 Header */}
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="heading-lg flex items-center gap-2">
          👥 User Management
        </h1>
        <p className="body-base text-[var(--color-text-muted)]">
          View all users and manage their roles or privileges.
        </p>
      </header>

      {/* 🧮 Role Summary */}
      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6"
      >
        <div className="p-4 text-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[color-mix(in srgb,var(--color-candidate)10%,var(--color-surface))]">
          <p className="text-sm text-[var(--color-text-muted)]">Candidates</p>
          <h3 className="text-xl font-semibold text-[var(--color-candidate-dark)]">
            {roleCounts.candidate}
          </h3>
        </div>
        <div className="p-4 text-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[color-mix(in srgb,var(--color-employer)10%,var(--color-surface))]">
          <p className="text-sm text-[var(--color-text-muted)]">Employers</p>
          <h3 className="text-xl font-semibold text-[var(--color-employer-dark)]">
            {roleCounts.employer}
          </h3>
        </div>
        <div className="p-4 text-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[color-mix(in srgb,var(--color-text-muted)10%,var(--color-surface))]">
          <p className="text-sm text-[var(--color-text-muted)]">Admins</p>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            {roleCounts.admin}
          </h3>
        </div>
        <div className="p-4 text-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[color-mix(in srgb,var(--color-success)10%,var(--color-surface))]">
          <p className="text-sm text-[var(--color-text-muted)]">Total Users</p>
          <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">
            {roleCounts.total}
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
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-[var(--color-border)] rounded-[var(--radius-button)] pl-8 pr-3 py-2 text-sm bg-[var(--color-surface)] focus:ring-1 focus:ring-[var(--color-candidate)]"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value as "all" | BevisUser["role"])
          }
          className="border border-[var(--color-border)] rounded-[var(--radius-button)] px-3 py-2 text-sm bg-[var(--color-surface)]"
        >
          <option value="all">All Roles</option>
          <option value="candidate">Candidate</option>
          <option value="employer">Employer</option>
          <option value="admin">Admin</option>
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
              <th className="py-3 px-4 font-medium">Email</th>
              <th className="py-3 px-4 font-medium">Role</th>
              <th className="py-3 px-4 font-medium">Created</th>
              <th className="py-3 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((u, i) => (
                <tr
                  key={u.id}
                  className={`border-b border-[var(--color-border)] ${
                    i % 2 === 0
                      ? "bg-[color-mix(in srgb,var(--color-bg)96%,transparent)]"
                      : ""
                  } hover:bg-[var(--color-bg-hover)] transition`}
                >
                  <td className="py-3 px-4 font-medium">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        u.role === "admin"
                          ? "bg-gray-200 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                          : u.role === "employer"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-muted)]">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={u.role}
                      disabled={updating === u.id}
                      onChange={(e) =>
                        handleChangeRole(
                          u.id,
                          e.target.value as BevisUser["role"]
                        )
                      }
                      className={`border border-[var(--color-border)] rounded px-2 py-1 text-sm transition ${
                        updating === u.id ? "opacity-60 cursor-wait" : ""
                      }`}
                    >
                      <option value="candidate">Candidate</option>
                      <option value="employer">Employer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-6 text-[var(--color-text-muted)]"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* 📄 Pagination */}
      {filteredUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 text-sm">
          <div className="text-[var(--color-text-muted)]">
            Showing {(page - 1) * perPage + 1}–
            {Math.min(page * perPage, filteredUsers.length)} of{" "}
            {filteredUsers.length} users
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
