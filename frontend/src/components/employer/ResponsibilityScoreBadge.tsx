import { ShieldCheck } from "lucide-react";

interface ResponsibilityScoreBadgeProps {
  score: number | null | undefined;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getScoreColor(score: number | null | undefined) {
  if (score === null || score === undefined) return "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400";
  if (score >= 80) return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300";
  if (score >= 50) return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300";
  return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
}

function getIconColor(score: number | null | undefined) {
  if (score === null || score === undefined) return "text-gray-400";
  if (score >= 80) return "text-emerald-500";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

const sizeClasses = {
  sm: { badge: "px-2 py-0.5 text-xs", icon: 12, gap: "gap-1" },
  md: { badge: "px-3 py-1 text-sm", icon: 14, gap: "gap-1.5" },
  lg: { badge: "px-4 py-2 text-base", icon: 18, gap: "gap-2" },
};

export default function ResponsibilityScoreBadge({
  score,
  size = "md",
  showLabel = true,
}: ResponsibilityScoreBadgeProps) {
  const { badge, icon, gap } = sizeClasses[size];
  const colorClass = getScoreColor(score);
  const iconColorClass = getIconColor(score);
  const isNew = score === null || score === undefined;

  const tooltipText = isNew
    ? "No reviews yet — this employer hasn't received any proof submissions"
    : `Responsibility Score: ${score}/100 — measures response rate, review speed, and feedback quality`;

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${badge} ${gap} ${colorClass}`}
      title={tooltipText}
    >
      <ShieldCheck size={icon} className={iconColorClass} />
      {isNew ? (
        <span>New</span>
      ) : (
        <span>
          {score}
          {showLabel && <span className="font-normal ml-1 opacity-75">Responsibility</span>}
        </span>
      )}
    </span>
  );
}
