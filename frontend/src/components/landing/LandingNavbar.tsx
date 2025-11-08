// src/components/landing/LandingNavbar.tsx
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Moon,
  Sun,
  Menu,
  X,
  UserCircle2,
  LogOut,
  Settings,
  FileText,
  Briefcase,
  Shield,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { notify } from "@/components/ui/Notify";

export default function LandingNavbar() {
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false); // mobile menu
  const [dropdownOpen, setDropdownOpen] = useState(false); // profile dropdown
  const [exploreOpen, setExploreOpen] = useState(false); // explore dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);

  const links = [
    { label: "Find Jobs", to: "/jobs" },
    { label: "Leaderboard", to: "/leaderboard" },
  ];

  const handleLogout = async () => {
    await signOut();
    notify.success("👋 You’ve been logged out");
    navigate("/");
  };

  // detect role
  const role =
    user?.role || JSON.parse(localStorage.getItem("bevis_user") || "{}")?.role;

  // close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setDropdownOpen(false);
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node))
        setExploreOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-semibold text-[var(--color-text)] tracking-tight"
        >
          Bevis
        </Link>

        {/* ─── Desktop Nav ─── */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-text-muted)]">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className="hover:text-[var(--color-text)] transition-colors"
            >
              {l.label}
            </Link>
          ))}

          {/* Explore dropdown */}
          <div className="relative" ref={exploreRef}>
            <button
              onClick={() => setExploreOpen((v) => !v)}
              className="flex items-center gap-1 hover:text-[var(--color-text)] transition-colors"
            >
              Explore <ChevronDown size={14} />
            </button>

            {exploreOpen && (
              <div className="absolute left-0 mt-2 w-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] py-2 z-50">
                <Link
                  to="/learn-more"
                  onClick={() => setExploreOpen(false)}
                  className="block px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover-bg-soft transition"
                >
                  Learn More
                </Link>
                <Link
                  to="/about"
                  onClick={() => setExploreOpen(false)}
                  className="block px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover-bg-soft transition"
                >
                  About
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* ─── Desktop Actions ─── */}
        <div className="hidden md:flex items-center gap-3" ref={dropdownRef}>
          <button
            onClick={toggleTheme}
            title={isDark ? "Light mode" : "Dark mode"}
            className="rounded-lg p-2 hover-bg-soft"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {!user ? (
            <>
              <Link
                to="/auth"
                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
              >
                Log in
              </Link>
              <Link
                to="/auth"
                className="text-sm rounded-[var(--radius-button)] bg-[var(--color-employer)] text-white px-4 py-2 hover:brightness-110 transition"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
              >
                <UserCircle2 size={22} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-12 right-6 w-52 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] py-2 transition-colors">
                  <p className="px-4 py-2 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] truncate">
                    {user.email}
                  </p>

                  {role === "candidate" && (
                    <>
                      <button
                        onClick={() => navigate("/candidate/profile")}
                        className="w-full text-left px-4 py-2 text-sm text-[var(--color-text)] flex items-center gap-2 hover-bg-soft"
                      >
                        <UserCircle2 size={16} /> My Profile
                      </button>
                      <button
                        onClick={() => navigate("/candidate/proofs")}
                        className="w-full text-left px-4 py-2 text-sm text-[var(--color-text)] flex items-center gap-2 hover-bg-soft"
                      >
                        <FileText size={16} /> My Proofs
                      </button>
                    </>
                  )}

                  {role === "employer" && (
                    <>
                      <button
                        onClick={() => navigate("/employer")}
                        className="w-full text-left px-4 py-2 text-sm text-[var(--color-text)] flex items-center gap-2 hover-bg-soft"
                      >
                        <Briefcase size={16} /> My Jobs
                      </button>
                      <button
                        onClick={() => navigate("/employer/submissions")}
                        className="w-full text-left px-4 py-2 text-sm text-[var(--color-text)] flex items-center gap-2 hover-bg-soft"
                      >
                        <FileText size={16} /> Submissions
                      </button>
                    </>
                  )}

                  {role === "admin" && (
                    <button
                      onClick={() => navigate("/admin")}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--color-text)] flex items-center gap-2 hover-bg-soft"
                    >
                      <Shield size={16} /> Admin Dashboard
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/${role}/settings`)}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--color-text)] flex items-center gap-2 hover-bg-soft"
                  >
                    <Settings size={16} /> Settings
                  </button>

                  <div className="border-t border-[var(--color-border)] my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--color-error)] flex items-center gap-2 hover:bg-[color-mix(in srgb, var(--color-text-muted) 6%, transparent)]"
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ─── Mobile Toggle ─── */}
        <button
          className="md:hidden rounded-lg p-2 text-[var(--color-text)]"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ─── Mobile Drawer ─── */}
      {open && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <nav className="flex flex-col px-6 py-4 text-sm">
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                {l.label}
              </Link>
            ))}

            {/* Explore in mobile drawer */}
            <details className="mt-2">
              <summary className="py-2 cursor-pointer text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                Explore
              </summary>
              <div className="pl-4 flex flex-col gap-1">
                <Link
                  to="/learn-more"
                  onClick={() => setOpen(false)}
                  className="py-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
                >
                  Learn More
                </Link>
                <Link
                  to="/about"
                  onClick={() => setOpen(false)}
                  className="py-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
                >
                  About
                </Link>
              </div>
            </details>

            {/* Existing mobile auth/profile section below */}
            {/* ... (keep your existing mobile auth or profile logic) */}
          </nav>
        </div>
      )}
    </header>
  );
}
