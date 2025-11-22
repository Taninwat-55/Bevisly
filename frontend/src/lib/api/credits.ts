// src/lib/api/credits.ts
import { supabase } from "../supabaseClient";

export type CreditReason = "submission_reward" | "quality_bonus" | "fairness_payout";

/**
 * 🪙 Distribute Credits (RPC)
 * Safely awards credits to a user via the backend function.
 */
export async function distributeCredits(
  userId: string,
  amount: number,
  reason: CreditReason,
  relatedEntityId?: string
) {
  const { error } = await supabase.rpc("distribute_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_entity_id: relatedEntityId, 
  });

  if (error) throw error;
}

/**
 * 📜 Get Credit History
 */
export async function getCreditHistory(userId: string) {
  const { data, error } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}