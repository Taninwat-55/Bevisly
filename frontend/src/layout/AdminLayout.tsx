// src/layout/AdminLayout.tsx
import Sidebar from "@/components/Sidebar";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors">
      {/* 🧭 Sidebar */}
      <Sidebar role="admin" />

      {/* 🧩 Main Content Area */}
      <div className="flex-1 flex flex-col border-l border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
        {/* Inner scroll area */}
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex-1 overflow-y-auto px-6 md:px-10 py-12"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
