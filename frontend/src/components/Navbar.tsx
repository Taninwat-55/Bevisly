import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, Home } from "lucide-react";
import UserMenu from "@/components/common/UserMenu";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const landingLinks = [
  { label: "Features", href: "#features" },
  { label: "For Employers", href: "#employers" },
  { label: "For Candidates", href: "#candidates" },
  { label: "Pricing", href: "#pricing" },
];

const publicLinks = [
  { label: "Browse Jobs", to: "/jobs" },
  { label: "Leaderboard", to: "/leaderboard" },
  { label: "About", to: "/about" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isLanding = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const goToDashboard = () => {
    if (!user) return navigate("/auth");
    if (user.role === "employer") return navigate("/employer");
    if (user.role === "admin" || user.role === "demo_admin") return navigate("/admin");
    return navigate("/candidate");
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 border-b ${
        scrolled || !isLanding
          ? "bg-[var(--color-bg)]/80 backdrop-blur-md border-[var(--color-border)]"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* ─── Left: Logo ─── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-[var(--color-text)]"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {isLanding ? (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] flex items-center justify-center text-white font-bold text-lg">
                B
              </div>
              <span className="text-xl font-bold font-display tracking-tight text-[var(--color-text)]">
                Bevisly
              </span>
            </button>
          ) : (
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] flex items-center justify-center text-white font-bold text-lg">
                B
              </div>
              <span className="text-xl font-bold font-display tracking-tight text-[var(--color-text)]">
                Bevisly
              </span>
            </Link>
          )}
        </div>

        {/* ─── Center: Nav links ─── */}
        <nav className="hidden md:flex items-center justify-center gap-8 flex-1">
          {isLanding
            ? landingLinks.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  {label}
                </a>
              ))
            : publicLinks.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  {label}
                </Link>
              ))}
        </nav>

        {/* ─── Right: Theme + Auth ─── */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {!user ? (
            <>
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
              <Button
                size="sm"
                className="shadow-glow-primary"
                onClick={() => navigate("/auth?tab=signup")}
              >
                Join Beta
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" onClick={goToDashboard} className="hidden sm:flex">
                Dashboard
              </Button>
              <UserMenu />
            </>
          )}
        </div>
      </div>

      {/* ─── Mobile Drawer ─── */}
      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-[var(--color-surface)] border-t border-[var(--color-border)] md:hidden shadow-lg z-50">
          <nav className="flex flex-col px-6 py-4 text-sm gap-1">
            {isLanding
              ? landingLinks.map(({ label, href }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="py-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    {label}
                  </a>
                ))
              : publicLinks.map(({ label, to }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className="py-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
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
                className="flex items-center gap-2 py-2.5 text-[var(--color-brand-primary)] font-medium"
              >
                <Home size={16} /> My Dashboard
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
