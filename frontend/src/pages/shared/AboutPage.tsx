import { Link } from "react-router-dom";
import { Target, Eye, Lightbulb } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors pb-20">
      {/* ── Fancy Banner / Header ── */}
      <div className="relative py-16 px-8 bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] text-white shadow-xl overflow-hidden mt-2 rounded-b-[3rem] mx-4 text-center">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold font-display leading-tight mb-4">
            About Bevisly
          </h1>
          <p className="text-blue-100 text-xl max-w-2xl mx-auto opacity-90 leading-relaxed">
            Bevisly is reimagining hiring through verified, proof-based experience — where skill speaks louder than words.
          </p>
        </div>
      </div>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center border-b border-[var(--color-border)]">
        <div className="fade-in-up">
          <div className="inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 mb-4 text-[var(--color-candidate-dark)]">
            <Target size={22} />
          </div>
          <h2 className="heading-md mb-2">Our Mission</h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Our mission is to make hiring{" "}
            <strong>fair, transparent, and skill-first</strong>. Bevisly replaces
            guesswork and résumé bias with verified proof tasks — giving
            everyone an equal opportunity to show what they can actually do.
          </p>
        </div>

        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-6 fade-in-up">
          <p className="italic text-[var(--color-text-muted)]">
            “Experience shouldn’t only be defined by years or degrees — it should
            be proven through real work.”
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center border-b border-[var(--color-border)] bg-[color-mix(in srgb,var(--color-surface) 98%,var(--color-bg))]">
        <div className="order-2 md:order-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-6 fade-in-up">
          <p className="italic text-[var(--color-text-muted)]">
            “We envision a world where your proof of skill becomes your passport
            to opportunities — globally recognized, verifiable, and trusted.”
          </p>
        </div>

        <div className="order-1 md:order-2 fade-in-up">
          <div className="inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 mb-4 text-[var(--color-employer-dark)]">
            <Eye size={22} />
          </div>
          <h2 className="heading-md mb-2">Our Vision</h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Bevisly aims to create a{" "}
            <strong>new standard of proof-based hiring</strong> — where skill,
            effort, and feedback replace background checks and bias. We believe
            the future of hiring belongs to transparency and fairness.
          </p>
        </div>
      </section>

      {/* How We're Building It */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center border-b border-[var(--color-border)]">
        <div className="inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 mb-4 text-[var(--color-candidate-dark)]">
          <Lightbulb size={22} />
        </div>
        <h2 className="heading-md mb-3">How We’re Building Bevisly</h2>
        <p className="body-base text-[var(--color-text-muted)] max-w-2xl mx-auto mb-6">
          Bevisly starts simple — helping candidates complete small, real-world
          proof tasks and earn verified recognition from employers. Each proof
          becomes part of a growing skill record — fair, data-backed, and
          transparent. Soon, Bevisly will introduce{" "}
          <strong>AI-assisted review</strong> and{" "}
          <strong>verifiable credentials</strong> to make this process even
          smarter and more reliable.
        </p>
      </section>

      {/* Team Section (hidden for now — ready to enable later) */}
      {/*
      <section className="max-w-6xl mx-auto px-6 py-20 text-center border-b border-[var(--color-border)]">
        <div className="inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 mb-4">
          <Users size={22} />
        </div>
        <h2 className="heading-md mb-8">Meet the Team</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[
            { name: "Taninwat Kaewpankan", role: "Founder & Product Designer", img: "/team/ice.jpg" },
            { name: "Jane Doe", role: "Frontend Engineer", img: "/team/jane.jpg" },
            { name: "John Doe", role: "Advisor", img: "/team/john.jpg" },
          ].map((m) => (
            <div
              key={m.name}
              className="flex flex-col items-center text-center border border-[var(--color-border)] rounded-[var(--radius-card)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-soft)]"
            >
              <img
                src={m.img}
                alt={m.name}
                className="w-20 h-20 rounded-full object-cover mb-3"
              />
              <h3 className="font-semibold">{m.name}</h3>
              <p className="text-sm text-[var(--color-text-muted)]">{m.role}</p>
            </div>
          ))}
        </div>
      </section>
      */}

      {/* CTA */}
      <section className="text-center py-20 bg-[var(--color-surface)]">
        <h2 className="heading-md mb-4">
          Join Bevisly — where real work proves real skill.
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
      </section>
    </div>
  );
}