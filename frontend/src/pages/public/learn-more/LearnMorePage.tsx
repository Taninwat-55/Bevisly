import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import CandidateGuide from "./CandidateGuide";
import EmployerGuide from "./EmployerGuide";

export default function LearnMorePage() {
  const [mode, setMode] = useState<"candidate" | "employer">("candidate");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors pb-20">
      {/* ── Hero Banner ── */}
      <header className="relative py-16 px-8 overflow-hidden mt-2 rounded-b-[3rem] mx-4 text-center mb-10 bg-[#0B0C10]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[var(--color-brand-primary)]/20 rounded-full blur-[120px] -z-0" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[var(--color-brand-secondary)]/10 rounded-full blur-[100px] -z-0" />
        <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--color-brand-primary)] animate-pulse" />
            <span className="text-sm font-medium text-white/70">How It Works</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight mb-4 text-white">
            Learn How{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)]">
              Bevisly
            </span>{" "}
            Works
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-white/60 leading-relaxed">
            Discover how Bevisly empowers both candidates and employers through verified, proof-based hiring — where skill replaces guesswork.
          </p>

          {/* Toggle inside banner */}
          <div className="inline-flex items-center p-1 rounded-full bg-white/5 border border-white/10 shadow-sm mt-8">
            <button
              onClick={() => setMode("candidate")}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                mode === "candidate"
                  ? "bg-white text-[var(--color-brand-primary)] shadow-md"
                  : "text-white/60 hover:text-white"
              }`}
            >
              🎓 For Candidates
            </button>
            <button
              onClick={() => setMode("employer")}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                mode === "employer"
                  ? "bg-white text-[var(--color-brand-primary)] shadow-md"
                  : "text-white/60 hover:text-white"
              }`}
            >
              🏢 For Employers
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        {mode === "candidate" ? <CandidateGuide /> : <EmployerGuide />}
      </main>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden bg-[var(--color-surface)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-primary)]/5 to-[var(--color-brand-secondary)]/5" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold font-display text-[var(--color-text)] mb-6 tracking-tight">
            Ready to experience{" "}
            <span className="text-[var(--color-brand-primary)]">proof-based hiring?</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-14 px-8 text-lg rounded-2xl shadow-glow-primary hover:scale-105 transition-transform"
              onClick={() => navigate("/auth?role=candidate")}
            >
              Create My Proof Profile
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg rounded-2xl hover:scale-105 transition-transform"
              onClick={() => navigate("/auth?role=employer")}
            >
              Post a Role
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}