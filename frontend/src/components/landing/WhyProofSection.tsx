import { ShieldCheck, Zap, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function WhyProofSection() {
  return (
    <section
      id="about"
      className="bg-[var(--color-bg)] py-24 border-t border-[var(--color-border)]"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* 🧠 Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="heading-lg mb-3">Why Proof Beats Promise</h2>
          <p className="body-base text-[var(--color-text-muted)] max-w-2xl mx-auto">
            Because real work speaks louder than words — proof builds trust, fairness, and speed on both sides.
          </p>
        </motion.header>

        {/* 💡 Dual Columns */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* 🎓 Candidates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="mb-4 inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
              <Zap size={22} className="text-[var(--color-candidate)]" />
            </div>
            <h3 className="font-semibold text-lg mb-3">For Candidates</h3>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)] leading-relaxed">
              {[
                "Turn short tasks into verified experience.",
                "Receive structured feedback on real work.",
                "Stand out without pedigree or connections.",
              ].map((text) => (
                <li key={text} className="flex items-start gap-2">
                  <Check
                    size={14}
                    className="mt-[2px] text-[var(--color-candidate)]"
                  />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* 🏢 Employers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="mb-4 inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
              <ShieldCheck size={22} className="text-[var(--color-employer)]" />
            </div>
            <h3 className="font-semibold text-lg mb-3">For Employers</h3>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)] leading-relaxed">
              {[
                "See proof, not claims.",
                "Hire faster with objective skill signals.",
                "Access motivated, emerging talent with low risk.",
              ].map((text) => (
                <li key={text} className="flex items-start gap-2">
                  <Check
                    size={14}
                    className="mt-[2px] text-[var(--color-employer)]"
                  />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* 🌉 Bridge Line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center text-sm text-[var(--color-text-muted)]"
        >
          Proof isn’t just fair — it’s the future of hiring.
        </motion.p>
      </div>
    </section>
  );
}