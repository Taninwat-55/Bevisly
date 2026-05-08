import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import { BadgeCheck, Star, Share2, Loader2, Lock, ArrowLeft, Download } from "lucide-react";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";

type PublicProof = {
  submission_id: string;
  candidate_name: string | null;
  username: string | null;
  job_title: string | null;
  company_name: string | null;
  task_title: string | null;
  rating: number | null;
  comments: string | null;
  strengths: string | null;
  reviewed_at: string | null;
  is_public: boolean;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={20}
          className={
            n <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-slate-600"
          }
        />
      ))}
      <span className="ml-2 text-lg font-semibold text-white">
        {rating.toFixed(1)}<span className="text-slate-400 text-sm font-normal"> / 5.0</span>
      </span>
    </div>
  );
}

export default function PublicProofView() {
  const { id } = useParams<{ id: string }>();
  const [proof, setProof] = useState<PublicProof | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from("proof_cards")
        .select("submission_id, candidate_name, username, job_title, company_name, task_title, rating, comments, strengths, reviewed_at, is_public")
        .eq("submission_id", id)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else if (!data.is_public) {
        setNotFound(true);
      } else {
        setProof(data as PublicProof);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  const handleDownloadPNG = async () => {
    if (!certificateRef.current) return;
    try {
      const canvas = await html2canvas(certificateRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `bevisly-proof-${proof?.submission_id?.slice(0, 8)?.toUpperCase() || "cert"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Certificate downloaded!");
    } catch {
      toast.error("Failed to generate image. Try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <Loader2 className="animate-spin text-[var(--color-text-muted)]" size={32} />
      </div>
    );
  }

  if (notFound || !proof) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--color-bg)] px-4">
        <Lock size={40} className="text-slate-500" />
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Proof not found or private</h1>
        <p className="text-[var(--color-text-muted)] text-sm text-center max-w-xs">
          This proof may be private, or the link is incorrect. Ask the candidate to make it public first.
        </p>
        <Link to="/" className="text-sm text-[var(--color-brand-primary)] hover:underline flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Bevisly
        </Link>
      </div>
    );
  }

  const verifiedDate = proof.reviewed_at
    ? new Date(proof.reviewed_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  const shortId = proof.submission_id.slice(0, 8).toUpperCase();
  const profileUrl = proof.username ? `/@${proof.username}` : null;

  const pageTitle = `${proof.candidate_name ?? "Candidate"} — Verified Proof | Bevisly`;
  const pageDescription = `${proof.candidate_name} completed a verified proof task for ${proof.job_title} and received a ${proof.rating?.toFixed(1)}/5 rating on Bevisly.`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="profile" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-4 py-16">
        {/* Certificate card */}
        <div ref={certificateRef} className="w-full max-w-[540px] rounded-2xl overflow-hidden shadow-2xl">
          {/* Gradient header bar */}
          <div className="h-2 bg-gradient-to-r from-[var(--color-brand-secondary)] via-[var(--color-brand-primary)] to-blue-500" />

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-b-2xl p-8 flex flex-col gap-6">
            {/* Badge + brand */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-brand-secondary)] to-[var(--color-brand-primary)] flex items-center justify-center shadow-lg">
                  <BadgeCheck size={36} className="text-white" strokeWidth={1.75} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[var(--color-text-muted)]">
                  Bevisly · Verified Proof of Skill
                </p>
                <h1 className="text-2xl font-bold text-[var(--color-text)] mt-1">
                  {proof.candidate_name ?? "Candidate"}
                </h1>
                <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                  completed a verified proof task
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[var(--color-border)]" />

            {/* Role & Task */}
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Role</p>
                <p className="text-base font-semibold text-[var(--color-text)]">{proof.job_title ?? "—"}</p>
                {proof.company_name && (
                  <p className="text-sm text-[var(--color-text-muted)]">{proof.company_name}</p>
                )}
              </div>
              {proof.task_title && (
                <div>
                  <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Task</p>
                  <p className="text-sm text-[var(--color-text)]">{proof.task_title}</p>
                </div>
              )}
            </div>

            {/* Rating */}
            {proof.rating != null && (
              <div>
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Employer Rating</p>
                <StarRating rating={proof.rating} />
              </div>
            )}

            {/* Strengths / comments */}
            {(proof.strengths || proof.comments) && (
              <div className="bg-[var(--color-bg)] rounded-xl p-4 border border-[var(--color-border)]">
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Employer Feedback</p>
                <p className="text-sm text-[var(--color-text)] italic leading-relaxed line-clamp-4">
                  "{proof.strengths || proof.comments}"
                </p>
              </div>
            )}

            {/* Verified date */}
            {verifiedDate && (
              <p className="text-center text-xs text-[var(--color-text-muted)]">
                Verified on {verifiedDate}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {profileUrl && (
                <Link
                  to={profileUrl}
                  className="flex-1 text-center py-2.5 px-4 rounded-lg bg-[var(--color-brand-primary)] text-white text-sm font-semibold hover:bg-blue-700 transition"
                >
                  View Full Profile →
                </Link>
              )}
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] text-sm font-medium hover:bg-[var(--color-bg)] transition"
              >
                <Share2 size={14} /> Copy Link
              </button>
              <button
                onClick={handleDownloadPNG}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] text-sm font-medium hover:bg-[var(--color-bg)] transition"
              >
                <Download size={14} /> Download PNG
              </button>
            </div>

            {/* Verification ID */}
            <div className="text-center">
              <p className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-widest">
                VERIFICATION ID: {shortId}···
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                Verified via <span className="font-semibold">bevisly.app</span>
              </p>
            </div>
          </div>
        </div>

        <Link to="/" className="mt-8 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition flex items-center gap-1">
          <ArrowLeft size={12} /> Back to Bevisly
        </Link>
      </div>
    </>
  );
}
