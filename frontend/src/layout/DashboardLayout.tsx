import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import {
    Bell, LogOut, ChevronRight,
    LayoutDashboard, Briefcase, FileCheck, Settings,
    ArrowLeft, ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import ContactModal from "@/components/common/ContactModal";

interface DashboardLayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
    fullWidth?: boolean;
}

export default function DashboardLayout({ children, showSidebar = true, fullWidth = false }: DashboardLayoutProps) {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const { user, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        if (confirm("Are you sure you want to log out?")) {
            await signOut();
            navigate("/");
        }
    };

    // Determine role-based links
    const role = user?.role || "candidate";

    // "Settings" removed from main nav links array
    const links = role === "employer" ? [
        { label: "Dashboard", path: "/employer", icon: LayoutDashboard },
    ] : role === "admin" ? [
        { label: "Overview", path: "/admin", icon: LayoutDashboard },
        { label: "Data Viewer", path: "/admin/data", icon: FileCheck },
    ] : [
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
                className="fixed inset-y-0 left-0 z-40 flex flex-col glass-panel border-r border-[var(--glass-border)] transition-all duration-300 backdrop-blur-xl"
            >
                {/* Brand */}
                <Link to="/" className={`h-20 flex items-center ${isSidebarOpen ? "px-8" : "justify-center"} border-b border-[var(--color-border)]/50 hover:bg-[var(--color-surface-hover)] transition-colors`}>
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
                  ${isActive
                                        ? "text-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10 font-semibold shadow-sm"
                                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
                                    }
                  ${!isSidebarOpen ? "justify-center" : ""}
                `}
                            >
                                <Icon size={isSidebarOpen ? 20 : 24} className={`shrink-0 ${isActive ? "text-[var(--color-brand-primary)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]"}`} />

                                {isSidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="whitespace-nowrap"
                                    >
                                        {link.label}
                                    </motion.span>
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
                    <div className={`flex items-center ${isSidebarOpen ? "gap-3" : "justify-center"}`}>
                        <Link 
                            to={`/${role}/settings`}
                            className={`flex items-center gap-3 group overflow-hidden ${!isSidebarOpen ? "justify-center" : "flex-1"}`}
                            title="Account Settings"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center border border-[var(--color-border)] shrink-0 group-hover:border-[var(--color-brand-primary)] transition-all shadow-sm group-hover:shadow-glow-primary/20">
                                <span className="font-semibold text-[var(--color-text)]">
                                    {user?.avatar_url ? (
                                        <img src={user.avatar_url} alt="User" className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        (
                                            user?.company_name?.[0]?.toUpperCase() ||
                                            user?.full_name?.[0]?.toUpperCase() ||
                                            user?.email?.[0].toUpperCase()
                                        )
                                    )}
                                </span>
                            </div>

                            {isSidebarOpen && (
                                <div className="overflow-hidden text-left">
                                    {role === "employer" && user?.company_name ? (
                                        <>
                                            <p className="text-sm font-semibold text-[var(--color-text)] truncate group-hover:text-[var(--color-brand-primary)] transition-colors">{user.company_name}</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate uppercase tracking-wider">{user.full_name || "Employer"}</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm font-semibold text-[var(--color-text)] truncate group-hover:text-[var(--color-brand-primary)] transition-colors">{user?.full_name || user?.email}</p>
                                            {user?.full_name && <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate uppercase tracking-wider">Candidate</p>}
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
                        {isSidebarOpen ? <ArrowLeft size={14} strokeWidth={2.5} /> : <ArrowRight size={14} strokeWidth={2.5} />}
                    </button>
                )}
            </motion.aside>
            )}

            {/* ── MAIN CONTENT ───────────────────────────── */}
            <div
                className="flex-1 flex flex-col transition-all duration-300 min-h-screen"
                style={{ marginLeft: showSidebar ? (isSidebarOpen ? 280 : 80) : 0 }}
            >

                {/* Header */}
                <header className="h-20 glass-panel border-b border-[var(--glass-border)] sticky top-0 z-30 px-8 flex items-center justify-between backdrop-blur-md">
                    <div className="flex items-center gap-4">

                        {/* Logo (Visible when sidebar is hidden) */}
                        {!showSidebar && (
                            <Link to="/" className="flex items-center gap-2 mr-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] flex items-center justify-center text-white font-bold text-sm shadow-glow-primary shrink-0">
                                    B
                                </div>
                                <span className="text-lg font-bold font-display text-[var(--color-text)] tracking-tight">
                                    Bevisly
                                </span>
                            </Link>
                        )}

                        {/* Breadcrumbs (Mock) */}
                        <div className="hidden md:flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                            <span className="capitalize">{role}</span>
                            <ChevronRight size={14} />
                            <span className="font-medium text-[var(--color-text)]">
                                {location.pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button className="relative p-2 rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--color-brand-secondary)] border border-[var(--color-surface)]" />
                        </button>
                        <Button size="sm" variant="outline" className="hidden sm:flex" onClick={() => setIsContactOpen(true)}>
                            Help & Support
                        </Button>
                    </div>
                </header>

                {/* Content Area */}
                <main className={`flex-1 overflow-x-hidden ${fullWidth ? 'p-0' : 'p-8'}`}>
                    <div className={`animate-fade-in-up ${fullWidth ? 'h-full' : 'max-w-7xl mx-auto'}`}>
                        {children}
                    </div>
                </main>
            </div>

            <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
        </div>
    );
}
