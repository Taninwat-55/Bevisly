import { Link } from "react-router-dom";
import { useState } from "react";
import ContactModal from "@/components/common/ContactModal";

export default function LandingFooter() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <footer className="bg-[var(--color-bg)] border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] flex items-center justify-center text-white font-bold text-sm">
                B
              </div>
              <span className="text-base font-bold font-display tracking-tight text-[var(--color-text)]">
                Bevisly
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] max-w-xs leading-relaxed mb-4">
              The proof-first hiring platform. Candidates prove skills. Employers review real work.
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              © {new Date().getFullYear()} Bevisly. All rights reserved.
            </p>
          </div>

          {/* Platform column */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-4">
              Platform
            </p>
            <nav className="flex flex-col gap-3 text-sm">
              <Link to="/jobs" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                Browse Jobs
              </Link>
              <Link to="/pricing" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                Pricing
              </Link>
              <Link to="/leaderboard" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                Leaderboard
              </Link>
              <Link to="/docs" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                Docs & Help
              </Link>
            </nav>
          </div>

          {/* Audience column */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-4">
              Learn More
            </p>
            <nav className="flex flex-col gap-3 text-sm">
              <Link to="/learn-more?mode=candidate" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                For Candidates
              </Link>
              <Link to="/learn-more?mode=employer" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                For Employers
              </Link>
              <Link to="/learn-more" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                How It Works
              </Link>
            </nav>
          </div>

          {/* Company column */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-4">
              Company
            </p>
            <nav className="flex flex-col gap-3 text-sm">
              <Link to="/about" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                About
              </Link>
              <button
                onClick={() => setIsContactOpen(true)}
                className="text-left text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                Contact
              </button>
              <Link to="/privacy" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                Privacy
              </Link>
            </nav>
          </div>

        </div>
      </footer>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  );
}
