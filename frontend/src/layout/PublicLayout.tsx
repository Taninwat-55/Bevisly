import Navbar from "@/components/Navbar";
import LandingFooter from "@/components/landing/LandingFooter";
import ScrollToTop from "@/components/common/ScrollToTop";
import FeedbackButton from "@/components/common/FeedbackButton";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CookieConsent from "@/components/common/CookieConsent";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] transition-colors">
      <Navbar />
      <ScrollToTop />

      {/* Animated route outlet */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex-1 pt-16"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <CookieConsent />
      <LandingFooter />
      <FeedbackButton />
    </div>
  );
}
