import { useState } from "react";
import { Link } from "react-router-dom";
import CandidateGuide from "./CandidateGuide";
import EmployerGuide from "./EmployerGuide";

export default function LearnMorePage() {
  const [mode, setMode] = useState<"candidate" | "employer">("candidate");

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors pb-20">
      {/* ── Fancy Banner / Header ── */}
      <header className="relative py-16 px-8 bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] text-white shadow-xl overflow-hidden mt-2 rounded-b-[3rem] mx-4 text-center mb-10">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight mb-4">
            Learn How Bevisly Works
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto opacity-90 leading-relaxed">
            Discover how Bevisly empowers both candidates and employers through verified, proof-based hiring — where skill replaces guesswork.
          </p>
        </div>

        {/* Toggle inside banner */}
        <div className="inline-flex bg-black/20 p-1 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden mt-8 relative z-10">
          <button
            onClick={() => setMode("candidate")}
            className={`px-6 py-2.5 text-sm font-medium transition-all rounded-lg ${
              mode === "candidate"
                ? "bg-white text-[var(--color-brand-primary)] shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            🎓 For Candidates
          </button>
          <button
            onClick={() => setMode("employer")}
            className={`px-6 py-2.5 text-sm font-medium transition-all rounded-lg ml-1 ${
              mode === "employer"
                ? "bg-white text-[var(--color-brand-primary)] shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            🏢 For Employers
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        {mode === "candidate" ? <CandidateGuide /> : <EmployerGuide />}
      </main>

      {/* CTA */}
      <footer className="text-center border-t border-[var(--color-border)] py-20 bg-[var(--color-surface)]">
        <h2 className="heading-md mb-4">
          Ready to experience proof-based hiring?
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/auth?role=candidate"
            className="px-5 py-3 rounded-[var(--radius-button)] bg-[var(--color-candidate)] text-white hover:brightness-110 transition"
          >
            Create My Proof Profile
          </Link>
          <Link
            to="/auth?role=employer"
            className="px-5 py-3 rounded-[var(--radius-button)] bg-[var(--color-employer)] text-white hover:brightness-110 transition"
          >
            Post a Role
          </Link>
        </div>
      </footer>
    </div>
  );
}