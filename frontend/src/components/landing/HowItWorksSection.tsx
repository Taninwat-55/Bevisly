// src/components/landing/HowItWorksSection.tsx
import {
  Briefcase,
  CheckCircle2,
  Award,
  Upload,
  Eye,
  Star,
} from "lucide-react";
import { useState } from "react";

const candidateFlow = [
  {
    icon: Briefcase,
    title: "1. Apply with Proof",
    text: "Choose a job you like and complete its short real-world task — no résumé needed.",
  },
  {
    icon: CheckCircle2,
    title: "2. Get Reviewed",
    text: "Employers assess your actual work and share feedback directly through Bevis.",
  },
  {
    icon: Award,
    title: "3. Earn Verified Proof",
    text: "Receive a verified proof card that boosts your profile and helps you stand out.",
  },
];

const employerFlow = [
  {
    icon: Upload,
    title: "1. Post a Role",
    text: "Describe your role; Bevis helps generate a micro-proof task.",
  },
  {
    icon: Eye,
    title: "2. Review Proofs",
    text: "Assess real submissions instead of CVs — see authentic skill.",
  },
  {
    icon: Star,
    title: "3. Hire & Feature",
    text: "Hire confidently and feature your company among verified employers.",
  },
];

export default function HowItWorksSection() {
  const [mode, setMode] = useState<"candidate" | "employer">("candidate");
  const items = mode === "candidate" ? candidateFlow : employerFlow;

  return (
    <section
      id="how-it-works"
      className="bg-[var(--color-surface)] py-20 border-t border-[var(--color-border)]"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-3">How Bevis Works</h2>
          <p className="body-base text-[var(--color-text-muted)]">
            Fair for both sides — proof replaces promise.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex border border-[var(--color-border)] rounded-[var(--radius-button)] overflow-hidden">
            <button
              onClick={() => setMode("candidate")}
              className={`px-5 py-2 text-sm font-medium transition-colors ${
                mode === "candidate"
                  ? "bg-[var(--color-candidate)] text-white"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              🎓 For Candidates
            </button>
            <button
              onClick={() => setMode("employer")}
              className={`px-5 py-2 text-sm font-medium transition-colors ${
                mode === "employer"
                  ? "bg-[var(--color-employer)] text-white"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              🏢 For Employers
            </button>
          </div>
        </div>

        {/* Step Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex flex-col items-start text-left rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="mb-4 inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-lg mb-1">{title}</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
