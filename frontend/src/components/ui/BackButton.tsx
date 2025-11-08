import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export default function BackButton({
  to,
  label,
  className = "",
}: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (to) navigate(to);
    else if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/");
  };

  // ✅ fixed logic
  let defaultLabel = label;
  if (!defaultLabel) {
    const path = location.pathname;

    if (/^\/jobs\/[a-zA-Z0-9_-]+$/.test(path)) {
      defaultLabel = "Back to Jobs";
    } else if (/^\/candidate\/[a-zA-Z0-9_-]+$/.test(path)) {
      defaultLabel = "Back to Leaderboard";
    } else if (path.startsWith("/jobs")) {
      defaultLabel = "Back";
    } else {
      defaultLabel = "Back";
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)]
        px-2.5 py-1.5 text-sm text-[var(--color-text-muted)]
        hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]
        transition-colors ${className}`}
    >
      <ArrowLeft size={14} />
      {defaultLabel}
    </button>
  );
}
