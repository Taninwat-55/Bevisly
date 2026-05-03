import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  Star,
  ShieldCheck,
  Archive,
  Dumbbell,
  Trophy,
  Briefcase,
  BarChart3,
  Building2,
  Sparkles,
  Kanban,
  Wand2,
  BadgeCheck,
  Users,
  ChevronDown,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// ─── Types ──────────────────────────────────────────────────────────────────

type SectionId = "how-it-works" | "for-candidates" | "for-employers" | "key-features" | "faq";

interface NavPill {
  id: SectionId;
  label: string;
}

interface FaqItem {
  q: string;
  a: string | React.ReactNode;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_PILLS: NavPill[] = [
  { id: "how-it-works", label: "Overview" },
  { id: "for-candidates", label: "For Candidates" },
  { id: "for-employers", label: "For Employers" },
  { id: "key-features", label: "Key Features" },
  { id: "faq", label: "FAQ" },
];

const HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    icon: Briefcase,
    title: "Employer posts a job",
    description:
      "The employer creates a job listing and attaches a real Proof Task — a short, scoped work sample that reflects what the first week on the job actually looks like. Not a quiz. Real work.",
    accent: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
  },
  {
    number: "02",
    icon: ClipboardCheck,
    title: "Candidate applies by doing",
    description:
      "Instead of uploading a CV, the candidate completes the Proof Task to apply. The submission — their actual output — is what the employer reviews. No cover letters. No filtering by school name.",
    accent: "from-orange-500/20 to-orange-600/10",
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
  },
  {
    number: "03",
    icon: Star,
    title: "Employer reviews proof",
    description:
      "The employer reads the submission, rates the quality with a star rating, and gives structured written feedback. The candidate keeps that proof permanently — even if they don't get the role.",
    accent: "from-emerald-500/20 to-emerald-600/10",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
  },
];

const CANDIDATE_CARDS = [
  {
    icon: ClipboardCheck,
    title: "Proof Tasks",
    description:
      "Complete a real, scoped task set by the employer to apply for a job. The task shows what you can do — not just what you claim on a CV. Tasks are designed to take 1–3 hours max.",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Star,
    title: "Bevisly Score",
    description:
      "A composite skill score (0–∞) that grows every time you complete a proof and receive an employer rating. Combines employer feedback stars and practice task grades. Shown on the public leaderboard.",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: ShieldCheck,
    title: "Reliability Score",
    description:
      "Measures your completion rate — did you finish the tasks you started? — plus your profile completeness. Employers see this score when reviewing your submission. It signals professionalism.",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: Archive,
    title: "Proof Vault",
    description:
      "Every completed proof is permanently saved on your profile with a shareable public link. Whether you got the role or not, the work you did is yours to keep. It works as a living portfolio.",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    icon: Dumbbell,
    title: "Practice Proofs",
    description:
      "Pre-built challenges you can complete without applying for a job. AI grades them instantly. Your score counts toward your Bevisly Score — so you can build your profile from day one, before any employer even posts.",
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-500",
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    description:
      "Top candidates are ranked publicly by Bevisly Score. It gives early-career candidates a transparent, merit-based signal that stands in place of years of experience.",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
  },
];

const EMPLOYER_CARDS = [
  {
    icon: ClipboardCheck,
    title: "Proof Tasks",
    description:
      "Set a real, scoped work task (1–3 hours max) as part of your job listing. Candidates complete it to apply. You review actual output, not a CV. See who can do the job before you schedule a single interview.",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: BarChart3,
    title: "Responsibility Score",
    description:
      "Your public accountability score (0–100), visible to candidates on your job listings and company page. Based on response rate (50 pts), review speed (30 pts), and feedback quality (20 pts). Keeps ghosting accountable — on both sides.",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: Building2,
    title: "Employer Brand Page",
    description:
      "A public profile at /company/your-slug showing your Responsibility Score, open roles, company description, mission, and culture. Gives candidates the context they need before applying.",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-500",
  },
  {
    icon: Sparkles,
    title: "AI Feedback Suggestions",
    description:
      "When reviewing a submission, Bevisly's AI analyses the proof and suggests a star rating and written feedback paragraph. You can edit or override it before submitting. Saves time and improves feedback quality.",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    icon: Kanban,
    title: "Talent Board",
    description:
      "A Kanban-style pipeline per job posting. Drag candidates through stages: New → Shortlisted → Interview → Offer → Hired / Rejected. Clear, visual, fast.",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: Wand2,
    title: "AI Job & Task Generator",
    description:
      "Describe your role in a sentence and Bevisly's AI generates a full job listing and a matching proof task. Get from idea to live posting in minutes, not hours.",
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-500",
  },
];

