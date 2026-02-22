import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabaseClient";
import { notify } from "@/components/common/Notify";
import { Smartphone, Loader2, ArrowRight } from "lucide-react";

interface MFAChallengeModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MFAChallengeModal({ isOpen, onSuccess, onCancel }: MFAChallengeModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code || code.length !== 6) {
      notify.error("Please enter a valid 6-digit code.");
      return;
    }

    try {
      setLoading(true);
      
      // 1. Get the factors for the currently logged in user (at AAL1)
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;
      
      const totpFactor = factorsData.totp.find((f: { status: string; id: string }) => f.status === "verified");
      if (!totpFactor) throw new Error("No verified MFA factor found on this account.");

      // 2. Challenge the factor
      const challengeInfo = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
      if (challengeInfo.error) throw challengeInfo.error;
      
      // 3. Verify the code against the challenge
      const challengeId = challengeInfo.data.id;
      const verifyInfo = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId,
        code
      });

      if (verifyInfo.error) throw verifyInfo.error;

      // 4. Verification successful, the session is now AAL2
      notify.success("Identity verified successfully.");
      setCode("");
      onSuccess();
    } catch (err: unknown) {
      console.error("MFA Challenge Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Invalid or expired code. Please try again.";
      notify.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCancel}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8 text-left align-middle shadow-2xl transition-all">
                
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                    <Smartphone size={32} />
                  </div>
                </div>
                
                <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-center text-[var(--color-text)] mb-2">
                  Two-Factor Authentication
                </Dialog.Title>
                
                <div className="mt-2 text-center mb-8">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Enter the 6-digit code from your authenticator app to continue.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    autoFocus
                    className="font-mono text-center text-2xl tracking-[0.5em] font-bold py-6 bg-[var(--color-bg)]"
                  />
                  
                  <div className="flex gap-3 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={onCancel}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={code.length !== 6 || loading}
                      rightIcon={loading ? <Loader2 className="animate-spin w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    >
                      Verify
                    </Button>
                  </div>
                </form>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
