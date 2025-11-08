import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function FinalCTASection() {
  return (
    <section
      id="contact"
      className="relative bg-[var(--color-surface)] py-24 border-t border-[var(--color-border)] overflow-hidden"
    >
      {/* subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-candidate)]/5 via-transparent to-[var(--color-employer)]/5 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-[var(--color-text)]"
        >
          Ready to prove what you can do?
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-[var(--color-text-muted)] text-base md:text-lg"
        >
          Your next opportunity starts with proof — fair, fast, and verified.
        </motion.p>

        {/* Dual CTA buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/auth?role=candidate"
            className="rounded-[var(--radius-button)] px-6 py-3.5 bg-[var(--color-candidate)] text-white font-medium hover:brightness-110 transition shadow-[var(--shadow-soft)]"
          >
            I’m a Candidate
          </Link>
          <Link
            to="/auth?role=employer"
            className="rounded-[var(--radius-button)] px-6 py-3.5 bg-[var(--color-employer)] text-white font-medium hover:brightness-110 transition shadow-[var(--shadow-soft)]"
          >
            I’m an Employer
          </Link>
        </motion.div>
      </div>
    </section>
  );
}