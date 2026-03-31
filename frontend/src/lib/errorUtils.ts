/**
 * Maps Supabase/Postgres error codes and messages to human-readable strings.
 * Reference: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */

interface SupabaseError {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
}

const POSTGRES_ERROR_MAP: Record<string, string> = {
  "42501": "You don't have permission to perform this action.",
  "23505": "This record already exists. Please check for duplicates.",
  "23503": "This action references data that no longer exists.",
  "23502": "A required field is missing. Please fill in all required fields.",
  "22P02": "Invalid data format. Please check your inputs.",
  "42P01": "A required database table is missing. Please contact support.",
  "PGRST301": "You don't have permission to access this data.",
  "PGRST204": "No data was returned. The record may not exist.",
};

/**
 * Extract a user-friendly error message from a Supabase/Postgres error.
 * Falls back to a provided default message.
 */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!error || typeof error !== "object") return fallback;

  const err = error as SupabaseError;

  // 1. Check Postgres error code first
  if (err.code && POSTGRES_ERROR_MAP[err.code]) {
    return POSTGRES_ERROR_MAP[err.code];
  }

  // 2. Check for common message patterns
  const msg = err.message || "";

  if (msg.includes("violates row-level security") || msg.includes("new row violates")) {
    return "Permission denied. Your account may not have the required access for this company.";
  }

  if (msg.includes("duplicate key") || msg.includes("unique constraint")) {
    return "This record already exists. Please check for duplicates.";
  }

  if (msg.includes("foreign key constraint")) {
    return "Cannot complete this action because it references other data.";
  }

  if (msg.includes("JWT expired") || msg.includes("not authenticated")) {
    return "Your session has expired. Please log in again.";
  }

  // 3. If the message is short enough and not a raw SQL dump, show it
  if (msg.length > 0 && msg.length < 150 && !msg.includes("SELECT") && !msg.includes("INSERT")) {
    return msg;
  }

  return fallback;
}

/**
 * Wraps an async operation with a timeout.
 * If the operation takes longer than `ms`, the toast warning is shown
 * but the operation continues (it is NOT cancelled).
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  onTimeout: () => void
): Promise<T> {
  let timedOut = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    onTimeout();
  }, ms);

  return promise.finally(() => {
    if (!timedOut) clearTimeout(timeoutId);
  });
}
