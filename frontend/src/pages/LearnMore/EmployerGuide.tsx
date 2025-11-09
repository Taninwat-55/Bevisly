import { Link } from "react-router-dom";
import { Upload, Eye, Star } from "lucide-react";
import InfoSections from "./InfoSections";

export default function EmployerGuide() {
  const steps = [
    {
      icon: Upload,
      title: "1. Post a Role",
      text: "Describe your job and Bevis helps generate a relevant micro-proof task.",
    },
    {
      icon: Eye,
      title: "2. Review Proofs",
      text: "Assess candidate submissions fairly — you see authentic work, not buzzwords.",
    },
    {
      icon: Star,
      title: "3. Hire & Feature",
      text: "Hire confidently and optionally feature your company as a verified employer.",
    },
  ];

  return (
    <>
      <h2 className="heading-md mb-6 text-center">How Employers Use Bevis</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {steps.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 hover:-translate-y-1 hover:shadow-lg transition-all flex flex-col items-start text-left"
          >
            <div className="mb-4 inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[color-mix(in srgb,var(--color-employer)8%,transparent)] text-[var(--color-employer-dark)] p-3">
              <Icon size={20} />
            </div>
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              {text}
            </p>
          </div>
        ))}
      </div>

      <InfoSections accent="var(--color-employer-dark)" />

      <div className="mt-10 text-center">
        <Link
          to="/auth?role=employer"
          className="text-[var(--color-employer-dark)] font-medium hover:underline"
        >
          Start Posting →
        </Link>
      </div>
    </>
  );
}
