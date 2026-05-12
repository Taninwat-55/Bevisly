import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Trophy, Medal, Star } from "lucide-react";
import BackButton from "@/components/common/BackButton";
import { motion } from "framer-motion";

type ProfileLite = {
  id: string;
  full_name: string | null;
  bevisly_score: number | null;
  avatar_url?: string | null;
};

export default function PublicLeaderboard({ isWorkspaceView = false }: { isWorkspaceView?: boolean }) {
  const [leaders, setLeaders] = useState<ProfileLite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, bevisly_score, avatar_url")
        .order("bevisly_score", { ascending: false })
        .limit(20);

      if (error) console.error("Error fetching leaderboard:", error);
      setLeaders(data ?? []);
      setLoading(false);
    };
    fetchLeaders();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[var(--color-bg)] text-[var(--color-text-muted)] gap-4">
        <Loader2 className="animate-spin w-8 h-8 text-[var(--color-brand-primary)]" />
        <p className="font-medium animate-pulse">Calculating rankings...</p>
      </div>
    );

  const topThree = leaders.slice(0, 3);
  const remaining = leaders.slice(3);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors">
      
      {/* ── Fancy Banner / Header ── */}
      <div className="relative pt-12 pb-24 px-8 bg-gradient-to-br from-indigo-600 via-blue-600 to-teal-500 text-white shadow-2xl overflow-hidden rounded-b-[4rem]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-400/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto">
          {!isWorkspaceView && <BackButton to="/" className="mb-8" variant="glass" label="Back" />}
          
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 shadow-xl"
            >
              <Trophy size={32} className="text-yellow-300" />
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4">
              Top Proven Talent
            </h1>
            <p className="text-blue-100 max-w-2xl text-lg leading-relaxed">
              Every point represents a real task completed and verified by an employer. 
              No fluff, just skills.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-12 pb-20 relative z-20">
        
        {/* 🏆 Top 3 Podium Style 🏆 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {topThree.map((user, index) => {
            const isFirst = index === 0;
            const isSecond = index === 1;
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative flex flex-col items-center p-8 rounded-[2.5rem] border shadow-2xl transition-all
                  ${isFirst ? "bg-white dark:bg-slate-900 border-yellow-400/30 md:scale-110 md:-translate-y-4 z-10" : "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-[var(--color-border)]"}
                `}
              >
                {/* Badge/Rank */}
                <div className={`
                  absolute -top-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg font-bold text-lg
                  ${isFirst ? "bg-yellow-400 text-yellow-950 ring-4 ring-yellow-400/20" : isSecond ? "bg-slate-300 text-slate-800" : "bg-orange-300 text-orange-900"}
                `}>
                  {index + 1}
                </div>

                {/* Avatar */}
                <div className={`
                  w-20 h-20 rounded-2xl overflow-hidden mb-4 border-2 shadow-inner
                  ${isFirst ? "border-yellow-400" : "border-[var(--color-border)]"}
                `}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name || ""} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-2xl font-bold text-[var(--color-text-muted)]">
                      {user.full_name?.[0] || "?"}
                    </div>
                  )}
                </div>

                <Link to={`/candidate/${user.id}`} className="text-center group">
                  <h3 className="text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-brand-primary)] transition-colors line-clamp-1">
                    {user.full_name || "Anonymous User"}
                  </h3>
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <Star size={14} className={isFirst ? "text-yellow-500 fill-yellow-500" : "text-slate-400"} />
                    <span className="text-xl font-black text-[var(--color-brand-primary)]">
                      {user.bevisly_score ?? 0}
                    </span>
                    <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Score</span>
                  </div>
                </Link>

                {isFirst && (
                  <div className="mt-4 px-4 py-1.5 bg-yellow-400/10 rounded-full border border-yellow-400/20">
                    <span className="text-xs font-bold text-yellow-600 uppercase tracking-tighter">Elite Rank</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* 📜 The Rest of the List 📜 */}
        <div className="glass-panel border border-[var(--color-border)] rounded-[2.5rem] shadow-xl overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="px-8 py-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]/50 flex items-center justify-between">
            <h2 className="font-bold text-lg text-[var(--color-text)]">Rising Stars</h2>
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Top 20 Ranking</span>
          </div>

          <div className="divide-y divide-[var(--color-border)]">
            {remaining.length === 0 ? (
              <div className="py-12 text-center text-[var(--color-text-muted)]">
                More candidates joining the ranks soon...
              </div>
            ) : (
              remaining.map((user, i) => (
                <Link
                  key={user.id}
                  to={`/candidate/${user.id}`}
                  className="flex items-center gap-4 px-8 py-5 hover:bg-[var(--color-brand-primary)]/5 transition-all group"
                >
                  <span className="w-6 text-sm font-bold text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-primary)]">
                    {i + 4}
                  </span>
                  
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-[var(--color-border)] bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                     {user.avatar_url ? (
                       <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                     ) : (
                       <span className="text-sm font-bold opacity-50">{user.full_name?.[0]}</span>
                     )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[var(--color-text)] truncate group-hover:text-[var(--color-brand-primary)] transition-colors">
                      {user.full_name || "Anonymous Candidate"}
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)]">Verified Talent</p>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-lg font-bold text-[var(--color-text)]">
                      {user.bevisly_score ?? 0}
                    </span>
                    <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Score</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center">
           <p className="text-sm text-[var(--color-text-muted)] flex items-center justify-center gap-2">
             <Medal size={14} /> Rankings are updated in real-time as tasks are verified.
           </p>
        </div>

      </div>
    </div>
  );
}
