import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { getAdminStats } from "../../lib/api/admin";
import { useAuth } from "@/hooks/useAuth";
import {
  Users,
  Briefcase,
  FileSpreadsheet,
  UserCheck,
  UserCircle2,
  Database,
  ShieldCheck,
  RefreshCcw,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { setOverride, user } = useAuth();
  const navigate = useNavigate();
  const isDemoAdmin = user?.role === "demo_admin";

  const [stats, setStats] = useState<{
    total_users: number;
    total_jobs: number;
    total_submissions: number;
    total_feedbacks: number;
    avg_feedback_score: string | number;
  }>({
    total_users: 0,
    total_jobs: 0,
    total_submissions: 0,
    total_feedbacks: 0,
    avg_feedback_score: "—",
  });

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((err) => {
        console.error("Stats load error:", err);
        toast.error("Failed to load dashboard stats");
      });
  }, []);

  const handleOverride = (role: "candidate" | "employer" | "admin") => {
    // For demo_admin, reset back to demo_admin instead of full admin
    const actualRole = role === "admin" && isDemoAdmin ? "demo_admin" : role;
    setOverride?.(actualRole);
    toast.success(`🔁 Viewing as ${role}`);
    navigate(role === "admin" ? "/admin" : `/${role}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] px-6 md:px-10 py-12 transition-colors font-sans">

      {/* Demo Mode Banner */}
      {isDemoAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center gap-3"
        >
          <span className="text-2xl">🔒</span>
          <div>
            <p className="font-semibold text-sm">Demo Mode — Read-Only Access</p>
            <p className="text-xs opacity-80">You can explore all views and switch perspectives, but write actions (editing roles, credits, featured jobs) are disabled.</p>
          </div>
        </motion.div>
      )}

      {/* ── Header ────────────────────────────────────────── */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-[var(--color-text)] mb-2 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
              <ShieldCheck size={28} />
            </span>
            Admin Control
          </h1>
          <p className="text-[var(--color-text-muted)] text-lg">
            System overview and user management portal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-muted)] flex items-center gap-2 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Operational
          </div>
        </div>
      </header>

      {/* ── System Health (Stats) ────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-xl font-bold font-display text-[var(--color-text)] mb-6 flex items-center gap-2">
          <Activity size={20} className="text-[var(--color-brand-secondary)]" />
          System Health
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Card 1: Users */}
          <div className="group glass-panel p-6 rounded-2xl relative overflow-hidden transition-all hover:shadow-glow-primary border border-[var(--color-border)]">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><Users size={20} /></div>
            </div>
            <p className="text-sm font-medium text-[var(--color-text-muted)] mb-1">Total Users</p>
            <h3 className="text-3xl font-bold font-display text-[var(--color-text)] mb-2">{stats.total_users}</h3>
            <div className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
              <Activity size={12} />
              <span>+12% vs last week</span>
            </div>
          </div>

          {/* Card 2: Jobs */}
          <div className="group glass-panel p-6 rounded-2xl relative overflow-hidden transition-all hover:shadow-glow-orange border border-[var(--color-border)]">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500"><Briefcase size={20} /></div>
            </div>
            <p className="text-sm font-medium text-[var(--color-text-muted)] mb-1">Active Jobs</p>
            <h3 className="text-3xl font-bold font-display text-[var(--color-text)] mb-2">{stats.total_jobs}</h3>
            <div className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
              <Activity size={12} />
              <span>+5 new today</span>
            </div>
          </div>

          {/* Card 3: Submissions */}
          <div className="group glass-panel p-6 rounded-2xl relative overflow-hidden transition-all hover:shadow-lg border border-[var(--color-border)]">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500"><FileSpreadsheet size={20} /></div>
            </div>
            <p className="text-sm font-medium text-[var(--color-text-muted)] mb-1">Submissions</p>
            <h3 className="text-3xl font-bold font-display text-[var(--color-text)] mb-2">{stats.total_submissions}</h3>
            <div className="text-xs text-[var(--color-text-muted)]">
              across all active roles
            </div>
          </div>

          {/* Card 4: Satisfaction */}
          <div className="group glass-panel p-6 rounded-2xl relative overflow-hidden transition-all hover:shadow-lg border border-[var(--color-border)]">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><ShieldCheck size={20} /></div>
            </div>
            <p className="text-sm font-medium text-[var(--color-text-muted)] mb-1">Satisfaction</p>
            <h3 className="text-3xl font-bold font-display text-[var(--color-text)] mb-2">{stats.avg_feedback_score}</h3>
            <div className="text-xs text-[var(--color-text-muted)]">
              Average candidate rating
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Quick Access Grid ────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-xl font-bold font-display text-[var(--color-text)] mb-6">Management Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Tile 1 */}
          <div
            onClick={() => navigate("/admin/users")}
            className="group cursor-pointer glass-panel p-6 rounded-2xl border border-[var(--color-border)] hover:border-blue-500/30 transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h3 className="font-bold text-lg text-[var(--color-text)] mb-1">User Directory</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Manage users, update roles, and view profiles.</p>
          </div>

          {/* Tile 2 */}
          <div
            onClick={() => navigate("/admin/jobs")}
            className="group cursor-pointer glass-panel p-6 rounded-2xl border border-[var(--color-border)] hover:border-orange-500/30 transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
              <Briefcase size={24} />
            </div>
            <h3 className="font-bold text-lg text-[var(--color-text)] mb-1">Job Oversight</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Monitor listings, feature jobs, and extensive moderation.</p>
          </div>

          {/* Tile 3 */}
          <div
            onClick={() => navigate("/admin/data-viewer")}
            className="group cursor-pointer glass-panel p-6 rounded-2xl border border-[var(--color-border)] hover:border-slate-500/30 transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 mb-4 group-hover:scale-110 transition-transform">
              <Database size={24} />
            </div>
            <h3 className="font-bold text-lg text-[var(--color-text)] mb-1">Raw Data</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Direct access to database tables for debugging.</p>
          </div>

        </div>
      </section>

      {/* ── View As Mode ────────────────────────────── */}
      <section>
        <div className="glass-panel p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="text-xl font-bold font-display text-[var(--color-text)] mb-2 flex items-center gap-2">
                <RefreshCcw size={20} className="text-[var(--color-text-muted)]" />
                Perspective Testing
              </h3>
              <p className="text-[var(--color-text-muted)]">
                Switch your view to experience the platform exactly as a specific user role would.
                Useful for debugging permissions and layout flows.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleOverride("candidate")}
                className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-2"
              >
                <UserCircle2 size={18} /> View as Candidate
              </button>
              <button
                onClick={() => handleOverride("employer")}
                className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-2"
              >
                <UserCheck size={18} /> View as Employer
              </button>
              <button
                onClick={() => handleOverride("admin")}
                className="px-5 py-3 rounded-xl bg-[var(--color-brand-primary)] text-white font-medium hover:brightness-110 transition shadow-glow-primary"
              >
                Reset View
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
