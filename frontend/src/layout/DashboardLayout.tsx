import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import {
    Menu, X, Bell, LogOut, ChevronRight, User,
    LayoutDashboard, Briefcase, FileCheck, Settings,
    Users, CreditCard, UserCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const { user, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

    // Determine role-based links
    const role = user?.role || "candidate";

    const links = role === "employer" ? [
        { label: "Dashboard", path: "/employer", icon: LayoutDashboard },
        { label: "Create Job", path: "/employer/jobs/new", icon: Briefcase },
        { label: "Talent Pool", path: "/employer/talent", icon: Users },
        { label: "Talent Manager", path: "/employer/talent/manage", icon: UserCheck },
        { label: "Submissions", path: "/employer/submissions", icon: FileCheck },
        { label: "Settings", path: "/employer/settings", icon: Settings },
    ] : role === "admin" ? [
        { label: "Overview", path: "/admin", icon: LayoutDashboard },
        { label: "Data Viewer", path: "/admin/data", icon: FileCheck },
    ] : [
        { label: "Dashboard", path: "/candidate", icon: LayoutDashboard },
        { label: "Find Jobs", path: "/candidate/jobs", icon: Briefcase },
        { label: "My Profile", path: "/candidate/profile", icon: User },
        { label: "My Proofs", path: "/candidate/proofs", icon: FileCheck },
        { label: "Credits", path: "/candidate/credits", icon: CreditCard },
        { label: "Settings", path: "/candidate/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[var(--color-bg)] transition-colors duration-300">

            {/* ── SIDEBAR (Glass Panel) ────────────────────────────── */}
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
                <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
                    {links.map((link) => {
                        const isActive = location.pathname === link.path;
                        const Icon = link.icon;

                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                  ${isActive
                                        ? "text-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10 font-semibold shadow-sm"
                                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
                                    }
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

                {/* User Footer */}
                <div className="p-4 border-t border-[var(--color-border)]/50">
                    <div className={`flex items-center ${isSidebarOpen ? "gap-3" : "justify-center"}`}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center border border-[var(--color-border)] shrink-0">
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
                            <div className="overflow-hidden">
                                {role === "employer" && user?.company_name ? (
                                    <>
                                        <p className="text-sm font-medium text-[var(--color-text)] truncate">{user.company_name}</p>
                                        <p className="text-xs text-[var(--color-text-muted)] truncate">{user.full_name || user.email}</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-[var(--color-text)] truncate">{user?.full_name || user?.email}</p>
                                        {user?.full_name && <p className="text-xs text-[var(--color-text-muted)] truncate">{user.email}</p>}
                                    </>
                                )}
                            </div>
                        )}

                        {isSidebarOpen && (
                            <button
                                onClick={handleSignOut}
                                className="ml-auto p-2 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                                title="Sign Out"
                            >
                                <LogOut size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </motion.aside>

            {/* ── MAIN CONTENT ───────────────────────────── */}
            <div
                className="flex-1 flex flex-col transition-all duration-300 min-h-screen"
                style={{ marginLeft: isSidebarOpen ? 280 : 80 }}
            >

                {/* Header */}
                <header className="h-20 glass-panel border-b border-[var(--glass-border)] sticky top-0 z-30 px-8 flex items-center justify-between backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors"
                        >
                            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

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
                        <Button size="sm" variant="outline" className="hidden sm:flex">
                            Help & Support
                        </Button>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-8 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto animate-fade-in-up">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
