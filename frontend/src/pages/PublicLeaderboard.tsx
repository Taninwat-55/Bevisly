// src/pages/PublicLeaderboard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import BackButton from "@/components/ui/BackButton";

type ProfileLite = {
  id: string;
  full_name: string | null;
  credits: number | null;
};

export default function PublicLeaderboard() {
  const [leaders, setLeaders] = useState<ProfileLite[]>([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data, error } = await supabase
        // 👇 no generic arguments; we’ll type after
        .from("profiles")
        .select("id, full_name, credits")
        .order("credits", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching leaderboard:", error);
        return;
      }

      setLeaders((data as ProfileLite[]) ?? []);
    };

    fetchLeaders();
  }, []);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <BackButton to="/" />
      <h1 className="heading-md mb-6 text-center">🏆 Top Proof Earners</h1>
      <ul className="space-y-3">
        {leaders.map((u, i) => (
          <li
            key={u.id}
            className="flex justify-between bg-[var(--color-surface)] px-4 py-2 rounded-[var(--radius-button)] shadow-[var(--shadow-soft)]"
          >
            <span>
              {i + 1}.{" "}
              <Link
                to={`/candidate/${u.id}`}
                className="text-[var(--color-candidate)] hover:underline font-medium"
              >
                {u.full_name ?? "Anonymous"}
              </Link>
            </span>
            <span className="text-[var(--color-candidate)] font-semibold">
              {u.credits ?? 0} 💳
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
