import { useState } from "react";
import { Link } from "react-router-dom";
import CandidateGuide from "./CandidateGuide";
import EmployerGuide from "./EmployerGuide";

export default function LearnMorePage() {
  const [mode, setMode] = useState<"candidate" | "employer">("candidate");

  const accent =
    mode === "candidate"
      ? "var(--color-candidate-dark)"
      : "var(--color-employer-dark)";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* 🧭 Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] py-20 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `linear-gradient(to bottom right, color-mix(in srgb, ${accent} 10%, transparent), transparent)`,
          }}
        />
        <h1 className="heading-lg mb-3 relative z-10">Learn How Bevis Works</h1>
        <p className="body-base text-[var(--color-text-muted)] max-w-2xl mx-auto relative z-10">
          Discover how Bevis empowers both candidates and employers through
          verified, proof-based hiring — where skill replaces guesswork.
        </p>

        {/* Toggle */}
        <div className="inline-flex border border-[var(--color-border)] rounded-[var(--radius-button)] overflow-hidden mt-8 relative z-10">
          <button
            onClick={() => setMode("candidate")}
            className={`px-5 py-2 text-sm font-medium transition-all ${
              mode === "candidate"
                ? "bg-[var(--color-candidate)] text-white shadow-md"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            🎓 For Candidates
          </button>
          <button
            onClick={() => setMode("employer")}
            className={`px-5 py-2 text-sm font-medium transition-all ${
              mode === "employer"
                ? "bg-[var(--color-employer)] text-white shadow-md"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            🏢 For Employers
          </button>
        </div>
      </header>

      {/* 🧩 Content */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        {mode === "candidate" ? <CandidateGuide /> : <EmployerGuide />}
      </main>

      {/* 🚀 CTA */}
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