// ADMIN-ONLY SIDEBAR
// This component is used exclusively by AdminLayout.tsx for the /admin routes.
//
// Candidate and employer navigation lives in DashboardLayout.tsx (src/layout/DashboardLayout.tsx),
// which handles its own sidebar inline. If you're adding nav links for candidates or employers,
// edit the `links` array in DashboardLayout.tsx — not here.
//
// TODO: consolidate into a single Sidebar component that handles all three roles.
// Tracked intent: merge this and DashboardLayout's sidebar into one component.

import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  Shield,
  Users,
  Briefcase,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  MessageCircle,
  Database,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  role?: "admin" | "demo_admin";
}

export default function Sidebar({ role }: SidebarProps) {
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const rawRole = role || user?.role || "admin";
  const resolvedRole = rawRole === "demo_admin" ? "admin" : rawRole;

  const accentColor = "var(--color-brand-primary)";

  const links = [
    { to: "/admin", label: "Dashboard", icon: <Shield size={17} /> },
    { to: "/admin/users", label: "Users", icon: <Users size={17} /> },
    { to: "/admin/jobs", label: "Jobs Overview", icon: <Briefcase size={17} /> },
    { to: "/admin/feedback-messages", label: "Platform Feedback", icon: <MessageCircle size={17} /> },
    { to: "/admin/data-viewer", label: "Data Viewer", icon: <Database size={17} /> },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col transition-all duration-300 border-r border-[var(--color-border)] shadow-[var(--shadow-soft)]
        bg-[color-mix(in srgb,var(--color-surface) 95%,transparent)]
        ${collapsed ? "w-[72px]" : "w-[230px]"} overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        {!collapsed && (
          <span className="font-semibold text-[var(--color-text)] whitespace-nowrap select-none flex items-center gap-2">
            <Shield size={15} className="text-[var(--color-brand-primary)]" /> Admin
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] transition"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col px-2 py-3 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            title={label}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-[var(--radius-button)] text-sm font-medium transition-all
     ${isActive
                ? "bg-[color-mix(in srgb,var(--color-bg) 85%,transparent)] text-[var(--color-text)] font-semibold"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[color-mix(in srgb,var(--color-bg) 90%,transparent)]"
              }`
            }
            style={({ isActive }) =>
              isActive
                ? { borderLeft: `3px solid ${accentColor}`, color: accentColor }
                : undefined
            }
          >
            {icon}
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer / User Settings & Logout */}
      <div className="mt-auto px-2 py-4 border-t border-[var(--color-border)] space-y-1">
        <Link
          to={`/${resolvedRole}/settings`}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-[var(--radius-button)] text-sm font-medium transition-all text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]"
          title="Settings"
        >
          <Settings size={17} />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={() => {
            if (confirm("Are you sure you want to log out?")) {
              signOut();
            }
          }}
          className={`flex items-center gap-3 px-3 py-2 w-full rounded-[var(--radius-button)] text-sm font-medium transition-all text-red-500 hover:bg-red-500/10 hover:text-red-600`}
          title="Log Out"
        >
          <LogOut size={17} />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
