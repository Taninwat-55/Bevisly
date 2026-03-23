import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  Shield,
  FolderKanban,
  PlusCircle,
  Settings,
  House,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  role?: "candidate" | "employer" | "admin" | "demo_admin";
}

export default function Sidebar({ role }: SidebarProps) {
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const rawRole = role || user?.role || "candidate";
  // Treat demo_admin as admin for sidebar display
  const resolvedRole = rawRole === "demo_admin" ? "admin" : rawRole;

  /* Accent color per role */
  const accentColorMap = {
    candidate: "var(--color-candidate-dark)",
    employer: "var(--color-employer-dark)",
    admin: "#71717A", // subtle gray for admin
  } as const;
  const accentColor = accentColorMap[resolvedRole];

  /* Role-based links */
  const links =
    resolvedRole === "employer"
      ? [
        { to: "/employer", label: "Overview", icon: <House size={17} /> },
        {
          to: "/employer",
          label: "Dashboard",
          icon: <LayoutDashboard size={17} />,
        },
        {
          to: "/employer/jobs",
          label: "My Jobs",
          icon: <Briefcase size={17} />,
        },
        {
          to: "/employer/jobs/new",
          label: "Post a Job",
          icon: <PlusCircle size={17} />,
        },
        {
          to: "/employer/submissions",
          label: "Submissions",
          icon: <FolderKanban size={17} />,
        },
        {
          to: "/employer/settings",
          label: "Settings",
          icon: <Settings size={17} />,
        },
      ]
      : resolvedRole === "admin"
        ? [
          { to: "/admin", label: "Dashboard", icon: <Shield size={17} /> },
          { to: "/admin/users", label: "Users", icon: <Users size={17} /> },
          {
            to: "/admin/jobs",
            label: "Jobs Overview",
            icon: <Briefcase size={17} />,
          },
          {
            to: "/admin/settings",
            label: "Settings",
            icon: <Settings size={17} />,
          },
        ]
        : [
          { to: "/candidate", label: "Overview", icon: <House size={17} /> },
          {
            to: "/candidate/dashboard",
            label: "Dashboard",
            icon: <LayoutDashboard size={17} />,
          },
          {
            to: "/candidate/jobs",
            label: "Jobs",
            icon: <Briefcase size={17} />,
          },
          {
            to: "/candidate/proofs",
            label: "My Proofs",
            icon: <FileText size={17} />,
          },
          {
            to: "/candidate/settings",
            label: "Settings",
            icon: <Settings size={17} />,
          },
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
          <span className="font-semibold text-[var(--color-text)] whitespace-nowrap select-none">
            {resolvedRole === "candidate"
              ? "🎓 Candidate"
              : resolvedRole === "employer"
                ? "🏢 Employer"
                : "🧩 Admin"}
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
      <nav className="flex flex-col px-2 py-3 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            title={label} // tooltip for collapsed mode
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

      {/* Footer / Logout */}
      <div className="mt-auto px-2 py-4 border-t border-[var(--color-border)]">
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
