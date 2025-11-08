// src/components/landing/FinalCTASection.tsx
import { Link } from "react-router-dom";

export default function FinalCTASection() {
  return (
    <section
      id="contact"
      className="bg-[var(--color-surface)] py-20 border-t border-[var(--color-border)]"
    >
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h3 className="text-2xl font-semibold text-[var(--color-text)]">
          Ready to prove what you can do?
        </h3>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Create your proof profile or post a role with an attached task.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/auth?role=candidate"
            className="rounded-[var(--radius-button)] px-5 py-3 bg-[var(--color-candidate)] text-white hover:brightness-110 transition shadow-[var(--shadow-soft)]"
          >
            I’m a Candidate
          </Link>
          <Link
            to="/auth?role=employer"
            className="rounded-[var(--radius-button)] px-5 py-3 bg-[var(--color-employer)] text-white hover:brightness-110 transition shadow-[var(--shadow-soft)]"
          >
            I’m an Employer
          </Link>
        </div>
      </div>
    </section>
  );
}
