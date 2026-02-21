import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon, Menu, X, Home } from "lucide-react";
import UserMenu from "@/components/common/UserMenu";
import { Button } from "@/components/ui/Button";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  /* Go to dashboard based on role */
  const goToDashboard = () => {
    if (!user) return navigate("/auth");
    if (user.role === "employer") return navigate("/employer/dashboard");
    if (user.role === "admin") return navigate("/admin");
    return navigate("/candidate");
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 border-b ${
        scrolled || location.pathname !== "/"
          ? "bg-[var(--color-bg)]/80 backdrop-blur-md border-[var(--color-border)]"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* ─── Left: Logo + Mobile toggle ─── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-[var(--color-text)]"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] flex items-center justify-center text-white font-bold text-lg">
              B
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-[var(--color-text)]">
              Bevisly
            </span>
          </div>
        </div>

        {/* ─── Center: Main Nav Links ─── */}
        <nav className="hidden md:flex items-center justify-center gap-8 flex-1">
          <a href="/#features" className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Features</a>
          <a href="/#employers" className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">For Employers</a>
          <a href="/#candidates" className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">For Candidates</a>
          <a href="/#pricing" className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Pricing</a>
        </nav>

        {/* ─── Right: Theme + Auth/User ─── */}
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
            title="Toggle Theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Auth-dependent content */}
          {!user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  Log in
              </Button>
              <Button size="sm" className="shadow-glow-primary" onClick={() => navigate("/auth?mode=signup")}>
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
          <nav className="flex flex-col px-6 py-4 text-sm gap-2">
            
            <a href="/#features" onClick={() => setMobileOpen(false)} className="py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Features</a>
            <a href="/#employers" onClick={() => setMobileOpen(false)} className="py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">For Employers</a>
            <a href="/#candidates" onClick={() => setMobileOpen(false)} className="py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">For Candidates</a>
            <a href="/#pricing" onClick={() => setMobileOpen(false)} className="py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Pricing</a>

            {user && (
              <button
                onClick={() => {
                  goToDashboard();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 py-2 text-[var(--color-brand-primary)] font-medium"
              >
                <Home size={16} /> My Dashboard
              </button>
            )}

            <button
              onClick={() => {
                toggleTheme();
                setMobileOpen(false);
              }}
              className="flex items-center gap-2 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />} Toggle Theme
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
