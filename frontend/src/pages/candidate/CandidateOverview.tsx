import { useEffect, useState } from "react";
import HomeLayout from "@/layout/HomeLayout";
import { useAuth } from "@/hooks/useAuth";
import { useCandidateStats } from "@/hooks/useCandidateStats";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient"; // ✅ Import supabase

export default function CandidateHome() {
  const { user } = useAuth();
  const { proofsCompleted, avgScore, jobsApplied, credits, loading } = useCandidateStats();
  const [displayName, setDisplayName] = useState<string>(""); // ✅ State for name

  // 👤 Fetch profile name
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchProfileName = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      
      if (data?.full_name) {
        setDisplayName(data.full_name);
      }
    };

    fetchProfileName();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-[var(--color-text-muted)]">
        <Loader2 className="animate-spin mr-2" size={18} />
        Loading your dashboard…
      </div>
    );
  }

  return (
    <HomeLayout
      accentColor="var(--color-candidate-dark)"
      // ✅ Use Display Name if available
      title={`👋 Welcome back, ${displayName || user?.email?.split("@")[0] || "Candidate"}!`}
      subtitle="Track your progress, explore new proof tasks, and grow your verified record."
    >
      {/* 📊 Quick Stats */}
      <div className="sm:col-span-2 lg:col-span-3 grid sm:grid-cols-3 gap-4 mb-2">
        <StatCard label="Proofs Completed" value={proofsCompleted} />
        <StatCard label="Average Score" value={avgScore ? `${avgScore}★` : "—"} />
        <StatCard label="Jobs Applied" value={jobsApplied} />
      </div>

      {/* 💳 Credits */}
      <div className="sm:col-span-2 lg:col-span-3">
        <div className="bg-[var(--color-candidate)]/10 border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-5 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            You currently have{" "}
            <strong className="text-[var(--color-candidate-dark)]">{credits}</strong> Bevis
            Credits — earn more through top-rated proofs.
          </p>
        </div>
      </div>

      {/* 🎯 Action Cards */}
      <ActionCard
        title="🎯 Explore Proof Tasks"
        desc="Browse available roles and challenges that match your skills."
        href="/jobs"
      />
      <ActionCard
        title="🧾 View Feedback"
        desc="Check employer ratings and feedback to improve your next submission."
        href="/candidate/proofs"
      />
      <ActionCard
        title="📄 Update Profile"
        desc="Keep your information up-to-date and strengthen your credibility."
        href="/candidate/profile"
      />
    </HomeLayout>
  );
}

/* ─────────────────────────────── Subcomponents ─────────────────────────────── */

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[var(--color-surface)] p-4 rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-[var(--shadow-soft)] text-center">
      <div className="text-2xl font-semibold text-[var(--color-candidate-dark)] mb-1">
        {value}
      </div>
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}

function ActionCard({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] p-6 hover:shadow-[var(--shadow-hover)] transition-all">
      <h2 className="font-semibold mb-2 text-[var(--color-text)]">{title}</h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-4">{desc}</p>
      <Link
        to={href}
        className="text-[var(--color-candidate-dark)] font-medium hover:underline transition"
      >
        Go →
      </Link>
    </div>
  );
}