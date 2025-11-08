// src/components/Navbar.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { notify } from "@/components/ui/Notify";
import toast from "react-hot-toast";
import {
  Menu,
  X,
  Bell,
  LogOut,
  UserCircle2,
  Settings,
  FileText,
  Shield,
  Home,
  Moon,
  Sun,
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user, setOverride } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const storedUser = JSON.parse(localStorage.getItem("bevis_user") || "{}");
  const actualRole = storedUser?.role;
  const overrideRole = localStorage.getItem("overrideRole");
  const effectiveRole = overrideRole || actualRole;
  const isAdmin = effectiveRole === "admin";

  /* ─────────────────────────────────────────────── */
  /* 🧭 Handle Logout */
  const handleLogout = async () => {
    await signOut();
    notify.success("👋 You’ve been logged out");
    navigate("/");
  };

  /* 🔒 Role-based dashboard routing */
  const goToDashboard = () => {
    if (isAdmin) navigate("/admin");
    else if (effectiveRole === "employer") navigate("/employer");
    else navigate("/candidate");
  };

  /* ─────────────────────────────────────────────── */
  /* 🧩 Close dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ─────────────────────────────────────────────── */
  // 🌐 Global links (role-aware)
  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Find Jobs", to: "/jobs" },
    { label: "Leaderboard", to: "/leaderboard" },
  ];

  return (
    <header
      className="sticky top-0 z-40 border-b border-[var(--color-border)] 
             bg-[var(--color-surface)] backdrop-blur-md 
             shadow-[var(--shadow-soft)] transition-[background,border,color] duration-300"
    >
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: Logo + Mobile toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-[var(--color-candidate-dark)]"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <h1
            onClick={() => (user ? goToDashboard() : navigate("/"))}
            className="text-lg font-semibold text-[var(--color-candidate-dark)] cursor-pointer select-none"
          >
            Bevis
          </h1>
        </div>

        {/* Center: Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--color-text-muted)]">
          {navLinks.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className={`hover:text-[var(--color-text)] transition-colors ${
                location.pathname === to
                  ? "text-[var(--color-text)] font-semibold"
                  : ""
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right: Icons + Profile */}
        {/* Right: Actions */}
<div className="flex items-center gap-4 relative" ref={dropdownRef}>
  <button
    onClick={toggleTheme}
    className="text-[var(--color-text-muted)] hover:text-[var(--color-candidate-dark)] transition"
    title="Toggle Theme"
  >
    {isDark ? <Sun size={18} /> : <Moon size={18} />}
  </button>

  {!user ? (
    <>
      {/* 🌐 Logged-out view */}
      <Link
        to="/auth"
        className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
      >
        Log in
      </Link>
      <Link
        to="/auth?mode=signup"
        className="text-sm rounded-[var(--radius-button)] bg-[var(--color-employer)] text-white px-4 py-2 hover:brightness-110 transition"
      >
        Sign up
      </Link>
    </>
  ) : (
    <>
      {/* 👤 Logged-in view */}
      <button
        onClick={() => toast("No new notifications 📬")}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-candidate-dark)] transition"
        title="Notifications"
      >
        <Bell size={20} />
      </button>

      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-candidate-dark)] transition"
        title="Account"
      >
        <UserCircle2 size={22} />
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute top-10 right-0 w-56 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] overflow-hidden">
          <p className="px-4 py-2 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] truncate">
            {user?.email}
          </p>

          <button
            onClick={() => {
              navigate("/candidate/profile");
              setDropdownOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-[var(--color-bg-hover)] transition"
          >
            <UserCircle2 size={16} /> My Profile
          </button>

          <button
            onClick={() => {
              navigate("/candidate/proofs");
              setDropdownOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-[var(--color-bg-hover)] transition"
          >
            <FileText size={16} /> My Proofs
          </button>

          <button
            onClick={() => {
              navigate("/candidate/settings");
              setDropdownOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-[var(--color-bg-hover)] transition"
          >
            <Settings size={16} /> Settings
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                setOverride?.("admin");
                navigate("/admin");
                setDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-[var(--color-bg-hover)] transition"
            >
              <Shield size={16} /> Admin Dashboard
            </button>
          )}

          <div className="border-t border-[var(--color-border)] my-1" />

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-[var(--color-error)] flex items-center gap-2 hover:bg-[color-mix(in srgb,var(--color-error)5%,transparent)] transition"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      )}
    </>
  )}
</div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-[var(--color-surface)] border-t border-[var(--color-border)] md:hidden shadow-lg z-50">
          <nav className="flex flex-col px-6 py-4 text-sm">
            {navLinks.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                onClick={() => setMobileOpen(false)}
                className="py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                {label}
              </Link>
            ))}

            {user && (
              <button
                onClick={() => {
                  goToDashboard();
                  setMobileOpen(false);
                }}
                className="mt-2 flex items-center gap-2 text-[var(--color-candidate-dark)] font-medium"
              >
                <Home size={16} /> My Dashboard
              </button>
            )}

            <button
              onClick={() => {
                toggleTheme();
                setMobileOpen(false);
              }}
              className="mt-3 flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />} Toggle Theme
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
