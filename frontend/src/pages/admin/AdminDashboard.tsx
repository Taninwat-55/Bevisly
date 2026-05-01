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
    const actualRole = role === "admin" && isDemoAdmin ? "demo_admin" : role;
    setOverride?.(actualRole);
    toast.success(`🔁 Viewing as ${role}`);
    navigate(role === "admin" ? "/admin" : `/${role}`, { replace: true });
  };

  return (
    <div className="space-y-8 pb-12">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-soft)]">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--color-brand-primary)]/5 rounded-full blur-[80px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-brand-primary)]/3 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary)] text-[10px] font-bold uppercase tracking-widest mb-4">
              <ShieldCheck size={11} />
              Root Terminal
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-[var(--color-text)] mb-2">
              Admin Control
            </h1>
            <p className="text-[var(--color-text-muted)] max-w-xl text-sm leading-relaxed">
              System overview, user management, and security portal.
              Maintain the integrity of the Bevisly ecosystem.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">System Operational</span>
          </div>
        </div>
      </div>

      {/* Demo Mode Banner */}
      {isDemoAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-start gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck size={16} className="text-amber-500" />
          </div>
          <div>
            <p className="font-semibold text-sm">Demo Mode — Read-Only Access</p>
            <p className="text-xs opacity-80 mt-0.5 leading-relaxed">Write actions (editing roles, credits, featured jobs) are disabled.</p>
          </div>
        </motion.div>
      )}

      {/* ── Stats ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[var(--color-text)] flex items-center gap-2">
            <Activity size={16} className="text-[var(--color-brand-primary)]" />
            System Metrics
          </h2>
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Real-time</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={stats.total_users} icon={Users} color="blue" trend="+12% growth" />
          <StatCard label="Active Jobs" value={stats.total_jobs} icon={Briefcase} color="orange" trend="+5 today" />
          <StatCard label="Submissions" value={stats.total_submissions} icon={FileSpreadsheet} color="purple" info="Across all roles" />
          <StatCard label="Satisfaction" value={stats.avg_feedback_score} icon={ShieldCheck} color="emerald" info="Avg candidate rating" />
        </div>
      </section>

      {/* ── Management Tools ── */}
      <section>
        <h2 className="text-base font-semibold text-[var(--color-text)] mb-4">Management Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ToolTile onClick={() => navigate("/admin/users")} icon={Users} label="User Directory" description="Manage access, update roles, and audit profiles." color="blue" />
          <ToolTile onClick={() => navigate("/admin/jobs")} icon={Briefcase} label="Job Oversight" description="Monitor listings, feature roles, and manage moderation." color="orange" />
          <ToolTile onClick={() => navigate("/admin/data-viewer")} icon={Database} label="Raw Data Terminal" description="Direct database access for auditing and debugging." color="slate" />
        </div>
      </section>

      {/* ── Perspective Switcher ── */}
      <section>
        <div className="relative glass-panel p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-brand-primary)]/5 rounded-full blur-[60px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-1 flex items-center gap-2">
                <RefreshCcw size={16} className="text-[var(--color-brand-primary)]" />
                Perspective Testing
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-md">
                Switch your session to experience the platform as a candidate or employer. Useful for verifying flows and permissions.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleOverride("candidate")}
                className="px-4 py-2.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm font-semibold hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/5 transition-all flex items-center gap-2"
              >
                <UserCircle2 size={16} className="text-blue-500" />
                As Candidate
              </button>
              <button
                onClick={() => handleOverride("employer")}
                className="px-4 py-2.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm font-semibold hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/5 transition-all flex items-center gap-2"
              >
                <UserCheck size={16} className="text-orange-500" />
                As Employer
              </button>
              <button
                onClick={() => handleOverride("admin")}
                className="px-4 py-2.5 rounded-xl bg-[var(--color-brand-primary)] text-white text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-2"
              >
                <ShieldCheck size={16} />
                Reset View
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, trend, info }: any) {
  const colorMap: any = {
    blue: "text-blue-500 bg-blue-500/10",
    orange: "text-orange-500 bg-orange-500/10",
    purple: "text-purple-500 bg-purple-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-bold font-display text-[var(--color-text)] mb-2">{value}</h3>
      {trend && (
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-tight">
          <Activity size={10} />
          {trend}
        </div>
      )}
      {info && (
        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-tight">{info}</p>
      )}
    </motion.div>
  );
}

function ToolTile({ onClick, icon: Icon, label, description, color }: any) {
  const colorMap: any = {
    blue: "text-blue-500 bg-blue-500/10",
    orange: "text-orange-500 bg-orange-500/10",
    slate: "text-[var(--color-text-muted)] bg-[var(--color-bg)]",
  };

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -2 }}
      className="group cursor-pointer p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-primary)]/40 hover:shadow-[var(--shadow-soft)] transition-all"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 ${colorMap[color]}`}>
        <Icon size={22} />
      </div>
      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-1 group-hover:text-[var(--color-brand-primary)] transition-colors">{label}</h3>
      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{description}</p>
    </motion.div>
  );
}
