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
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors pb-20">
      
      {/* ── Fancy Banner / Header ── */}
      <div className="relative pt-12 pb-24 px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white shadow-2xl overflow-hidden rounded-b-[3rem] md:rounded-b-[4rem]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-6"
              >
                <ShieldCheck size={12} />
                Root Terminal
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4">
                Admin Control
              </h1>
              <p className="text-slate-300 max-w-2xl text-lg leading-relaxed">
                System overview, user management, and security portal. 
                Maintain the integrity of the Bevisly ecosystem.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center gap-3 shadow-2xl">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                <span className="text-sm font-bold tracking-wide">System Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-20 space-y-12">
        
        {/* Demo Mode Banner */}
        {isDemoAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-amber-500/10 backdrop-blur-md border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-start gap-4 shadow-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="font-bold text-sm">Demo Mode — Read-Only Access</p>
              <p className="text-xs opacity-80 mt-1 leading-relaxed">You can explore all views and switch perspectives, but write actions (editing roles, credits, featured jobs) are disabled.</p>
            </div>
          </motion.div>
        )}

        {/* ── Stats Section ── */}
        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xl font-bold font-display text-[var(--color-text)] flex items-center gap-2">
              <Activity size={20} className="text-[var(--color-brand-primary)]" />
              System Metrics
            </h2>
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Real-time update</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label="Total Users" 
              value={stats.total_users} 
              icon={Users} 
              color="blue" 
              trend="+12% growth"
            />
            <StatCard 
              label="Active Jobs" 
              value={stats.total_jobs} 
              icon={Briefcase} 
              color="orange" 
              trend="+5 today"
            />
            <StatCard 
              label="Submissions" 
              value={stats.total_submissions} 
              icon={FileSpreadsheet} 
              color="purple" 
              info="Across all roles"
            />
            <StatCard 
              label="Satisfaction" 
              value={stats.avg_feedback_score} 
              icon={ShieldCheck} 
              color="emerald" 
              info="Avg candidate rating"
            />
          </div>
        </section>

        {/* ── Tools Section ── */}
        <section>
          <h2 className="text-xl font-bold font-display text-[var(--color-text)] mb-6 px-2">Management Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ToolTile 
              onClick={() => navigate("/admin/users")}
              icon={Users}
              label="User Directory"
              description="Manage user access, update roles, and audit profile activity."
              color="blue"
            />
            <ToolTile 
              onClick={() => navigate("/admin/jobs")}
              icon={Briefcase}
              label="Job Oversight"
              description="Monitor active listings, feature roles, and manage moderation."
              color="orange"
            />
            <ToolTile 
              onClick={() => navigate("/admin/data-viewer")}
              icon={Database}
              label="Raw Data Terminal"
              description="Direct database access for deep auditing and system debugging."
              color="slate"
            />
          </div>
        </section>

        {/* ── Perspective Switcher ── */}
        <section>
          <div className="relative glass-panel p-8 rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-surface)]/50 backdrop-blur-xl shadow-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-primary)]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-[var(--color-brand-primary)]/10 transition-colors" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-xl text-center lg:text-left">
                <h3 className="text-2xl font-bold font-display text-[var(--color-text)] mb-3 flex items-center justify-center lg:justify-start gap-3">
                  <RefreshCcw size={24} className="text-[var(--color-brand-primary)]" />
                  Perspective Testing
                </h3>
                <p className="text-[var(--color-text-muted)] text-base leading-relaxed">
                  Switch your session view to experience the platform exactly as a candidate or employer would. 
                  Perfect for verifying permission logic and user flows.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4 w-full lg:w-auto">
                <button
                  onClick={() => handleOverride("candidate")}
                  className="px-6 py-4 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] font-bold hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/5 transition-all shadow-sm flex items-center gap-3"
                >
                  <UserCircle2 size={20} className="text-blue-500" /> 
                  <span>As Candidate</span>
                </button>
                <button
                  onClick={() => handleOverride("employer")}
                  className="px-6 py-4 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] font-bold hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/5 transition-all shadow-sm flex items-center gap-3"
                >
                  <UserCheck size={20} className="text-orange-500" /> 
                  <span>As Employer</span>
                </button>
                <button
                  onClick={() => handleOverride("admin")}
                  className="px-8 py-4 rounded-2xl bg-[var(--color-brand-primary)] text-white font-bold hover:brightness-110 transition-all shadow-glow-primary flex items-center gap-3"
                >
                  <ShieldCheck size={20} /> 
                  <span>Reset View</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ── Helper Components ── */

function StatCard({ label, value, icon: Icon, color, trend, info }: any) {
  const colorMap: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-panel p-6 rounded-[2rem] border border-[var(--color-border)] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm relative overflow-hidden"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${colorMap[color]}`}>
        <Icon size={24} />
      </div>
      <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-4xl font-bold font-display text-[var(--color-text)] mb-3">{value}</h3>
      {trend && (
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
          <Activity size={12} />
          {trend}
        </div>
      )}
      {info && (
        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-tighter">{info}</p>
      )}
    </motion.div>
  );
}

function ToolTile({ onClick, icon: Icon, label, description, color }: any) {
  const colorMap: any = {
    blue: "text-blue-500 bg-blue-500/10",
    orange: "text-orange-500 bg-orange-500/10",
    slate: "text-slate-500 bg-slate-500/10",
  };

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -4 }}
      className="group cursor-pointer glass-panel p-8 rounded-[2.5rem] border border-[var(--color-border)] bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm hover:border-[var(--color-brand-primary)]/30 transition-all shadow-lg"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${colorMap[color]}`}>
        <Icon size={28} />
      </div>
      <h3 className="text-xl font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-brand-primary)] transition-colors">{label}</h3>
      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{description}</p>
    </motion.div>
  );
}
