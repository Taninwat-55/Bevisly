import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";

export type ProofCard = {
  id: string | null;
  submission_id: string | null;
  job_title: string | null;
  rating: number | null;
  comments: string | null;
  reviewed_at: string | null;
};

export function useProofs() {
  const { user } = useAuth();
  const [cards, setCards] = useState<ProofCard[]>([]);
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      const { data: cardData } = await supabase
        .from("proof_cards")
        .select("*")
        .eq("candidate_name", user.email?.split("@")[0] ?? "")
        .order("reviewed_at", { ascending: false });

      const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single();

      setCards(cardData || []);
      setCredits(profile?.credits || 0);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { cards, credits, loading };
}