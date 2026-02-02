import { Link } from "react-router-dom";
import { useState } from "react";
import ContactModal from "@/components/common/ContactModal";

export default function LandingFooter() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <footer className="bg-[var(--color-bg)] border-t border-[var(--color-border)] py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Brand statement */}
          <div className="text-sm text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} Bevisly. Built for fairness — where real work replaces résumés.
          </div>

          {/* Footer nav */}
          <nav
            className="flex flex-wrap justify-center gap-4 text-sm"
            aria-label="Footer navigation"
          >
            <Link to="/about" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">About</Link>
            <Link to="/learn-more" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Learn More</Link>
            <Link to="/jobs" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Jobs</Link>
            <Link to="/privacy" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Privacy Policy</Link>
            <button 
              onClick={() => setIsContactOpen(true)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              Contact
            </button>
          </nav>
        </div>
      </footer>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  );
}