import { useEffect, useState, useMemo } from "react";
import { getAllUsers, updateUserRole, addCredits, setUserVerified } from "@/lib/api/admin";
import toast from "react-hot-toast";
import type { BevislyUser } from "@/types/admin";
import { ArrowDownUp, Search, User, MoreHorizontal, Shield, ShieldCheck, Briefcase, GraduationCap, PlusCircle, Coins, Eye, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export default function AdminUsers() {
  const { user: authUser } = useAuth();
  const isDemoAdmin = authUser?.role === "demo_admin";
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
    if (isDemoAdmin) {
      toast.error("Demo accounts cannot change user roles.");
      return;
    }
    setUpdating(id);
    try {
      await updateUserRole(id, newRole);
      toast.success(`Role updated to ${newRole}`);
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
    if (isDemoAdmin) {
      toast.error("Demo accounts cannot add credits.");
      return;
    }
    if (!confirm(`Add ${amount} credits to this user?`)) return;
    setUpdating(id);
    try {
      const newBal = await addCredits(id, amount);
      toast.success(`Credits updated. New balance: ${newBal}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, credits: newBal } : u))
      );
    } catch {
      toast.error("Failed to add credits");
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleVerified = async (id: string, current: boolean) => {
    const next = !current;
    try {
      await setUserVerified(id, next);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_verified: next } : u))
      );
      toast.success(next ? "Employer verified ✓" : "Verification removed");
    } catch {
      toast.error("Failed to update verification");
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

  /* ─────────────── Helper: Role Badge ─────────────── */
  const RoleBadge = ({ role }: { role: string }) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold border border-purple-500/20">
          <Shield size={12} /> Admin
        </span>
      );
    }
    if (role === 'demo_admin') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-500/20">
          <Eye size={12} /> Demo
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

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-[var(--color-text-muted)] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        <p className="font-bold uppercase tracking-widest text-xs animate-pulse">Scanning community directory...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors pb-20">

      {/* ── Fancy Banner / Header ── */}
      <div className="relative pt-12 pb-24 px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl overflow-hidden rounded-b-[3rem] md:rounded-b-[4rem]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-6"
              >
                <Users size={12} />
                User Administration
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4">
                User Directory
              </h1>
              <p className="text-slate-300 max-w-2xl text-lg leading-relaxed">
                Manage platform access, audit user roles, and distribute system credits. 
                Keep the community balanced and secure.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center gap-4 shadow-2xl">
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Total</p>
                  <p className="text-lg font-bold text-white">{users.length}</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                {!isDemoAdmin && (
                  <button
                    onClick={() => {
                      const email = prompt("Enter email verification to invite:");
                      if (email) {
                        const link = `${window.location.origin}/auth?invite=${btoa(email)}`;
                        navigator.clipboard.writeText(link);
                        toast.success(`Invite link for ${email} copied to clipboard!`);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-primary)] text-white rounded-lg text-sm font-bold hover:bg-[var(--color-brand-primary-hover)] transition-colors"
                  >
                    <PlusCircle size={18} />
                    <span>Invite</span>
                  </button>
                )}
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
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-4 focus:ring-[var(--color-brand-primary)]/10 focus:border-[var(--color-brand-primary)] outline-none transition-all font-medium"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
            <div className="flex items-center gap-2 p-1 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-xl">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as "all" | BevislyUser["role"])}
                className="bg-transparent border-0 rounded-lg px-4 py-2 text-sm font-bold outline-none focus:ring-0 cursor-pointer text-[var(--color-text)]"
              >
                <option value="all">All Roles</option>
                <option value="candidate">Candidates</option>
                <option value="employer">Employers</option>
                <option value="admin">Admins</option>
                <option value="demo_admin">Demo Admins</option>
              </select>
            </div>

            <button
              onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
              className="flex items-center gap-2 px-5 py-3 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-xl text-sm font-bold hover:bg-[var(--color-surface-hover)] transition-all shadow-sm group"
            >
              <ArrowDownUp size={16} className="text-[var(--color-brand-primary)] group-hover:rotate-180 transition-transform" />
              {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
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
                  <th className="py-5 px-8 font-bold text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest">Identity</th>
                  <th className="py-5 px-6 font-bold text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest">Privileges</th>
                  <th className="py-5 px-6 font-bold text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest">Wallet</th>
                  <th className="py-5 px-6 font-bold text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest">Onboarded</th>
                  <th className="py-5 px-8 font-bold text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]/30">
                {paginated.length > 0 ? (
                  paginated.map((u) => (
                    <tr key={u.id} className="group hover:bg-[var(--color-brand-primary)]/5 transition-all">
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-black border border-[var(--color-border)] shadow-sm group-hover:scale-105 transition-transform">
                            {u.email?.[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[var(--color-text)] truncate">{u.email}</p>
                            <p className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-tighter">ID: {u.id.slice(0, 12)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 font-mono text-sm font-bold bg-[var(--color-surface)]/80 border border-[var(--color-border)] px-3 py-1.5 rounded-xl shadow-inner">
                            <Coins size={14} className="text-amber-500" />
                            {u.credits ?? 0}
                          </div>
                          {!isDemoAdmin && (
                            <button
                              onClick={() => handleAddCredits(u.id, 10)}
                              disabled={updating === u.id}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-brand-primary)] hover:text-white text-[var(--color-brand-primary)] transition-all border border-transparent hover:border-[var(--color-brand-primary)]/20"
                              title="Add 10 Credits"
                            >
                              <PlusCircle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <p className="text-xs font-bold text-[var(--color-text)]">
                          {new Date(u.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold tracking-tighter mt-0.5">Verified Account</p>
                      </td>
                      <td className="py-5 px-8 text-right">
                        {isDemoAdmin ? (
                          <div className="opacity-50 grayscale"><RoleBadge role={u.role} /></div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                          {u.role === "employer" && (
                            <button
                              onClick={() => handleToggleVerified(u.id, u.is_verified ?? false)}
                              title={u.is_verified ? "Remove verification" : "Verify employer"}
                              className={`p-1.5 rounded-md transition-colors ${
                                u.is_verified
                                  ? "text-blue-600 bg-blue-500/10 hover:bg-blue-500/20"
                                  : "text-[var(--color-text-muted)] hover:text-blue-600 hover:bg-blue-500/10"
                              }`}
                            >
                              {u.is_verified ? <ShieldCheck size={16} /> : <Shield size={16} />}
                            </button>
                          )}
                          <div className="relative inline-block">
                            <select
                              value={u.role}
                              disabled={updating === u.id}
                              onChange={(e) => handleChangeRole(u.id, e.target.value as BevislyUser["role"])}
                              className={`
                                   appearance-none bg-[var(--color-bg)]/50 pl-4 pr-10 py-2 rounded-xl border border-[var(--color-border)] text-xs font-bold cursor-pointer
                                   hover:border-[var(--color-brand-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--color-brand-primary)]/10 transition-all
                                   ${updating === u.id ? 'opacity-50 pointer-events-none' : ''}
                                `}
                            >
                              <option value="candidate">Candidate</option>
                              <option value="employer">Employer</option>
                              <option value="admin">Admin</option>
                              <option value="demo_admin">Demo Admin</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-brand-primary)]">
                              <MoreHorizontal size={16} />
                            </div>
                          </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-[var(--color-text-muted)]">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center opacity-20">
                          <User size={32} />
                        </div>
                        <p className="font-bold">No matches found in the directory.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredUsers.length > 0 && (
            <div className="border-t border-[var(--color-border)] p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-[var(--color-bg)]/30 backdrop-blur-md">
              <div className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                Showing <span className="text-[var(--color-text)]">{(page - 1) * perPage + 1}</span> - <span className="text-[var(--color-text)]">{Math.min(page * perPage, filteredUsers.length)}</span> of {filteredUsers.length} Users
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-bold hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Previous
                </button>
                <div className="text-xs font-bold text-[var(--color-text)] bg-[var(--color-brand-primary)]/10 px-3 py-1.5 rounded-lg border border-[var(--color-brand-primary)]/20">
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
