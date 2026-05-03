import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X } from "lucide-react";
import UserMenu from "@/components/common/UserMenu";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Languages } from "lucide-react";

type RouteLink = { label: string; to: string; href?: never };
type AnchorLink = { label: string; href: string; to?: never };
type NavLink = RouteLink | AnchorLink;

const navLinks: NavLink[] = [
  { label: "Candidates", to: "/learn-more?mode=candidate" },
  { label: "Employers", to: "/learn-more?mode=employer" },
  { label: "Jobs", to: "/jobs" },
  { label: "About", to: "/about" },
  { label: "Pricing", to: "/pricing" },
  { label: "Docs & Help", to: "/docs" },
];

const mobileLinks: NavLink[] = navLinks;

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

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const goToDashboard = () => {
    if (!user) return navigate("/auth");
    if (user.role === "employer") return navigate("/employer");
    if (user.role === "admin" || user.role === "demo_admin") return navigate("/admin");
    return navigate("/candidate");
  };

  const closeMobile = () => setMobileOpen(false);

  const isActiveRoute = (to: string) => location.pathname === to.split("?")[0];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled || !isLanding
            ? "bg-[var(--color-bg)]/80 backdrop-blur-md h-16"
            : "bg-transparent h-20"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full grid grid-cols-3 items-center">

          {/* ─── Left: Hamburger + Logo ─── */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
              aria-label="Open menu"
            >
              <Menu size={22} />
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

          {/* ─── Center: Nav ─── */}
          <nav className="hidden md:flex justify-center items-center">
            {/* ── Floating Pill ── */}
            <div
              className={`flex items-center gap-1 px-2 py-1.5 rounded-full bg-[var(--color-surface)]/80 backdrop-blur-md border transition-all duration-300 ${
                scrolled
                  ? "border-[var(--color-border)] shadow-md"
                  : "border-[var(--color-border)]/60 shadow-sm"
              }`}
            >
              {navLinks.map((link) =>
                link.href !== undefined ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="px-4 py-2 rounded-full text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-brand-primary)]/10 transition-all duration-200"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActiveRoute(link.to)
                        ? "bg-[var(--color-brand-primary)]/15 text-[var(--color-brand-primary)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-brand-primary)]/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
          </nav>

          {/* ─── Right: Theme + Auth ─── */}
          <div className="flex justify-end items-center gap-3">
            <button
              className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
              title="Change Language (Coming Soon)"
            >
              <Languages size={20} />
            </button>
            <ThemeToggle />
            {!user ? (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="shadow-glow-primary hidden sm:flex"
                  onClick={() => navigate("/auth?tab=signup")}
                >
                  Sign Up Free
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
      </header>

      {/* ─── Mobile Full-Screen Overlay ─── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden flex flex-col">
          {/* Backdrop (also closes on tap) */}
          <div
            className="absolute inset-0 bg-[var(--color-bg)]/95 backdrop-blur-xl"
            onClick={closeMobile}
          />

          {/* Decorative orbs */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--color-brand-primary)]/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[var(--color-brand-secondary)]/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full px-8 py-6">

            {/* Top: logo + close */}
            <div className="flex items-center justify-between mb-12">
              <Link to="/" onClick={closeMobile} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] flex items-center justify-center text-white font-bold text-lg">
                  B
                </div>
                <span className="text-xl font-bold font-display tracking-tight text-[var(--color-text)]">
                  Bevisly
                </span>
              </Link>
              <button
                onClick={closeMobile}
                className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Links — large staggered */}
            <nav className="flex flex-col gap-1 flex-1">
              {mobileLinks.map((link, i) =>
                link.href !== undefined ? (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={closeMobile}
                    className="text-4xl font-bold font-display text-[var(--color-text)] hover:text-[var(--color-brand-primary)] transition-colors duration-200 py-2 animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={closeMobile}
                    className="text-4xl font-bold font-display text-[var(--color-text)] hover:text-[var(--color-brand-primary)] transition-colors duration-200 py-2 animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Bottom CTAs */}
            <div className="flex flex-col gap-3 pt-8 border-t border-[var(--color-border)]">
              {!user ? (
                <>
                  <Button
                    size="lg"
                    className="w-full shadow-glow-primary"
                    onClick={() => { navigate("/auth?tab=signup"); closeMobile(); }}
                  >
                    Sign Up Free
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => { navigate("/auth"); closeMobile(); }}
                  >
                    Sign In
                  </Button>
                </>
              ) : (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => { goToDashboard(); closeMobile(); }}
                >
                  My Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
