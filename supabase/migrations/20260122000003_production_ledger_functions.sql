-- ============================================================
-- Production-Ready Ledger System
-- Migration: 20260122_production_ledger_functions.sql
-- ============================================================

-- ============================================================
-- 1. SPEND_CREDITS RPC - Secure Debit Operations
-- ============================================================

create or replace function spend_credits(
  p_user_id uuid,
  p_amount int,
  p_reason text,
  p_entity_id uuid default null
)
returns boolean
language plpgsql
security definer
as $$
declare
  current_balance int;
begin
  -- A. Validate amount is positive
  if p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;

  -- B. Check balance
  select coalesce(credits, 0) into current_balance 
  from public.profiles 
  where id = p_user_id
  for update; -- Lock row to prevent race conditions

  if current_balance < p_amount then
    return false; -- Insufficient funds
  end if;

  -- C. Prevent duplicate transactions (idempotency)
  if p_entity_id is not null and exists (
    select 1 from public.credit_transactions 
    where related_entity_id = p_entity_id 
    and reason = p_reason
  ) then
    return true; -- Already processed
  end if;

  -- D. Log the debit transaction (negative amount)
  insert into public.credit_transactions (user_id, amount, reason, related_entity_id)
  values (p_user_id, -p_amount, p_reason, p_entity_id);

  -- E. Update the user's balance
  update public.profiles 
  set credits = credits - p_amount 
  where id = p_user_id;

  return true;
end;
$$;

-- ============================================================
-- 2. GET_CREDIT_BALANCE RPC - Secure Balance Retrieval
-- ============================================================

create or replace function get_credit_balance(p_user_id uuid)
returns int
language sql
security definer
stable
as $$
  select coalesce(credits, 0) from public.profiles where id = p_user_id;
$$;

-- ============================================================
-- 3. ENHANCED DISTRIBUTE_CREDITS - With Validation
-- ============================================================

create or replace function distribute_credits(
  p_user_id uuid, 
  p_amount int, 
  p_reason text, 
  p_entity_id uuid default null
)
returns void
language plpgsql
security definer
as $$
begin
  -- A. Validate amount is positive
  if p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;

  -- B. Prevent Double Spending (Idempotency)
  if p_entity_id is not null and exists (
    select 1 from public.credit_transactions 
    where related_entity_id = p_entity_id 
    and reason = p_reason
  ) then
    return; -- Already processed
  end if;

  -- C. Log the transaction
  insert into public.credit_transactions (user_id, amount, reason, related_entity_id)
  values (p_user_id, p_amount, p_reason, p_entity_id);

  -- D. Update the user's total balance
  update public.profiles
  set credits = coalesce(credits, 0) + p_amount
  where id = p_user_id;
end;
$$;

-- ============================================================
-- 4. RLS LOCKDOWN - Block Direct Writes to Ledger
-- ============================================================

-- Users can only VIEW their own transactions (no INSERT/UPDATE/DELETE)
drop policy if exists "Users view own transactions" on public.credit_transactions;

create policy "Users can only view own credit transactions"
  on public.credit_transactions for select
  using (auth.uid() = user_id);

-- Admins can view all transactions
create policy "Admins can view all credit transactions"
  on public.credit_transactions for select
  using (is_admin());

-- Note: No INSERT/UPDATE/DELETE policies = only security definer functions can write
