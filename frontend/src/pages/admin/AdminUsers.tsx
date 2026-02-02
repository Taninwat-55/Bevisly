import { useEffect, useState, useMemo } from "react";
import { getAllUsers, updateUserRole, addCredits } from "@/lib/api/admin";
import toast from "react-hot-toast";
import type { BevislyUser } from "@/types/admin";
import { ArrowDownUp, Search, User, MoreHorizontal, Shield, Briefcase, GraduationCap, PlusCircle, Coins } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminUsers() {
  const [users, setUsers] = useState<BevislyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | BevislyUser["role"]>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

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

  const handleChangeRole = async (id: string, newRole: BevislyUser["role"]) => {
    setUpdating(id);
    try {
      await updateUserRole(id, newRole);
      toast.success(`✅ Role updated to ${newRole}`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, role: newRole as BevislyUser["role"] } : u
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

  const handleAddCredits = async (id: string, amount: number) => {
    if (!confirm(`Add ${amount} credits to this user?`)) return;
    setUpdating(id);
    try {
      const newBal = await addCredits(id, amount);
      toast.success(`✅ Credits updated. New balance: ${newBal}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, credits: newBal } : u))
      );
    } catch {
      toast.error("Failed to add credits");
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

  const totalPages = Math.ceil(filteredUsers.length / perPage);
  const paginated = filteredUsers.slice((page - 1) * perPage, page * perPage);

  useEffect(() => setPage(1), [searchTerm, roleFilter, perPage]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-[var(--color-text-muted)] gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-brand-primary)] border-t-transparent animate-spin" />
        <p>Loading user directory...</p>
      </div>
    );

  /* ─────────────── Helper: Role Badge ─────────────── */
  const RoleBadge = ({ role }: { role: string }) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold border border-purple-500/20">
          <Shield size={12} /> Admin
        </span>
      );
    }
    if (role === 'employer') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-500/20">
          <Briefcase size={12} /> Employer
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
        <GraduationCap size={12} /> Candidate
      </span>
    );
  };

  /* ─────────────── Render ─────────────── */
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] px-6 md:px-10 py-12 transition-colors font-sans">

      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-[var(--color-text)] mb-2">User Directory</h1>
          <p className="text-[var(--color-text-muted)]">Manage platform access and user roles.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-1 shadow-sm">
              <div className="px-4 py-2 rounded-lg bg-[var(--color-bg)] text-xs font-medium text-[var(--color-text-muted)]">
                Total: <span className="text-[var(--color-text)] font-bold ml-1">{users.length}</span>
              </div>
            </div>
            
            <button
                onClick={() => {
                    const email = prompt("Enter email verification to invite:");
                    if (email) {
                         // Simulate invite for now or copying a link
                         // In a real app we'd call an edge function.
                         // For MVP, we'll generate a signup link they can share.
                         const link = `${window.location.origin}/auth?invite=${btoa(email)}`;
                         navigator.clipboard.writeText(link);
                         toast.success(`Invite link for ${email} copied to clipboard!`);
                    }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-primary)] text-white rounded-xl text-sm font-medium hover:brightness-110 transition shadow-glow-primary"
            >
                <PlusCircle size={18} />
                <span>Invite User</span>
            </button>
        </div>
      </header>

      {/* Controls Bar */}
      <div className="glass-panel p-4 rounded-xl border border-[var(--color-border)] mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">

        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search users by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "all" | BevislyUser["role"])}
            className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand-primary)] cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="candidate">Candidates</option>
            <option value="employer">Employers</option>
            <option value="admin">Admins</option>
          </select>

          <button
            onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm hover:bg-[var(--color-surface-hover)] transition"
          >
            <ArrowDownUp size={16} className="text-[var(--color-text-muted)]" />
            {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
          </button>
        </div>
      </div>

      {/* Data Grid */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                <th className="py-4 px-6 font-semibold text-[var(--color-text-muted)] uppercase text-xs tracking-wider">User</th>
                <th className="py-4 px-6 font-semibold text-[var(--color-text-muted)] uppercase text-xs tracking-wider">Current Role</th>
                <th className="py-4 px-6 font-semibold text-[var(--color-text-muted)] uppercase text-xs tracking-wider">Credits</th>
                <th className="py-4 px-6 font-semibold text-[var(--color-text-muted)] uppercase text-xs tracking-wider">Joined Date</th>
                <th className="py-4 px-6 font-semibold text-[var(--color-text-muted)] uppercase text-xs tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]/50">
              {paginated.length > 0 ? (
                paginated.map((u) => (
                  <tr key={u.id} className="group hover:bg-[var(--color-bg)]/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold border border-[var(--color-border)]">
                          {u.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--color-text)]">{u.email}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">ID: {u.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 font-mono text-sm bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-1 rounded">
                          <Coins size={12} className="text-amber-500" />
                          {u.credits ?? 0}
                        </div>
                        <button
                          onClick={() => handleAddCredits(u.id, 10)}
                          disabled={updating === u.id}
                          className="text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/10 p-1 rounded transition-colors"
                          title="Add 10 Credits"
                        >
                          <PlusCircle size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[var(--color-text-muted)] font-medium">
                      {new Date(u.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="relative inline-block">
                        <select
                          value={u.role}
                          disabled={updating === u.id}
                          onChange={(e) => handleChangeRole(u.id, e.target.value as BevislyUser["role"])}
                          className={`
                               appearance-none bg-transparent pl-3 pr-8 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-medium cursor-pointer
                               hover:border-[var(--color-brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all
                               ${updating === u.id ? 'opacity-50 pointer-events-none' : ''}
                            `}
                        >
                          <option value="candidate">Candidate</option>
                          <option value="employer">Employer</option>
                          <option value="admin">Admin</option>
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]">
                          <MoreHorizontal size={14} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[var(--color-text-muted)]">
                    <div className="flex flex-col items-center gap-2">
                      <User size={32} className="opacity-20" />
                      <p>No users found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredUsers.length > 0 && (
          <div className="border-t border-[var(--color-border)] p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--color-bg)]/30">
            <div className="text-xs text-[var(--color-text-muted)]">
              Showing <span className="font-medium text-[var(--color-text)]">{(page - 1) * perPage + 1}</span> to <span className="font-medium text-[var(--color-text)]">{Math.min(page * perPage, filteredUsers.length)}</span> of {filteredUsers.length} results
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-md border border-[var(--color-border)] text-xs font-medium hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:hover:bg-transparent transition"
              >
                Previous
              </button>
              <div className="text-xs font-medium text-[var(--color-text)]">
                Page {page} of {totalPages || 1}
              </div>
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
