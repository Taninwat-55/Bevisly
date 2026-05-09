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
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  role?: "admin" | "demo_admin";
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ role, mobileOpen, onMobileClose }: SidebarProps) {
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
    <>
    <aside
      className={`relative hidden md:flex flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)] transition-all duration-300 ${
        isSidebarOpen ? "w-[280px]" : "w-[80px]"
      }`}
    >
      {/* Brand */}
      <Link
        to="/"
        className={`h-20 flex items-center ${isSidebarOpen ? "px-8" : "justify-center"} border-b border-[var(--color-border)]/50 hover:bg-[var(--color-surface-hover)] transition-colors`}
      >
        <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary)] flex items-center justify-center text-white font-bold text-lg shrink-0">
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
          <div className="w-10 h-10 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center border border-[var(--color-border)] shrink-0 group-hover:border-[var(--color-brand-primary)] transition-colors">
            <span className="font-semibold text-[var(--color-text)]">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="User" className="w-full h-full object-cover rounded-full" />
              ) : (
                user?.full_name?.[0]?.toUpperCase() ||
                user?.email?.[0]?.toUpperCase() ||
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

    {/* ─── Mobile Drawer ─── */}
    {mobileOpen && (
      <div className="fixed inset-0 z-[60] md:hidden flex">
        <div className="absolute inset-0 bg-black/40" onClick={onMobileClose} />
        <div className="relative z-10 w-[280px] h-full flex flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)] shadow-xl">
          {/* Header */}
          <div className="h-14 flex items-center justify-between px-5 border-b border-[var(--color-border)]/50">
            <Link to="/" onClick={onMobileClose} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-primary)] flex items-center justify-center text-white font-bold text-lg">
                B
              </div>
              <span className="text-xl font-bold font-display tracking-tight text-[var(--color-text)]">
                Bevisly
              </span>
            </Link>
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
                  ${isActive
                    ? "text-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10 font-semibold"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--color-border)]/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center border border-[var(--color-border)] shrink-0 text-sm font-semibold text-[var(--color-text)]">
              {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                {user?.full_name || user?.email}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
                {rawRole === "demo_admin" ? "Demo Admin" : "Admin"}
              </p>
            </div>
            <button
              onClick={() => { if (confirm("Sign out?")) signOut(); }}
              className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
