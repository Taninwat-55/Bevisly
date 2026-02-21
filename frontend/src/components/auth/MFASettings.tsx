import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { notify } from "@/components/common/Notify";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Smartphone, Loader2, ShieldCheck, ShieldAlert, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";

export default function MFASettings() {
  const [factors, setFactors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [totpUri, setTotpUri] = useState("");
  const [factorId, setFactorId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [totpSecret, setTotpSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    loadFactors();
  }, []);

  async function loadFactors() {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      
      // Filter the TOTP factors that have actually been verified
      const verifiedTotp = data.totp.filter((factor: any) => factor.status === "verified");
      setFactors(verifiedTotp);
    } catch (err) {
      console.error("Failed to load MFA factors", err);
      // Suppress UI error for generic factors fetching if needed
    } finally {
      setLoading(false);
    }
  }

  async function startEnrollment() {
    try {
      setActionLoading(true);

      // Clean up any orphaned unverified factors to prevent the "Factor already exists" error
      // Sometimes "unverified" factors linger if enrollment wasn't completed
      const { data: existingFactors } = await supabase.auth.mfa.listFactors();
      if (existingFactors && existingFactors.totp) {
        const unverified = existingFactors.totp.filter((f: any) => f.status !== "verified");
        for (const factor of unverified) {
          try {
             await supabase.auth.mfa.unenroll({ factorId: factor.id });
          } catch (e) {
             console.log("Could not unenroll factor", factor.id, e);
          }
        }
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `Authenticator App - ${Math.floor(Math.random() * 10000)}`,
      });
      if (error) throw error;

      setFactorId(data.id);
      setTotpUri(data.totp.uri);
      setTotpSecret(data.totp.secret);
      setIsEnrolling(true);
    } catch (err: any) {
      console.error("MFA Enrollment Error", err);
      notify.error(err.message || "Failed to start 2FA enrollment");
    } finally {
      setActionLoading(false);
    }
  }

  async function verifyEnrollment(e: React.FormEvent) {
    e.preventDefault();
    if (!verifyCode || verifyCode.length !== 6) {
      notify.error("Please enter a valid 6-digit code.");
      return;
    }
    
    try {
      setActionLoading(true);
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      const challengeId = challenge.data.id;
      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: verifyCode,
      });

      if (verify.error) throw verify.error;

      notify.success("Two-Factor Authentication successfully enabled!");
      setVerifyCode("");
      setIsEnrolling(false);
      setTotpUri("");
      await loadFactors();
    } catch (err: any) {
      console.error("MFA Verification Error", err);
      notify.error(err.message || "Invalid or expired code. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  // Auto-submit when exactly 6 digits are typed/pasted
  useEffect(() => {
    if (verifyCode.length === 6 && !actionLoading && factorId) {
      const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
      verifyEnrollment(syntheticEvent);
    }
  }, [verifyCode]);

  async function unenrollFactor(id: string) {
    if (!window.confirm("Are you sure you want to disable 2FA? This will reduce the security of your account.")) {
      return;
    }

    try {
      setActionLoading(true);
      const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
      if (error) throw error;

      notify.success("Two-Factor Authentication disabled.");
      await loadFactors();
    } catch (err: any) {
      console.error("MFA Unenroll Error", err);
      notify.error(err.message || "Failed to disable 2FA.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 text-[var(--color-text-muted)]">
        <Loader2 className="animate-spin w-5 h-5 mr-3" />
        Loading security settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 lg:p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            <Smartphone size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--color-text)]">Two-Factor Authentication (2FA)</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1 max-w-lg">
              Add an extra layer of security to your account by requesting both your password and a code from an authenticator app.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
        {factors.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl">
              <ShieldCheck size={20} />
              <p className="text-sm font-medium">Your account is secured with Two-Factor Authentication.</p>
            </div>
            {factors.map((factor) => (
              <div key={factor.id} className="flex items-center justify-between p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                <div className="flex items-center gap-3">
                  <KeyRound size={18} className="text-[var(--color-text-muted)]" />
                  <div>
                    <h4 className="text-sm font-medium text-[var(--color-text)]">Authenticator App</h4>
                    <p className="text-xs text-[var(--color-text-muted)]">Added {new Date(factor.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => unenrollFactor(factor.id)}
                  isLoading={actionLoading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/50"
                >
                  Disable
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {!isEnrolling ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl flex-1 mr-4">
                  <ShieldAlert size={20} />
                  <p className="text-sm font-medium">2FA is currently disabled.</p>
                </div>
                <Button onClick={startEnrollment} isLoading={actionLoading}>
                  Set up 2FA
                </Button>
              </div>
            ) : (
              <AnimatePresence>
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-[var(--color-text)]">1. Scan QR Code</h4>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        Open your authenticator app (e.g. Google Authenticator, Authy, Apple Passwords) and scan this QR code.
                      </p>
                      
                      <div className="p-4 bg-white rounded-xl inline-flex items-center justify-center border shadow-sm w-48 h-48">
                        {totpUri ? (
                          <div className="w-full h-full bg-white p-2">
                            <QRCode 
                              value={totpUri} 
                              size={256} 
                              style={{ height: "auto", maxWidth: "100%", width: "100%" }} 
                              viewBox={`0 0 256 256`} 
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-lg">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-2">
                        <button 
                          onClick={() => setShowSecret(!showSecret)}
                          className="text-xs text-[var(--color-brand-primary)] hover:underline"
                        >
                          {showSecret ? "Hide manual entry code" : "Can't scan the QR code?"}
                        </button>
                        {showSecret && (
                          <div className="mt-2 p-3 bg-[var(--color-bg)] rounded-lg text-xs font-mono break-all text-[var(--color-text)]">
                            {totpSecret}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 md:border-l border-[var(--color-border)] md:pl-8">
                      <h4 className="font-semibold text-[var(--color-text)]">2. Enter Verification Code</h4>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        Enter the 6-digit code generated by your authenticator app to confirm setup.
                      </p>
                      
                      <form onSubmit={verifyEnrollment} className="space-y-4 pt-2">
                        <Input
                          placeholder="000000"
                          value={verifyCode}
                          onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          required
                          className="font-mono text-center text-lg tracking-[0.5em] font-bold"
                        />
                        <div className="flex gap-3">
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              setIsEnrolling(false);
                              setVerifyCode("");
                              setTotpUri("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            className="flex-1" 
                            isLoading={actionLoading}
                            disabled={verifyCode.length !== 6}
                          >
                            Verify & Enable
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
