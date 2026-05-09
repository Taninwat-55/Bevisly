import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Outlet, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import FeedbackButton from "@/components/common/FeedbackButton";
import { Menu } from "lucide-react";

export default function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors">
      {/* Sidebar (desktop) + mobile drawer */}
      <Sidebar
        role="admin"
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col border-l border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-40 flex items-center gap-3 px-4 h-14 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-brand-primary)] flex items-center justify-center text-white font-bold text-base">
              B
            </div>
            <span className="text-lg font-bold font-display tracking-tight text-[var(--color-text)]">
              Bevisly
            </span>
          </Link>
          <span className="ml-auto text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
            Admin
          </span>
        </div>

        {/* Inner scroll area */}
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex-1 overflow-y-auto px-6 md:px-10 py-8 md:py-12"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
      <FeedbackButton />
    </div>
  );
}
