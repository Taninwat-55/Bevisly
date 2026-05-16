import { useState, useEffect } from "react";
import type { CandidateFeedbackEntry } from "@/types/candidate";

const SEEN_KEY = "bevisly_seen_proofs";
const COUNT_KEY = "bevisly_unseen_count";
const EVENT = "bevisly:unseen_changed";

function getSeenIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function getUnseenIds(proofs: CandidateFeedbackEntry[]): Set<string> {
  const seen = getSeenIds();
  const unseen = new Set<string>();
  for (const p of proofs) {
    if (p.status === "reviewed" && p.feedback?.[0] && !seen.has(p.id)) {
      unseen.add(p.id);
    }
  }
  return unseen;
}

export function cacheUnseenCount(count: number): void {
  localStorage.setItem(COUNT_KEY, count.toString());
  window.dispatchEvent(new Event(EVENT));
}

export function markFeedbackSeen(submissionId: string): void {
  const seen = getSeenIds();
  if (seen.has(submissionId)) return;
  seen.add(submissionId);
  localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  const current = parseInt(localStorage.getItem(COUNT_KEY) ?? "0", 10);
  localStorage.setItem(COUNT_KEY, Math.max(0, current - 1).toString());
  window.dispatchEvent(new Event(EVENT));
}

export function useUnseenFeedbackCount(): number {
  const [count, setCount] = useState(() => {
    const stored = localStorage.getItem(COUNT_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });

  useEffect(() => {
    const handler = () => {
      const updated = localStorage.getItem(COUNT_KEY);
      setCount(updated ? parseInt(updated, 10) : 0);
    };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  return count;
}
