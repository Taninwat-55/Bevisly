import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { getCandidateFeedback } from "@/lib/api/submissions";
import ProofCard from "@/components/proofs/ProofCard";
import ProofDetailModal from "@/components/proofs/ProofDetailModal";
import { ShieldCheck } from "lucide-react";
import type { CandidateFeedbackEntry } from "@/types/candidate";
import { FileCheck } from "lucide-react";

export default function CandidateFeedbackView() {
  const { user } = useAuth();
  const [proofs, setProofs] = useState<CandidateFeedbackEntry[]>([]);
  const [selectedProof, setSelectedProof] =
    useState<CandidateFeedbackEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    getCandidateFeedback(user.id)
      .then((data) => setProofs(data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-10 text-[var(--color-text-muted)]">
        <div className="w-10 h-10 border-4 border-[var(--color-brand-primary)] border-t-transparent rounded-full animate-spin mb-4" />
        Loading your proofs...
      </div>
    );

  return (
    <div className="space-y-8 pb-20">
      {/* ── Header Section ────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-[var(--glass-border)] p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--color-brand-secondary)]/10 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[var(--color-brand-primary)]/10 rounded-full blur-[80px] -z-10 -translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm mb-6">
            <ShieldCheck size={14} className="text-[var(--color-brand-primary)]" />
            <span className="text-xs font-medium text-[var(--color-text)]">
              Real-world Skills Verification
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-[var(--color-text)] mb-4 tracking-tight">
            My Proofs & Feedback
          </h1>
          <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">
            Track your submissions and review feedback from companies. Every proof you complete adds to your verified skill portfolio.
          </p>
        </div>
      </div>

      {/* ── Content Grid ────────────────────────────────────────── */}
      {!proofs.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-3xl border border-[var(--color-border)]">
          <div className="w-20 h-20 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-text-muted)] mb-6 shadow-inner">
            <FileCheck size={40} />
          </div>
          <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">No proofs submitted yet</h3>
          <p className="text-[var(--color-text-muted)] max-w-md mb-8">
            Start applying for jobs that match your skills. Once you complete a Proof Task, it will appear here.
          </p>
          <a href="/candidate/jobs" className="px-6 py-3 rounded-xl bg-[var(--color-brand-primary)] text-white font-medium hover:bg-[var(--color-brand-primary)]/90 transition-colors shadow-lg shadow-[var(--color-brand-primary)]/20">
            Browse Jobs
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {proofs.map((proof) => (
            <ProofCard
              key={proof.id}
              proof={proof}
              onClick={() => setSelectedProof(proof)}
            />
          ))}
        </div>
      )}

      {selectedProof && (
        <ProofDetailModal
          card={{
            id: selectedProof.id,
            submission_id: selectedProof.id,
            user_id: null,
            job_title: selectedProof.jobs?.title ?? null,
            task_title: selectedProof.proof_tasks?.title ?? null,
            company_name: selectedProof.jobs?.company ?? null,
            username: null,
            rating: selectedProof.feedback?.[0]?.stars ?? null,
            comments: selectedProof.feedback?.[0]?.comments ?? null,
            strengths: selectedProof.feedback?.[0]?.strengths ?? null,
            improvements: selectedProof.feedback?.[0]?.improvements ?? null,
            reviewed_at: selectedProof.feedback?.[0]?.created_at ?? selectedProof.created_at ?? null,
            is_public: false,
            is_featured: false,
            share_url: null,
          }}
          isOpen={true}
          onClose={() => setSelectedProof(null)}
        />
      )}
    </div>
  );
}
