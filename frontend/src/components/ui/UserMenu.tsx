import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import toast from "react-hot-toast";
import { notify } from "@/components/ui/Notify";
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

  const storedUser = JSON.parse(localStorage.getItem("bevis_user") || "{}");
  const actualRole = storedUser?.role;
  const overrideRole = localStorage.getItem("overrideRole");
  const effectiveRole = overrideRole || actualRole;
  const isTrueAdmin = actualRole === "admin";
  const isAdminView = effectiveRole === "admin";

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
      {/* 🔔 Notifications */}
      <button
        onClick={() => toast("No new notifications 📬")}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-candidate-dark)] transition"
        title="Notifications"
      >
        <Bell size={20} strokeWidth={1.75} />
      </button>

      {/* 👤 Account */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={`rounded-full p-[6px] hover:bg-[var(--color-bg-hover)] transition ${
          dropdownOpen ? "bg-[var(--color-bg-hover)]" : ""
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
          {/* User Email */}
          <p className="px-4 py-2 text-xs text-[var(--color-text)]/70 border-b border-[var(--color-border)] truncate">
            {user?.email}
          </p>

          {/* Menu items */}
          <button
            onClick={() => {
              navigate("/candidate/profile");
              setDropdownOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition"
          >
            <UserCircle2 size={16} /> My Profile
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

          {isTrueAdmin && !isAdminView && (
            <button
              onClick={() => {
                setOverride?.("admin");
                navigate("/admin");
                setDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition"
            >
              <Shield size={16} /> Back to Admin Dashboard
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
