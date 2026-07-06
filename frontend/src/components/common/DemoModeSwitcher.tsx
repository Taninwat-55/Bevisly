import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRound, Building2 } from "lucide-react";

/**
 * Floating switcher shown ONLY to the demo account (role = demo_admin).
 *
 * The demo can experience both sides of Bevisly from a single login, but it is
 * blocked from the admin panel (see ProtectedRoute). Since the old
 * candidate/employer switcher lived inside the admin dashboard, this component
 * gives the demo a way to flip sides from anywhere in the app.
 */
export default function DemoModeSwitcher() {
  const { user, setOverride } = useAuth();
  const navigate = useNavigate();

  const isDemo =
    user?.original_role === "demo_admin" || user?.role === "demo_admin";

  // Default the demo into the candidate view so role-specific UI resolves
  // against a concrete role instead of "demo_admin".
  useEffect(() => {
    if (!isDemo) return;
    const override = localStorage.getItem("overrideRole");
    if (!override || override === "admin" || override === "demo_admin") {
      setOverride?.("candidate");
    }
  }, [isDemo, setOverride]);

  if (!isDemo) return null;

  const current = user?.role; // effective (overridden) role
  const go = (role: "candidate" | "employer") => {
    setOverride?.(role);
    navigate(`/${role}`);
  };

  const base =
    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all";
  const active =
    "bg-[var(--color-brand-primary)] text-white shadow-sm";
  const inactive =
    "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]";

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-1 shadow-[var(--shadow-soft)]">
      <span className="px-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
        Demo
      </span>
      <button
        type="button"
        onClick={() => go("candidate")}
        className={`${base} ${current === "candidate" ? active : inactive}`}
      >
        <UserRound size={13} strokeWidth={2.5} /> Candidate
      </button>
      <button
        type="button"
        onClick={() => go("employer")}
        className={`${base} ${current === "employer" ? active : inactive}`}
      >
        <Building2 size={13} strokeWidth={2.5} /> Employer
      </button>
    </div>
  );
}
