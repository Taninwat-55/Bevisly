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
          <div className="glass-panel overflow-hidden relative border border-white/10 dark:border-white/5 shadow-2xl backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 rounded-3xl p-6 flex flex-col md:flex-row gap-5">
            {/* Ambient Background Glow */}
            <div className="absolute top-[-50%] left-[-20%] w-32 h-32 bg-blue-500/20 rounded-full blur-[40px] pointer-events-none" />
            
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-teal-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 shadow-inner">
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
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  Accept All
                </button>
                <button
                  onClick={() => setVisible(false)}
                  className="px-4 py-2.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>

            <button 
              onClick={() => setVisible(false)}
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