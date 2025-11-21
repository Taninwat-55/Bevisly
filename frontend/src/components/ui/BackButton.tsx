import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  onClick?: () => void;
}

export default function BackButton({
  to,
  label,
  className = "",
  onClick,
}: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (onClick) return onClick();
    if (to) navigate(to);
    else if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/");
  };

  let defaultLabel = label;
  if (!defaultLabel) {
    const path = location.pathname;
    if (/^\/jobs\/[a-zA-Z0-9_-]+$/.test(path)) {
      defaultLabel = "Back to Jobs";
    } 
    // 🔴 DELETE or COMMENT OUT these lines:
    // else if (/^\/candidate\/[a-zA-Z0-9_-]+$/.test(path)) {
    //   defaultLabel = "Back to Leaderboard";
    // } 
    else if (path.startsWith("/jobs")) {
      defaultLabel = "Back";
    } else {
      defaultLabel = "Back";
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex w-fit items-center gap-1.5 rounded-[var(--radius-button)]
  border border-[var(--color-border)] bg-[var(--color-surface)]
  px-3 py-1.5 text-sm text-[var(--color-text-muted)]
  hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]
  hover:shadow-[var(--shadow-soft)] transition-all duration-150 ${className}`}
    >
      <ArrowLeft size={14} />
      {defaultLabel}
    </button>
  );
}
