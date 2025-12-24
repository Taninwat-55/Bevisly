import {
  Briefcase,
  CheckCircle2,
  Award,
  Upload,
  Eye,
  Star,
  UserCheck,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

const candidateFlow = [
  {
    icon: Briefcase,
    title: "1. Apply with Proof",
    text: "Choose a role you like and complete its short real-world task — no résumé needed.",
  },
  {
    icon: CheckCircle2,
    title: "2. Get Reviewed",
    text: "Employers assess your actual work and share structured feedback directly on Bevisly.",
  },
  {
    icon: Award,
    title: "3. Earn Verified Proof",
    text: "Receive a proof card verified by the employer — visible on your profile forever.",
  },
];

const employerFlow = [
  {
    icon: Upload,
    title: "1. Post a Role",
    text: "Describe your role and attach or auto-generate a proof task in one click.",
  },
  {
    icon: Eye,
    title: "2. Review Proofs",
    text: "Assess real submissions instead of CVs — see authentic skill and effort.",
  },
  {
    icon: Star,
    title: "3. Hire & Feature",
    text: "Hire confidently and showcase your company among verified employers.",
  },
];

export default function HowItWorksSection() {
  const [mode, setMode] = useState<"candidate" | "employer">("candidate");
  const items = mode === "candidate" ? candidateFlow : employerFlow;

  return (
    <section
      id="how-it-works"
      className="bg-[var(--color-surface)] py-24 border-t border-[var(--color-border)]"
    >
      <div className="mx-auto max-w-7xl px-6 text-center">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="heading-lg mb-2"
        >
          How Bevisly Works
        </motion.h2>
        <p className="body-base text-[var(--color-text-muted)] mb-12">
          One fair system where proof replaces promises — for both candidates and employers.
        </p>

        {/* Role Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex border border-[var(--color-border)] rounded-[var(--radius-button)] overflow-hidden shadow-[var(--shadow-soft)]">
            <button
              onClick={() => setMode("candidate")}
              className={`px-5 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                mode === "candidate"
                  ? "bg-[var(--color-candidate)] text-white"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              <UserCheck size={16} /> Candidates
            </button>
            <button
              onClick={() => setMode("employer")}
              className={`px-5 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                mode === "employer"
                  ? "bg-[var(--color-employer)] text-white"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              <Building2 size={16} /> Employers
            </button>
          </div>
        </div>

        {/* Step Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex flex-col items-start text-left rounded-2xl border border-[var(--color-border)]
                         bg-[var(--color-bg)] p-6 hover:shadow-md hover:-translate-y-1 transition-all"
            >
              <div className="mb-4 inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <Icon
                  size={20}
                  className={`${
                    mode === "candidate"
                      ? "text-[var(--color-candidate)]"
                      : "text-[var(--color-employer)]"
                  }`}
                />
              </div>
              <h3 className="font-semibold text-lg mb-1">{title}</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                {text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA bridge */}
        <div className="mt-16 flex flex-wrap justify-center gap-4">
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