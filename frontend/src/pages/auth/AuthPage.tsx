import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { notify } from "@/components/common/Notify";
import { Eye, EyeOff } from "lucide-react";
import BackButton from "@/components/common/BackButton";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState<"candidate" | "employer">("candidate");
  const [formLoading, setFormLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);

  // Auto-focus email
  useEffect(() => {
    emailRef.current?.focus();
  }, [isLogin]);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "employer") navigate("/employer");
      else if (user.role === "admin") navigate("/admin");
      else navigate("/candidate");
    }
  }, [user, authLoading, navigate]);

  // Sign Up
  async function handleSignUp() {
    setFormError(null);

    if (!email.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    try {
      setFormLoading(true);
      // 1. Capture 'data' to check for immediate session
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role } },
      });

      if (error) {
        setFormError(error.message);
        return;
      }

      // 2. Handle Logic based on Email Confirmation setting
      if (data.session) {
        // Case A: Email Confirmation is DISABLED (Dev Mode)
        // User is logged in immediately.
        notify.success("🎉 Account created! Logging you in...", role);

        // The existing useEffect will detect the user and redirect automatically.
      } else if (data.user) {
        // Case B: Email Confirmation is ENABLED (Production)
        // No session yet. User must verify email.
        notify.success("✅ Success! Please check your email to confirm.", role);

        // Optional: Switch back to login view so they aren't staring at the signup form
        setIsLogin(true);
      }

    } catch (err) {
      console.error("Error", err);
      setFormError("Unexpected error. Please try again.");
    } finally {
      setFormLoading(false);
    }
  }

  // Log In
  async function handleLogin() {
    setFormError(null);

    if (!email.trim() || !password.trim()) {
      setFormError("Please enter both email and password.");
      return;
    }

    try {
      setFormLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setFormError("Invalid email or password. Please try again.");
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData.session?.user;
      if (sessionUser) {
        // Fetch role from database (source of truth)
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", sessionUser.id)
          .single();

        const role = (profile?.role as "candidate" | "employer" | "admin") ?? "candidate";

        localStorage.setItem(
          "bevisly_user",
          JSON.stringify({ id: sessionUser.id, email: sessionUser.email, role })
        );

        notify.success("✅ Logged in successfully!", role);
        navigate(role === "admin" ? "/admin" : role === "employer" ? "/employer" : "/candidate");
      }
    } catch (err) {
      console.error(err);
      setFormError("Unexpected error. Please try again later.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLogin) await handleLogin();
    else await handleSignUp();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] overflow-hidden">
      {/* Consistent Back Button */}
      <div className="absolute left-4 top-4">
        <BackButton
          label={isLogin ? "Back to Home" : "Back to Login"}
          to={isLogin ? "/" : undefined}
          onClick={!isLogin ? () => setIsLogin(true) : undefined}
          className="border-transparent hover:border-[var(--color-border)]"
        />
      </div>

      {/* Auth Card */}
      <div className="bg-[var(--color-surface)] p-8 rounded-card shadow-soft w-full max-w-md relative overflow-hidden transition-all duration-300">
        <h1 className="text-2xl font-semibold text-center mb-6 text-[var(--color-candidate-dark)]">
          {isLogin ? "Welcome Back 👋" : "Create Your Account"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">Email</label>
            <input
              ref={emailRef}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[var(--color-border)] rounded-button px-3 py-2 text-sm focus:ring-2 focus:ring-candidate-light"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[var(--color-border)] rounded-button px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-candidate-light"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-8 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

            {/* Inline Error (animated) */}
            {formError && (
              <motion.p
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-[var(--color-error)] mt-1"
              >
                {formError}
              </motion.p>
            )}
          </div>

          {/* Confirm Password (signup only) */}
          {!isLogin && (
            <div className="relative">
              <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">
                Confirm Password
              </label>
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full border ${confirmPassword && password !== confirmPassword
                  ? "border-red-400"
                  : "border-[var(--color-border)]"
                  } rounded-button px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-candidate-light`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-3 top-8 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-[var(--color-error)] mt-1">
                  Passwords do not match
                </p>
              )}
            </div>
          )}

          {/* Role (signup only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "candidate" | "employer")}
                className="w-full border border-[var(--color-border)] rounded-button px-3 py-2 text-sm"
              >
                <option value="candidate">Candidate</option>
                <option value="employer">Employer</option>
              </select>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={formLoading}
            className="w-full cursor-pointer bg-[var(--color-candidate-dark)] text-white py-2 rounded-button shadow-soft hover:bg-[var(--color-candidate)] transition disabled:opacity-50"
          >
            {formLoading ? "Loading…" : isLogin ? "Log In" : "Create Account"}
          </button>
        </form>

        {/* Forgot Password */}
        {isLogin && (
          <p className="text-sm text-center text-[var(--color-text-muted)] mt-2">
            <button
              type="button"
              onClick={() => navigate("/auth/forgot")}
              className="cursor-pointer text-[var(--color-candidate-dark)] hover:underline"
            >
              Forgot password?
            </button>
          </p>
        )}

        {/* Toggle */}
        <p className="text-sm mt-4 text-center text-[var(--color-text-muted)]">
          {isLogin ? "New to Bevisly?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-[var(--color-candidate-dark)] cursor-pointer font-medium hover:underline transition-colors"
          >
            {isLogin ? "Create one" : "Log in instead"}
          </button>
        </p>
      </div>
    </div>
  );
}