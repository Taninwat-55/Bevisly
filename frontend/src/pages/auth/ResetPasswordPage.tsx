import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { notify } from "@/components/common/Notify";
import { Eye, EyeOff, ArrowRight, CheckCircle2, Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import BackButton from "@/components/common/BackButton";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const strength = evaluateStrength(password);

  // Verification: Ensure we have a session or a recovery state
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Current session state:", !!session);
    }
    checkSession();
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    console.log("Reset password attempt started...");
    setErrorMsg(null);
    
    if (!password) return notify.error("Please enter a new password.");
    if (strength.score < 3) return setErrorMsg("Please choose a stronger password.");

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error("Update password error:", error);
        throw error;
      }

      console.log("Password updated successfully!");
      setSuccess(true);
      notify.success("Password updated");
    } catch (err: unknown) {
      console.error("Catch block error:", err);
      const message = err instanceof Error ? err.message : "Reset failed. Try again.";
      
      if (message.includes("Password should contain")) {
        setErrorMsg("⚠️ Password too weak. Include uppercase, lowercase, number, and symbol.");
      } else if (message.toLowerCase().includes("session") || message.toLowerCase().includes("expired")) {
        setErrorMsg("Your session has expired. Please request a new reset link.");
      } else {
        setErrorMsg(message);
      }
      notify.error(message);
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
    if (password.length < 8) score = Math.max(0, score - 1);
    
    let label = "Weak";
    let color = "bg-red-500";
    if (score === 3) {
      label = "Medium";
      color = "bg-yellow-400";
    } else if (score >= 4) {
      label = "Strong";
      color = "bg-green-500";
    }
    return { score, label, color, rules };
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--color-bg)]">
      {/* ── LEFT SIDE: BrandSidebar ── */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-[var(--color-slate-900)] text-white p-12">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary)] flex items-center justify-center font-bold text-lg">
              B
            </div>
            <span className="text-2xl font-bold font-display tracking-tight">
              Bevisly
            </span>
          </div>

          <div className="max-w-md">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-tight">
              {success ? "All set!" : "Secure your account."} <br />
              <span className="text-indigo-300">
                {success ? "You're good to go." : "Choose wisely."}
              </span>
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed mb-8">
              {success 
                ? "Your password has been updated successfully. You can now log in with your new credentials."
                : "Create a strong password to ensure your professional profile and proofs remain protected."}
            </p>

            <div className="space-y-4">
              {[
                "Advanced encryption",
                "Password strength analysis",
                "Secure session management",
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <CheckCircle2 className="text-teal-400 shrink-0" size={20} />
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          © {new Date().getFullYear()} Bevisly Inc. All rights reserved.
        </div>
      </div>

      {/* ── RIGHT SIDE: Form ── */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative">
        {!success && (
          <div className="absolute left-4 top-4">
            <BackButton to="/auth" label="Back to Login" variant="ghost" />
          </div>
        )}

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="reset-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md space-y-8"
            >
              <div className="lg:hidden flex items-center gap-2 mb-8">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-primary)] flex items-center justify-center text-white font-bold">
                  B
                </div>
                <span className="text-xl font-bold font-display text-[var(--color-text)]">
                  Bevisly
                </span>
              </div>

              <div className="text-center lg:text-left">
                <h1 className="text-3xl font-bold font-display text-[var(--color-text)] tracking-tight mb-2">
                  Set New Password
                </h1>
                <p className="text-[var(--color-text-muted)]">
                  Please enter a new secure password for your account.
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-6">
                <div className="relative">
                  <Input
                    label="New Password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="••••••••"
                    autoFocus
                    leftIcon={<Lock size={18} className="text-[var(--color-text-muted)]" />}
                    error={errorMsg || undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>

                  {/* Strength Meter */}
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 space-y-2"
                    >
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-[var(--color-text-muted)]">
                          Password Strength
                        </span>
                        <span
                          className={
                            strength.label === "Strong"
                              ? "text-green-500"
                              : strength.label === "Medium"
                              ? "text-yellow-500"
                              : "text-red-500"
                          }
                        >
                          {strength.label}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--color-slate-200)] dark:bg-[var(--color-slate-800)] rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${strength.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(strength.score / 4) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                        {[
                          { key: "hasLower", label: "Lowercase" },
                          { key: "hasUpper", label: "Uppercase" },
                          { key: "hasNumber", label: "Number" },
                          { key: "hasSymbol", label: "Symbol" },
                        ].map((rule) => (
                          <li
                            key={rule.key}
                            className={`flex items-center gap-1.5 text-[10px] ${
                              strength.rules[rule.key as keyof typeof strength.rules]
                                ? "text-green-500"
                                : "text-[var(--color-text-muted)]"
                            }`}
                          >
                            <div
                              className={`w-1 h-1 rounded-full ${
                                strength.rules[
                                  rule.key as keyof typeof strength.rules
                                ]
                                  ? "bg-green-500"
                                  : "bg-[var(--color-slate-300)]"
                              }`}
                            />
                            {rule.label}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>

                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-center gap-3"
                    >
                      <AlertCircle size={18} />
                      <span>{errorMsg}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  className="w-full text-lg h-12"
                  isLoading={loading}
                  rightIcon={!loading && <ArrowRight size={18} />}
                >
                  {loading ? "Updating…" : "Update Password"}
                </Button>
              </form>

              <div className="text-center">
                <button
                  onClick={() => navigate("/auth")}
                  className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  Cancel and go back
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md text-center space-y-8"
            >
              <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-6">
                <ShieldCheck size={40} className="animate-pulse" />
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-bold font-display text-[var(--color-text)]">
                  Success!
                </h2>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  Your password has been changed successfully. <br />
                  You can now return to the login page.
                </p>
              </div>

              <Button
                onClick={() => navigate("/auth")}
                className="w-full text-lg h-12"
              >
                Go to Login
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
