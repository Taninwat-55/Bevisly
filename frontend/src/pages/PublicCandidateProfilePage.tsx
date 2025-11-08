// src/pages/PublicCandidateProfilePage.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Copy, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import type { ProfileLite, ProofCardLite } from "@/types";
import BackButton from "@/components/ui/BackButton";

export default function PublicCandidateProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfileLite | null>(null);
  const [cards, setCards] = useState<ProofCardLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const [{ data: prof, error: err1 }, { data: proofs, error: err2 }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name, credits")
            .eq("id", id)
            .single(),
          supabase
            .from("proof_cards")
            .select("id, job_title, rating, comments, reviewed_at")
            .order("reviewed_at", { ascending: false }),
        ]);

      if (err1 || err2) console.error("Error fetching profile:", err1 || err2);

      setProfile(prof ?? null);
      setCards(proofs ?? []);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="p-8 text-center text-[var(--color-text-muted)]">
        Loading profile…
      </div>
    );

  if (!profile)
    return (
      <div className="p-8 text-center text-[var(--color-text-muted)]">
        Profile not found 🚫
      </div>
    );

  // 🪄 Limit initial visible cards to 6
  const visibleCards = showAll ? cards : cards.slice(0, 6);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-8 py-10 max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="heading-lg">{profile.full_name ?? "Anonymous"}</h1>
        <p className="text-[var(--color-text-muted)] mb-4">
          💳 {profile.credits ?? 0} credits
        </p>

        {/* 🏠 Back + 🔗 Copy */}
        <div className="flex items-center gap-4">
          <BackButton to="/leaderboard" />

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

      {/* Proof Cards */}
      <section className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] border border-[var(--color-border)] p-6">
        <h2 className="heading-md mb-4">Proof Cards</h2>

        {cards.length === 0 ? (
          <p className="text-[var(--color-text-muted)]">
            This candidate hasn’t earned any proof cards yet.
          </p>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleCards.map((c) => (
                <div
                  key={c.id ?? c.job_title}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-4 hover:shadow-lg transition"
                >
                  <h3 className="font-semibold text-[var(--color-text)] mb-1">
                    {c.job_title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] mb-2">
                    ⭐ {c.rating?.toFixed(1) ?? "–"} ·{" "}
                    {new Date(c.reviewed_at ?? "").toLocaleDateString()}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {c.comments || "No comment"}
                  </p>
                </div>
              ))}
            </div>

            {/* View All / Collapse */}
            {cards.length > 6 && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="flex items-center gap-1 text-sm text-[var(--color-candidate)] hover:underline transition"
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
    </div>
  );
}
