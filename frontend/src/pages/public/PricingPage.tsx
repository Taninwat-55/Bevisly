import { useNavigate } from "react-router-dom";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function PricingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-6 py-24 text-center">
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[var(--color-brand-primary)]/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-lg mx-auto space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-brand-primary)]/30 bg-[var(--color-brand-primary)]/8 text-[var(--color-brand-primary)] text-xs font-semibold">
          <Sparkles size={11} />
          Early Access
        </div>

        {/* Heading */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-display text-[var(--color-text)] leading-tight">
            Pricing is{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-primary)] to-indigo-400">
              coming soon
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-lg leading-relaxed">
            We're in early access — everything is free while we build with our first employers and candidates.
            Paid plans will launch once we've validated what matters most.
          </p>
        </div>

        {/* Free perks */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-left space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
            What's free right now
          </p>
          {[
            "Post jobs with AI-generated proof tasks",
            "Review submissions with AI evidence summaries",
            "Candidates complete real-work challenges",
            "Kanban pipeline board & hiring stages",
            "Responsibility Score & Employer Brand Page",
            "Candidate profiles, proof vault & Bevisly Score",
          ].map((perk) => (
            <div key={perk} className="flex items-start gap-2.5">
              <CheckCircle2 size={15} className="text-[var(--color-brand-primary)] shrink-0 mt-0.5" />
              <span className="text-sm text-[var(--color-text-muted)]">{perk}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            className="w-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 text-white h-12 text-base"
            onClick={() => navigate("/auth?tab=signup")}
          >
            Get started — it's free
          </Button>
          <p className="text-xs text-[var(--color-text-muted)]">
            No credit card · No time limit · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
