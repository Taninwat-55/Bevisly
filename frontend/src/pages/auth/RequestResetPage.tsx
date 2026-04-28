import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { notify } from "@/components/common/Notify";
import BackButton from "@/components/common/BackButton";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CheckCircle2, ArrowRight, Mail, Send, AlertCircle } from "lucide-react";

export default function RequestResetPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  // Cooldown timer logic
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  async function handleSendLink(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setErrorMsg(null);
    
    const cleanEmail = email.trim();
    if (!cleanEmail) return notify.error("Please enter your email.");
    if (cooldown > 0)
      return notify.error(`Please wait ${cooldown}s before trying again.`);

    try {
      setLoading(true);
      
      const redirectTo = `${window.location.origin}/auth/reset`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });
      
      if (error) throw error;

      setSentTo(cleanEmail);
      notify.success("📧 Reset link sent! Check your inbox.");
      setCooldown(60);
    } catch (err: any) {
      console.error("Reset error:", err);
      const message = err.message || "Failed to send reset link.";

      const secondsMatch = message.match(/after (\d+) seconds/);
      const isExceeded = message.toLowerCase().includes("rate limit exceeded");

      if (secondsMatch) {
        const seconds = parseInt(secondsMatch[1], 10);
        setCooldown(seconds);
        setErrorMsg(`Too many requests. Please wait ${seconds}s.`);
      } else if (isExceeded) {
        setCooldown(60);
        setErrorMsg("Email rate limit exceeded. Please wait a minute and try again.");
      } else {
        setErrorMsg(message);
      }
      notify.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--color-bg)]">
      {/* ── LEFT SIDE: BrandSidebar ── */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-[var(--color-slate-900)] text-white p-12">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[var(--color-brand-primary)]/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[var(--color-brand-secondary)]/20 rounded-full blur-[120px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] flex items-center justify-center font-bold text-lg shadow-glow-primary">
              B
            </div>
            <span className="text-2xl font-bold font-display tracking-tight">
              Bevisly
            </span>
          </div>

          <div className="max-w-md">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-tight">
              {sentTo ? "Check your inbox." : "Forgot your password?"} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
                {sentTo ? "It's on its way." : "Don't worry."}
              </span>
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed mb-8">
              {sentTo 
                ? `We've sent a secure link to ${sentTo}. Click the link in the email to set a new password.`
                : "We'll send you a secure link to get back into your account in no time."}
            </p>

            <div className="space-y-4">
              {[
                "Secure password recovery",
                "Instant magic links",
                "24/7 account protection",
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
        <div className="absolute left-4 top-4">
          <BackButton to="/auth" label="Back to Login" variant="ghost" />
        </div>

        <AnimatePresence mode="wait">
          {!sentTo ? (
            <motion.div
              key="request"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md space-y-8"
            >
              <div className="lg:hidden flex items-center gap-2 mb-8">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] flex items-center justify-center text-white font-bold">
                  B
                </div>
                <span className="text-xl font-bold font-display text-[var(--color-text)]">
                  Bevisly
                </span>
              </div>

              <div className="text-center lg:text-left">
                <h1 className="text-3xl font-bold font-display text-[var(--color-text)] tracking-tight mb-2">
                  Forgot Password
                </h1>
                <p className="text-[var(--color-text-muted)]">
                  Enter your email address and we'll send you a link to reset your
                  password.
                </p>
              </div>

              <form onSubmit={handleSendLink} className="space-y-6">
                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="name@example.com"
                  autoFocus
                  leftIcon={<Mail size={18} className="text-[var(--color-text-muted)]" />}
                  error={errorMsg || undefined}
                />

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
                  className="w-full text-lg h-12 shadow-glow-primary"
                  isLoading={loading}
                  disabled={cooldown > 0}
                  rightIcon={!loading && <ArrowRight size={18} />}
                >
                  {loading
                    ? "Sending…"
                    : cooldown > 0
                    ? `Wait ${cooldown}s`
                    : "Send Reset Link"}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Remembered your password?{" "}
                  <button
                    onClick={() => navigate("/auth")}
                    className="font-medium text-[var(--color-brand-primary)] hover:underline"
                  >
                    Sign in
                  </button>
                </p>
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
                <Send size={40} className="animate-bounce" />
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-bold font-display text-[var(--color-text)]">
                  Email Sent!
                </h2>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  We've sent a password reset link to <br />
                  <span className="font-semibold text-[var(--color-text)]">{sentTo}</span>
                </p>
              </div>

              <div className="bg-[var(--color-surface-hover)] p-6 rounded-2xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] text-left shadow-sm">
                <h4 className="font-semibold text-[var(--color-text)] mb-2">Next Steps:</h4>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="text-green-500 font-bold">1.</span>
                    Check your inbox (and spam folder).
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-500 font-bold">2.</span>
                    Click the "Reset Password" button in the email.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-500 font-bold">3.</span>
                    Choose a strong new password.
                  </li>
                </ul>
              </div>

              <div className="space-y-4 pt-4">
                <Button
                  onClick={() => handleSendLink()}
                  variant="outline"
                  className="w-full"
                  isLoading={loading}
                  disabled={cooldown > 0}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Didn't get the email? Resend"}
                </Button>

                <button
                  onClick={() => navigate("/auth")}
                  className="text-sm font-medium text-[var(--color-brand-primary)] hover:underline block mx-auto py-2"
                >
                  Back to Login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}