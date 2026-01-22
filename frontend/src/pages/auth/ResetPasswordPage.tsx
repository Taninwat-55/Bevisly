import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { notify } from "@/components/common/Notify";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const strength = evaluateStrength(password);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return notify.error("Please enter a new password.");

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      notify.success("✅ Password updated!");
      navigate("/auth");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err);
        if (err.message?.includes("Password should contain")) {
          notify.error(
            "⚠️ Password too weak. Include uppercase, lowercase, number, and symbol."
          );
        } else {
          notify.error(err.message || "Reset failed. Try again.");
        }
      } else {
        console.error("Unknown error:", err);
        notify.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  function evaluateStrength(password: string) {
    let score = 0;
    const rules = {
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSymbol: /[^A-Za-z0-9]/.test(password),
    };
    score = Object.values(rules).filter(Boolean).length;
    let label = "Weak";
    let color = "bg-red-500";
    if (score === 3) {
      label = "Medium";
      color = "bg-yellow-400";
    } else if (score === 4) {
      label = "Strong";
      color = "bg-green-500";
    }
    return { score, label, color, rules };
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="bg-[var(--color-surface)] transition-colors p-8 rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-4 text-[var(--color-candidate-dark)]">
          Set New Password
        </h1>

        <form onSubmit={handleReset} className="space-y-4">
          {/* Password input + toggle */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">
              New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[var(--color-border)] rounded-[var(--radius-button)] px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-[var(--color-candidate-light)]"
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[34px] transform -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

            {/* Strength meter */}
            {password && (
              <div className="mt-2">
                <div className="w-full h-2 bg-gray-200 rounded">
                  <div
                    className={`h-2 rounded transition-all duration-300 ${strength.color}`}
                    style={{ width: `${(strength.score / 4) * 100}%` }}
                  />
                </div>
                <p
                  className={`text-sm mt-1 ${
                    strength.label === "Strong"
                      ? "text-green-600"
                      : strength.label === "Medium"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {strength.label} password
                </p>
                <ul className="text-xs text-[var(--color-text-muted)] mt-1 space-y-0.5">
                  {!strength.rules.hasLower && (
                    <li>• Add a lowercase letter (a-z)</li>
                  )}
                  {!strength.rules.hasUpper && (
                    <li>• Add an uppercase letter (A-Z)</li>
                  )}
                  {!strength.rules.hasNumber && <li>• Add a number (0-9)</li>}
                  {!strength.rules.hasSymbol && (
                    <li>• Add a symbol (!@#$%^&*)</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-candidate-dark)] text-white py-2 rounded-[var(--radius-button)] hover:bg-[var(--color-candidate)] transition disabled:opacity-50"
          >
            {loading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
