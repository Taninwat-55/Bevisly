import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Rocket, Camera, FileText, Linkedin, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCandidateStats } from "@/hooks/useCandidateStats";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/Card";

interface ProfileProgressProps {
  onNavigateToProfile: () => void;
}

type ChecklistItem = {
  key: string;
  label: string;
  points: number;
  icon: React.ElementType;
  action: () => void;
};

export default function ProfileProgress({ onNavigateToProfile }: ProfileProgressProps) {
  const { user } = useAuth();
  const { proofsCompleted, loading: statsLoading } = useCandidateStats();
  const navigate = useNavigate();

  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user?.id) return;
    setProfileLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("resume_url, linkedin_url")
      .eq("id", user.id)
      .single();
    setResumeUrl(data?.resume_url ?? null);
    setLinkedinUrl(data?.linkedin_url ?? null);
    setProfileLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  if (profileLoading || statsLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="h-[104px] rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse" />
      </div>
    );
  }

  const hasAvatar = !!user?.avatar_url;
  const hasResume = !!resumeUrl;
  const hasLinkedIn = !!linkedinUrl;
  const hasProof = proofsCompleted > 0;

  const percent =
    (hasAvatar ? 20 : 0) +
    (hasResume ? 30 : 0) +
    (hasLinkedIn ? 20 : 0) +
    (hasProof ? 30 : 0);

  if (percent === 100) return null;

  const incompleteItems: ChecklistItem[] = [];

  if (!hasAvatar)
    incompleteItems.push({
      key: "avatar",
      label: "Upload a profile photo",
      points: 20,
      icon: Camera,
      action: onNavigateToProfile,
    });

  if (!hasResume)
    incompleteItems.push({
      key: "resume",
      label: "Upload your resume",
      points: 30,
      icon: FileText,
      action: onNavigateToProfile,
    });

  if (!hasLinkedIn)
    incompleteItems.push({
      key: "linkedin",
      label: "Add your LinkedIn URL",
      points: 20,
      icon: Linkedin,
      action: onNavigateToProfile,
    });

  if (!hasProof)
    incompleteItems.push({
      key: "proof",
      label: "Complete your first proof task",
      points: 30,
      icon: Trophy,
      action: () => navigate("/candidate/jobs"),
    });

  const barColor =
    percent < 40
      ? "from-red-500 to-orange-500"
      : percent < 70
      ? "from-amber-500 to-yellow-400"
      : "from-blue-500 to-emerald-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto"
    >
      <Card variant="outline" padding="none">
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--color-brand-primary)]/10 flex items-center justify-center text-[var(--color-brand-primary)]">
                <Rocket size={14} />
              </div>
              <span className="text-sm font-semibold text-[var(--color-text)]">
                Complete your profile
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                — {incompleteItems.length} step{incompleteItems.length !== 1 ? "s" : ""} remaining
              </span>
            </div>
            <span className="text-sm font-bold text-[var(--color-text)]">{percent}%</span>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 w-full rounded-full bg-[var(--color-border)] overflow-hidden">
            <motion.div
              className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${barColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          {/* Action pills */}
          <div className="flex flex-wrap gap-2">
            {incompleteItems.map((item) => (
              <button
                key={item.key}
                onClick={item.action}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text)] hover:border-[var(--color-brand-primary)]/50 hover:bg-[var(--color-surface)] hover:-translate-y-0.5 transition-all duration-150 group"
              >
                <item.icon
                  size={14}
                  className="text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-primary)] transition-colors"
                />
                <span>{item.label}</span>
                <span className="ml-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  +{item.points}%
                </span>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
