import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { getCandidateFeedback } from "@/lib/api/submissions";
import ProofCard from "@/components/proofs/ProofCard";
import ProofDetailModal from "@/components/proofs/ProofDetailModal";
import { MessageSquare } from "lucide-react";
import type { CandidateFeedbackEntry } from "@/types/candidate";

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
      <div className="p-10 text-center text-[var(--color-text-muted)]">
        Loading feedback…
      </div>
    );

  if (!proofs.length)
    return (
      <div className="p-10 text-center text-[var(--color-text-muted)]">
        You haven’t submitted any proofs yet.
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-8 py-10">
      <header className="mb-10">
        <h1 className="heading-lg flex items-center gap-2">
          <MessageSquare size={22} /> My Feedback
        </h1>
        <p className="body-base mt-1 text-[var(--color-text-muted)]">
          Review employer feedback on your submitted proofs.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {proofs.map((proof) => (
          <ProofCard
            key={proof.id}
            proof={proof}
            onClick={() => setSelectedProof(proof)}
          />
        ))}
      </div>

      {selectedProof && (
        <ProofDetailModal
          proof={selectedProof}
          onClose={() => setSelectedProof(null)}
        />
      )}
    </div>
  );
}
