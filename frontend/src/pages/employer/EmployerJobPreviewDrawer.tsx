import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import DOMPurify from "dompurify";
import {
  X,
  DollarSign,
  Clock,
  Briefcase,
  Package,
  CheckCircle,
  Shield,
  Brain,
  Loader2,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getCompanyProfile } from "@/lib/api/companies";
import type { Job } from "@/types/job";
import type { Company } from "@/types/company";
import ResponsibilityScoreBadge from "@/components/employer/ResponsibilityScoreBadge";

interface Props {
  jobId: string | null;
  onClose: () => void;
}

export default function EmployerJobPreviewDrawer({ jobId, onClose }: Props) {
  const [job, setJob] = useState<Job | null>(null);
  const [companyProfile, setCompanyProfile] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      setCompanyProfile(null);
      return;
    }
    let mounted = true;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          proof_tasks(*),
          contact_person:profiles!employer_id(full_name, email),
          employer:profiles!jobs_employer_id_fkey(is_verified)
        `)
        .eq("id", jobId)
        .single();

      if (!error && data && mounted) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = data as any;
        setJob({ ...raw, employer_verified: raw.employer?.is_verified ?? false } as Job);
        if (raw.company_id) {
          getCompanyProfile(raw.company_id)
            .then((p) => { if (mounted) setCompanyProfile(p); })
            .catch(() => {});
        }
      }
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [jobId]);

  const proof = job?.proof_tasks?.[0];

  const salaryLabel = (() => {
    if (!job) return null;
    const type = job.compensation_type;
    const periodLabel = job.pay_period === "yearly" ? "/yr" : job.pay_period === "hourly" ? "/hr" : "/mo";
    const equityStr = job.equity_min && job.equity_max ? `${job.equity_min}%–${job.equity_max}% equity` : null;
    const salaryStr =
      job.salary_min && job.salary_max
        ? `${job.salary_min.toLocaleString()}–${job.salary_max.toLocaleString()} ${job.payment_currency}${periodLabel}`
        : job.payment_amount
          ? `${job.payment_amount.toLocaleString()} ${job.payment_currency}${periodLabel}`
          : null;
    if (type === "volunteer" || (!type && !job.paid)) return "Volunteer / Unpaid";
    if (type === "equity_only") return equityStr || "Equity";
    if (type === "salary_and_equity") return [salaryStr, equityStr].filter(Boolean).join(" + ") || "Competitive";
    return salaryStr || "Competitive";
  })();

  return createPortal(
    <AnimatePresence>
      {jobId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 z-[70] h-full w-full max-w-3xl bg-[var(--color-bg)] border-l border-[var(--color-border)] shadow-2xl flex flex-col"
          >
            {/* Sticky header */}
            <div className="sticky top-0 z-10 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between shrink-0">
              <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-brand-primary)]">
                Job Preview — Candidate View
              </p>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-[var(--color-text-muted)]">
                  <Loader2 className="animate-spin" size={28} />
                  <p className="text-sm">Loading job details…</p>
                </div>
              ) : !job ? (
                <div className="p-10 text-center text-[var(--color-text-muted)]">Job not found.</div>
              ) : (
                <div className="px-8 pt-6 pb-16 space-y-6">

                  {/* ── Header Card ── */}
                  <div className="relative glass-panel rounded-3xl p-8 border border-[var(--color-border)] overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--color-brand-primary)]/10 to-transparent blur-3xl -z-10" />
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[var(--color-text)] mb-3">
                          {job.title}
                        </h1>
                        <div className="flex items-center gap-2 text-[var(--color-text-muted)] flex-wrap">
                          {(companyProfile?.logo_url ?? job.company_logo) && (
                            <img
                              src={(companyProfile?.logo_url ?? job.company_logo)!}
                              alt={job.company ?? ""}
                              className="w-5 h-5 rounded-full object-cover border border-[var(--color-border)] shrink-0"
                            />
                          )}
                          <span className="font-semibold text-[var(--color-brand-primary)]">
                            {job.company || "Company"}
                          </span>
                          {job.employer_verified && (
                            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                              <ShieldCheck size={13} className="text-blue-500" />
                              Verified
                            </span>
                          )}
                          <span>•</span>
                          <span>{job.location || "Remote"}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-5">
                          {salaryLabel && salaryLabel !== "Volunteer / Unpaid" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-xs font-medium">
                              <DollarSign size={12} /> {salaryLabel}
                            </span>
                          )}
                          {job.expires_at && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-medium">
                              <Clock size={13} /> Expires {new Date(job.expires_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {proof && (
                        <div className="shrink-0 w-12 h-12 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shadow-inner">
                          <Brain size={22} className="text-[var(--color-brand-primary)]" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Metadata Strip ── */}
                  <div className="grid grid-cols-3 divide-x divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 overflow-hidden">
                    <div className="flex flex-col items-center justify-center py-4 px-3 gap-1">
                      <DollarSign size={15} className="text-[var(--color-text-muted)]" />
                      <span className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold tracking-wider">Salary</span>
                      <span className="text-sm font-bold text-[var(--color-text)] text-center leading-tight">{salaryLabel || "—"}</span>
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

                  {/* ── Content sections ── */}
                  <div className="space-y-10">

                    {/* About the Role */}
                    <section>
                      <h3 className="text-xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-2">
                        <Package size={22} className="text-[var(--color-brand-primary)]" />
                        About the Role
                      </h3>
                      <div className="prose dark:prose-invert max-w-none text-[var(--color-text-muted)] leading-relaxed text-base">
                        {job.description ? (
                          <ReactMarkdown>{DOMPurify.sanitize(job.description)}</ReactMarkdown>
                        ) : (
                          <p className="italic">No description provided.</p>
                        )}
                      </div>
                    </section>

                    {/* Requirements */}
                    {job.requirements && (
                      <section>
                        <h3 className="text-xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-2">
                          <CheckCircle size={22} className="text-[var(--color-brand-primary)]" />
                          Requirements
                        </h3>
                        <div className="border-l-2 border-[var(--color-brand-primary)] pl-6 py-1 space-y-1 prose dark:prose-invert max-w-none text-[var(--color-text-muted)] leading-relaxed text-base [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_li]:marker:text-[var(--color-brand-primary)]">
                          <ReactMarkdown>
                            {(() => {
                              const raw = DOMPurify.sanitize(job.requirements!);
                              const lines = raw.split("\n").filter((l) => l.trim());
                              const alreadyFormatted = lines.some((l) => /^[-*\d]/.test(l.trim()));
                              return alreadyFormatted ? raw : lines.map((l) => `- ${l.trim()}`).join("\n");
                            })()}
                          </ReactMarkdown>
                        </div>
                      </section>
                    )}

                    {/* About the Company */}
                    {companyProfile && (companyProfile.description || companyProfile.mission || companyProfile.culture) && (
                      <section>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                          <h3 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
                            <Briefcase size={22} className="text-[var(--color-brand-primary)]" />
                            About {job.company || "the Company"}
                          </h3>
                          <ResponsibilityScoreBadge score={companyProfile.responsibility_score} size="sm" showLabel />
                        </div>
                        <div className="space-y-4">
                          {companyProfile.description && (
                            <div className="prose dark:prose-invert max-w-none text-[var(--color-text-muted)] leading-relaxed text-base">
                              <ReactMarkdown>{DOMPurify.sanitize(companyProfile.description)}</ReactMarkdown>
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
                        </div>
                      </section>
                    )}

                    {/* The Challenge */}
                    {proof && (
                      <section>
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
                            <h4 className="text-xl font-bold text-[var(--color-text)] mb-4">{proof.title}</h4>
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
                                <span className="text-sm font-bold text-[var(--color-text)] capitalize">
                                  {proof.submission_format?.replace("_", " ") || "TBD"}
                                </span>
                              </div>
                              <div className="flex flex-col items-center justify-center p-3 border-l border-[var(--color-border)]">
                                <span className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold mb-1">Type</span>
                                <span className="text-sm font-bold text-[var(--color-text)] capitalize">
                                  {proof.submission_type || "TBD"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    )}

                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
