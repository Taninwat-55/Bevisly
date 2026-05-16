import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import {
  Loader2,
  Globe,
  Briefcase,
  MapPin,
  BadgeCheck,
  Clock,
  ShieldCheck,
  Building2,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { getCompanyBySlug } from "@/lib/api/companies";
import type { Company } from "@/types/company";
import type { Job } from "@/types/job";
import BackButton from "@/components/common/BackButton";
import ResponsibilityScoreBadge from "@/components/employer/ResponsibilityScoreBadge";
import DOMPurify from "dompurify";
import ReactMarkdown from "react-markdown";

export default function CompanyBrandPage() {
  const { slug } = useParams<{ slug: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setLoading(true);

      const co = await getCompanyBySlug(slug);
      if (!co) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setCompany(co);

      // Fetch active jobs for this company
      const { data: jobData } = await supabase
        .from("jobs")
        .select("id, title, location, job_type, work_mode, company, created_at")
        .eq("company_id", co.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(20);

      setJobs((jobData as Job[]) ?? []);
      setLoading(false);
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (notFound || !company) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Building2 size={36} className="text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Company Not Found</h1>
          <p className="text-[var(--color-text-muted)] mb-6">
            This employer page doesn't exist or hasn't been set up yet.
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl font-medium hover:bg-[var(--color-bg)] transition"
          >
            Browse Jobs
          </Link>
        </div>
      </div>
    );
  }

  const companyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/company/${slug}`
    : `https://bevisly.com/company/${slug}`;

  const initials = company.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const isNew = company.responsibility_score === null || company.responsibility_score === undefined;

  return (
    <>
      <Helmet>
        <title>{company.name} - Employer Profile | Bevisly</title>
        <meta
          name="description"
          content={`${company.name} is hiring on Bevisly. ${jobs.length} open role${jobs.length !== 1 ? "s" : ""}.${company.description ? ` ${company.description.slice(0, 100)}` : ""}`}
        />
        <meta property="og:title" content={`${company.name} | Bevisly Employer Profile`} />
        <meta property="og:description" content={company.description ?? `${company.name} is hiring on Bevisly.`} />
        <meta property="og:url" content={companyUrl} />
        {company.logo_url && <meta property="og:image" content={company.logo_url} />}
        <link rel="canonical" href={companyUrl} />
      </Helmet>

      <motion.div
        className="min-h-screen bg-[var(--color-bg)] px-4 md:px-6 py-8 md:py-12 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-4xl mx-auto">
          <BackButton label="Back to Jobs" to="/jobs" />

          {/* Company Header Card */}
          <div className="mt-8 relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8 shadow-sm">
            {/* Accent bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-brand-primary)] to-blue-500" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Logo / Initials */}
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-16 h-16 rounded-xl object-contain border border-[var(--color-border)] bg-white p-1 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {initials}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-[var(--color-text)]">{company.name}</h1>
                  <BadgeCheck className="text-blue-500 shrink-0" size={22} fill="white" />
                </div>

                {company.website_url && (
                  <a
                    href={company.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-[var(--color-brand-primary)] hover:underline font-medium"
                  >
                    <Globe size={13} />
                    {company.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    <ExternalLink size={12} className="opacity-60" />
                  </a>
                )}
              </div>

              {/* Responsibility Score — prominent */}
              <div className="shrink-0">
                <ResponsibilityScoreBadge score={company.responsibility_score} size="lg" showLabel={false} />
                <p className="text-xs text-[var(--color-text-muted)] mt-1 text-center">
                  Responsibility
                </p>
              </div>
            </div>

            {/* Trust Stats Row */}
            <div className="mt-6 pt-5 border-t border-[var(--color-border)] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-[var(--color-text)]">
                  {isNew ? "—" : `${company.responsibility_score}/100`}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5 flex items-center justify-center gap-1">
                  <ShieldCheck size={11} />
                  Responsibility Score
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-[var(--color-text)]">
                  {company.avg_review_days == null
                    ? "—"
                    : `~${company.avg_review_days}d`}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5 flex items-center justify-center gap-1">
                  <Clock size={11} />
                  Avg Review Time
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-[var(--color-text)]">
                  {jobs.length}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5 flex items-center justify-center gap-1">
                  <Briefcase size={11} />
                  Open Role{jobs.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-[var(--color-text)]">
                  {isNew ? "New" : "Verified"}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5 flex items-center justify-center gap-1">
                  <BadgeCheck size={11} />
                  Status
                </p>
              </div>
            </div>
          </div>

          {/* Score Explainer (for new employers or low scorers) */}
          {isNew && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
              <ShieldCheck size={16} className="shrink-0 mt-0.5" />
              <span>
                <strong>New Employer</strong> — Responsibility Score builds up as candidates submit proofs and the employer reviews them. A high score means fast responses and quality feedback.
              </span>
            </div>
          )}

          {/* About Section */}
          {(company.description || company.mission || company.culture) && (
            <section className="mt-8">
              <h2 className="text-xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-2">
                <Building2 size={20} className="text-[var(--color-brand-primary)]" />
                About {company.name}
              </h2>
              <div className="space-y-4">
                {company.description && (
                  <div className="prose prose-invert max-w-none text-[var(--color-text-muted)] leading-relaxed text-base">
                    <ReactMarkdown>
                      {DOMPurify.sanitize(company.description)}
                    </ReactMarkdown>
                  </div>
                )}
                {company.mission && (
                  <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Our Mission</h3>
                    <p className="text-[var(--color-text)] leading-relaxed">{company.mission}</p>
                  </div>
                )}
                {company.culture && (
                  <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Culture & Values</h3>
                    <p className="text-[var(--color-text)] leading-relaxed">{company.culture}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Team Photos */}
          {Array.isArray(company.team_photos) && company.team_photos.length > 0 && (
            <section className="mt-8">
              <div className={`grid gap-4 ${company.team_photos.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                {company.team_photos.map((url, i) => (
                  <div key={i} className="aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--color-border)]">
                    <img src={url} alt={`${company.name} team`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Open Jobs Section */}
          <section className="mt-8">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-[var(--color-brand-primary)]" />
              Open Roles
              {jobs.length > 0 && (
                <span className="ml-1 text-sm font-normal text-[var(--color-text-muted)]">({jobs.length})</span>
              )}
            </h2>

            {jobs.length === 0 ? (
              <div className="py-10 text-center rounded-2xl border border-dashed border-[var(--color-border)]">
                <Briefcase size={28} className="mx-auto text-[var(--color-text-muted)] mb-3 opacity-40" />
                <p className="text-[var(--color-text-muted)]">No open roles right now.</p>
                <p className="text-sm text-[var(--color-text-muted)] mt-1 opacity-70">Check back soon or browse other employers.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="block p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-primary)] hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-brand-primary)] transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                          {job.location && (
                            <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                              <MapPin size={11} />
                              {job.location}
                            </span>
                          )}
                          {job.work_mode && (
                            <span className="text-xs text-[var(--color-text-muted)] capitalize">{job.work_mode}</span>
                          )}
                          {job.job_type && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] capitalize">
                              {job.job_type}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {job.created_at && (
                          <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                            <Clock size={11} />
                            {new Date(job.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                        <ExternalLink size={14} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-primary)] transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Bottom CTA */}
          <div className="mt-10 p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-center">
            <p className="text-sm text-[var(--color-text-muted)]">
              Prove your skills to {company.name} — complete a Proof Task instead of sending a CV.
            </p>
            <Link
              to="/jobs"
              className="mt-3 inline-flex items-center gap-2 px-5 py-2 bg-[var(--color-brand-primary)] text-white rounded-xl font-medium hover:opacity-90 transition text-sm"
            >
              <Briefcase size={14} />
              Browse All Jobs
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
}
