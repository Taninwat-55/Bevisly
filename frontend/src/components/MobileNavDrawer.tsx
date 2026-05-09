import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Plus, Settings, X, Shield, Crown, Zap, Briefcase } from "lucide-react";
import type { SessionUser } from "@/context/AuthContext";

export interface MobileNavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
  featured?: boolean;
}

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  links: MobileNavItem[];
  user: SessionUser | null;
  role: "candidate" | "employer" | "admin" | "demo_admin";
  onSignOut: () => void;
}

export default function MobileNavDrawer({
  open,
  onClose,
  links,
  user,
  role,
  onSignOut,
}: MobileNavDrawerProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close drawer when route changes
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer panel */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 w-[85%] max-w-[320px] bg-[var(--color-surface)] border-r border-[var(--color-border)] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--color-border)]/60">
              <Link to="/" onClick={onClose} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-primary)] flex items-center justify-center text-white font-bold text-sm">
                  B
                </div>
                <span className="text-lg font-bold font-display tracking-tight text-[var(--color-text)]">
                  Bevisly
                </span>
              </Link>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Post Job CTA (employer only) */}
            {role === "employer" && (
              <div className="px-4 pt-4">
                <button
                  onClick={() => {
                    navigate("/employer?post=true");
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white font-bold tracking-tight"
                >
                  <Plus size={18} strokeWidth={3} />
                  Post Job
                </button>
              </div>
            )}

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]"
                        : "text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                  >
                    <Icon size={20} className="shrink-0" />
                    <span className="flex-1">{link.label}</span>
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white min-w-[20px] text-center">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--color-border)]/60 bg-[var(--color-surface-hover)]/40">
              <Link
                to={`/${role}/settings`}
                onClick={onClose}
                className="flex items-center gap-3 mb-3 group"
              >
              <div className="relative shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all shadow-sm overflow-hidden
                  ${(user?.original_role === "admin" || user?.original_role === "demo_admin" || user?.role === "admin" || user?.role === "demo_admin")
                    ? "border-purple-400 dark:border-purple-500 shadow-purple-500/20"
                    : (user?.subscription_tier === "growth" || user?.subscription_tier === "pro_saas")
                    ? "border-amber-400 dark:border-amber-500 shadow-amber-500/20"
                    : user?.subscription_tier === "plus"
                    ? "border-emerald-400 dark:border-emerald-500 shadow-emerald-500/20"
                    : user?.subscription_tier === "starter"
                    ? "border-blue-400 dark:border-blue-500 shadow-blue-500/20"
                    : "border-[var(--color-border)] bg-[var(--color-surface-hover)]"
                  }
                `}>
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-semibold text-[var(--color-text)] text-sm">
                      {user?.company_name?.[0]?.toUpperCase() ||
                        user?.full_name?.[0]?.toUpperCase() ||
                        user?.email?.[0]?.toUpperCase()}
                    </span>
                  )}
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
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--color-text)] truncate group-hover:text-[var(--color-brand-primary)] transition-colors">
                    {role === "employer" && user?.company_name
                      ? user.company_name
                      : user?.full_name || user?.email}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)] truncate uppercase tracking-wider">
                    {role}
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-2">
                <Link
                  to={`/${role}/settings`}
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <Settings size={16} />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    onClose();
                    onSignOut();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-red-500/30 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
