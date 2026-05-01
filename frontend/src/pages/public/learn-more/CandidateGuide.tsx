import { Link } from "react-router-dom";
import { Briefcase, CheckCircle2, Award } from "lucide-react";
import InfoSections from "./InfoSections";

export default function CandidateGuide() {
  const steps = [
    {
      icon: Briefcase,
      title: "1. Find a Role (or Practice)",
      text: "Browse proof-based junior roles — or complete a practice proof task to start building your portfolio before you even apply.",
    },
    {
      icon: CheckCircle2,
      title: "2. Complete the Proof Task",
      text: "30 minutes. Real work. Submit your deliverable — no cover letter, no keyword stuffing.",
    },
    {
      icon: Award,
      title: "3. Earn a Permanent Credential",
      text: "Employer-reviewed feedback gets added to your public proof profile. It lives there forever. Share it with anyone.",
    },
  ];

  return (
    <>
      <h2 className="heading-md mb-6 text-center">Build a proof portfolio that speaks for itself</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {steps.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 hover:-translate-y-1 hover:shadow-lg transition-all flex flex-col items-start text-left"
          >
            <div className="mb-4 inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[color-mix(in srgb,var(--color-candidate)8%,transparent)] text-[var(--color-candidate-dark)] p-3">
              <Icon size={20} />
            </div>
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              {text}
            </p>
          </div>
        ))}
      </div>

      <InfoSections accent="var(--color-candidate-dark)" />

      <div className="mt-10 text-center">
        <Link
          to="/jobs"
          className="text-[var(--color-candidate-dark)] font-medium hover:underline"
        >
          Browse Junior Roles & Proof Tasks →
        </Link>
      </div>
    </>
  );
}
