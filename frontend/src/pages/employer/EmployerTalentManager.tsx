import { useEffect, useState, useMemo, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getEmployerSubmissionsWithFeedback } from "@/lib/api/submissions";
import type { EmployerSubmission } from "@/types";
import toast from "react-hot-toast";
import { Loader2, Users } from "lucide-react";
import TalentBoard from "@/components/talent/TalentBoard";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export default function EmployerTalentManager() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<EmployerSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  // 🧠 ref to throttle rapid DB updates
  const updateTimeout = useRef<NodeJS.Timeout | null>(null);
  const batched = useRef(false);

  /* ── Load once ─────────────────────────────── */
  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await getEmployerSubmissionsWithFeedback(user.id);
        if (mounted) setSubmissions(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load candidates");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  /* ── Live Supabase updates (batched) ───────── */
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("submissions_live_sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions" },
        (payload) => {
          const updated = payload.new as EmployerSubmission;
          if (!updated?.id) return;

          // Optimistically patch or insert
          setSubmissions((prev) => {
            const idx = prev.findIndex((s) => s.id === updated.id);
            if (idx === -1) return [updated, ...prev];
            const clone = [...prev];
            clone[idx] = { ...clone[idx], ...updated };
            return clone;
          });

          // Debounced live pulse + batched toast
          if (updateTimeout.current) clearTimeout(updateTimeout.current);
          if (!batched.current) {
            toast.success("Live updates synced");
            batched.current = true;
          }
          setLive(true);
          updateTimeout.current = setTimeout(() => {
            batched.current = false;
            setLive(false);
          }, 2000);
        }
      )
      .subscribe();

    return () => {
      if (updateTimeout.current) clearTimeout(updateTimeout.current);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  /* ── Memoized prop (prevents rerender storms) ───────── */
  const stableSubs = useMemo(() => submissions, [submissions]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-[var(--color-text-muted)]" />
      </div>
    );

  /* ── UI ─────────────── */
  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-8 py-10 relative">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h1 className="heading-lg text-[var(--color-employer-dark)] flex items-center gap-2">
            <Users size={20} /> Talent Manager
          </h1>

          {/* 🟢 Live Indicator */}
          <AnimatePresence>
            {live && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-1 text-xs text-[var(--color-success)]"
              >
                <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
                Live
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-[var(--color-text-muted)] text-sm">
          Manage candidates across your hiring stages.
        </p>
      </header>

      {/* 🧩 Board */}
      <TalentBoard submissions={stableSubs} setSubmissions={setSubmissions} />
    </div>
  );
}
