import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  onClick?: () => void;
}

export default function BackButton({
  to,
  label = "Back",
  className = "",
  onClick,
}: BackButtonProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) return onClick();
    if (to) {
      navigate(to);
    } else {
      // Fallback to home if no history to go back to
      if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
      } else {
        navigate("/");
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`group inline-flex items-center gap-2 text-sm font-medium 
      text-[var(--color-text-muted)] hover:text-[var(--color-candidate)] 
      transition-colors duration-200 py-2 ${className}`}
    >
      <div className="p-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] group-hover:border-[var(--color-candidate)] transition-colors">
        <ArrowLeft size={14} />
      </div>
      {label}
    </button>
  );
}