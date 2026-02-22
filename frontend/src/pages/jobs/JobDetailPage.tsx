import { useEffect, useState } from "react";
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
  DollarSign,
  CheckCircle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Job } from "@/types/job";
import { checkSubmissionStatus } from "@/lib/api/submissions";
import { Helmet } from "react-helmet-async";

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

  /* ─── Fetch job + proof tasks ─────────────────────────────── */
  useEffect(() => {
    if (!id) return;
    const fetchJob = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("*, proof_tasks(*)")
        .eq("id", id)
        .single();

      if (error) toast.error(error.message);
      else setJob(data as Job);

      // Check active submission
      if (user) {
        const sub = await checkSubmissionStatus(id);
        if (sub) setExistingStatus(sub.status);
      }

      setLoading(false);
    };
    fetchJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  /* ─── Candidate CTA ─────────────────────────────────────── */
  const handleCTA = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!proof) {
      toast.error("No proof task available for this job.");
      return;
    }

    // If already applied/started, just go there
    if (existingStatus) {
      navigate(`/candidate/proof/${proof.id}`);
      return;
    }

    if (skipModal) {
      confirmStartProof();
    } else {
      setShowConfirm(true);
    }
  };

  const confirmStartProof = () => {
    if (!proof) return;
    setStarting(true);
    toast.success("🚀 Proof task started!");
    setTimeout(() => {
      setShowConfirm(false);
      navigate(`/candidate/proof/${proof.id}`);
    }, 600);
  };

  // Construct Google Jobs Schema (JSON-LD)
  // This tells Google: "This is a Job Posting"
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
          <meta name="description" content={`Apply for the ${job.title} role at ${job.company}. Verified proof-based hiring.`} />
          <meta property="og:title" content={`${job.title} at ${job.company}`} />
          <meta property="og:description" content={job.description?.slice(0, 150) + "..."} />
          <meta property="og:type" content="website" />
          <script type="application/ld+json">{jobSchema}</script>
        </Helmet>
      )}

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-8">
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

        {/* Job Header Card */}
        <div className="relative glass-panel rounded-3xl p-8 border border-[var(--color-border)] overflow-hidden mb-8 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--color-brand-primary)]/10 to-transparent blur-3xl -z-10" />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-[var(--color-text)] mb-3 bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text)] to-[var(--color-text-muted)]">
                {job.title}
              </h1>
              <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <span className="font-semibold text-[var(--color-brand-primary)]">{job.company || "Company"}</span>
                <span>•</span>
                <span>{job.location || "Remote"}</span>
              </div>

              <div className="flex flex-wrap gap-2 mt-6">
                {job.paid && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-medium">
                    <DollarSign size={13} /> Paid Role
                  </span>
                )}
                {job.show_salary_range && job.salary_min && job.salary_max && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-xs font-medium">
                    💰 {job.salary_min.toLocaleString()} – {job.salary_max.toLocaleString()} {job.payment_currency}
                  </span>
                )}
                {job.expires_at && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-medium">
                    <Clock size={13} /> Expires {new Date(job.expires_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Proof Badge/Icon */}
            {proof && (
              <div className="hidden md:flex flex-col items-end">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shadow-inner">
                  <Brain size={32} className="text-[var(--color-brand-primary)]" />
                </div>
                <span className="text-xs text-[var(--color-text-muted)] mt-2 font-medium">Proof-Based</span>
              </div>
            )}
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Description */}
            <section>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <Package size={18} className="text-[var(--color-brand-primary)]" /> About the Role
              </h3>
              <div className="prose prose-invert max-w-none text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line text-sm md:text-base">
                {job.description || "No description provided."}
              </div>
            </section>

            {/* Requirements */}
            {job.requirements && (
              <section>
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                  <CheckCircle size={18} className="text-[var(--color-brand-primary)]" />  Requirements
                </h3>
                <div className="prose prose-invert max-w-none text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line text-sm md:text-base bg-[var(--color-surface)]/50 p-6 rounded-2xl border border-[var(--color-border)] border-dashed">
                  {job.requirements}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Sidebar Actions */}
          <div className="space-y-6">

            {/* Proof Task Card (The Main CTA) */}
            {proof && (
              <div className="sticky top-24 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-lg p-6 relative overflow-hidden group">
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />

                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--color-text)]">Proof Task</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">Show, don't just tell.</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-[var(--color-text)] text-sm">{proof.title}</h4>
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-3">
                    {proof.description || "Complete this task to prove your skills."}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--color-text-muted)]">Est. Time</span>
                      <span className="font-medium text-[var(--color-text)]">{proof.expected_time || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--color-text-muted)]">Format</span>
                      <span className="font-medium text-[var(--color-text)] capitalize">{proof.submission_format?.replace("_", " ") || "Repo"}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {role === "employer" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate(`/employer`)}
                      className="px-4 py-2.5 bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] text-[var(--color-text)] text-sm font-medium rounded-xl transition-colors text-center"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/employer`)}
                      className="px-4 py-2.5 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-dark)] text-white text-sm font-medium rounded-xl transition-colors text-center"
                    >
                      Submissions
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleCTA}
                    disabled={hasApplied}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all transform active:scale-[0.98]
                                    ${hasApplied
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default"
                        : "bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-dark)] text-white shadow-lg hover:shadow-brand-primary/25"
                      }`}
                  >
                    {hasApplied ? "✅ Submitted" : "Start Proof Task"}
                  </button>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirm && proof && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-8 max-w-sm w-[90%] text-center relative overflow-hidden"
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
                  You're starting the proof task for <strong>{job.title}</strong>. This is your chance to shine!
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
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-dark)] text-white font-bold text-sm transition-colors shadow-lg hover:shadow-[var(--color-brand-primary)]/25 disabled:opacity-70 disabled:cursor-not-allowed"
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
        </AnimatePresence>
      </div>
    </div>
  );
}
