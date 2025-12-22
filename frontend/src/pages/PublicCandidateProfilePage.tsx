import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Copy, Loader2, Trophy, Star, BadgeCheck, Briefcase
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
  // const [timeline, setTimeline] = useState<ProofCardLite[]>([]);

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
          // setTimeline(rpcTimeline);
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
          // setTimeline(fallbackProofs ?? []);
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

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          { data: prof },
          { data: rankData },
          { data: rpcTimeline },
        ] = await Promise.all([
          supabase.from("profiles").select("id, full_name, credits, email").eq("id", id).single(),
          supabase.rpc("get_user_rank", { user_id: id }),
          supabase.rpc("get_recent_activity", { user_id: id }),
        ]);

        setProfile(prof as any); // Cast for email access if type missing
        setRank(rankData ?? null);

        if (rpcTimeline && Array.isArray(rpcTimeline) && rpcTimeline.length > 0) {
          // setTimeline(rpcTimeline);
          setCards(rpcTimeline);
        } else {
          const { data: fallbackProofs } = await supabase
            .from("proof_cards")
            .select("id, job_title, rating, comments, reviewed_at, submission_id")
            .order("reviewed_at", { ascending: false })
            .limit(10);
          // setTimeline(fallbackProofs ?? []);
          setCards(fallbackProofs ?? []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center min-h-screen text-[var(--color-text-muted)]"><Loader2 className="animate-spin mr-2" /> Loading profile...</div>;
  if (!profile) return <div className="p-8 text-center text-[var(--color-text-muted)]">Profile not found 🚫</div>;

  const visibleCards = showAll ? cards : cards.slice(0, 6);
  // @ts-ignore
  const email = profile.email; // Access email for "Hire Me" button

  return (
    <motion.div className="min-h-screen bg-[var(--color-bg)] px-6 py-12 transition-colors" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-4xl mx-auto">
        <BackButton label="Back to Home" to="/" />

        {/* 🏁 Header Card */}
        <div className="mt-8 relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm text-center">
          {/* Background Decor */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-candidate)] to-purple-500" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-candidate)] to-purple-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
              {profile.full_name?.charAt(0) || "U"}
            </div>

            <h1 className="text-3xl font-bold text-[var(--color-text)] flex items-center gap-2">
              {profile.full_name ?? "Anonymous"}
              <BadgeCheck className="text-blue-500" size={24} fill="white" />
            </h1>

            <div className="flex flex-wrap justify-center gap-4 mt-3 text-sm font-medium text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1"><Trophy size={14} className="text-yellow-500" /> {profile.credits ?? 0} Proof Credits</span>
              {rank && <span className="flex items-center gap-1"><Star size={14} className="text-purple-500" /> Global Rank #{rank}</span>}
            </div>

            {/* 🎯 CTA Buttons */}
            <div className="flex gap-3 mt-8">
              <a
                href={`mailto:${email}?subject=Interview Request via Bevisly`}
                className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-text)] text-[var(--color-bg)] rounded-full font-semibold hover:opacity-90 transition shadow-md"
              >
                <Briefcase size={16} /> Hire This Candidate
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Profile link copied!");
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] rounded-full font-medium hover:bg-[var(--color-bg-hover)] transition"
              >
                <Copy size={16} /> Share
              </button>
            </div>
          </div>
        </div>

        {/* 🏆 Verified Proofs */}
        <section className="mt-10">
          <h2 className="heading-md mb-6 flex items-center gap-2">
            <BadgeCheck className="text-[var(--color-candidate)]" /> Verified Proofs
          </h2>

          {cards.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface)]">
              <p className="text-[var(--color-text-muted)]">No verified proofs yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {visibleCards.map((c) => (
                <motion.div
                  key={c.id ?? c.job_title}
                  whileHover={{ y: -2 }}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm hover:shadow-md transition group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-[var(--color-text)] text-lg line-clamp-1 group-hover:text-[var(--color-candidate-dark)] transition">
                      {c.job_title}
                    </h3>
                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded text-xs font-bold text-yellow-700 dark:text-yellow-400">
                      <Star size={12} fill="currentColor" /> {c.rating?.toFixed(1)}
                    </div>
                  </div>

                  <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-3 italic">
                    "{c.comments || "Excellent work demonstrating core skills."}"
                  </p>

                  <div className="pt-4 border-t border-[var(--color-border)] flex justify-between items-center text-xs text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1">
                      <BadgeCheck size={12} className="text-green-500" /> Verified by Employer
                    </span>
                    <span>{new Date(c.reviewed_at ?? "").toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {cards.length > 6 && (
            <div className="mt-6 text-center">
              <button onClick={() => setShowAll(!showAll)} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] underline">
                {showAll ? "Show Less" : "Show All History"}
              </button>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}