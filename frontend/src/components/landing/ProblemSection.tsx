import { motion } from "framer-motion";
import { FileText, Timer, SearchCheck } from "lucide-react";

export default function ProblemSection() {
  const problems = [
    {
      icon: <FileText className="text-[var(--color-candidate)]" size={28} />,
      title: "Résumé Bias",
      text: "Hiring still relies on keywords and credentials, not skill. Great talent gets filtered out before being seen.",
    },
    {
      icon: <Timer className="text-[var(--color-employer)]" size={28} />,
      title: "Slow & Unreliable Processes",
      text: "Endless interviews, technical tests, and CV scans waste time and rarely predict performance.",
    },
    {
      icon: <SearchCheck className="text-[var(--color-success)]" size={28} />,
      title: "No Proof of Real Ability",
      text: "Employers guess. Candidates over-explain. Without verifiable proof, everyone works on assumptions.",
    },
  ];

  return (
    <section id="problems" className="bg-[var(--color-bg)] py-24 border-t border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* 🧠 Section heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="heading-lg mb-2"
        >
          Why the Old Way Doesn’t Work
        </motion.h2>
        <p className="body-base text-[var(--color-text-muted)] mb-14">
          The hiring gap is real — here’s what’s broken.
        </p>

        {/* 🪜 Problem cards */}
        <div className="grid gap-8 md:grid-cols-3 text-left">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]
                         hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="mb-4">{p.icon}</div>
              <h3 className="font-semibold text-lg mb-2 text-[var(--color-text)]">
                {p.title}
              </h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                {p.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* 🌍 Bridge line to next section */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-sm text-[var(--color-text-muted)]"
        >
          Bevis replaces guesswork with verifiable proof — turning every task into real evidence of skill.
        </motion.p>
      </div>
    </section>
  );
}