const KEY_FEATURES = [
  {
    icon: ClipboardCheck,
    title: "Proof-of-Work Hiring",
    description: "Every application is a completed task, not a CV. See real output before making any commitment.",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: ShieldCheck,
    title: "Two-Sided Accountability",
    description: "Candidates have a Reliability Score. Employers have a Responsibility Score. Both sides stay honest.",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: Archive,
    title: "Permanent Proof Portfolio",
    description: "Every submission is stored on the candidate's profile forever — a verifiable, public portfolio that grows with each application.",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Tools",
    description: "AI generates job listings, proof tasks, and feedback suggestions. Cuts admin overhead for employers significantly.",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: BadgeCheck,
    title: "Verified Employer Badge",
    description: "Employers who meet quality standards earn a verified badge, giving candidates confidence the listing is legitimate.",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-500",
  },
  {
    icon: Users,
    title: "Practice Challenges",
    description: "Candidates can build their Bevisly Score through practice tasks before any employer even posts a matching role.",
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-500",
  },
];

const CANDIDATE_FAQS: FaqItem[] = [
  {
    q: "Is Bevisly free for candidates?",
    a: "Yes, completely free. You can apply for jobs, complete proof tasks, build your Bevisly Score, and maintain your public proof portfolio at no cost.",
  },
  {
    q: "What if I don't get the job — do I lose my proof?",
    a: "No. Every completed proof stays permanently on your profile as a portfolio piece, regardless of outcome. You can share a direct link to any proof at any time.",
  },
  {
    q: "How long should a Proof Task take?",
    a: "Tasks are scoped to 1–3 hours maximum. Employers are encouraged to keep tasks reasonable — a fair reflection of real work, not a free work extraction exercise.",
  },
  {
    q: "What is the Bevisly Score?",
    a: "A composite number that grows every time you complete a proof and receive an employer rating. It combines employer feedback stars and practice task grades into a single public skill signal.",
  },
];

