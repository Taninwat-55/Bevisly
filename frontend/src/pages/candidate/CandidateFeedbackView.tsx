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
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
            My Proofs & Feedback
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Track your submissions and review feedback from companies.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
          <ShieldCheck size={14} />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Verified Proofs
          </span>
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
            username: user?.username ?? null,
            rating: selectedProof.feedback?.[0]?.stars ?? null,
            comments: selectedProof.feedback?.[0]?.comments ?? null,
            strengths: selectedProof.feedback?.[0]?.strengths ?? null,
            improvements: selectedProof.feedback?.[0]?.improvements ?? null,
            reviewed_at: selectedProof.feedback?.[0]?.created_at ?? selectedProof.created_at ?? null,
            is_public: selectedProof.is_public ?? false,
            is_featured: false,
            share_url: null,
          }}
          isOpen={true}
          onClose={() => setSelectedProof(null)}
          username={user?.username}
        />
      )}
    </div>
  );
}
