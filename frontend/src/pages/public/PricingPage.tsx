import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  X,
  ChevronDown,
  Star,
  Shield,
  Users,
  BarChart3,
  Sparkles,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

type BillingCycle = "monthly" | "annual";
type PricingMode = "employer" | "candidate";
type CellValue = true | false | string;

const EMPLOYER_PRICES = {
  starter: { monthly: 149, annual: 119 },
  growth:  { monthly: 299, annual: 239 },
};
const CANDIDATE_PRICES = {
  plus: { monthly: 9, annual: 7 },
};

/* ─── Employer feature table ─── */
interface FeatureRow { label: string; free: CellValue; starter: CellValue; growth: CellValue }
interface FeatureGroup { title: string; icon: React.ElementType; rows: FeatureRow[] }

const EMPLOYER_FEATURES: FeatureGroup[] = [
  {
    title: "Hiring",
    icon: Users,
    rows: [
      { label: "Active job listings",                    free: "1",      starter: "3",                   growth: "10" },
      { label: "Proof task designer",                    free: "Basic",  starter: "Full + AI templates", growth: "Full + AI templates" },
      { label: "AI proof task generation",               free: false,    starter: true,                  growth: true },
      { label: "Application status tracker",             free: true,     starter: true,                  growth: true },
      { label: "Kanban talent board",                    free: true,     starter: true,                  growth: true },
    ],
  },
  {
    title: "Signals & Trust",
    icon: Shield,
    rows: [
      { label: "Bevisly Score visibility",               free: "View only", starter: true,               growth: true },
      { label: "Verified Skills on profiles",            free: true,     starter: true,                  growth: true },
      { label: "Employer Profile + Responsibility Score",free: false,    starter: true,                  growth: true },
      { label: "Verified employer badge",                free: "After review", starter: true,            growth: true },
    ],
  },
  {
    title: "Pipeline & Discovery",
    icon: BarChart3,
    rows: [
      { label: "AI feedback suggestions",                free: false,    starter: true,                  growth: true },
      { label: "Candidate search / talent pool",         free: false,    starter: false,                 growth: true },
      { label: "Featured proofs on candidate cards",     free: false,    starter: false,                 growth: true },
      { label: "Featured job boost",                     free: "Add-on", starter: "Add-on",              growth: "1 included/mo" },
    ],
  },
  {
    title: "Support",
    icon: Sparkles,
    rows: [
      { label: "Email support",                          free: true,     starter: true,                  growth: "Priority" },
      { label: "Onboarding guidance",                    free: false,    starter: true,                  growth: true },
      { label: "Dedicated success contact",              free: false,    starter: false,                 growth: true },
    ],
  },
];

