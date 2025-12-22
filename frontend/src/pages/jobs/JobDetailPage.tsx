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
  LogIn,
  CheckCircle,
  X,
  Edit3,
  FolderOpen,
  Shield,
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

      // ✅ Check active submission
      if (user) {
        const sub = await checkSubmissionStatus(id);
        if (sub) setExistingStatus(sub.status);
      }

      setLoading(false);
    };
    fetchJob();
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

    // ✅ If already applied/started, just go there
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
      "sameAs": "https://bevis.app" // Your actual domain
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
    <div className="min-h-screen bg-[var(--color-bg)] px-8 py-10 relative">
      {job && (
        <Helmet>
          {/* Standard Meta Tags */}
          <title>{`${job.title} at ${job.company} | Bevisly`}</title>
          <meta name="description" content={`Apply for the ${job.title} role at ${job.company}. Verified proof-based hiring.`} />

          {/* Open Graph (Facebook/LinkedIn Cards) */}
          <meta property="og:title" content={`${job.title} at ${job.company}`} />
          <meta property="og:description" content={job.description?.slice(0, 150) + "..."} />
          <meta property="og:type" content="website" />

          {/* Google Jobs Schema Script */}
          <script type="application/ld+json">{jobSchema}</script>
        </Helmet>
      )}

      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
      >
        ← Back
      </button>

      {/* 🏁 Job Header */}
      <header className="mb-8">
        <h1 className="heading-lg mb-1 text-[var(--color-text)]">
          {job.title}
        </h1>
        <p className="text-[var(--color-text-muted)]">
          {job.company || "—"} {job.location && `• ${job.location}`}
        </p>
      </header>

      {/* 📄 Job Description */}
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-6 mb-8">
        <h2 className="heading-md mb-2">About the Role</h2>
        <p className="body-base leading-relaxed text-[var(--color-text-muted)] whitespace-pre-line">
          {job.description || "No description provided."}
        </p>

        {/* ✅ Requirements Section */}
        {job.requirements && (
          <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3">
              Requirements & Skills
            </h3>
            <div className="body-base leading-relaxed text-[var(--color-text-muted)] whitespace-pre-line">
              {job.requirements}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-[var(--color-text-muted)]">
          <span>📍 {job.location || "Remote"}</span>

          {/* ✅ Deadline Info */}
          {job.expires_at && (
            <span className="flex items-center gap-1 text-[var(--color-warning)]">
              <Clock size={14} />
              Deadline: {new Date(job.expires_at).toLocaleDateString()}
            </span>
          )}

          {job.paid && (
            <span className="bg-[var(--color-candidate-light)] text-[var(--color-candidate-dark)] px-2 py-1 rounded-[var(--radius-button)] text-xs font-medium">
              Paid Opportunity
            </span>
          )}

          {job.show_salary_range && job.salary_min && job.salary_max && (
            <span className="bg-[var(--color-surface-hover)] text-[var(--color-text)] px-2 py-1 rounded-[var(--radius-button)] text-xs font-medium">
              💰 {job.salary_min.toLocaleString()} –{" "}
              {job.salary_max.toLocaleString()} {job.payment_currency ?? "EUR"}{" "}
              /{job.pay_period ?? "month"}
            </span>
          )}
        </div>
      </section>

      {/* 🧩 Proof Task Section */}
      {proof && (
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading-md">Proof Task</h2>
            <span className="text-xs text-[var(--color-text-muted)]">
              Task ID: {proof.id.slice(0, 8)}…
            </span>
          </div>

          <h3 className="font-semibold text-[var(--color-text)] mb-1">
            {proof.title}
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4 leading-relaxed">
            {proof.description || "No task description provided."}
          </p>

          <ul className="text-sm text-[var(--color-text-muted)] space-y-2 mb-6">
            <li className="flex items-center gap-2">
              <Clock size={15} className="opacity-80" />
              <span>
                <strong>Expected Time:</strong> {proof.expected_time || "—"}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Package size={15} className="opacity-80" />
              <span>
                <strong>Submission Format:</strong>{" "}
                {proof.submission_format || "Not specified"}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Brain size={15} className="opacity-80" />
              <span>
                <strong>AI Tools Allowed:</strong>{" "}
                {proof.ai_tools_allowed ? (
                  <span className="text-[var(--color-success)] font-medium">
                    Yes
                  </span>
                ) : (
                  <span className="text-[var(--color-error)] font-medium">
                    No
                  </span>
                )}
              </span>
            </li>
          </ul>

          {/* 🎯 Role-specific actions */}
          {role === "candidate" && (
            <>
              {/* 🆕 SCENARIO A: External Job */}
              {job.apply_url ? (
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3 rounded-[var(--radius-button)] font-medium bg-[var(--color-employer)] text-white hover:bg-[var(--color-employer-dark)] transition"
                >
                  Apply on Company Site ↗
                </a>
              ) : (
                /* 🔙 SCENARIO B: Bevisly Internal Job (Proof Task) */
                <button
                  onClick={handleCTA}
                  className={`w-full py-3 rounded-[var(--radius-button)] font-medium transition ${!user
                      ? "bg-[var(--color-bg-hover)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-candidate-dark)]"
                      : "bg-[var(--color-candidate)] text-white hover:bg-[var(--color-candidate-dark)]"
                    }`}
                >
                  {!user ? (
                    <span className="inline-flex items-center gap-1 justify-center">
                      <LogIn size={14} /> Sign in to Apply
                    </span>
                  ) : (
                    "Start Proof Task"
                  )}
                </button>
              )}
            </>
          )}

          {role === "employer" && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => navigate(`/employer/jobs/${id}/edit`)}
                className="bg-[var(--color-employer)] text-white px-4 py-2 rounded-[var(--radius-button)] hover:bg-[var(--color-employer-dark)] transition flex items-center gap-2"
              >
                <Edit3 size={16} /> Edit Job
              </button>
              <button
                onClick={() => navigate(`/employer/submissions`)}
                className="border border-[var(--color-border)] text-[var(--color-text-muted)] px-4 py-2 rounded-[var(--radius-button)] hover:bg-[var(--color-border)] transition flex items-center gap-2"
              >
                <FolderOpen size={16} /> View Submissions
              </button>
            </div>
          )}

          {role === "admin" && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => toast("Admin management coming soon!")}
                className="bg-[var(--color-admin)] text-white px-4 py-2 rounded-[var(--radius-button)] hover:bg-[var(--color-admin-dark)] transition flex items-center gap-2"
              >
                <Shield size={16} /> Manage Job
              </button>
            </div>
          )}
        </section>
      )}

      {/* 💬 Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && proof && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-xl p-6 max-w-sm w-[90%] text-center relative"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <CheckCircle
                className="mx-auto text-[var(--color-success)] mb-3"
                size={32}
              />
              <h2 className="heading-md mb-1">Proof Started!</h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">
                You’re about to begin your submission for{" "}
                <strong>{job.title}</strong>.
              </p>

              <label className="flex items-center justify-center gap-2 text-xs text-[var(--color-text-muted)] mb-6 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={skipModal}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSkipModal(checked);
                    localStorage.setItem("skipProofConfirm", String(checked));
                  }}
                  className="accent-[var(--color-candidate)]"
                />
                Don’t show this confirmation again
              </label>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={confirmStartProof}
                  disabled={starting}
                  className="bg-[var(--color-candidate)] text-white px-4 py-2 rounded-[var(--radius-button)] hover:bg-[var(--color-candidate-dark)] transition disabled:opacity-60"
                >
                  {starting ? "Opening..." : "Go to Workspace"}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="border border-[var(--color-border)] px-4 py-2 rounded-[var(--radius-button)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  Cancel
                </button>
              </div>

              <button
                onClick={() => setShowConfirm(false)}
                className="absolute top-3 right-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
