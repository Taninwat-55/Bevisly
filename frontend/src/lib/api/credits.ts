import { supabase } from "../supabaseClient";

// ============================================================
// TYPES
// ============================================================

export type CreditReason = 
  | "submission_reward" 
  | "quality_bonus" 
  | "fairness_payout"
  | "premium_purchase"
  | "referral_bonus";

export type CreditTransaction = {
  id: string;
  user_id: string;
  amount: number;
  reason: CreditReason | string;
  related_entity_id: string | null;
  created_at: string;
};

// ============================================================
// RPC FUNCTIONS (Server-Side Atomic Operations)
// ============================================================

/**
 * Distribute Credits (Credit/Add)
 * Safely awards credits to a user via server-side RPC.
 * Includes idempotency protection via relatedEntityId.
 */
export async function distributeCredits(
  userId: string,
  amount: number,
  reason: CreditReason,
  relatedEntityId?: string
): Promise<void> {
  const { error } = await supabase.rpc("distribute_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_entity_id: relatedEntityId ?? null,
  });

  if (error) throw error;
}

/**
 * Spend Credits (Debit/Subtract)
 * Safely deducts credits from a user via server-side RPC.
 * Returns false if insufficient balance.
 */
export async function spendCredits(
  userId: string,
  amount: number,
  reason: CreditReason,
  relatedEntityId?: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc("spend_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_entity_id: relatedEntityId ?? null,
  });

  if (error) throw error;
  return data as boolean;
}

/**
 * Get Credit Balance
 * Securely retrieves current balance via server-side RPC.
 */
export async function getCreditBalance(userId: string): Promise<number> {
  const { data, error } = await supabase.rpc("get_credit_balance", {
    p_user_id: userId,
  });

  if (error) throw error;
  return (data as number) ?? 0;
}

// ============================================================
// READ FUNCTIONS
// ============================================================

/**
 * Get Credit History
 * Returns all transactions for a user (read-only view).
 */
export async function getCreditHistory(userId: string): Promise<CreditTransaction[]> {
  const { data, error } = await supabase
    .from("credit_transactions")
    .select("id, user_id, amount, reason, related_entity_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as CreditTransaction[];
}