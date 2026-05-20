const stats = [
  {
    value: "5×",
    label: "Work sample tests predict job performance better than years of education",
    source: "Schmidt & Hunter, 85-year meta-analysis",
  },
  {
    value: "1 in 700",
    label: "Actual hires affected by companies that claim skills-based hiring",
    source: "Harvard Business School & Burning Glass Institute",
  },
  {
    value: "34%",
    label: "More career-switcher profiles filtered out by ATS — even with equivalent skills",
    source: "National Bureau of Economic Research, 2023",
  },
  {
    value: "25%",
    label: "Higher retention rate for skills-based hires vs. credential-based hiring",
    source: "IBM",
  },
];

export default function ResearchStats() {
  return (
    <section className="py-16 md:py-20 bg-[var(--color-bg-subtle)] border-y border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--color-brand-subtle)] border border-[var(--color-brand-subtle-border)] text-sm font-medium text-[var(--color-brand-primary)] mb-4">
            Built on hiring science, not hype
          </div>
          <p className="text-[var(--color-text-muted)] text-lg">
            The hiring system is broken. Decades of research prove it.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <div
              key={stat.value}
              className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-2"
            >
              <div className="text-4xl md:text-5xl font-bold font-display text-[var(--color-brand-primary)] tabular-nums leading-none">
                {stat.value}
              </div>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed flex-1">
                {stat.label}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] opacity-60 uppercase tracking-wider mt-1">
                {stat.source}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-[var(--color-text-muted)] max-w-2xl mx-auto italic">
            "Bevisly does not replace human judgment. It makes human judgment more structured, evidence-based, and auditable."
          </p>
        </div>
      </div>
    </section>
  );
}
