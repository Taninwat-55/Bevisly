import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Moon,
  Sun,
  Menu,
  X,
  UserCircle2,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { notify } from "@/components/ui/Notify";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingNavbar() {
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
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

  // const role =
  //   user?.role || JSON.parse(localStorage.getItem("bevis_user") || "{}")?.role;

  // Close dropdowns when clicking outside
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
        {/* 🪶 Logo */}
        <Link
          to="/"
          className="text-xl font-semibold tracking-tight text-[var(--color-text)] hover:opacity-90 transition"
        >
          <span className="text-[var(--color-candidate)]">Be</span>vis
        </Link>

        {/* ─── Desktop Nav ─── */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-text-muted)]">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className={`relative transition-colors hover:text-[var(--color-text)] ${
                location.pathname === l.to ? "text-[var(--color-text)]" : ""
              }`}
            >
              {l.label}
              {location.pathname === l.to && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[var(--color-candidate)] rounded-full"
                />
              )}
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

            <AnimatePresence>
              {exploreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-2 w-44 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] py-2 z-50"
                >
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
                </motion.div>
              )}
            </AnimatePresence>
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
                to="/auth?mode=signup"
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

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-12 right-6 w-56 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] py-2 z-50"
                  >
                    <p className="px-4 py-2 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] truncate">
                      {user.email}
                    </p>
                    {/* Candidate, Employer, Admin options (same as before) */}
                    {/* ... keep your existing role buttons here ... */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--color-error)] flex items-center gap-2 hover-bg-soft"
                    >
                      <LogOut size={16} /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
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
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            <nav className="flex flex-col px-6 py-4 text-sm">
              {links.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/learn-more"
                onClick={() => setOpen(false)}
                className="py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                Learn More
              </Link>
              <Link
                to="/about"
                onClick={() => setOpen(false)}
                className="py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                About
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
