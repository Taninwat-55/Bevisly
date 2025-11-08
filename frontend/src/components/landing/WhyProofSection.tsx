// src/components/landing/WhyProofSection.tsx
import { ShieldCheck, Zap } from "lucide-react";

export default function WhyProofSection() {
  return (
    <section
      id="about"
      className="bg-[var(--color-bg)] py-20 border-t border-[var(--color-border)]"
    >
      <div className="mx-auto max-w-7xl px-6">
        <header className="mb-12 text-center">
          <h2 className="heading-lg">Why proof beats promise</h2>
          <p className="mt-3 body-base">
            Fair hiring with verified work — fast for employers, empowering for
            candidates.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="mb-4 inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
              <Zap size={20} />
            </div>
            <h3 className="font-semibold text-lg mb-1">For Candidates</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-[var(--color-text-muted)] space-y-1 leading-relaxed">
              <li>Turn short tasks into verified experience</li>
              <li>Get structured feedback on real work</li>
              <li>Stand out without pedigree or backdoor networks</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="mb-4 inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-semibold text-lg mb-1">For Employers</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-[var(--color-text-muted)] space-y-1 leading-relaxed">
              <li>See proof, not claims</li>
              <li>Hire faster with objective signals</li>
              <li>Low-risk access to emerging talent</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
