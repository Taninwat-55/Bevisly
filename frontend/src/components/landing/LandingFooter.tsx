export default function LandingFooter() {
  return (
    <footer className="bg-[var(--color-bg)] border-t border-[var(--color-border)] py-10">
      <div className="mx-auto max-w-7xl px-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* 💬 Brand statement */}
        <div className="text-sm text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} Bevis. Built for fairness — where real work replaces résumés.
        </div>

        {/* 🌐 Footer nav */}
        <nav
          className="flex flex-wrap justify-center gap-4 text-sm"
          aria-label="Footer navigation"
        >
          <a
            href="#about"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            About
          </a>
          <a
            href="#how-it-works"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            How It Works
          </a>
          <a
            href="#jobs"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            Jobs
          </a>
          <a
            href="mailto:hello@bevis.test"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}