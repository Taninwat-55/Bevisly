// src/pages/PublicCandidateProfilePage.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Copy,
  ChevronDown,
  ChevronUp,
  Loader2,
  Trophy,
  Clock,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import type { ProfileLite, ProofCardLite } from "@/types/shared";
import BackButton from "@/components/ui/BackButton";
import { motion } from "framer-motion";

export default function PublicCandidateProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfileLite | null>(null);
  const [cards, setCards] = useState<ProofCardLite[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [timeline, setTimeline] = useState<ProofCardLite[]>([]);

  /* 🧠 Fetch candidate + proofs + rank + recent activity */
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Run everything in parallel
        const [
          { data: prof, error: err1 },
          { data: rankData, error: err2 },
          { data: rpcTimeline, error: rpcErr },
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name, credits")
            .eq("id", id)
            .single(),
          supabase.rpc("get_user_rank", { user_id: id }),
          supabase.rpc("get_recent_activity", { user_id: id }),
        ]);

        if (err1) console.error("Profile fetch error:", err1);
        if (err2) console.error("Rank fetch error:", err2);
        if (rpcErr) console.warn("RPC get_recent_activity error:", rpcErr);

        setProfile(prof ?? null);
        setRank(rankData ?? null);

        // ✅ Prefer RPC result if available
        if (
          rpcTimeline &&
          Array.isArray(rpcTimeline) &&
          rpcTimeline.length > 0
        ) {
          setTimeline(rpcTimeline);
          setCards(rpcTimeline); // for visible proof cards too
        } else {
          // 🩹 fallback to direct query (if RPC not available or empty)
          const { data: fallbackProofs, error: fbErr } = await supabase
            .from("proof_cards")
            .select(
              "id, job_title, rating, comments, reviewed_at, submission_id"
            )
            .order("reviewed_at", { ascending: false })
            .limit(10);
          if (fbErr) console.error("Fallback proof fetch error:", fbErr);
          setTimeline(fallbackProofs ?? []);
          setCards(fallbackProofs ?? []);
        }
      } catch (err) {
        console.error("Error fetching candidate data:", err);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /* 🌀 States */
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-[var(--color-text-muted)]">
        <Loader2 className="animate-spin mr-2" /> Loading profile…
      </div>
    );

  if (!profile)
    return (
      <div className="p-8 text-center text-[var(--color-text-muted)]">
        Profile not found 🚫
      </div>
    );

  const visibleCards = showAll ? cards : cards.slice(0, 6);

  return (
    <motion.div
      className="min-h-screen bg-[var(--color-bg)] px-8 py-10 max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <BackButton to="/leaderboard" />

      {/* 🏁 Header */}
      <header className="mb-8 text-center">
        <h1 className="heading-lg mb-1">{profile.full_name ?? "Anonymous"}</h1>
        <p className="text-[var(--color-text-muted)] mb-2">
          💳 {profile.credits ?? 0} Proof Credits
        </p>
        {rank && (
          <div className="flex items-center justify-center gap-2 text-[var(--color-candidate)] font-medium mb-3">
            <Trophy size={16} /> Ranked #{rank} globally
          </div>
        )}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Profile link copied!", { icon: "🔗" });
            }}
            className="flex items-center gap-1 text-sm text-[var(--color-candidate)] hover:underline"
          >
            <Copy size={14} /> Copy Link
          </button>
        </div>
      </header>

      {/* 🧩 Proof Cards */}
      <section className="bg-[var(--color-surface)] rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-[var(--shadow-soft)] p-6 mb-8">
        <h2 className="heading-md mb-4 text-center text-[var(--color-text)]">
          Verified Proof Cards
        </h2>

        {cards.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)]">
            This candidate hasn’t earned any proof cards yet.
          </p>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleCards.map((c) => (
                <motion.div
                  key={c.id ?? c.job_title}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-4 hover:shadow-[var(--shadow-hover)] transition"
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className="font-semibold text-[var(--color-text)] mb-1 line-clamp-1">
                    {c.job_title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">
                    <Star size={12} className="inline mr-1 opacity-70" />
                    {c.rating?.toFixed(1) ?? "–"} ·{" "}
                    {c.reviewed_at
                      ? new Date(c.reviewed_at).toLocaleDateString()
                      : "Unreviewed"}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)] line-clamp-3">
                    {c.comments || "No comment provided."}
                  </p>
                </motion.div>
              ))}
            </div>

            {cards.length > 6 && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="flex items-center gap-1 text-sm text-[var(--color-candidate)] hover:underline"
                >
                  {showAll ? (
                    <>
                      <ChevronUp size={14} /> Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} /> View All ({cards.length})
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* 🕓 Recent Proof Activity */}
      <section className="bg-[var(--color-surface)] rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-[var(--shadow-soft)] p-6">
        <h2 className="heading-md mb-4 text-center text-[var(--color-text)]">
          Recent Proof Activity
        </h2>

        {timeline.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)]">
            No recent activity to show.
          </p>
        ) : (
          <ul className="relative border-l border-[var(--color-border)] ml-4 space-y-4">
            {timeline.map((entry) => (
              <li key={entry.id} className="pl-4 relative">
                <div className="absolute -left-[9px] top-1 w-3 h-3 rounded-full bg-[var(--color-candidate)]" />
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {entry.job_title}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                  <Clock size={12} />{" "}
                  {entry.reviewed_at
                    ? new Date(entry.reviewed_at).toLocaleString()
                    : "Pending review"}
                </p>
                {entry.comments && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 italic line-clamp-2">
                    “{entry.comments}”
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </motion.div>
  );
}
