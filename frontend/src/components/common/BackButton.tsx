import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  onClick?: () => void;
  variant?: "default" | "glass" | "ghost";
}

export default function BackButton({
  to,
  label = "Back",
  className = "",
  onClick,
  variant = "default",
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

  const variants = {
    default: "text-[var(--color-text-muted)] hover:text-[var(--color-candidate)]",
    glass: "text-white/80 hover:text-white hover:bg-white/10 border border-white/10 rounded-full px-4 backdrop-blur-md",
    ghost: "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-full px-3"
  };

  const iconStyles = {
    default: "p-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] group-hover:border-[var(--color-candidate)] transition-colors",
    glass: "mr-1", // No circle for glass, just the icon
    ghost: "mr-1"
  };

  return (
    <button
      onClick={handleClick}
      className={`group inline-flex items-center gap-2 text-sm font-medium transition-all duration-200 py-2 ${variants[variant]} ${className}`}
    >
      <div className={variant === 'default' ? iconStyles.default : ''}>
        <ArrowLeft size={16} className={variant !== 'default' ? iconStyles[variant] : ''} />
      </div>
      {label}
    </button>
  );
}