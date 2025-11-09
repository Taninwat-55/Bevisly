import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useCandidateStats } from "@/hooks/useCandidateStats";
import ProofCardsGrid from "@/components/proofs/ProofCardsGrid";
import toast from "react-hot-toast";
import { RotateCcw, Copy, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CandidateProfile() {
  const { user } = useAuth();
  const { proofsCompleted, avgScore, jobsApplied, credits, loading } =
    useCandidateStats();

  const [joined, setJoined] = useState<string>("");
  const [copied, setCopied] = useState(false);

  /* 🗓️ Fetch join date */
  useEffect(() => {
    if (!user?.id) return;

    const fetchJoinDate = async () => {
      const { data } = await supabase
        .from("users")
        .select("created_at")
        .eq("id", user.id)
        .single();

      if (data?.created_at)
        setJoined(new Date(data.created_at).toLocaleDateString());
    };

    fetchJoinDate();
  }, [user?.id]);

  /* 🧹 Reset stored preferences (e.g., skip modals) */
  const handleResetPreferences = () => {
    const keys = Object.keys(localStorage);
    let resetCount = 0;
    keys.forEach((key) => {
      if (key.startsWith("skip") || key.startsWith("onboarding")) {
        localStorage.removeItem(key);
        resetCount++;
      }
    });
    toast.success(
      resetCount > 0
        ? `✅ ${resetCount} preference${resetCount > 1 ? "s" : ""} reset!`
        : "No preferences to reset."
    );
  };

  /* 📋 Copy public link */
  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/candidate/${user?.id}`
    );
    setCopied(true);
    toast.success("Profile link copied!");
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-[var(--color-text-muted)]">
        Loading profile…
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-8 py-10 transition-colors">
      {/* 👤 Header */}
      <header className="mb-10 text-center">
        <h1 className="heading-lg text-[var(--color-text)]">👤 My Profile</h1>
        <p className="body-base mt-1 text-[var(--color-text-muted)]">
          Your personal dashboard for tracking growth and progress.
        </p>
      </header>

      {/* 🧩 Account Info */}
      <motion.section
        className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] border border-[var(--color-border)] p-6 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h2 className="heading-md mb-4 text-[var(--color-text)]">
          Account Information
        </h2>
        <div className="space-y-2 text-sm text-[var(--color-text-muted)]">
          <InfoRow label="Email" value={user?.email} />
          <InfoRow label="Role" value={user?.role} />
          <InfoRow label="Member Since" value={joined || "—"} />
          <InfoRow label="Proof Credits" value={credits ?? "—"} />
        </div>

        {/* 🔄 Reset Preferences */}
        <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
          <button
            onClick={handleResetPreferences}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-[var(--color-border)] rounded-[var(--radius-button)]
                       text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition"
          >
            <RotateCcw size={14} />
            Reset all onboarding preferences
          </button>
          <p className="text-xs text-[var(--color-text-muted)] mt-2">
            Restores hidden confirmations like “Don’t show again”.
          </p>
        </div>
      </motion.section>

      {/* 📊 Performance Summary */}
      <motion.section
        className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] border border-[var(--color-border)] p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.25 }}
      >
        <h2 className="heading-md mb-4 text-[var(--color-text)]">
          Performance Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard label="Proofs Completed" value={proofsCompleted} />
          <StatCard label="Average Score" value={`${avgScore || "—"}★`} />
          <StatCard label="Jobs Applied" value={jobsApplied} />
        </div>
      </motion.section>

      {/* 💳 Proof Cards */}
      <motion.section
        className="mt-8 bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] border border-[var(--color-border)] p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.25 }}
      >
        <h2 className="heading-md mb-4 text-[var(--color-text)]">
          My Proof Cards
        </h2>
        <ProofCardsGrid />
      </motion.section>

      {/* 🌍 Public Profile */}
      <motion.section
        className="mt-8 bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] border border-[var(--color-border)] p-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.25 }}
      >
        <h2 className="heading-md mb-3 text-[var(--color-text)]">
          Public Profile
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Share your Bevis proof record with potential employers or peers.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="px-4 py-2 border border-[var(--color-border)] rounded-[var(--radius-button)] text-sm bg-[var(--color-bg)] break-all max-w-[90%] text-[var(--color-text)]">
            {`${window.location.origin}/candidate/${user?.id}`}
          </div>

          <button
            onClick={handleCopyLink}
            className="relative text-sm px-4 py-2 bg-[var(--color-candidate)] text-white rounded-[var(--radius-button)] hover:brightness-110 transition inline-flex items-center gap-2"
          >
            <Copy size={14} />
            Copy Link
            <AnimatePresence>
              {copied && (
                <motion.span
                  className="absolute -top-5 right-2 text-[10px] text-[var(--color-success)] flex items-center gap-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  <CheckCircle size={10} /> Copied!
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.section>
    </div>
  );
}

/* ─── Subcomponents ─────────────────────────────── */
function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  // 🧠 Format helper
  const formatValue = (val: string | number | null | undefined) => {
    if (val == null || val === "") return "—";

    // 🗓️ If it looks like a date or ISO string
    if (typeof val === "string" && !isNaN(Date.parse(val))) {
      const date = new Date(val);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    return val;
  };

  return (
    <p className="flex justify-between sm:justify-start sm:gap-3">
      <span className="font-medium text-[var(--color-text)]">{label}:</span>
      <span className="text-[var(--color-text-muted)] truncate">
        {formatValue(value)}
      </span>
    </p>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <motion.div
      className="bg-[var(--color-bg)] p-6 rounded-[var(--radius-card)] text-center border border-[var(--color-border)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition"
      whileHover={{ scale: 1.03 }}
    >
      <div className="text-3xl font-semibold text-[var(--color-candidate)] mb-1">
        {value}
      </div>
      <div className="text-sm text-[var(--color-text-muted)]">{label}</div>
    </motion.div>
  );
}
