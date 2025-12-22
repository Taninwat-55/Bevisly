import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon, Menu, X, Home } from "lucide-react";
import UserMenu from "@/components/ui/UserMenu";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);

  /* 🌐 Global navigation links */
  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Jobs", to: "/jobs" },
    { label: "Leaderboard", to: "/leaderboard" },
    { label: "Learn", to: "/learn-more" },
    { label: "About", to: "/about" },
  ];

  /* 🧭 Append Dashboard link for logged-in users */
  if (user) {
    const storedUser = JSON.parse(localStorage.getItem("bevisly_user") || "{}");
    const role = localStorage.getItem("overrideRole") || storedUser?.role;

    navLinks.splice(1, 0, {
      label: "Overview",
      to:
        role === "admin"
          ? "/admin"
          : role === "employer"
            ? "/employer"
            : "/candidate",
    });
  }

  /* 🧭 Go to dashboard based on role */
  const goToDashboard = () => {
    const storedUser = JSON.parse(localStorage.getItem("bevisly_user") || "{}");
    const role = localStorage.getItem("overrideRole") || storedUser?.role;
    if (role === "admin") navigate("/admin");
    else if (role === "employer") navigate("/employer");
    else navigate("/candidate");
  };

  return (
    <header
      className="sticky top-0 z-40 border-b border-[var(--color-border)] 
                 bg-[var(--color-surface)] backdrop-blur-md 
                 shadow-[var(--shadow-soft)] transition-[background,border,color] duration-300"
    >
      <div className="flex items-center justify-between px-6 py-3">
        {/* ─── Left: Logo + Mobile toggle ─── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-[var(--color-candidate-dark)]"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div
            onClick={() => (user ? goToDashboard() : navigate("/"))}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <img src="/logo.png" alt="Bevisly" className="h-8 w-auto" />
            <span className="text-lg font-semibold text-[var(--color-candidate-dark)]">Bevisly</span>
          </div>
        </div>

        {/* ─── Center: Main Nav Links ─── */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--color-text-muted)]">
          {navLinks.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className={`hover:text-[var(--color-text)] transition-colors ${location.pathname === to
                  ? "text-[var(--color-text)] font-semibold"
                  : ""
                }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ─── Right: Theme + Auth/User ─── */}
        <div className="flex items-center gap-5">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-candidate-dark)] transition"
            title="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Auth-dependent content */}
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
            <UserMenu />
          )}
        </div>
      </div>

      {/* ─── Mobile Drawer ─── */}
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
