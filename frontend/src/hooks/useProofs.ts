import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";

export type ProofCard = {
  id: string | null;
  submission_id: string | null;
  user_id: string | null;
  job_title: string | null;
  task_title: string | null;
  company_name: string | null;
  username: string | null;
  rating: number | null;
  comments: string | null;
  strengths: string | null;
  improvements: string | null;
  reviewed_at: string | null;
  is_public: boolean;
  is_featured: boolean;
  share_url: string | null;
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
        .eq("user_id", user.id)
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
  }, [user?.id]);

  const toggleProofPublic = async (submissionId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const { error } = await supabase
        .from("submissions")
        .update({ is_public: newStatus })
        .eq("id", submissionId);
        
      if (error) throw error;
      
      // Update local state
      setCards((prev) => 
        prev.map((card) => 
          card.submission_id === submissionId 
            ? { ...card, is_public: newStatus } 
            : card
        )
      );
      
      return { success: true, is_public: newStatus };
    } catch (err) {
      console.error("Error toggling proof visibility:", err);
      return { success: false, error: err };
    }
  };

  const toggleProofFeatured = async (submissionId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    if (newStatus) {
      const featuredCount = cards.filter((c) => c.is_featured).length;
      if (featuredCount >= 3) {
        return { success: false, error: "You can feature up to 3 proofs at a time" };
      }
    }
    try {
      const { error } = await supabase
        .from("submissions")
        .update({ is_featured: newStatus })
        .eq("id", submissionId);

      if (error) throw error;

      setCards((prev) =>
        prev.map((card) =>
          card.submission_id === submissionId
            ? { ...card, is_featured: newStatus }
            : card
        )
      );

      return { success: true, is_featured: newStatus };
    } catch (err) {
      console.error("Error toggling proof featured:", err);
      return { success: false, error: err };
    }
  };

  return { cards, credits, loading, toggleProofPublic, toggleProofFeatured };
}