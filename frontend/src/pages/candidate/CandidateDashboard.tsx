import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { CreditCard, Target, Briefcase, CheckCircle } from "lucide-react";
import type { DashboardProof } from "@/types";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    proofsCompleted: 0,
    avgScore: 0,
    jobsApplied: 0,
  });
  const [credits, setCredits] = useState<number>(0);
  const [displayName, setDisplayName] = useState<string>(""); 

  // 🪙 Fetch credits AND profile name
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("credits, full_name") 
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setCredits(data?.credits ?? 0);
        setDisplayName(data?.full_name ?? ""); 
      });
  }, [user?.id]);

  // 📊 Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      const { count: completed } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "reviewed");

      const { data: scored } = await supabase
        .from("submissions")
        .select("score")
        .eq("user_id", user.id)
        .not("score", "is", null);

      const { count: applied } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const avgScore =
        scored && scored.length
          ? scored.reduce((acc, cur) => acc + (cur.score ?? 0), 0) /
            scored.length
          : 0;

      setStats({
        proofsCompleted: completed || 0,
        avgScore: Number(avgScore.toFixed(1)),
        jobsApplied: applied || 0,
      });
    };

    fetchStats();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-8 py-10 transition-colors">
      {/* 🏁 Welcome */}
      <header className="mb-10">
        <h1 className="heading-lg flex items-center gap-2">
          {/* ✅ Use Display Name if available, else fallback to email */}
          👋 Hi, {displayName || user?.email?.split("@")[0]}!
        </h1>
        <p className="body-base text-[var(--color-text-muted)]">
          Ready to prove yourself? Here’s your progress at a glance.
        </p>
      </header>

      {/* 🌟 Stats Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
        <CreditCardStat credits={credits} />
        <StatCard label="Proofs Completed" value={stats.proofsCompleted} />
        <StatCard label="Average Score" value={`${stats.avgScore || "–"}★`} />
        <StatCard label="Jobs Applied" value={stats.jobsApplied} />
      </section>

      {/* 🚀 Quick Access */}
      <section>
        <h2 className="flex items-center gap-2 heading-md mb-4">
          <Target size={20} /> Quick Access
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LinkCard
            to="/candidate/jobs"
            title="Browse Jobs"
            desc="Find proof tasks that fit your skills"
            icon={<Briefcase size={18} />}
          />
          <LinkCard
            to="/candidate/proofs"
            title="My Proofs"
            desc="See your submissions and feedback"
            icon={<CheckCircle size={18} />}
          />
        </div>
      </section>
      
      {/* 📜 Active Proofs Section */}
      <section className="mt-14">
        <h2 className="flex items-center gap-2 heading-md mb-4">
          <CheckCircle size={20} /> My Active Proofs
        </h2>

        <ActiveProofs userId={user?.id} />
      </section>
    </div>
  );
}

/* ─────────────────────────────── COMPONENTS ─────────────────────────────── */

function CreditCardStat({ credits }: { credits: number }) {
  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-[var(--shadow-soft)] text-center hover:shadow-[var(--shadow-hover)] transition">
      <div className="flex justify-center mb-2">
        <div className="p-2 bg-[var(--color-candidate)]/10 rounded-full text-[var(--color-candidate)]">
          <CreditCard size={24} />
        </div>
      </div>
      <div className="text-3xl font-semibold text-[var(--color-candidate)] mb-1">
        {credits}
      </div>
      <div className="text-sm text-[var(--color-text-muted)]">
        Proof Credits
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-[var(--shadow-soft)] text-center transition hover:shadow-[var(--shadow-hover)] hover:-translate-y-[1px]">
      <div className="text-3xl font-semibold text-[var(--color-candidate)] mb-1">
        {value}
      </div>
      <div className="text-sm text-[var(--color-text-muted)]">{label}</div>
    </div>
  );
}

function LinkCard({
  to,
  title,
  desc,
  icon,
}: {
  to: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex items-start gap-3 bg-[var(--color-surface)] p-6 rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] hover:-translate-y-[1px] transition"
    >
      <div className="text-[var(--color-candidate)]">{icon}</div>
      <div>
        <h3 className="font-medium text-[var(--color-text)] mb-1">{title}</h3>
        <p className="text-sm text-[var(--color-text-muted)]">{desc}</p>
      </div>
    </Link>
  );
}

function ActiveProofs({ userId }: { userId?: string }) {
  const [proofs, setProofs] = useState<DashboardProof[]>([]);

  useEffect(() => {
    if (!userId) return;

    supabase
      .from("submissions")
      .select(`
        id,
        status,
        created_at,
        proof_tasks ( id, title ),
        jobs ( title, company )
      `)
      .eq("user_id", userId)
      .in('status', ['in_progress', 'submitted'])
      .order("created_at", { ascending: false })
      .then(({ data }) => {
          // @ts-ignore
          setProofs(data ?? [])
      });
  }, [userId]);

  if (!proofs.length)
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        You haven’t started any proofs yet.
      </p>
    );

  return (
    <div className="space-y-3">
      {proofs.map((p) => {
        const proofTaskId = p.proof_tasks?.id; 
        const status = p.status || "not_started";

        const statusClasses =
          status === "submitted"
            ? "bg-green-100 text-green-700"
            : status === "in_progress"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-gray-100 text-gray-600";

        return (
          <Link
            key={p.id}
            to={proofTaskId ? `/candidate/proof/${proofTaskId}` : "#"}
            className="flex items-center justify-between bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] px-4 py-3 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] hover:-translate-y-[1px] transition"
          >
            <div>
              <p className="font-medium text-[var(--color-text)]">{p.proof_tasks?.title || "Untitled Task"}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{p.jobs?.title} @ {p.jobs?.company}</p>
            </div>

            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClasses}`}
            >
              {status === "submitted"
                ? "Submitted"
                : status === "in_progress"
                ? "In Progress"
                : status === "reviewed"
                ? "Reviewed"
                : "Not Started"}
            </span>
          </Link>
        );
      })}
    </div>
  );
}