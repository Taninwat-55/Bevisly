import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Eye, Lightbulb, Quote } from "lucide-react";
import { Button } from "@/components/ui/Button";
import ContactModal from "@/components/common/ContactModal";

export default function AboutPage() {
  const navigate = useNavigate();
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors pb-20">
      {/* ── Hero Banner ── */}
      <div className="relative py-16 px-8 overflow-hidden mt-2 rounded-b-[3rem] mx-4 text-center bg-[var(--color-obsidian)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[var(--color-brand-primary)]/20 rounded-full blur-[120px] -z-0" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[var(--color-brand-secondary)]/10 rounded-full blur-[100px] -z-0" />
        <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--color-brand-primary)] animate-pulse" />
            <span className="text-sm font-medium text-white/70">
              About Bevisly
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold font-display leading-tight mb-4 text-white">
            About{" "}
            <span className="text-[var(--color-brand-primary)]">Bevisly</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-white/60 leading-relaxed">
            Built by someone who got tired of the broken hiring process. This is
            the platform I wished existed.
          </p>
        </div>
      </div>

      {/* ── Why We Built This ── */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-b border-[var(--color-border)]">
        <div className="inline-block px-3 py-1 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-sm font-medium mb-6">
          The Story Behind Bevisly
        </div>
        <h2 className="text-3xl font-bold font-display text-[var(--color-text)] mb-8">
          This platform was built by someone who couldn't get hired.
        </h2>

        <div className="space-y-5 text-[var(--color-text-muted)] leading-relaxed text-lg">
          <p>
            I graduated with a Bachelor's in Game Design and Project Management,
            then went on to complete a Master's in Entrepreneurship. By every
            traditional measure, I had the credentials. But I still spent over a
            year applying — and hearing nothing back.
          </p>
          <p>
            The one role I landed in that year was a volunteer position in a
            student-run consultancy, bridging startups and SMEs with student
            talent. I loved it. But it also showed me something: the hiring
            system is fundamentally broken for junior talent. Strong people get
            filtered out before anyone sees their actual work.
          </p>
          <p>
            I started thinking: what if there was a way to show what you can do
            — not just claim it? I was inspired by Bitcoin's proof-of-work
            concept. You do the work, you prove it, you win the reward. No
            shortcuts. No bias based on where you went to school or how polished
            your CV looks.
          </p>
          <p>
            That's Bevisly. A platform where junior talent — students, new
            grads, career switchers — proves their skills through real tasks.
            Where even a rejection comes with verified proof of what you built.
            Where SMEs and startups can find competent people without spending
            hours screening CVs.
          </p>
        </div>

        <div className="mt-10 glass-panel rounded-2xl p-6 border-l-4 border-[var(--color-brand-primary)] flex gap-4 items-start">
          <Quote
            size={20}
            className="text-[var(--color-brand-primary)] shrink-0 mt-1"
          />
          <p className="italic text-[var(--color-text-muted)] text-lg leading-relaxed">
            "I'm about to graduate again, and I still don't have a job. I know
            exactly how this feels — and I'm building the platform I wished
            existed when I started looking."
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center border-b border-[var(--color-border)]">
        <div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-4">
            <Target size={22} />
          </div>
          <h2 className="text-3xl font-bold font-display text-[var(--color-text)] mb-3">
            Our Mission
          </h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Our mission is to make hiring{" "}
            <strong className="text-[var(--color-text)]">
              fast, fair, and skill-first for junior talent
            </strong>
            . Bevisly replaces the CV black hole with a 30-minute proof task —
            giving recent grads, career switchers, and students an equal chance
            to prove what they can actually do.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <p className="italic text-[var(--color-text-muted)] text-lg leading-relaxed">
            "Nobody wants me. I tried every possible method. So I built the
            platform that would have helped me — and everyone like me."
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center border-b border-[var(--color-border)]">
        <div className="order-2 md:order-1 glass-panel rounded-2xl p-6">
          <p className="italic text-[var(--color-text-muted)] text-lg leading-relaxed">
            "I'm building this slowly and honestly. The vision is big but the
            wedge is narrow: hire junior talent faster, with proof. We nail that
            first."
          </p>
        </div>

        <div className="order-1 md:order-2">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mb-4">
            <Eye size={22} />
          </div>
          <h2 className="text-3xl font-bold font-display text-[var(--color-text)] mb-3">
            Our Vision
          </h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Bevisly aims to become the{" "}
            <strong className="text-[var(--color-text)]">
              standard for proof-based hiring in the Nordics
            </strong>{" "}
            — and eventually globally. A world where your first job isn't gated
            by who you know or how well you wrote a cover letter, but by what
            you can actually deliver.
          </p>
        </div>
      </section>

      {/* What We're Building Right Now */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center border-b border-[var(--color-border)]">
        <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 mb-4 mx-auto">
          <Lightbulb size={22} />
        </div>
        <h2 className="text-3xl font-bold font-display text-[var(--color-text)] mb-4">
          What We're Building Right Now
        </h2>
        <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
          Today, Bevisly does one thing well: it replaces CV screening with a
          short proof task for junior roles. Employers post, AI generates the
          task, candidates submit, you review. Soon: interview scheduling, and a
          full proof-first pipeline. But today, the focus is on nailing that
          first handshake — proof-first, fast, fair.
        </p>
      </section>

      {/* ── The Team Section ── */}
      <section className="max-w-5xl mx-auto px-6 py-24 border-b border-[var(--color-border)]">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-sm font-medium mb-4">
            The Team
          </div>
          <h2 className="text-3xl font-bold font-display text-[var(--color-text)] mb-3">
            Right now, it's just me.
          </h2>
          <p className="text-[var(--color-text-muted)] max-w-xl mx-auto">
            Bevisly is a solo-founded product. I'm building it in public,
            shipping fast, and talking directly to every employer and candidate
            who uses it.
          </p>
        </div>

        {/* Founder Card */}
        <div className="flex flex-col md:flex-row justify-center gap-8 mb-16">
          <div className="glass-panel rounded-2xl p-8 max-w-sm mx-auto md:mx-0 text-center border border-[var(--color-border)] hover:border-[var(--color-brand-primary)]/30 transition-colors">
            <img
              src="/Founder_Image.webp"
              alt="Taninwat Kaewpankan"
              className="w-24 h-24 rounded-full mx-auto mb-5 object-cover shadow-lg border-2 border-[var(--color-brand-primary)]/20"
            />
            <h3 className="text-xl font-bold text-[var(--color-text)] mb-1">
              Taninwat Kaewpankan
            </h3>
            <p className="text-sm text-[var(--color-brand-primary)] font-medium mb-4">
              Founder &amp; Builder
            </p>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              MSc Entrepreneurship grad who spent over a year unable to break in
              — despite the credentials. Built Bevisly so junior talent gets
              judged on what they can do, not how well their CV reads.
            </p>
          </div>
        </div>

        {/* Future team slots */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {["Engineer", "Design", "Growth", "Operations"].map((role) => (
            <div
              key={role}
              className="rounded-xl border border-dashed border-[var(--color-border)] p-5 flex flex-col items-center justify-center gap-2 opacity-40 hover:opacity-60 transition-opacity"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] text-lg font-bold">
                ?
              </div>
              <p className="text-xs font-medium text-[var(--color-text-muted)] text-center">
                Future {role}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-[var(--color-text-muted)] mt-8">
          We're growing.{" "}
          <button
            onClick={() => setIsContactOpen(true)}
            className="text-[var(--color-brand-primary)] hover:underline font-medium"
          >
            Reach out if you want to help build this.
          </button>
        </p>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden bg-[var(--color-surface)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-primary)]/5 to-[var(--color-brand-secondary)]/5" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold font-display text-[var(--color-text)] mb-6 tracking-tight">
            Want to hire junior talent{" "}
            <span className="text-[var(--color-brand-primary)]">
              the right way?
            </span>
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-14 px-8 text-lg rounded-2xl shadow-glow-primary hover:scale-105 transition-transform"
              onClick={() => navigate("/auth?tab=signup&role=candidate")}
            >
              Build My Proof Portfolio
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg rounded-2xl hover:scale-105 transition-transform"
              onClick={() => navigate("/auth?tab=signup&role=employer")}
            >
              Post a Junior Role
            </Button>
          </div>
        </div>
      </section>

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}