const FAQS_EMPLOYER = [
  { q: "Do I need a credit card to start the free trial?",
    a: "No. Start your 14-day trial with just an email address. We only ask for payment details if you decide to continue after the trial ends." },
  { q: "What happens when my 14-day trial ends?",
    a: "Your account switches to the Free plan automatically — you keep your data, one active job, and all your candidate submissions. Nothing is deleted." },
  { q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account settings in one click. No fees, no lengthy processes. Annual plan balances become credit toward any future subscription." },
  { q: "I'm outside the US — are prices in USD?",
    a: "Yes, all prices are in USD — the global SaaS standard. When Stripe is connected at checkout, it handles currency conversion for your local card. EU customers: VAT may apply." },
  { q: "What counts as an active job?",
    a: "Any published job listing accepting applications. Drafts and archived jobs don't count. You can rotate jobs freely — close one, open another — at any time." },
  { q: "Can I switch plans?",
    a: "Yes, any time. Upgrades apply immediately and are prorated. Downgrades take effect at the start of your next billing cycle so you get full value for what you've paid." },
];

const FAQS_CANDIDATE = [
  { q: "Is Bevisly really free for candidates?",
    a: "Yes, completely. Browsing jobs, completing proof tasks, building your public profile, and applying to roles are all free — forever, with no hidden limits." },
  { q: "What does Bevisly Plus add?",
    a: "Plus unlocks deeper insights: a full breakdown of how your Bevisly Score is calculated, skill gap recommendations, unlimited practice proofs, and priority placement in employer searches." },
  { q: "Can I cancel Plus anytime?",
    a: "Yes. Cancel from your settings with one click. If you're on annual, the unused balance becomes credit." },
  { q: "Will Plus help me get hired faster?",
    a: "Directly? No — we never gate job access behind a paywall. Indirectly? Yes — more practice proofs means a higher score, and a higher score means more visibility to employers searching for talent." },
];

/* ─── Small components ─── */

function Cell({ value }: { value: CellValue }) {
  if (value === true)  return <Check size={16} className="mx-auto text-[var(--color-brand-primary)]" />;
  if (value === false) return <X size={14} className="mx-auto text-[var(--color-text-muted)]/30" />;
  return <span className="text-xs text-[var(--color-text-muted)] leading-tight">{value}</span>;
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--color-border)] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <span className="font-medium text-[var(--color-text)] text-sm">{q}</span>
        <ChevronDown size={16} className={`shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed pb-4">{a}</p>
      </div>
    </div>
  );
}

function FeatureGroupSection({ group }: { group: FeatureGroup }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-3 px-4 bg-[var(--color-surface)] border-y border-[var(--color-border)] text-left"
      >
        <group.icon size={13} className="text-[var(--color-brand-primary)]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text)]">{group.title}</span>
        <ChevronDown size={13} className={`ml-auto text-[var(--color-text-muted)] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && group.rows.map((row) => (
        <div key={row.label} className="grid grid-cols-4 items-center border-b border-[var(--color-border)] hover:bg-[var(--color-surface)]/50 transition-colors">
          <div className="col-span-1 py-3 px-4 text-sm text-[var(--color-text-muted)]">{row.label}</div>
          <div className="text-center py-3 px-2"><Cell value={row.free} /></div>
          <div className="text-center py-3 px-2 bg-[var(--color-brand-primary)]/5"><Cell value={row.starter} /></div>
          <div className="text-center py-3 px-2"><Cell value={row.growth} /></div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main page ─── */
export default function PricingPage() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<BillingCycle>("annual");
  const [mode, setMode] = useState<PricingMode>("employer");

  const handleCTA = () => navigate("/auth?mode=signup");

  const starterPrice = EMPLOYER_PRICES.starter[billing];
  const growthPrice  = EMPLOYER_PRICES.growth[billing];
  const plusPrice    = CANDIDATE_PRICES.plus[billing];
  const billingLabel = billing === "annual" ? "/ mo, billed annually" : "/ month";

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">

      {/* ── Hero ─── */}
      <section className="relative pt-24 pb-14 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[var(--color-brand-primary)]/6 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-brand-primary)]/30 bg-[var(--color-brand-primary)]/8 text-[var(--color-brand-primary)] text-xs font-semibold mb-6">
            <Zap size={11} />
            14-day free trial on all paid plans · No credit card required
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-display text-[var(--color-text)] leading-tight mb-5">
            Hiring that pays<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-primary)] to-orange-400">
              for itself
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-lg max-w-xl mx-auto leading-relaxed">
            One great hire is worth $10k–$30k in productivity. One bad hire costs the same in losses.
            Bevisly starts at <strong className="text-[var(--color-text)]">$149/month</strong>.
          </p>
        </div>
      </section>

      {/* ── Mode + Billing toggles ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6 mb-10">
        <div className="inline-flex items-center p-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)]">
          <button
            onClick={() => setMode("employer")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${mode === "employer" ? "bg-[var(--color-text)] text-[var(--color-bg)] shadow-sm" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}
          >
            For Employers
          </button>
          <button
            onClick={() => setMode("candidate")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${mode === "candidate" ? "bg-[var(--color-text)] text-[var(--color-bg)] shadow-sm" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}
          >
            For Candidates
          </button>
        </div>

        <div className="inline-flex items-center p-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)]">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${billing === "monthly" ? "bg-[var(--color-text)] text-[var(--color-bg)] shadow-sm" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billing === "annual" ? "bg-[var(--color-text)] text-[var(--color-bg)] shadow-sm" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}
          >
            Annual
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--color-brand-primary)] text-white">SAVE 20%</span>
          </button>
        </div>
      </div>

      {/* ── EMPLOYER PLANS ─── */}
      {mode === "employer" && (
        <>
          {/* Plan cards */}
          <section className="px-6 pb-16">
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 items-start">

              {/* Free */}
              <div className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[var(--color-text)] mb-1">Free</h2>
                  <p className="text-sm text-[var(--color-text-muted)]">Try proof-based hiring at no cost.</p>
                </div>
                <div className="mb-1">
                  <span className="text-5xl font-bold text-[var(--color-text)]">$0</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mb-6">forever</p>
                <Button variant="outline" className="w-full mb-8" onClick={handleCTA}>Get started free</Button>
                <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
                  {["1 active job listing", "Basic proof task designer", "Kanban talent board", "Candidate status tracker", "Employer verification badge (after review)"].map(f => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check size={14} className="text-[var(--color-brand-primary)] shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Starter */}
              <div className="flex flex-col rounded-2xl border-2 border-[var(--color-brand-primary)] bg-[var(--color-surface)] p-7 relative shadow-[0_0_32px_-4px_rgba(255,139,61,0.25)]" style={{ marginTop: "-8px", marginBottom: "-8px" }}>
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--color-brand-primary)] text-white text-[11px] font-bold shadow">
                    <Star size={10} fill="white" /> MOST POPULAR
                  </span>
                </div>
                <div className="mb-5 mt-3">
                  <h2 className="text-lg font-bold text-[var(--color-text)] mb-1">Starter</h2>
                  <p className="text-sm text-[var(--color-text-muted)]">Everything for your first proof-based hire.</p>
                </div>
                <div className="mb-1">
                  <span className="text-5xl font-bold text-[var(--color-text)]">${starterPrice}</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mb-6">{billingLabel}</p>
                <Button className="w-full mb-1 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 text-white" onClick={handleCTA}>
                  Start free trial
                </Button>
                <p className="text-center text-[10px] text-[var(--color-text-muted)] mb-7">14-day free trial · No card required</p>
                <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
                  {["Up to 3 active job listings", "Full proof task designer + AI templates", "AI-generated proof tasks", "AI feedback suggestions for reviews", "Bevisly Score on every candidate", "Employer Profile + Responsibility Score", "Verified employer badge", "Email support"].map(f => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check size={14} className="text-[var(--color-brand-primary)] shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Growth */}
              <div className="flex flex-col rounded-2xl border-2 border-[var(--color-text)]/15 bg-[var(--color-surface)] p-7 relative">
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--color-text)] text-[var(--color-bg)] text-[11px] font-bold shadow">
                    BEST VALUE
                  </span>
                </div>
                <div className="mb-5 mt-3">
                  <h2 className="text-lg font-bold text-[var(--color-text)] mb-1">Growth</h2>
                  <p className="text-sm text-[var(--color-text-muted)]">Scale hiring across multiple roles.</p>
                </div>
                <div className="mb-1">
                  <span className="text-5xl font-bold text-[var(--color-text)]">${growthPrice}</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mb-6">{billingLabel}</p>
                <Button variant="outline" className="w-full mb-1" onClick={handleCTA}>Start free trial</Button>
                <p className="text-center text-[10px] text-[var(--color-text-muted)] mb-7">14-day free trial · No card required</p>
                <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
                  {["Up to 10 active job listings", "Everything in Starter", "Candidate search + talent pool", "Featured proofs on candidate cards", "1 Featured Job Boost included/month", "Priority support", "Dedicated success contact"].map(f => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check size={14} className="text-[var(--color-brand-primary)] shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Value anchor */}
          <section className="px-6 py-16 mb-6">
            <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, var(--color-slate-900) 0%, var(--color-slate-800) 100%)" }}>
              <div className="p-10 md:p-14 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-[var(--color-brand-secondary)]">
                  The real cost of hiring
                </p>
                <h2 className="text-2xl md:text-4xl font-bold leading-snug mb-6 text-[var(--color-slate-50)]">
                  One bad hire costs{" "}
                  <span className="text-[var(--color-brand-secondary)]">$15,000+</span>
                  {" "}in lost time,<br className="hidden md:block" />
                  rehiring fees, and team disruption.
                </h2>
                <p className="text-sm mb-10 max-w-xl mx-auto leading-relaxed text-[var(--color-slate-400)]">
                  Bevisly lets candidates prove their skills before you commit. At $149/month, it pays
                  for itself the moment you avoid one wrong hire.
                </p>
                <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
                  {[
                    { stat: "10–20h", label: "saved per hire on CV screening" },
                    { stat: "3×",     label: "more confidence in hiring decisions" },
                    { stat: "$149",   label: "per month vs. $15k per bad hire" },
                  ].map(({ stat, label }) => (
                    <div key={label}>
                      <div className="text-3xl font-bold text-[var(--color-brand-secondary)]">{stat}</div>
                      <div className="text-xs mt-1 leading-snug text-[var(--color-slate-500)]">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Feature comparison table */}
          <section className="px-6 pb-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold font-display text-[var(--color-text)] mb-8 text-center">Compare plans</h2>
              <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
                <div className="grid grid-cols-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
                  <div className="py-3 px-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Feature</div>
                  {(["Free", "Starter", "Growth"] as const).map((plan, i) => (
                    <div key={plan} className={`text-center py-3 px-2 text-sm font-bold text-[var(--color-text)] ${i === 1 ? "bg-[var(--color-brand-primary)]/5" : ""}`}>
                      {plan}
                      {i === 1 && <div className="text-[10px] font-normal text-[var(--color-brand-primary)]">Most Popular</div>}
                    </div>
                  ))}
                </div>
                {EMPLOYER_FEATURES.map(g => <FeatureGroupSection key={g.title} group={g} />)}
              </div>
            </div>
          </section>

          {/* Add-ons */}
          <section className="px-6 pb-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold font-display text-[var(--color-text)] mb-2 text-center">Add-ons</h2>
              <p className="text-[var(--color-text-muted)] text-center text-sm mb-8">Available on any plan. No subscription required.</p>
              <div className="max-w-sm mx-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 flex items-center justify-center shrink-0">
                    <TrendingUp size={18} className="text-[var(--color-brand-primary)]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--color-text)] mb-0.5">Featured Job Boost</h3>
                    <div className="text-2xl font-bold text-[var(--color-text)] mb-2">
                      $99 <span className="text-sm font-normal text-[var(--color-text-muted)]">/ job / 30 days</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                      Priority placement at the top of search results, a highlighted card style, and
                      increased visibility to the most active candidates on the platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="px-6 pb-16">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold font-display text-[var(--color-text)] mb-8 text-center">Common questions</h2>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 md:px-8">
                {FAQS_EMPLOYER.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── CANDIDATE PLANS ─── */}
      {mode === "candidate" && (
        <>
          <section className="px-6 pb-16">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <p className="text-[var(--color-text-muted)] max-w-lg mx-auto">
                  Job access is never behind a paywall. Bevisly Plus unlocks deeper insights and more
                  practice — so you can grow faster and stand out to employers.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 items-start">

                {/* Free */}
                <div className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7">
                  <div className="mb-5">
                    <h2 className="text-lg font-bold text-[var(--color-text)] mb-1">Free</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">Everything you need to get hired.</p>
                  </div>
                  <div className="mb-1">
                    <span className="text-5xl font-bold text-[var(--color-text)]">$0</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-6">forever, no expiry</p>
                  <Button variant="outline" className="w-full mb-8" onClick={handleCTA}>Get started free</Button>
                  <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
                    {["Public profile at /@yourname", "Apply to any open role", "Complete proof tasks for real jobs", "5 practice proofs per month", "Bevisly Score on your profile", "Application status tracker", "Verified skill badges", "Shareable proof certificates"].map(f => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check size={14} className="text-[var(--color-brand-primary)] shrink-0 mt-0.5" />{f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plus */}
                <div className="flex flex-col rounded-2xl border-2 border-[var(--color-brand-primary)] bg-[var(--color-surface)] p-7 relative shadow-[0_0_32px_-4px_rgba(255,139,61,0.2)]">
                  <div className="absolute -top-4 inset-x-0 flex justify-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-brand-primary)] text-white text-[11px] font-bold shadow">
                      <Sparkles size={10} /> BEVISLY PLUS
                    </span>
                  </div>
                  <div className="mb-5 mt-3">
                    <h2 className="text-lg font-bold text-[var(--color-text)] mb-1">Plus</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">Accelerate your growth and visibility.</p>
                  </div>
                  <div className="mb-1">
                    <span className="text-5xl font-bold text-[var(--color-text)]">${plusPrice}</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-6">{billingLabel}</p>
                  <Button className="w-full mb-1 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 text-white" onClick={handleCTA}>
                    Start free trial
                  </Button>
                  <p className="text-center text-[10px] text-[var(--color-text-muted)] mb-7">14-day free trial · No card required</p>
                  <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
                    {["Everything in Free", "Unlimited practice proofs", "Full Bevisly Score breakdown", "Skill gap insights + recommendations", "3 featured proofs pinned at top of profile", "Priority placement in employer searches"].map(f => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check size={14} className="text-[var(--color-brand-primary)] shrink-0 mt-0.5" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Candidate value anchor */}
          <section className="px-6 pb-16">
            <div className="max-w-3xl mx-auto rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, var(--color-slate-900) 0%, var(--color-slate-800) 100%)" }}>
              <div className="p-10 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-[var(--color-brand-secondary)]">
                  Why it matters
                </p>
                <h2 className="text-2xl md:text-3xl font-bold leading-snug mb-4 text-[var(--color-slate-50)]">
                  A higher Bevisly Score means{" "}
                  <span className="text-[var(--color-brand-secondary)]">more employer attention</span>.
                </h2>
                <p className="text-sm leading-relaxed max-w-md mx-auto text-[var(--color-slate-400)]">
                  Employers search and filter candidates by score. More practice proofs = higher score =
                  more visibility. Plus gives you unlimited practice so you can improve as fast as you want.
                </p>
              </div>
            </div>
          </section>

          {/* Candidate FAQ */}
          <section className="px-6 pb-16">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold font-display text-[var(--color-text)] mb-8 text-center">Common questions</h2>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 md:px-8">
                {FAQS_CANDIDATE.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── Bottom CTA ─── */}
      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto text-center rounded-3xl border border-[var(--color-brand-primary)]/25 bg-gradient-to-b from-[var(--color-brand-primary)]/5 to-transparent p-12">
          <h2 className="text-3xl font-bold font-display text-[var(--color-text)] mb-3">
            {mode === "employer" ? "Ready to hire smarter?" : "Ready to prove your skills?"}
          </h2>
          <p className="text-[var(--color-text-muted)] mb-8 text-sm">
            {mode === "employer"
              ? "Join companies using proof-based hiring to find better candidates, faster."
              : "Build a proof portfolio that speaks louder than any résumé."}
          </p>
          <Button className="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 text-white px-8 py-3 text-base" onClick={handleCTA}>
            {mode === "employer" ? "Start your 14-day free trial" : "Get started — it's free"}
          </Button>
          <p className="text-xs text-[var(--color-text-muted)] mt-4">No credit card required · Cancel anytime</p>
        </div>
      </section>

      <div className="text-center pb-8 text-xs" style={{ color: "var(--color-text-muted)", opacity: 0.5 }}>
        Prices in USD · EU VAT may apply · Cancel anytime
      </div>
    </div>
  );
}
