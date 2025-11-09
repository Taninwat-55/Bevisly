// src/pages/PublicLeaderboard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Trophy } from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import { motion } from "framer-motion";

type ProfileLite = {
  id: string;
  full_name: string | null;
  credits: number | null;
};

export default function PublicLeaderboard() {
  const [leaders, setLeaders] = useState<ProfileLite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, credits")
        .order("credits", { ascending: false })
        .limit(10);

      if (error) console.error("Error fetching leaderboard:", error);
      setLeaders(data ?? []);
      setLoading(false);
    };
    fetchLeaders();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-[var(--color-text-muted)]">
        <Loader2 className="animate-spin mr-2" /> Loading leaderboard…
      </div>
    );

  return (
    <motion.div
      className="min-h-screen bg-[var(--color-bg)] px-8 py-10 max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <BackButton to="/" />

      {/* 🏁 Header */}
      <header className="text-center mb-8">
        <h1 className="heading-lg mb-2 flex items-center justify-center gap-2">
          <Trophy className="text-[var(--color-candidate)]" /> Top Proof Earners
        </h1>
        <p className="text-[var(--color-text-muted)]">
          Celebrate the candidates who’ve earned the most proof credits through
          verified tasks.
        </p>
      </header>

      {/* 🏆 Leaderboard */}
      <section className="bg-[var(--color-surface)] rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-[var(--shadow-soft)] p-6">
        {leaders.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)]">
            No candidates ranked yet.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {leaders.map((u, i) => (
              <li
                key={u.id}
                className="flex justify-between items-center py-3 hover:bg-[var(--color-bg-hover)] rounded-[var(--radius-button)] px-3 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-text-muted)] w-6 text-right">
                    {i + 1}.
                  </span>
                  <Link
                    to={`/candidate/${u.id}`}
                    className="text-[var(--color-candidate)] hover:underline font-medium"
                  >
                    {u.full_name ?? "Anonymous"}
                  </Link>
                </div>
                <span className="text-[var(--color-candidate-dark)] font-semibold">
                  {u.credits ?? 0} pts
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </motion.div>
  );
}
