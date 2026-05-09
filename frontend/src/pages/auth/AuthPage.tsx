import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { notify } from "@/components/common/Notify";
import { Eye, EyeOff, ArrowRight, CheckCircle2, Github } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import MFAChallengeModal from "@/components/auth/MFAChallengeModal";
import BackButton from "@/components/common/BackButton";
import { Link } from "react-router-dom";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.799 L -6.734 42.379 C -8.804 40.419 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
    </g>
  </svg>
);

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState<"candidate" | "employer">("candidate");
  const [formLoading, setFormLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [showMFAChallenge, setShowMFAChallenge] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const emailRef = useRef<HTMLInputElement>(null);

  // Parse URL parameters for initial state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    const roleParam = params.get("role");

    if (tabParam === "signup") {
      setIsLogin(false);
    } else if (tabParam === "login") {
      setIsLogin(true);
    }

    if (roleParam === "employer" || roleParam === "candidate") {
      setRole(roleParam);
    }
  }, [location.search]);

  // Auto-focus email
  useEffect(() => {
    emailRef.current?.focus();
  }, [isLogin]);

  // Redirect if already logged in
  useEffect(() => {
    console.log("[Auth] user state changed →", user?.role ?? "null", "| authLoading:", authLoading);
    if (!authLoading && user) {
      console.log("[Auth] Navigating to dashboard for role:", user.role);
      if (user.role === "employer") navigate("/employer");
      else if (user.role === "admin" || user.role === "demo_admin") navigate("/admin");
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

      if (role === "employer") {
        if (!inviteCode.trim()) {
          setFormError("Invitation code is required for employer access.");
          return;
        }

        // Verify invite code
        const { data: isValid, error: checkError } = await supabase.rpc('check_invite_code', { invite_code: inviteCode });
        
        if (checkError) {
          console.error("Invite check error:", checkError);
          setFormError("Error verifying invitation code.");
          return; 
        }

        if (!isValid) {
          setFormError("Invalid or expired invitation code.");
          return;
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role } },
      });

      if (error) {
        setFormError(error.message);
        return;
      }

      if (data.session) {
        notify.success("Account created. Logging you in...", role);
        if (role === "employer") {
          try {
             // Attempt to claim code immediately if session exists
             await supabase.rpc('claim_invite_code', { invite_code: inviteCode });
          } catch (e) {
               console.log("Could not claim code immediately", e);
          }
        }
      } else if (data.user) {
        notify.success("Success. Please check your email to confirm.", role);
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

      console.log("[Login] 1. Calling signInWithPassword...");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      console.log("[Login] 2. signInWithPassword resolved. error:", error?.message ?? "none");

      if (error) {
        setFormError("Invalid email or password. Please try again.");
        return;
      }

      // Check for MFA
      const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (!aal.error && aal.data.nextLevel === "aal2" && aal.data.currentLevel === "aal1") {
        setShowMFAChallenge(true);
        return;
      }

      console.log("[Login] 3. Auth succeeded. Waiting for AuthProvider to set user...");
      notify.success("Logged in successfully");
    } catch (err: unknown) {
      console.error("[Login] Unexpected error:", err);
      setFormError("Unexpected error. Please try again later.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleMagicLinkForLogin() {
    setFormError(null);
    if (!email.trim() || !email.includes("@")) {
      setFormError("Please enter a valid email address to send a magic link.");
      return;
    }

    try {
      setFormLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) {
         setFormError(error.message);
      } else {
        // After sending magic link, check if MFA is required upon session establishment
        // This typically happens on the redirect page, but if the session is immediately available, check here.
        // For magic links, the user clicks a link in email, which then establishes the session.
        // The MFA check would usually happen on the page they land on after clicking the link.
        // However, if we want to show the modal *before* they leave, we'd need a different flow.
        // For now, we'll assume the MFA check will be handled on the redirect target or after the session is established.
        // If the user is redirected back to this page and a session is established, the useEffect for user will handle it.
        // If MFA is required, the session will be AAL1 and the redirect target should handle AAL2 challenge.
        notify.success("Magic Link sent. Check your email to log in.");
      }
    } catch (err) {
      console.error(err);
      setFormError("Failed to send magic link.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleSocialLogin(provider: "google" | "github") {
    setFormError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) throw error;
      // For social logins, the user is redirected to the provider and then back.
      // The session is established upon return.
      // The MFA check would typically happen on the page they land on after the redirect.
      // If the user is redirected back to this page and a session is established, the useEffect for user will handle it.
      // If MFA is required, the session will be AAL1 and the redirect target should handle AAL2 challenge.
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : `Failed to sign in with ${provider}.`;
      setFormError(message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLogin) await handleLogin();
    else await handleSignUp();
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--color-bg)]">

      {/* ── LEFT SIDE: Brand / Marketing ───────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-[var(--color-slate-900)] text-white p-12">
        {/* Background Effects */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-12 hover:opacity-80 transition-opacity group">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary)] flex items-center justify-center font-bold text-lg">
              B
            </div>
            <span className="text-2xl font-bold font-display tracking-tight">Bevisly</span>
          </Link>

          <div className="max-w-md">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-tight">
              Prove your skills. <br />
              <span className="text-indigo-300">
                Land the job.
              </span>
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed mb-8">
              Join thousands of developers and designers who act on proof, not just promises.
            </p>

            <div className="space-y-4">
              {[
                "Automated code verification",
                "Real-world proof tasks",
                "Direct access to top employers"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <CheckCircle2 className="text-indigo-400 shrink-0" size={20} />
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

      {/* ── RIGHT SIDE: Form ───────────────────────────── */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute left-4 top-4">
          <BackButton to="/" label="Back to Website" variant="ghost" />
        </div>

        <div className="w-full max-w-md space-y-8">

          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-primary)] flex items-center justify-center text-white font-bold">
              B
            </div>
            <span className="text-xl font-bold font-display text-[var(--color-text)]">Bevisly</span>
          </Link>

          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold font-display text-[var(--color-text)] tracking-tight mb-2">
              {isLogin ? "Welcome back" : (role === "employer" ? "Invitation Only" : "Create Account")}
            </h1>
            <p className="text-[var(--color-text-muted)]">
              {isLogin 
                ? "Enter your credentials to access your account." 
                : (role === "employer" 
                    ? "Enter your invitation code to access the beta." 
                    : "Join to start proving your skills.")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <Input
              label="Email"
              type="email"
              ref={emailRef}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              autoFocus
            />

            {/* Password */}
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password (Signup only) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="relative pt-1 space-y-4">
                    <div className="relative">
                      <Input
                        label="Confirm Password"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        error={confirmPassword && password !== confirmPassword ? "Passwords do not match" : undefined}
                      />
                       <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-9 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Role Selection */}
                    <div className="pt-2">
                      <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">I am a...</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRole("candidate")}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all ${role === "candidate"
                            ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5 text-[var(--color-brand-primary)] shadow-sm"
                            : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-slate-100)] dark:hover:bg-[var(--color-slate-800)]"
                            }`}
                        >
                          Candidate
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole("employer")}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all ${role === "employer"
                            ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5 text-[var(--color-brand-primary)] shadow-sm"
                            : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-slate-100)] dark:hover:bg-[var(--color-slate-800)]"
                            }`}
                        >
                          Employer
                        </button>
                      </div>
                    </div>

                    {/* Invitation Code (Employer only) */}
                    <AnimatePresence>
                      {role === "employer" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4">
                            <Input
                              label="Invitation Code"
                              type="text"
                              value={inviteCode}
                              onChange={(e) => setInviteCode(e.target.value)}
                              placeholder="ENTER-CODE"
                              required
                              className="tracking-widest font-mono"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>



            {/* Form Error */}
            <AnimatePresence>
              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm"
                >
                  {formError}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              className="w-full text-lg h-12"
              isLoading={formLoading}
              rightIcon={!formLoading && <ArrowRight size={18} />}
            >
              {isLogin ? "Sign In" : (role === "employer" ? "Verify Invite & Join" : "Create Account")}
            </Button>

            {isLogin && (
              <div className="relative">
                 <div className="absolute inset-0 flex items-center">
                   <div className="w-full border-t border-[var(--color-border)]"></div>
                 </div>
                 <div className="relative flex justify-center text-xs uppercase">
                   <span className="px-2 bg-[var(--color-bg)] text-[var(--color-text-muted)]">Or</span>
                 </div>
               </div>
            )}
            
            {isLogin && (
               <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleMagicLinkForLogin}
                    disabled={formLoading}
                  >
                    Sign in with Magic Link
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSocialLogin("google")}
                      disabled={formLoading}
                      leftIcon={<GoogleIcon />}
                    >
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSocialLogin("github")}
                      disabled={formLoading}
                      leftIcon={<Github size={18} />}
                    >
                      GitHub
                    </Button>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] text-center leading-relaxed">
                    Continues as a Candidate. For Employer signup, use email + invite code.
                  </p>
               </div>
            )}
          </form>

          <div className="text-center space-y-4">
            {isLogin && (
              <button onClick={() => navigate("/auth/forgot")} className="text-sm font-medium text-[var(--color-brand-primary)] hover:underline">
                Forgot password?
              </button>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-border)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[var(--color-bg)] text-[var(--color-text-muted)]">
                  {isLogin ? "Have an invite code?" : "Already have an account?"}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Create an account" : "Log in to existing account"}
            </Button>
          </div>
        </div>
      </div>

      <MFAChallengeModal
        isOpen={showMFAChallenge}
        onSuccess={() => {
          setShowMFAChallenge(false);
          // Navigation is handled by the useEffect watching user state above.
        }}
        onCancel={async () => {
          setShowMFAChallenge(false);
          await supabase.auth.signOut();
          notify.error("Sign in cancelled.");
        }}
      />
    </div>
  );
}