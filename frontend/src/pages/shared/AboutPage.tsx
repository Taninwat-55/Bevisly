import { useNavigate } from "react-router-dom";
import { Target, Eye, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors pb-20">
      {/* ── Hero Banner ── */}
      <div className="relative py-16 px-8 overflow-hidden mt-2 rounded-b-[3rem] mx-4 text-center bg-[#0B0C10]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[var(--color-brand-primary)]/20 rounded-full blur-[120px] -z-0" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[var(--color-brand-secondary)]/10 rounded-full blur-[100px] -z-0" />
        <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--color-brand-primary)] animate-pulse" />
            <span className="text-sm font-medium text-white/70">Our Story</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold font-display leading-tight mb-4 text-white">
            About{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)]">
              Bevisly
            </span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-white/60 leading-relaxed">
            Reimagining hiring through verified, proof-based experience — where skill speaks louder than words.
          </p>
        </div>
      </div>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center border-b border-[var(--color-border)]">
        <div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-4">
            <Target size={22} />
          </div>
          <h2 className="text-3xl font-bold font-display text-[var(--color-text)] mb-3">Our Mission</h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Our mission is to make hiring{" "}
            <strong className="text-[var(--color-text)]">fair, transparent, and skill-first</strong>. Bevisly replaces
            guesswork and résumé bias with verified proof tasks — giving
            everyone an equal opportunity to show what they can actually do.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <p className="italic text-[var(--color-text-muted)] text-lg leading-relaxed">
            "Experience shouldn't only be defined by years or degrees — it should
            be proven through real work."
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center border-b border-[var(--color-border)]">
        <div className="order-2 md:order-1 glass-panel rounded-2xl p-6">
          <p className="italic text-[var(--color-text-muted)] text-lg leading-relaxed">
            "We envision a world where your proof of skill becomes your passport
            to opportunities — globally recognized, verifiable, and trusted."
          </p>
        </div>

        <div className="order-1 md:order-2">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mb-4">
            <Eye size={22} />
          </div>
          <h2 className="text-3xl font-bold font-display text-[var(--color-text)] mb-3">Our Vision</h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Bevisly aims to create a{" "}
            <strong className="text-[var(--color-text)]">new standard of proof-based hiring</strong> — where skill,
            effort, and feedback replace background checks and bias. We believe
            the future of hiring belongs to transparency and fairness.
          </p>
        </div>
      </section>

      {/* How We're Building It */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center border-b border-[var(--color-border)]">
        <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 mb-4 mx-auto">
          <Lightbulb size={22} />
        </div>
        <h2 className="text-3xl font-bold font-display text-[var(--color-text)] mb-4">How We're Building Bevisly</h2>
        <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
          Bevisly starts simple — helping candidates complete small, real-world
          proof tasks and earn verified recognition from employers. Each proof
          becomes part of a growing skill record — fair, data-backed, and
          transparent. Soon, Bevisly will introduce{" "}
          <strong className="text-[var(--color-text)]">AI-assisted review</strong> and{" "}
          <strong className="text-[var(--color-text)]">verifiable credentials</strong> to make this process even
          smarter and more reliable.
        </p>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden bg-[var(--color-surface)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-primary)]/5 to-[var(--color-brand-secondary)]/5" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold font-display text-[var(--color-text)] mb-6 tracking-tight">
            Join Bevisly — where real work{" "}
            <span className="text-[var(--color-brand-primary)]">proves real skill.</span>
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