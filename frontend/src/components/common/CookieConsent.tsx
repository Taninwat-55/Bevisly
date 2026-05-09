import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("bevisly_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("bevisly_cookie_consent", "true");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-[100]"
        >
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg rounded-xl p-6 flex flex-col md:flex-row gap-5">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-subtle)] border border-[var(--color-brand-subtle-border)] flex items-center justify-center text-[var(--color-brand-primary)] shrink-0">
              <ShieldCheck size={24} />
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[var(--color-text)] tracking-tight">
                  Privacy & Data
                </h4>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  We use essential cookies to keep your session secure. No third-party trackers or invasive ads. Ever.
                  <Link to="/privacy" className="ml-1 text-blue-500 hover:underline font-medium">Read Policy</Link>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={accept}
                  className="px-6 py-2.5 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={() => { localStorage.setItem("bevisly_cookie_consent", "dismissed"); setVisible(false); }}
                  className="px-4 py-2.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>

            <button
              onClick={() => { localStorage.setItem("bevisly_cookie_consent", "dismissed"); setVisible(false); }}
              className="absolute top-4 right-4 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}