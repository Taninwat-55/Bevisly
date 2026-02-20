import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import toast from "react-hot-toast";
import { notify } from "@/components/common/Notify";
import {
  Bell,
  LogOut,
  UserCircle2,
  Settings,
  FileText,
  Shield,
} from "lucide-react";

export default function UserMenu() {
  const navigate = useNavigate();
  const { signOut, user, setOverride } = useAuth();
  const { isDark } = useTheme();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get actual role from localStorage (database role, before any override)
  const storedUser = JSON.parse(localStorage.getItem("bevisly_user") || "{}");
  const actualDatabaseRole = storedUser?.role; // This is the role from the database
  const overrideRole = localStorage.getItem("overrideRole");

  // User is "true admin" if their DATABASE role is admin (not override)
  const isTrueAdmin = actualDatabaseRole === "admin";
  const isCurrentlyViewingAsUser = isTrueAdmin && overrideRole && overrideRole !== "admin";

  const handleLogout = async () => {
    await signOut();
    notify.success("👋 You’ve been logged out");
    navigate("/");
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Theme-adaptive background */
  const bgColor = isDark
    ? "bg-[var(--color-surface)]"
    : "bg-[var(--color-surface)]";

  return (
    <div className="relative flex items-center gap-3" ref={dropdownRef}>
      {/* Notifications */}
      <button
        onClick={() => toast("No new notifications 📬")}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-candidate-dark)] transition"
        title="Notifications"
      >
        <Bell size={20} strokeWidth={1.75} />
      </button>

      {/* Account */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={`rounded-full p-[6px] hover:bg-[var(--color-bg-hover)] transition ${dropdownOpen ? "bg-[var(--color-bg-hover)]" : ""
          }`}
        title="Account"
      >
        <UserCircle2
          size={22}
          strokeWidth={1.75}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-candidate-dark)] transition"
        />
      </button>

      {dropdownOpen && (
        <div
          className={`absolute top-[2.8rem] right-0 w-56 border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] overflow-hidden transition-colors ${bgColor}`}
        >
          {/* User Info */}
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                  {user?.full_name?.[0]?.toUpperCase() || user?.company_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {/* Show company name for employers, full name for others */}
                {user?.role === "employer" && user?.company_name ? (
                  <>
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">
                      {user.company_name}
                    </p>
                    {user?.full_name && (
                      <p className="text-xs text-[var(--color-text-muted)] truncate">
                        {user.full_name}
                      </p>
                    )}
                  </>
                ) : user?.full_name ? (
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">
                    {user.full_name}
                  </p>
                ) : null}
                <p className="text-xs text-[var(--color-text-muted)] truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <button
            onClick={() => {
              navigate("/candidate");
              setDropdownOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition"
          >
            <UserCircle2 size={16} /> My Dashboard
          </button>

          <button
            onClick={() => {
              navigate("/candidate/proofs");
              setDropdownOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition"
          >
            <FileText size={16} /> My Proofs
          </button>

          <button
            onClick={() => {
              navigate("/candidate/settings");
              setDropdownOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition"
          >
            <Settings size={16} /> Settings
          </button>

          {/* Admin role switching options */}
          {isTrueAdmin && (
            <button
              onClick={() => {
                // Always clear any override and set role to admin
                localStorage.removeItem("overrideRole");
                setOverride?.("admin");
                setDropdownOpen(false);
                // Small delay to let the context update before navigating
                setTimeout(() => navigate("/admin"), 50);
              }}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
            >
              <Shield size={16} />
              {isCurrentlyViewingAsUser ? "Back to Admin Dashboard" : "Admin Dashboard"}
            </button>
          )}

          <div className="border-t border-[var(--color-border)] my-1" />

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-[var(--color-error)] flex items-center gap-2 hover:bg-[color-mix(in srgb,var(--color-error)6%,transparent)] transition"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      )}
    </div>
  );
}
