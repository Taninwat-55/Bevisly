import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import {
  Bell,
  LogOut,
  ChevronRight,
  LayoutDashboard,
  Briefcase,
  FileCheck,
  Settings,
  ArrowLeft,
  ArrowRight,
  Plus,
  ChevronDown,
  Layers,
  Search,
  Inbox,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getEmployerJobs, getEmployerSubmissionsWithFeedback } from "@/lib/api";
import type { EmployerJob, EmployerSubmission } from "@/types";
import ContactModal from "@/components/common/ContactModal";
import FeedbackButton from "@/components/common/FeedbackButton";

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
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [submissions, setSubmissions] = useState<EmployerSubmission[]>([]);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const selectedJobId = searchParams.get("jobId");
  const selectedJob = jobs.find(j => j.id === selectedJobId);

  useEffect(() => {
    if (user?.role === "employer" && user?.id) {
        Promise.all([
            getEmployerJobs(user.id),
            getEmployerSubmissionsWithFeedback(user.id)
        ]).then(([jobsData, subsData]) => {
            setJobs(jobsData);
            setSubmissions(subsData);
        }).catch(console.error);
    }
  }, [user?.role, user?.id]);
  
  const needsReviewCount = submissions.filter(s => 
    s.status === 'submitted' && (!s.feedback || s.feedback.length === 0)
  ).length;

  const handleSignOut = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await signOut();
      navigate("/");
    }
  };

  // Determine role-based links
  const role = user?.role || "candidate";

  // "Settings" removed from main nav links array
  const links =
    role === "employer"
      ? [
          { label: "Dashboard", path: "/employer", icon: LayoutDashboard },
          { label: "Action Items", path: "/employer/inbox", icon: Inbox, badge: needsReviewCount },
          { label: "All Candidates", path: "/employer/candidates", icon: Users },
        ]
      : role === "admin"
        ? [
            { label: "Overview", path: "/admin", icon: LayoutDashboard },
            { label: "Data Viewer", path: "/admin/data", icon: FileCheck },
          ]
        : [
            { label: "Dashboard", path: "/candidate", icon: LayoutDashboard },
            { label: "Find Jobs", path: "/candidate/jobs", icon: Briefcase },
            { label: "My Proofs", path: "/candidate/proofs", icon: FileCheck },
          ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors duration-300">
      {/* ── SIDEBAR (Glass Panel) ────────────────────────────── */}
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] flex items-center justify-center text-white font-bold text-lg shadow-glow-primary shrink-0">
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
          
          {/* ── GLOBAL CONTEXT SWITCHER (Employer Only) ─────────── */}
          {role === "employer" && (
            <div className={`px-4 py-4 relative ${!isSidebarOpen ? "flex justify-center" : ""}`}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`
                  flex items-center gap-2.5 transition-all duration-300 group
                  ${isSidebarOpen 
                    ? "w-full px-3 py-2.5 bg-[var(--color-surface-hover)]/50 hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)]/50 rounded-xl shadow-sm" 
                    : "w-11 h-11 justify-center bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] rounded-xl hover:scale-105"
                  }
                `}
                title={selectedJob ? `Viewing: ${selectedJob.title}` : "Context: All Jobs"}
              >
                <div className={`shrink-0 flex items-center justify-center ${isSidebarOpen ? "w-7 h-7 rounded-lg bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]" : ""}`}>
                   <Layers size={isSidebarOpen ? 16 : 20} />
                </div>
                
                {isSidebarOpen && (
                  <>
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest leading-none mb-1">Context</p>
                      <p className="text-sm font-semibold text-[var(--color-text)] truncate leading-tight">
                        {selectedJob?.title || "Overview (All Jobs)"}
                      </p>
                    </div>
                    <ChevronDown 
                      size={14} 
                      className={`text-[var(--color-text-muted)] transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} 
                    />
                  </>
                )}
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && isSidebarOpen && (
                  <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-4 right-4 mt-2 z-50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                    >
                      <div className="p-2 border-b border-[var(--color-border)]/50 bg-[var(--color-surface-hover)]/30">
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                          <input 
                            type="text"
                            placeholder="Find a job..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs bg-transparent border-0 focus:ring-0 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      
                      <div className="max-h-[320px] overflow-y-auto p-1.5 custom-scrollbar">
                        <button
                          onClick={() => {
                            setSearchParams({});
                            setIsDropdownOpen(false);
                            if (location.pathname !== "/employer") navigate("/employer");
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors mb-1
                            ${!selectedJobId ? "bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] font-semibold" : "text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"}
                          `}
                        >
                          <Layers size={14} />
                          <span className="text-sm">Overview (All Jobs)</span>
                        </button>
                        
                        <div className="px-3 py-2 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Active Jobs</div>
                        
                        {jobs.filter(j => j.status === 'active' && j.title.toLowerCase().includes(searchQuery.toLowerCase())).map(job => (
                          <button
                            key={job.id}
                            onClick={() => {
                              setSearchParams({ jobId: job.id });
                              setIsDropdownOpen(false);
                              if (location.pathname !== "/employer") navigate("/employer");
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors mb-1
                              ${selectedJobId === job.id ? "bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] font-semibold" : "text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"}
                            `}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-sm truncate">{job.title}</span>
                          </button>
                        ))}
                        
                        {jobs.filter(j => j.status !== 'active' && j.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                          <>
                            <div className="px-3 py-2 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mt-2">Inactive</div>
                            {jobs.filter(j => j.status !== 'active' && j.title.toLowerCase().includes(searchQuery.toLowerCase())).map(job => (
                              <button
                                key={job.id}
                                onClick={() => {
                                  setSearchParams({ jobId: job.id });
                                  setIsDropdownOpen(false);
                                  if (location.pathname !== "/employer") navigate("/employer");
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors opacity-60 hover:opacity-100
                                  ${selectedJobId === job.id ? "bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] font-semibold" : "text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"}
                                `}
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                <span className="text-sm truncate">{job.title}</span>
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Primary Action (Employer only) */}
          {role === "employer" && (
            <div className="px-4 py-4 mb-2">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/employer?post=true")}
                className={`
                                relative flex items-center justify-center gap-2 rounded-xl
                                bg-gradient-to-br from-indigo-600 to-blue-500
                                text-white font-bold tracking-tight
                                transition-all duration-300 group overflow-hidden
                                ${!isSidebarOpen ? "w-12 h-12" : "w-full py-3.5"}
                            `}
                title="Post a new job"
              >
                {/* Animated Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                <Plus
                  size={isSidebarOpen ? 18 : 22}
                  strokeWidth={3}
                  className="relative z-10"
                />

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

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative
                  ${
                    isActive
                      ? "text-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10 font-semibold shadow-sm"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
                  }
                  ${!isSidebarOpen ? "justify-center" : ""}
                `}
                >
                  <Icon
                    size={isSidebarOpen ? 20 : 24}
                    className={`shrink-0 ${isActive ? "text-[var(--color-brand-primary)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]"}`}
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
                    <div className={`
                      flex items-center justify-center rounded-full bg-red-500 text-white font-bold
                      ${isSidebarOpen ? "px-2 py-0.5 text-[10px] min-w-[20px]" : "absolute top-2 right-2 w-4 h-4 text-[8px]"}
                    `}>
                      {link.badge}
                    </div>
                  )}

                  {/* Active Indicator Strip */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-[var(--color-brand-primary)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Footer (Now includes Settings) */}
          <div className="p-4 border-t border-[var(--color-border)]/50 bg-[var(--color-surface-hover)]/30">
            <div
              className={`flex items-center ${isSidebarOpen ? "gap-3" : "justify-center"}`}
            >
              <Link
                to={`/${role}/settings`}
                className={`flex items-center gap-3 group overflow-hidden ${!isSidebarOpen ? "justify-center" : "flex-1"}`}
                title="Account Settings"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center border border-[var(--color-border)] shrink-0 group-hover:border-[var(--color-brand-primary)] transition-all shadow-sm group-hover:shadow-glow-primary/20">
                  <span className="font-semibold text-[var(--color-text)]">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt="User"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      user?.company_name?.[0]?.toUpperCase() ||
                      user?.full_name?.[0]?.toUpperCase() ||
                      user?.email?.[0].toUpperCase()
                    )}
                  </span>
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
                            Candidate
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </Link>

              {isSidebarOpen && (
                <div className="flex items-center gap-0.5">
                  <Link
                    to={`/${role}/settings`}
                    className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/10 rounded-lg transition-all"
                    title="Settings"
                  >
                    <Settings size={18} />
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Sign Out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Toggle Button (Floating on Edge) */}
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

        {/* Header */}
        <header className="h-16 md:h-20 glass-panel border-b border-[var(--glass-border)] sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-4">
            {/* Logo (Visible on mobile where sidebar is hidden, or when showSidebar is false) */}
            <Link
              to="/"
              className={`flex items-center gap-2 mr-4 ${showSidebar ? "md:hidden" : ""}`}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] flex items-center justify-center text-white font-bold text-sm shadow-glow-primary shrink-0">
                B
              </div>
              <span className="text-lg font-bold font-display text-[var(--color-text)] tracking-tight">
                Bevisly
              </span>
            </Link>

            {/* Breadcrumbs */}
            <div className="hidden md:flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <span className="capitalize">{role}</span>
              <ChevronRight size={14} />
              <span className="font-medium text-[var(--color-text)] capitalize">
                {(() => {
                  const segments = location.pathname.split("/").filter(Boolean);
                  const last = segments.at(-1) ?? "";
                  const prev = segments.at(-2) ?? "";
                  const isUUID = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(last);
                  if (isUUID) {
                    const labels: Record<string, string> = {
                      job: "Job Details",
                      proof: "Proof Workspace",
                    };
                    return labels[prev] ?? "Details";
                  }
                  return last.replace(/-/g, " ") || "Dashboard";
                })()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="relative p-2 rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--color-brand-secondary)] border border-[var(--color-surface)]" />
            </button>
            <Button
              size="sm"
              variant="outline"
              className="hidden sm:flex"
              onClick={() => setIsContactOpen(true)}
            >
              Help & Support
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main
          className={`flex-1 overflow-x-hidden ${fullWidth ? "p-0" : "p-4 md:p-8"}`}
        >
          <div
            className={`animate-fade-in-up ${fullWidth ? "h-full" : "max-w-7xl mx-auto"}`}
          >
            {children}
          </div>
        </main>
      </div>

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
      <FeedbackButton />
    </div>
  );
}
