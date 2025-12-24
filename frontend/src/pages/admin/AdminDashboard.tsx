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
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { setOverride } = useAuth();
  const navigate = useNavigate();

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
      .catch((err) => console.error("Stats load error:", err));
  }, []);

  const handleOverride = (role: "candidate" | "employer" | "admin") => {
    setOverride?.(role);
    toast.success(`🔁 Viewing as ${role}`);
    navigate(role === "admin" ? "/admin" : `/${role}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] px-6 md:px-10 py-12 transition-colors">
      {/* Header */}
      <header className="mb-10">
        <h1 className="heading-lg flex items-center gap-2 mb-2">
          🧩 Admin Dashboard
        </h1>
        <p className="body-base text-[var(--color-text-muted)]">
          Monitor key metrics, manage system data, and test user roles.
        </p>
      </header>

      {/* System Overview */}
      <section className="mb-12">
        <h2 className="heading-md mb-5">System Overview</h2>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            {
              label: "Total Users",
              value: stats.total_users,
              icon: <Users size={18} />,
              color: "var(--color-employer)",
            },
            {
              label: "Jobs Posted",
              value: stats.total_jobs,
              icon: <Briefcase size={18} />,
              color: "var(--color-candidate-dark)",
            },
            {
              label: "Submissions",
              value: stats.total_submissions,
              icon: <FileSpreadsheet size={18} />,
              color: "var(--color-employer-dark)",
            },
            {
              label: "Feedbacks",
              value: stats.total_feedbacks,
              sub: `⭐ Avg: ${stats.avg_feedback_score}`,
              icon: <ShieldCheck size={18} />,
              color: "var(--color-success)",
            },
          ].map(({ label, value, sub, icon, color }) => (
            <div
              key={label}
              className="flex flex-col justify-between bg-[var(--color-surface)] border border-[var(--color-border)]
              rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[var(--color-text-muted)]">
                  {label}
                </p>
                <span style={{ color }}>{icon}</span>
              </div>
              <h3 className="text-2xl font-semibold text-[var(--color-text)] leading-tight">
                {value}
              </h3>
              {sub && (
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  {sub}
                </p>
              )}
            </div>
          ))}
        </motion.div>
      </section>

      {/* Quick Access */}
      <section className="mb-12">
        <h2 className="heading-md mb-5">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              label: "Manage Users",
              desc: "View and edit user roles",
              to: "/admin/users",
              icon: <Users size={20} />,
              color: "var(--color-employer)",
            },
            {
              label: "Jobs Overview",
              desc: "Browse all posted jobs",
              to: "/admin/jobs",
              icon: <Briefcase size={20} />,
              color: "var(--color-candidate-dark)",
            },
            {
              label: "Feedback Logs",
              desc: "Review all candidate feedback",
              to: "/admin/feedback",
              icon: <FileSpreadsheet size={20} />,
              color: "var(--color-candidate)",
            },
            {
              label: "Data Viewer",
              desc: "Inspect platform tables",
              to: "/admin/data-viewer",
              icon: <Database size={20} />,
              color: "var(--color-text-muted)",
            },
            {
              label: "View as Candidate",
              desc: "Switch to candidate view",
              action: () => handleOverride("candidate"),
              icon: <UserCircle2 size={20} />,
              color: "var(--color-candidate-dark)",
            },
            {
              label: "View as Employer",
              desc: "Switch to employer view",
              action: () => handleOverride("employer"),
              icon: <UserCheck size={20} />,
              color: "var(--color-employer-dark)",
            },
          ].map(({ label, desc, to, action, icon, color }) => (
            <motion.button
              key={label}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => (to ? navigate(to) : action?.())}
              className="flex items-center gap-3 p-4 bg-[var(--color-surface)]
              rounded-[var(--radius-card)] border border-[var(--color-border)]
              shadow-[var(--shadow-soft)] hover:shadow-md hover:bg-[var(--color-bg-hover)]
              transition cursor-pointer text-left"
            >
              <span style={{ color }}>{icon}</span>
              <div>
                <p className="font-medium text-[var(--color-text)]">{label}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Admin Actions */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-surface)] border border-[var(--color-border)]
        rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-6"
      >
        <h2 className="heading-md mb-4">Admin Actions</h2>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleOverride("admin")}
            className="flex items-center gap-2 bg-[var(--color-employer-dark)] text-white px-5 py-2
            rounded-[var(--radius-button)] hover:brightness-110 transition shadow-[var(--shadow-soft)]"
          >
            <RefreshCcw size={16} /> Reset to Admin
          </button>
        </div>

        <p className="text-sm text-[var(--color-text-muted)] mt-4">
          Use these tools for maintenance and testing user perspectives safely.
        </p>
      </motion.section>
    </div>
  );
}