const EMPLOYER_FAQS: FaqItem[] = [
  {
    q: "Is Bevisly free for employers?",
    a: (
      <>
        There is a free tier with a limited number of active job posts. Pro plans unlock more posts, analytics, and advanced features like AI feedback suggestions and candidate search.{" "}
        <Link to="/pricing" className="text-[var(--color-brand-primary)] hover:underline font-medium">
          See Pricing
        </Link>.
      </>
    ),
  },
  {
    q: "What is the Responsibility Score?",
    a: "A 0–100 score visible to candidates on your job listings and company page. It measures how reliably you respond to submissions, how quickly you review them, and how substantive your feedback is. Keeps employers accountable for ghosting.",
  },
  {
    q: "How does AI feedback suggestion work?",
    a: "When you open a candidate's submission in the review panel, Bevisly analyses the proof and suggests a star rating and a written feedback paragraph. You can edit or override any part of it before submitting your final review.",
  },
  {
    q: "Can I set any kind of Proof Task?",
    a: "Yes. You define the task. The platform encourages tasks scoped to 1–3 hours that reflect real work you would give in the first week on the job — not trick questions or take-home projects that take days.",
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-block px-3 py-1 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-sm font-medium mb-5">
      {children}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl md:text-4xl font-bold font-display text-[var(--color-text)] mb-4">
      {children}
    </h2>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  iconBg,
  iconColor,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 border border-[var(--color-border)] hover:border-[var(--color-brand-primary)]/30 transition-colors">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div>
        <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">{title}</h3>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FaqAccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[var(--color-border)] last:border-0">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-brand-primary)] transition-colors">
          {item.q}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="pb-5 text-sm text-[var(--color-text-muted)] leading-relaxed pr-6">
          {item.a}
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("how-it-works");

  const sectionRefs: Record<SectionId, React.RefObject<HTMLElement | null>> = {
    "how-it-works": useRef<HTMLElement>(null),
    "for-candidates": useRef<HTMLElement>(null),
    "for-employers": useRef<HTMLElement>(null),
    "key-features": useRef<HTMLElement>(null),
    faq: useRef<HTMLElement>(null),
  };

  function scrollTo(id: SectionId) {
    setActiveSection(id);
    const el = sectionRefs[id].current;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors pb-24">
      <Helmet>
        <title>Docs & Help — Bevisly</title>
        <meta
          name="description"
          content="Everything you need to know about how Bevisly works — proof tasks, scores, employer tools, and FAQ."
        />
        <meta property="og:title" content="Docs & Help — Bevisly" />
        <meta
          property="og:description"
          content="Bevisly is a proof-of-work hiring platform. Candidates complete real tasks to apply. Employers review actual output, not CVs."
        />
      </Helmet>

      {/* ── Hero Banner ── */}
      <div className="relative py-20 px-8 overflow-hidden mt-2 rounded-b-[3rem] mx-4 text-center bg-[#0B0C10]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[480px] bg-[var(--color-brand-primary)]/20 rounded-full blur-[120px] -z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[350px] bg-[var(--color-brand-secondary)]/10 rounded-full blur-[100px] -z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--color-brand-primary)] animate-pulse" />
            <span className="text-sm font-medium text-white/70">Docs & Help</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold font-display leading-tight mb-4 text-white">
            How{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)]">
              Bevisly
            </span>{" "}
            works
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-white/60 leading-relaxed">
            Everything you need to know — proof tasks, scoring, employer tools, and answers to common questions.
          </p>
        </motion.div>
      </div>

      {/* ── Quick Nav Pills ── */}
      <div className="sticky top-16 z-30 bg-[var(--color-bg)]/90 backdrop-blur-md border-b border-[var(--color-border)] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none">
          {NAV_PILLS.map((pill) => (
            <button
              key={pill.id}
              onClick={() => scrollTo(pill.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeSection === pill.id
                  ? "bg-[var(--color-brand-primary)] text-white shadow-glow-primary"
                  : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-brand-primary)]/40"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        ref={sectionRefs["how-it-works"] as React.RefObject<HTMLElement>}
        className="max-w-5xl mx-auto px-6 pt-20 pb-16 border-b border-[var(--color-border)]"
      >
        <div className="text-center mb-12">
          <SectionLabel>How It Works</SectionLabel>
          <SectionHeading>Three steps. No CVs.</SectionHeading>
          <p className="text-[var(--color-text-muted)] max-w-xl mx-auto text-base leading-relaxed">
            Bevisly replaces the CV-and-cover-letter loop with a single proof task. Here is the full cycle.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <div
              key={step.number}
              className={`relative glass-panel rounded-2xl p-7 border border-[var(--color-border)] bg-gradient-to-br ${step.accent} overflow-hidden`}
            >
              <span className="absolute top-5 right-5 text-5xl font-black font-display text-[var(--color-border)] select-none leading-none">
                {step.number}
              </span>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${step.iconBg}`}>
                <step.icon size={22} className={step.iconColor} />
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">{step.title}</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── For Candidates ── */}
      <section
        id="for-candidates"
        ref={sectionRefs["for-candidates"] as React.RefObject<HTMLElement>}
        className="max-w-5xl mx-auto px-6 pt-20 pb-16 border-b border-[var(--color-border)]"
      >
        <div className="mb-10">
          <SectionLabel>For Candidates</SectionLabel>
          <SectionHeading>Your profile is your proof.</SectionHeading>
          <p className="text-[var(--color-text-muted)] max-w-2xl text-base leading-relaxed">
            Bevisly is free for candidates. Build your score, grow your vault, and let your work speak.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CANDIDATE_CARDS.map((card) => (
            <FeatureCard key={card.title} {...card} />
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link to="/auth?tab=signup&role=candidate">
            <Button size="lg" className="rounded-2xl h-12 px-7">
              Create your free profile
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
          <Link to="/leaderboard">
            <Button variant="outline" size="lg" className="rounded-2xl h-12 px-7">
              View Leaderboard
            </Button>
          </Link>
        </div>
      </section>

      {/* ── For Employers ── */}
      <section
        id="for-employers"
        ref={sectionRefs["for-employers"] as React.RefObject<HTMLElement>}
        className="max-w-5xl mx-auto px-6 pt-20 pb-16 border-b border-[var(--color-border)]"
      >
        <div className="mb-10">
          <SectionLabel>For Employers</SectionLabel>
          <SectionHeading>Review output, not applications.</SectionHeading>
          <p className="text-[var(--color-text-muted)] max-w-2xl text-base leading-relaxed">
            Post a job, attach a proof task, and let candidates show you what they can do. Built for startups and SMEs who need to hire fast and hire well.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {EMPLOYER_CARDS.map((card) => (
            <FeatureCard key={card.title} {...card} />
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link to="/auth?tab=signup&role=employer">
            <Button size="lg" className="rounded-2xl h-12 px-7">
              Post your first role
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button variant="outline" size="lg" className="rounded-2xl h-12 px-7">
              View Pricing
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Key Features ── */}
      <section
        id="key-features"
        ref={sectionRefs["key-features"] as React.RefObject<HTMLElement>}
        className="max-w-5xl mx-auto px-6 pt-20 pb-16 border-b border-[var(--color-border)]"
      >
        <div className="text-center mb-12">
          <SectionLabel>Key Features</SectionLabel>
          <SectionHeading>What makes Bevisly different.</SectionHeading>
          <p className="text-[var(--color-text-muted)] max-w-xl mx-auto text-base leading-relaxed">
            A set of interlocking systems designed to make early-career hiring honest, fast, and skill-first.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {KEY_FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        id="faq"
        ref={sectionRefs["faq"] as React.RefObject<HTMLElement>}
        className="max-w-3xl mx-auto px-6 pt-20 pb-16 border-b border-[var(--color-border)]"
      >
        <div className="text-center mb-12">
          <SectionLabel>FAQ</SectionLabel>
          <SectionHeading>Common questions.</SectionHeading>
          <p className="text-[var(--color-text-muted)] max-w-xl mx-auto text-base leading-relaxed">
            Answered directly. No fluff.
          </p>
        </div>

        <div className="space-y-0 mb-12">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2 px-1">
            Candidates
          </h3>
          <div className="glass-panel rounded-2xl px-6 divide-y divide-[var(--color-border)] border border-[var(--color-border)]">
            {CANDIDATE_FAQS.map((item) => (
              <FaqAccordionItem key={item.q} item={item} />
            ))}
          </div>
        </div>

        <div className="space-y-0">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2 px-1">
            Employers
          </h3>
          <div className="glass-panel rounded-2xl px-6 divide-y divide-[var(--color-border)] border border-[var(--color-border)]">
            {EMPLOYER_FAQS.map((item) => (
              <FaqAccordionItem key={item.q} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact / Support Footer ── */}
      <section className="max-w-3xl mx-auto px-6 pt-20 text-center">
        <div className="glass-panel rounded-3xl p-10 border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-brand-primary)]/5 to-[var(--color-brand-secondary)]/5">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-primary)]/10 flex items-center justify-center mx-auto mb-5">
            <Mail size={22} className="text-[var(--color-brand-primary)]" />
          </div>
          <h2 className="text-2xl font-bold font-display text-[var(--color-text)] mb-2">
            Still have questions?
          </h2>
          <p className="text-[var(--color-text-muted)] text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Send us a message and we'll get back to you. We read every email personally.
          </p>
          <a href="mailto:thaninwatice@gmail.com">
            <Button size="lg" className="rounded-2xl h-12 px-8 mb-8">
              <Mail size={16} className="mr-2" />
              Contact Support
            </Button>
          </a>

          <div className="flex items-center justify-center gap-6 text-sm pt-4 border-t border-[var(--color-border)] flex-wrap">
            <Link
              to="/about"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] transition-colors"
            >
              About
            </Link>
            <Link
              to="/pricing"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/leaderboard"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              to="/privacy"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
