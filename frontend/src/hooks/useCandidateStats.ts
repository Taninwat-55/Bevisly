import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";

export interface CandidateStats {
  proofsCompleted: number;
  avgScore: number | null;
  jobsApplied: number;
  credits: number | null;
  bevislyScore: number | null;
  loading: boolean;
}

export function useCandidateStats(): CandidateStats {
  const { user } = useAuth();
  const [stats, setStats] = useState<CandidateStats>({
    proofsCompleted: 0,
    avgScore: null,
    jobsApplied: 0,
    credits: null,
    bevislyScore: null,
    loading: true,
  });

  useEffect(() => {
    if (!user?.id) return;

    const fetchStats = async () => {
      try {
        // Proofs completed
        const { count: totalProofs } = await supabase
          .from("submissions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "reviewed");

        // Feedback average
        const { data: feedbackData } = await supabase
          .from("feedback")
          .select("stars, submissions!inner(user_id)") 
          .eq("submissions.user_id", user.id);

        const scores =
          feedbackData
            ?.map((f) => f.stars)
            .filter((s): s is number => typeof s === "number") ?? [];

        const avgScore =
          scores.length > 0
            ? Number(
                (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
              )
            : null;

        // Jobs applied
        const { count: appliedCount } = await supabase
          .from("submissions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Credits + Bevisly Score
        const { data: profile } = await supabase
          .from("profiles")
          .select("credits, bevisly_score")
          .eq("id", user.id)
          .maybeSingle();

        setStats({
          proofsCompleted: totalProofs || 0,
          avgScore,
          jobsApplied: appliedCount || 0,
          credits: profile?.credits ?? 0,
          bevislyScore: profile?.bevisly_score ?? 0,
          loading: false,
        });
      } catch (err) {
        console.error("Error fetching candidate stats:", err);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [user?.id]);

  return stats;
}