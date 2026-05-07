import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LogOut,
  LayoutDashboard,
  Briefcase,
  FileCheck,
  Settings,
  ArrowLeft,
  ArrowRight,
  Plus,
  Inbox,
  Users,
  HelpCircle,
  Trophy,
  UserCircle,
  Zap,
  Kanban,
  Languages,
  Menu,
  Shield,
  Crown
} from "lucide-react";
import MobileNavDrawer from "@/components/MobileNavDrawer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/hooks/useTheme";
import { getEmployerSubmissionsWithFeedback } from "@/lib/api";
import type { EmployerSubmission } from "@/types";
import ContactModal from "@/components/common/ContactModal";
import FeedbackButton from "@/components/common/FeedbackButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

// CANDIDATE & EMPLOYER SIDEBAR
// This layout owns the sidebar for /candidate and /employer routes.
// The sidebar nav links are defined in the `links` array below (~line 100).
// Admin navigation lives in a separate component: src/components/Sidebar.tsx (used by AdminLayout.tsx).
//
// TODO: consolidate into a single Sidebar component that handles all three roles.
// Tracked intent: merge Sidebar.tsx and this layout's sidebar into one component.

interface DashboardLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  fullWidth?: boolean;
}

export default function DashboardLayout({
  children,
  showSidebar = true,
  fullWidth = false,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [submissions, setSubmissions] = useState<EmployerSubmission[]>([]);
  const { user, signOut } = useAuth();
  const { setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const role = user?.role || "candidate";

  useEffect(() => {
    if (user?.role === "employer" && user?.id) {
      getEmployerSubmissionsWithFeedback(user.id)
        .then((subsData) => setSubmissions(subsData))
        .catch(console.error);
    }
  }, [user?.role, user?.id]);

  const needsReviewCount = submissions.filter(
    (s) => s.status === "submitted" && (!s.feedback || s.feedback.length === 0)
  ).length;

  // Employers default to light mode for a professional B2B appearance.
  // Only runs once per browser to avoid overriding an explicit user choice.
  useEffect(() => {
    if (role === "employer") {
      const INIT_KEY = "employer-theme-init";
      if (!localStorage.getItem(INIT_KEY)) {
        setTheme("light");
        localStorage.setItem(INIT_KEY, "true");
      }
    }
  }, [role, setTheme]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  interface NavItem {
    label: string;
    path: string;
    icon: React.ElementType;
    badge?: number;
    featured?: boolean;
  }

  const links: NavItem[] =
    role === "employer"
      ? [
          { label: "Dashboard", path: "/employer", icon: LayoutDashboard },
          { label: "Review Queue", path: "/employer/inbox", icon: Inbox, badge: needsReviewCount },
          { label: "My Jobs", path: "/employer/jobs", icon: Briefcase },
          { label: "Pipeline Board", path: "/employer/talent-board", icon: Kanban },
          { label: "Talent Directory", path: "/employer/candidates", icon: Users },
        ]
      : role === "admin"
        ? [
            { label: "Overview", path: "/admin", icon: LayoutDashboard },
            { label: "Data Viewer", path: "/admin/data", icon: FileCheck },
          ]
        : [
            { label: "Dashboard", path: "/candidate", icon: LayoutDashboard },
            { label: "Find Jobs", path: "/candidate/jobs", icon: Briefcase },
            { label: "My Proofs", path: "/candidate/proofs", icon: FileCheck, featured: true },
            { label: "Practice", path: "/candidate/practice", icon: Zap },
            { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
            {
              label: "Public Profile",
              path: user?.username ? `/@${user.username}` : `/candidate/${user?.id}`,
              icon: UserCircle,
            },
          ];

  const footerIconClass =
    "p-2 text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/10 rounded-lg transition-all";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors duration-300">
      {/* ── SIDEBAR ────────────────────────────── */}
      {showSidebar && (
        <motion.aside
          initial={false}
          animate={{ width: isSidebarOpen ? 280 : 80 }}
          className="fixed inset-y-0 left-0 z-40 hidden md:flex flex-col glass-panel border-r border-[var(--glass-border)] transition-all duration-300 backdrop-blur-xl"
        >
          {/* Brand */}
          <Link
            to="/"
            className={`h-20 flex items-center ${isSidebarOpen ? "px-8" : "justify-center"} border-b border-[var(--color-border)]/50 hover:bg-[var(--color-surface-hover)] transition-colors`}
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary)] flex items-center justify-center text-white font-bold text-lg shadow-glow-primary shrink-0">
              B
            </div>
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-3 text-xl font-bold font-display text-[var(--color-text)] tracking-tight"
              >
                Bevisly
              </motion.span>
            )}
          </Link>

          {/* Post Job (Employer only) */}
          {role === "employer" && (
            <div className="px-4 py-4 pb-0">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/employer?post=true")}
                className={`
                  relative flex items-center justify-center gap-2 rounded-xl
                  bg-[var(--color-brand-primary)] hover:bg-blue-700
                  text-white font-bold tracking-tight
                  transition-all duration-300 group overflow-hidden
                  ${!isSidebarOpen ? "w-12 h-12" : "w-full py-3.5"}
                `}
                title="Post a new job"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                <Plus size={isSidebarOpen ? 18 : 22} strokeWidth={3} className="relative z-10" />
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative z-10 whitespace-nowrap"
                  >
                    Post Job
                  </motion.span>
                )}
              </motion.button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 py-8 px-3 space-y-3 overflow-y-auto">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              const isFeatured = link.featured;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative
                  ${
                    isActive && isFeatured
                      ? "text-white bg-[var(--color-brand-primary)] font-semibold shadow-md"
                      : isActive
                      ? "text-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10 font-semibold shadow-sm"
                      : isFeatured
                      ? "text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/8 border border-transparent hover:border-[var(--color-brand-primary)]/20"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
                  }
                  ${!isSidebarOpen ? "justify-center" : ""}
                `}
                >
                  <Icon
                    size={isSidebarOpen ? 20 : 24}
                    className={`shrink-0 ${
                      isActive && isFeatured
                        ? "text-white"
                        : isActive
                        ? "text-[var(--color-brand-primary)]"
                        : isFeatured
                        ? "text-[var(--color-brand-primary)]/60 group-hover:text-[var(--color-brand-primary)]"
                        : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]"
                    }`}
                  />

                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="whitespace-nowrap flex-1"
                    >
                      {link.label}
                    </motion.span>
                  )}

                  {link.badge !== undefined && link.badge > 0 && (
                    <div
                      className={`
                      flex items-center justify-center rounded-full bg-red-500 text-white font-bold
                      ${isSidebarOpen ? "px-2 py-0.5 text-[10px] min-w-[20px]" : "absolute top-2 right-2 w-4 h-4 text-[8px]"}
                    `}
                    >
                      {link.badge}
                    </div>
                  )}

                  {isActive && !isFeatured && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-[var(--color-brand-primary)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Footer */}
          <div
            className={`p-4 border-t border-[var(--color-border)]/50 bg-[var(--color-surface-hover)]/30 flex ${
              isSidebarOpen ? "flex-row items-center gap-3" : "flex-col items-center gap-2"
            }`}
          >
            <Link
              to={`/${role}/settings`}
              className={`flex items-center gap-3 group overflow-hidden ${isSidebarOpen ? "flex-1" : ""}`}
              title="Account Settings"
            >
              <div className="relative shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all shadow-sm
                  ${(user?.original_role === "admin" || user?.original_role === "demo_admin" || user?.role === "admin" || user?.role === "demo_admin")
                    ? "border-purple-400 dark:border-purple-500 shadow-purple-500/20 group-hover:shadow-purple-500/40"
                    : (user?.subscription_tier === "growth" || user?.subscription_tier === "pro_saas")
                    ? "border-amber-400 dark:border-amber-500 shadow-amber-500/20 group-hover:shadow-amber-500/40"
                    : user?.subscription_tier === "plus"
                    ? "border-emerald-400 dark:border-emerald-500 shadow-emerald-500/20 group-hover:shadow-emerald-500/40"
                    : user?.subscription_tier === "starter"
                    ? "border-blue-400 dark:border-blue-500 shadow-blue-500/20 group-hover:shadow-blue-500/40"
                    : "border-[var(--color-border)] group-hover:border-[var(--color-brand-primary)] group-hover:shadow-glow-primary/20 bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800"
                  }
                `}>
                  <span className="font-semibold text-[var(--color-text)] flex items-center justify-center w-full h-full rounded-full overflow-hidden">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      user?.company_name?.[0]?.toUpperCase() ||
                      user?.full_name?.[0]?.toUpperCase() ||
                      user?.email?.[0]?.toUpperCase()
                    )}
                  </span>
                </div>
                {/* Badge Overlays */}
                {(user?.original_role === "admin" || user?.original_role === "demo_admin" || user?.role === "admin" || user?.role === "demo_admin") ? (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-purple-500 rounded-full border-2 border-[var(--color-surface)] flex items-center justify-center text-white" title="Admin">
                    <Shield size={8} strokeWidth={3} className="text-purple-50" />
                  </div>
                ) : (user?.subscription_tier === "growth" || user?.subscription_tier === "pro_saas") ? (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-amber-500 rounded-full border-2 border-[var(--color-surface)] flex items-center justify-center text-white" title="Growth Tier">
                    <Crown size={8} strokeWidth={3} className="text-amber-50" />
                  </div>
                ) : user?.subscription_tier === "plus" ? (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[var(--color-surface)] flex items-center justify-center text-white" title="Plus Tier">
                    <Zap size={8} strokeWidth={3} className="text-emerald-50" />
                  </div>
                ) : user?.subscription_tier === "starter" ? (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full border-2 border-[var(--color-surface)] flex items-center justify-center text-white" title="Starter Tier">
                    <Briefcase size={8} strokeWidth={3} className="text-blue-50" />
                  </div>
                ) : null}
              </div>
              {isSidebarOpen && (
                <div className="overflow-hidden text-left">
                  {role === "employer" && user?.company_name ? (
                    <>
                      <p className="text-sm font-semibold text-[var(--color-text)] truncate group-hover:text-[var(--color-brand-primary)] transition-colors">
                        {user.company_name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate uppercase tracking-wider">
                        {user.full_name || "Employer"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-[var(--color-text)] truncate group-hover:text-[var(--color-brand-primary)] transition-colors">
                        {user?.full_name || user?.email}
                      </p>
                      {user?.full_name && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate uppercase tracking-wider">
                          {role === "employer" ? "Employer" : "Candidate"}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </Link>
            <div className={`flex items-center gap-0.5 ${!isSidebarOpen ? "flex-col" : ""}`}>
              <Link to={`/${role}/settings`} className={footerIconClass} title="Settings">
                <Settings size={18} />
              </Link>
              <button
                onClick={() => setShowSignOutConfirm(true)}
                className="p-2 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Collapse Toggle */}
          {showSidebar && (
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="absolute -right-3 top-20 z-50 p-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full shadow-lg text-[var(--color-text)] hover:text-[var(--color-brand-primary)] hover:border-[var(--color-brand-primary)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center"
            >
              {isSidebarOpen ? (
                <ArrowLeft size={14} strokeWidth={2.5} />
              ) : (
                <ArrowRight size={14} strokeWidth={2.5} />
              )}
            </button>
          )}
        </motion.aside>
      )}

      {/* ── MAIN CONTENT ───────────────────────────── */}
      <div
        className="flex-1 flex flex-col transition-all duration-300 min-h-screen"
        style={{ marginLeft: showSidebar ? (isSidebarOpen ? 280 : 80) : 0 }}
      >
        {/* Mobile: zero left margin since sidebar is hidden */}
        <style>{`@media (max-width: 767px) { [style*="margin-left"] { margin-left: 0 !important; } }`}</style>

        {/* Mobile header (hamburger + logo — shown when sidebar is hidden) */}
        {showSidebar && (
          <header className="h-14 glass-panel border-b border-[var(--glass-border)] sticky top-0 z-30 px-3 flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="p-2 -ml-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-primary)] flex items-center justify-center text-white font-bold text-sm shadow-glow-primary shrink-0">
                B
              </div>
              <span className="text-lg font-bold font-display text-[var(--color-text)] tracking-tight">
                Bevisly
              </span>
            </Link>
          </header>
        )}

        {/* Content Area */}
        <main className={`flex-1 overflow-x-hidden ${fullWidth ? "p-0 pb-20 md:pb-0" : "p-4 md:p-8 pb-24 md:pb-8"}`}>
          <div className={`animate-fade-in-up ${fullWidth ? "h-full" : "max-w-7xl mx-auto"}`}>
            {children}
          </div>
        </main>
      </div>

      {/* ── Floating Pill (top-right) ─────────────── */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-1 px-2 py-1.5 rounded-full bg-[var(--color-surface)]/80 backdrop-blur-md border border-[var(--color-border)] shadow-lg">
        <button
          className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full transition-colors"
          title="Change Language (Coming Soon)"
        >
          <Languages size={17} />
        </button>
        <ThemeToggle />
        <div className="w-px h-4 bg-[var(--color-border)]" />
        <button
          onClick={() => setIsContactOpen(true)}
          className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full transition-colors"
          title="Help & Support"
        >
          <HelpCircle size={17} />
        </button>
      </div>

      {showSidebar && (
        <MobileNavDrawer
          open={isMobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          links={links}
          user={user}
          role={role}
          onSignOut={() => setShowSignOutConfirm(true)}
        />
      )}

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      <ConfirmDialog
        open={showSignOutConfirm}
        title="Sign out?"
        message="You'll be returned to the home page and will need to sign in again."
        confirmLabel="Sign Out"
        cancelLabel="Stay"
        variant="default"
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOutConfirm(false)}
      />

      <FeedbackButton />

      {showSidebar && <MobileBottomNav links={links} />}
    </div>
  );
}
