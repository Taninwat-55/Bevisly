import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import type { SessionUser } from "@/context/AuthContext";
import {
  Loader2,
  Clock,
  Package,
  Brain,
  Shield,
  ShieldCheck,
  DollarSign,
  CheckCircle,
  X,
  Zap,
  Star,
  Briefcase,
  Globe,
  User,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Job } from "@/types/job";
import {
  checkSubmissionStatus,
  checkFastPass,
  attachPastProof,
  type FastPassMatch,
} from "@/lib/api/submissions";
import { Helmet } from "react-helmet-async";
import DOMPurify from "dompurify";
import ReactMarkdown from "react-markdown";
import { getCompanyProfile } from "@/lib/api/companies";
import type { Company } from "@/types/company";
import ResponsibilityScoreBadge from "@/components/employer/ResponsibilityScoreBadge";

/* ─── Component ─────────────────────────────────────────────── */
export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role: SessionUser["role"] = user?.role ?? null;

  const [job, setJob] = useState<Job | null>(null);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const hasApplied = !!existingStatus;
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [skipModal, setSkipModal] = useState<boolean>(
    localStorage.getItem("skipProofConfirm") === "true"
  );
  const [fastPassMatch, setFastPassMatch] = useState<FastPassMatch | null>(null);
  const [showFastPass, setShowFastPass] = useState(false);
  const [checkingFastPass, setCheckingFastPass] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<Company | null>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  /* ─── Fetch job + proof tasks ─────────────────────────────── */
  useEffect(() => {
    if (!id) return;
    const fetchJob = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          proof_tasks(*),
          contact_person:profiles!employer_id(full_name, email),
          employer:profiles!jobs_employer_id_fkey(is_verified)
        `)
        .eq("id", id)
        .single();

      if (error) toast.error(error.message);
      else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = data as any;
        const jobData: Job = {
          ...raw,
          employer_verified: raw.employer?.is_verified ?? false,
        };
        setJob(jobData);
        // Fetch company profile for About section
        if ((data as Job).company_id) {
          getCompanyProfile((data as Job).company_id!).then(setCompanyProfile).catch(() => {});
        }
      }

      // Check active submission
      if (user) {
        const sub = await checkSubmissionStatus(id);
        if (sub) setExistingStatus(sub.status);
      }

      setLoading(false);
    };
    fetchJob();
  }, [id, user]);

  /* ─── Sticky bar observer ────────────────────────────────── */
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [job]);

  /* ─── Loading & Empty States ─────────────────────────────── */
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-[var(--color-text-muted)]">
        <Loader2 className="animate-spin mr-2" size={18} /> Loading job details…
      </div>
    );

  if (!job)
    return (
      <div className="p-10 text-center text-[var(--color-error)]">
        Job not found or unavailable.
      </div>
    );

  const proof = job.proof_tasks?.[0];

  /* ─── Simple Apply (no proof task) ──────────────────────── */
  const handleSimpleApply = async () => {
    if (!user || !job) return;
    setStarting(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("resume_url")
        .eq("id", user.id)
        .single();

      if (!profile?.resume_url) {
        toast.error(
          "Please upload your CV on your profile before applying.",
          { duration: 6000 }
        );
        navigate("/candidate/profile");
        return;
      }

      const { error } = await supabase.from("submissions").insert({
        user_id: user.id,
        job_id: job.id,
        proof_task_id: null,
        status: "submitted",
        hiring_stage: "new",
        resume_url: profile.resume_url,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });

      if (error) throw error;
      setExistingStatus("submitted");
      toast.success("Application sent! The employer will review your profile.");
    } catch {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setStarting(false);
    }
  };

  /* ─── Candidate CTA ─────────────────────────────────────── */
  const handleCTA = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // No proof task — quick apply flow
    if (!proof) {
      if (!existingStatus) await handleSimpleApply();
      return;
    }

    // If already applied/started, just go there
    if (existingStatus) {
      navigate(`/candidate/proof/${proof.id}`);
      return;
    }

    // Check for a reusable high-rated past proof
    setCheckingFastPass(true);
    try {
      const match = await checkFastPass(job!.id, job!.title);
      if (match) {
        setFastPassMatch(match);
        setShowFastPass(true);
        return;
      }
    } finally {
      setCheckingFastPass(false);
    }

    if (skipModal) {
      confirmStartProof();
    } else {
      setShowConfirm(true);
    }
  };

  const handleAttachPastProof = async () => {
    if (!fastPassMatch || !job) return;
    setAttaching(true);
    try {
      await attachPastProof(fastPassMatch, job.id, proof?.id ?? null);
      setShowFastPass(false);
      setExistingStatus("submitted");
      toast.success("⚡ Past proof attached — you're in the employer's review queue!");
    } catch {
      toast.error("Failed to attach past proof. Please try again.");
    } finally {
      setAttaching(false);
    }
  };

  const confirmStartProof = () => {
    if (!proof) return;
    setStarting(true);
    toast.success("Proof task started");
    setTimeout(() => {
      setShowConfirm(false);
      navigate(`/candidate/proof/${proof.id}`);
    }, 600);
  };

  // Construct Google Jobs Schema (JSON-LD)
  const jobSchema = job ? JSON.stringify({
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.created_at,
    "validThrough": job.expires_at || undefined,
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company,
      "sameAs": "https://bevisly.com"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location || "Remote"
      }
    },
    "baseSalary": job.show_salary_range ? {
      "@type": "MonetaryAmount",
      "currency": job.payment_currency || "EUR",
      "value": {
        "@type": "QuantitativeValue",
        "minValue": job.salary_min,
        "maxValue": job.salary_max,
        "unitText": job.pay_period === "hourly" ? "HOUR" : "MONTH"
      }
    } : undefined
  }) : null;

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {job && (
        <Helmet>
          <title>{`${job.title} at ${job.company} | Bevisly`}</title>
          <meta name="description" content={`Apply for the ${job.title} role at ${job.company}. Proof-based hiring — demonstrate your skills with a real task, not a CV.`} />
          <link rel="canonical" href={`https://bevisly.com/jobs/${job.id}`} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={`https://bevisly.com/jobs/${job.id}`} />
          <meta property="og:title" content={`${job.title} at ${job.company} | Bevisly`} />
          <meta property="og:description" content={job.description?.slice(0, 160) ?? `Apply for the ${job.title} role at ${job.company} on Bevisly.`} />
          <meta property="og:image" content="https://bevisly.com/logo.png" />
          <meta property="og:site_name" content="Bevisly" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@bevisly" />
          <meta name="twitter:title" content={`${job.title} at ${job.company} | Bevisly`} />
          <meta name="twitter:description" content={`Proof-based hiring for ${job.title} at ${job.company}. Apply with a real task, not a CV.`} />
          <meta name="twitter:image" content="https://bevisly.com/logo.png" />
          <script type="application/ld+json">{jobSchema}</script>
        </Helmet>
      )}

      <div className="max-w-4xl mx-auto px-6 pt-8 pb-32">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors group"
        >
          <span className="p-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] group-hover:border-[var(--color-text-muted)] transition-colors">
            ←
          </span>
          Back
        </button>

        {/* ── Job Header Card ──────────────────────────────── */}
        <div className="relative glass-panel rounded-3xl p-8 border border-[var(--color-border)] overflow-hidden mb-6 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--color-brand-primary)]/10 to-transparent blur-3xl -z-10" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-[var(--color-text)] mb-3">
                {job.title}
              </h1>
              <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                {(companyProfile?.logo_url ?? job.company_logo) && (
                  <img
                    src={(companyProfile?.logo_url ?? job.company_logo)!}
                    alt={job.company ?? ""}
                    className="w-5 h-5 rounded-full object-cover border border-[var(--color-border)] shrink-0"
                  />
                )}
                {companyProfile?.slug ? (
                  <a
                    href={`/company/${companyProfile.slug}`}
                    className="font-semibold text-[var(--color-brand-primary)] hover:underline underline-offset-2"
                  >
                    {job.company || "Company"}
                  </a>
                ) : (
                  <span className="font-semibold text-[var(--color-brand-primary)]">{job.company || "Company"}</span>
                )}
                {job.employer_verified && (
                  <span title="Verified Employer" className="inline-flex items-center gap-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                    <ShieldCheck size={13} className="text-blue-500" />
                    Verified
                  </span>
                )}
                <span>•</span>
                <span>{job.location || "Remote"}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-5">
                {(() => {
                  const type = job.compensation_type;
                  const periodLabel = job.pay_period === 'yearly' ? '/yr' : job.pay_period === 'hourly' ? '/hr' : '/mo';
                  const equityStr = job.equity_min && job.equity_max ? `${job.equity_min}%–${job.equity_max}% equity` : null;
                  const salaryStr = job.salary_min && job.salary_max
                    ? `${job.salary_min.toLocaleString()}–${job.salary_max.toLocaleString()} ${job.payment_currency}${periodLabel}`
                    : job.payment_amount ? `${job.payment_amount.toLocaleString()} ${job.payment_currency}${periodLabel}` : null;

                  let label: string | null = null;
                  if (type === 'volunteer' || (!type && !job.paid)) label = null;
                  else if (type === 'equity_only') label = equityStr;
                  else if (type === 'salary_and_equity') label = [salaryStr, equityStr].filter(Boolean).join(' + ');
                  else label = salaryStr;

                  return label ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-xs font-medium">
                      <DollarSign size={12} /> {label}
                    </span>
                  ) : null;
                })()}
                {job.expires_at && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-medium">
                    <Clock size={13} /> Expires {new Date(job.expires_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            {proof && (
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shadow-inner">
                <Brain size={26} className="text-[var(--color-brand-primary)]" />
              </div>
            )}
          </div>
        </div>

        {/* ── Metadata Strip ───────────────────────────────── */}
        <div className="grid grid-cols-3 divide-x divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 mb-6 overflow-hidden">
          <div className="flex flex-col items-center justify-center py-4 px-3 gap-1">
            <DollarSign size={15} className="text-[var(--color-text-muted)]" />
            <span className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold tracking-wider">Salary</span>
            <span className="text-sm font-bold text-[var(--color-text)] text-center leading-tight">
              {(() => {
                const type = job.compensation_type;
                const periodLabel = job.pay_period === 'yearly' ? '/yr' : '/mo';
                const equityStr = job.equity_min && job.equity_max ? `${job.equity_min}%–${job.equity_max}% equity` : null;
                const salaryStr = job.salary_min && job.salary_max
                  ? `${job.salary_min.toLocaleString()}–${job.salary_max.toLocaleString()} ${job.payment_currency}${periodLabel}`
                  : job.payment_amount
                    ? `${job.payment_amount.toLocaleString()} ${job.payment_currency}${periodLabel}`
                    : null;
                if (type === 'volunteer' || (!type && !job.paid)) return "Volunteer / Unpaid";
                if (type === 'equity_only') return equityStr || "Equity";
                if (type === 'salary_and_equity') return [salaryStr, equityStr].filter(Boolean).join(' + ') || "Competitive";
                return salaryStr || "Competitive";
              })()}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center py-4 px-3 gap-1">
            <Clock size={15} className="text-[var(--color-text-muted)]" />
            <span className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold tracking-wider">Deadline</span>
            <span className="text-sm font-bold text-[var(--color-text)] text-center leading-tight">
              {job.expires_at ? new Date(job.expires_at).toLocaleDateString() : "No deadline"}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center py-4 px-3 gap-1">
            <Briefcase size={15} className="text-[var(--color-text-muted)]" />
            <span className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold tracking-wider">Job Type</span>
            <span className="text-sm font-bold text-[var(--color-text)] text-center leading-tight">{job.job_type || "Full-time"}</span>
          </div>
        </div>

        {/* ── Application CTA Card ─────────────────────────── */}
        <div ref={ctaRef} className="glass-panel p-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--color-brand-primary)]/5 blur-3xl -z-10" />
          {role === "employer" ? (
            <div className="space-y-3">
              <button
                onClick={() => navigate("/employer")}
                className="w-full py-4 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white font-bold rounded-2xl transition-all shadow-lg"
              >
                View Submissions
              </button>
              <p className="text-[10px] text-[var(--color-text-muted)] text-center italic">You are viewing this as an employer.</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 min-w-0">
                {hasApplied ? (
                  <div className="flex items-center gap-2 text-emerald-500 font-bold text-lg">
                    <CheckCircle size={22} /> Application Submitted
                  </div>
                ) : (
                  <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                    This is a {proof?.expected_time || "30-minute"} proof task. Your submission goes directly to the employer for review — no ATS, no keyword filter.
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={handleCTA}
                  disabled={hasApplied || checkingFastPass || starting}
                  className={`px-8 py-3.5 rounded-2xl font-bold text-base transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 whitespace-nowrap
                    ${hasApplied
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default"
                      : "bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white disabled:opacity-70"
                    }`}
                >
                  {(checkingFastPass || starting) && <Loader2 size={18} className="animate-spin" />}
                  {hasApplied
                    ? proof ? "View Submission" : "Applied ✓"
                    : checkingFastPass || starting ? "Please wait…"
                    : proof ? "Start Proof Task" : "Apply Now"}
                </button>
                {/* {hasApplied && (
                  <button
                    onClick={() => navigate("/candidate/dashboard")}
                    className="px-8 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-semibold hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-muted)]"
                  >
                    Back to Dashboard
                  </button>
                )} */}
              </div>
            </div>
          )}
        </div>

        {/* ── Job Content ──────────────────────────────────── */}
        <div className="space-y-12">

          {/* About the Role */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h3 className="text-xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-2">
              <Package size={22} className="text-[var(--color-brand-primary)]" />
              About the Role
            </h3>
            <div className="prose dark:prose-invert max-w-none text-[var(--color-text-muted)] leading-relaxed text-lg">
              {job.description ? (
                <ReactMarkdown>{DOMPurify.sanitize(job.description)}</ReactMarkdown>
              ) : (
                "No description provided."
              )}
            </div>
          </section>

          {/* Requirements */}
          {job.requirements && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-2">
                <CheckCircle size={22} className="text-[var(--color-brand-primary)]" />
                Requirements
              </h3>
              <div className="border-l-2 border-[var(--color-brand-primary)] pl-6 py-1 space-y-1 prose dark:prose-invert max-w-none text-[var(--color-text-muted)] leading-relaxed text-base [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_li]:marker:text-[var(--color-brand-primary)]">
                <ReactMarkdown>
                  {(() => {
                    const raw = DOMPurify.sanitize(job.requirements);
                    const lines = raw.split("\n").filter((l) => l.trim());
                    const alreadyFormatted = lines.some((l) => /^[-*\d]/.test(l.trim()));
                    return alreadyFormatted
                      ? raw
                      : lines.map((l) => `- ${l.trim()}`).join("\n");
                  })()}
                </ReactMarkdown>
              </div>
            </section>
          )}

          {/* About the Company */}
          {companyProfile && (companyProfile.description || companyProfile.mission || companyProfile.culture) && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h3 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
                  <Briefcase size={22} className="text-[var(--color-brand-primary)]" />
                  About {job.company || "the Company"}
                </h3>
                <div className="flex items-center gap-3">
                  <ResponsibilityScoreBadge score={companyProfile.responsibility_score} size="sm" showLabel />
                </div>
              </div>
              <div className="space-y-6">
                {companyProfile.description && (
                  <div>
                    <div className="prose dark:prose-invert max-w-none text-[var(--color-text-muted)] leading-relaxed text-base">
                      <ReactMarkdown>{DOMPurify.sanitize(companyProfile.description)}</ReactMarkdown>
                    </div>
                  </div>
                )}
                {companyProfile.mission && (
                  <div className="p-5 rounded-2xl bg-[var(--color-surface)]/50 border border-[var(--color-border)]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Our Mission</h4>
                    <p className="text-[var(--color-text)] leading-relaxed">{companyProfile.mission}</p>
                  </div>
                )}
                {companyProfile.culture && (
                  <div className="p-5 rounded-2xl bg-[var(--color-surface)]/50 border border-[var(--color-border)]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Culture & Values</h4>
                    <p className="text-[var(--color-text)] leading-relaxed">{companyProfile.culture}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-4 pt-2">
                  {companyProfile.website_url && (
                    <a
                      href={companyProfile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[var(--color-brand-primary)] hover:underline font-medium"
                    >
                      <Globe size={14} /> Visit company website
                    </a>
                  )}
                  {job.contact_person && (
                    <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] border-l border-[var(--color-border)] pl-4">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-[var(--color-brand-primary)]" />
                        <span>{job.contact_person.full_name || "Contact Person"}</span>
                      </div>
                      {job.contact_person.email && (
                        <a
                          href={`mailto:${job.contact_person.email}`}
                          className="flex items-center gap-2 hover:text-[var(--color-brand-primary)] transition-colors"
                        >
                          <Mail size={14} className="text-[var(--color-brand-primary)]" />
                          <span>{job.contact_person.email}</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* The Challenge */}
          {proof && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
                  <Shield size={22} className="text-[var(--color-brand-primary)]" />
                  The Challenge
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-wider">
                  <Brain size={12} /> Proof-Based
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-brand-primary)]/10 to-purple-500/10 rounded-3xl blur opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative glass-panel p-8 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
                  <h4 className="text-2xl font-bold text-[var(--color-text)] mb-4">{proof.title}</h4>
                  <div className="prose dark:prose-invert max-w-none mb-8
                    prose-p:text-[var(--color-text-muted)] prose-p:leading-7 prose-p:mb-4
                    prose-strong:text-[var(--color-text)] prose-strong:font-semibold
                    prose-ul:my-4 prose-ul:pl-5 prose-li:text-[var(--color-text-muted)] prose-li:mb-1.5
                    prose-h3:text-[var(--color-text)] prose-h3:font-semibold prose-h4:text-[var(--color-text)]">
                    <ReactMarkdown>{DOMPurify.sanitize(proof.description || "No description provided.")}</ReactMarkdown>
                  </div>

                  {Array.isArray(proof.rubric_criteria) && proof.rubric_criteria.length > 0 && (
                    <div className="mb-6 p-5 rounded-2xl bg-[var(--color-bg)]/50 border border-[var(--color-border)]">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
                          How this proof will be scored
                        </h5>
                        <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                          {proof.rubric_locked_at ? "Locked rubric" : "Scoring contract"}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] mb-4">
                        The employer evaluates submissions against these criteria. Weights show how much each criterion contributes to the overall score.
                      </p>
                      <ul className="space-y-2">
                        {proof.rubric_criteria.map((c: { name: string; weight: number; description: string }) => (
                          <li
                            key={c.name}
                            className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]"
                          >
                            <span className="shrink-0 inline-flex items-center justify-center min-w-[44px] h-7 px-2 rounded-md bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-xs font-bold">
                              {c.weight}%
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-[var(--color-text)]">{c.name}</p>
                              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{c.description}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-[var(--color-bg)]/50 border border-[var(--color-border)]">
                    <div className="flex flex-col items-center justify-center p-3">
                      <span className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold mb-1">Est. Time</span>
                      <span className="text-sm font-bold text-[var(--color-text)]">{proof.expected_time || "TBD"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 border-l border-[var(--color-border)]">
                      <span className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold mb-1">Format</span>
                      <span className="text-sm font-bold text-[var(--color-text)] capitalize">{proof.submission_format?.replace("_", " ") || "TBD"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 border-l border-[var(--color-border)]">
                      <span className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold mb-1">Type</span>
                      <span className="text-sm font-bold text-[var(--color-text)] capitalize">{proof.submission_type || "TBD"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ── Sticky Bottom Action Bar ─────────────────────────── */}
      <AnimatePresence>
        {showStickyBar && !showConfirm && !showFastPass && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed bottom-0 inset-x-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] px-6 py-3 shadow-2xl"
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--color-text)] truncate">{job.title}</p>
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] truncate">
                  <span>{job.company} · {job.location || "Remote"}</span>
                  {proof?.expected_time && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-[var(--color-text-muted)] shrink-0" />
                      <span className="flex items-center gap-1 shrink-0">
                        <Clock size={10} />
                        {proof.expected_time}
                      </span>
                    </>
                  )}
                </div>
              </div>
              {role === "employer" ? (
                <button
                  onClick={() => navigate("/employer")}
                  className="shrink-0 px-6 py-2.5 rounded-xl bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white font-bold text-sm transition-all"
                >
                  View Submissions
                </button>
              ) : (
                <button
                  onClick={handleCTA}
                  disabled={hasApplied || checkingFastPass || starting}
                  className={`shrink-0 px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2
                    ${hasApplied
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default"
                      : "bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white disabled:opacity-70"
                    }`}
                >
                  {(checkingFastPass || starting) && <Loader2 size={15} className="animate-spin" />}
                  {hasApplied
                    ? <><CheckCircle size={15} /> {proof ? "Submitted" : "Applied"}</>
                    : checkingFastPass || starting ? "Please wait…"
                    : proof ? "Start Proof Task" : "Apply Now"}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Fast-Pass Modal */}
        {createPortal(
        <AnimatePresence>
          {showFastPass && fastPassMatch && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.target === e.currentTarget && setShowFastPass(false)}
            >
              <motion.div
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-8 max-w-md w-[90%] relative overflow-hidden"
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" />
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-56 h-56 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-5 text-amber-400">
                  <Zap size={30} />
                </div>

                <h2 className="text-xl font-bold text-[var(--color-text)] text-center mb-2">
                  Fast-Pass Available!
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] text-center mb-5 leading-relaxed">
                  You already have a verified proof for a similar role. Attach it instantly or start fresh.
                </p>

                {/* Past proof card */}
                <div className="bg-[var(--color-bg)] border border-amber-400/20 rounded-xl p-4 mb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--color-text-muted)] mb-1">Verified Proof Task</p>
                      <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                        {fastPassMatch.proofTaskTitle}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1 truncate">
                        for {fastPassMatch.jobTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < fastPassMatch.maxStars
                              ? "text-amber-400 fill-amber-400"
                              : "text-[var(--color-border)]"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowFastPass(false);
                      if (skipModal) confirmStartProof();
                      else setShowConfirm(true);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] font-medium text-sm transition-colors"
                  >
                    Take New Test
                  </button>
                  <button
                    onClick={handleAttachPastProof}
                    disabled={attaching}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors shadow-lg hover:shadow-amber-400/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {attaching ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Zap size={15} />
                    )}
                    {attaching ? "Attaching..." : "Attach Past Proof"}
                  </button>
                </div>

                <button
                  onClick={() => setShowFastPass(false)}
                  className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  <X size={20} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
        )}

        {/* Confirmation Modal */}
        {createPortal(
        <AnimatePresence>
          {showConfirm && proof && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-8 max-sm w-[90%] text-center relative overflow-hidden"
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-brand-primary)] to-transparent opacity-50" />

                <div className="w-16 h-16 rounded-full bg-[var(--color-brand-primary)]/10 flex items-center justify-center mx-auto mb-4 text-[var(--color-brand-primary)]">
                  <Brain size={32} />
                </div>

                <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">Ready to Prove It?</h2>
                <p className="text-sm text-[var(--color-text-muted)] mb-8 leading-relaxed">
                  You're starting the proof task for <strong>{job.title}</strong>. ~30 minutes. Your work will be reviewed by the employer and added to your proof portfolio regardless of outcome.
                </p>

                <label className="flex items-center justify-center gap-2 text-xs text-[var(--color-text-muted)] mb-6 cursor-pointer select-none hover:text-[var(--color-text)] transition-colors">
                  <input
                    type="checkbox"
                    checked={skipModal}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSkipModal(checked);
                      localStorage.setItem("skipProofConfirm", String(checked));
                    }}
                    className="rounded border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]/20"
                  />
                  Don’t show this again
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] font-medium text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStartProof}
                    disabled={starting}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white font-bold text-sm transition-colors shadow-lg hover:shadow-[var(--color-brand-primary)]/25 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {starting ? "Starting..." : "Let's Go!"}
                  </button>
                </div>

                <button
                  onClick={() => setShowConfirm(false)}
                  className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  <X size={20} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
        )}
    </div>
  );
}
