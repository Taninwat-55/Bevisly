// ADMIN-ONLY SIDEBAR
// This component is used exclusively by AdminLayout.tsx for the /admin routes.
//
// Candidate and employer navigation lives in DashboardLayout.tsx (src/layout/DashboardLayout.tsx),
// which handles its own sidebar inline. If you're adding nav links for admin, edit the
// `links` array below — for candidate/employer nav, edit DashboardLayout.tsx.
//
// TODO: consolidate into a single Sidebar component that handles all three roles.

import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  Shield,
  Users,
  Briefcase,
  Settings,
  ArrowLeft,
  ArrowRight,
  LogOut,
  MessageCircle,
  Database,
  Languages,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  role?: "admin" | "demo_admin";
}

export default function Sidebar({ role }: SidebarProps) {
  const { user, signOut } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const rawRole = role || user?.role || "admin";
  const resolvedRole = rawRole === "demo_admin" ? "admin" : rawRole;

  const links = [
    { to: "/admin", label: "Dashboard", icon: Shield, end: true },
    { to: "/admin/users", label: "Users", icon: Users, end: false },
    { to: "/admin/jobs", label: "Jobs Overview", icon: Briefcase, end: false },
    { to: "/admin/feedback-messages", label: "Platform Feedback", icon: MessageCircle, end: false },
    { to: "/admin/data-viewer", label: "Data Viewer", icon: Database, end: false },
  ];

  const footerIconClass =
    "p-2 text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/10 rounded-lg transition-all";

  return (
    <aside
      className={`relative hidden md:flex flex-col glass-panel border-r border-[var(--glass-border)] backdrop-blur-xl transition-all duration-300 ${
        isSidebarOpen ? "w-[280px]" : "w-[80px]"
      }`}
    >
      {/* Brand */}
      <Link
        to="/"
        className={`h-20 flex items-center ${isSidebarOpen ? "px-8" : "justify-center"} border-b border-[var(--color-border)]/50 hover:bg-[var(--color-surface-hover)] transition-colors`}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] flex items-center justify-center text-white font-bold text-lg shadow-glow-primary shrink-0">
          B
        </div>
        {isSidebarOpen && (
          <span className="ml-3 text-xl font-bold font-display text-[var(--color-text)] tracking-tight">
            Bevisly
          </span>
        )}
      </Link>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-3 space-y-3 overflow-y-auto">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative
              ${
                isActive
                  ? "text-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10 font-semibold shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
              }
              ${!isSidebarOpen ? "justify-center" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={isSidebarOpen ? 20 : 24}
                  className={`shrink-0 ${
                    isActive
                      ? "text-[var(--color-brand-primary)]"
                      : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]"
                  }`}
                />
                {isSidebarOpen && (
                  <span className="whitespace-nowrap flex-1">{label}</span>
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-[var(--color-brand-primary)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div
        className={`p-4 border-t border-[var(--color-border)]/50 bg-[var(--color-surface-hover)]/30 flex ${
          isSidebarOpen ? "flex-row items-center gap-3" : "flex-col items-center gap-2"
        }`}
      >
        <Link
          to={`/${resolvedRole}/settings`}
          className={`flex items-center gap-3 group overflow-hidden ${isSidebarOpen ? "flex-1" : ""}`}
          title="Account Settings"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center border border-[var(--color-border)] shrink-0 group-hover:border-[var(--color-brand-primary)] transition-all shadow-sm group-hover:shadow-glow-primary/20">
            <span className="font-semibold text-[var(--color-text)]">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="User" className="w-full h-full object-cover rounded-full" />
              ) : (
                user?.full_name?.[0]?.toUpperCase() ||
                user?.email?.[0].toUpperCase() ||
                "A"
              )}
            </span>
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden text-left">
              <p className="text-sm font-semibold text-[var(--color-text)] truncate group-hover:text-[var(--color-brand-primary)] transition-colors">
                {user?.full_name || user?.email}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] truncate uppercase tracking-wider">
                {rawRole === "demo_admin" ? "Demo Admin" : "Admin"}
              </p>
            </div>
          )}
        </Link>
        <div className={`flex items-center gap-0.5 ${!isSidebarOpen ? "flex-col" : ""}`}>
          <button className={footerIconClass} title="Change Language (Coming Soon)">
            <Languages size={18} />
          </button>
          <Link to={`/${resolvedRole}/settings`} className={footerIconClass} title="Settings">
            <Settings size={18} />
          </Link>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to log out?")) signOut();
            }}
            className="p-2 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="absolute -right-3 top-20 z-50 p-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full shadow-lg text-[var(--color-text)] hover:text-[var(--color-brand-primary)] hover:border-[var(--color-brand-primary)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center"
        title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isSidebarOpen ? (
          <ArrowLeft size={14} strokeWidth={2.5} />
        ) : (
          <ArrowRight size={14} strokeWidth={2.5} />
        )}
      </button>
    </aside>
  );
}
