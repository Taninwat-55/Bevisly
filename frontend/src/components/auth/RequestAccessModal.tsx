import { useState } from "react";
import { motion } from "framer-motion";
import { X, Building, User, Mail, Globe, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RequestAccessModal({ isOpen, onClose }: RequestAccessModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim() || !email.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("waitlist").insert([
        {
          company_name: companyName,
          contact_name: contactName,
          email,
          website,
          status: "pending"
        }
      ]);

      if (error) throw error;
      
      setSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setTimeout(() => {
      setCompanyName("");
      setContactName("");
      setEmail("");
      setWebsite("");
      setSuccess(false);
    }, 300);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={resetAndClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-[var(--color-bg)] rounded-[2rem] shadow-2xl overflow-hidden border border-[var(--color-border)]"
      >
        <div className="p-8">
          <button
            onClick={resetAndClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors"
          >
            <X size={20} />
          </button>

          {success ? (
             <div className="text-center py-8">
               <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                 <CheckCircle size={32} />
               </div>
               <h3 className="text-2xl font-bold font-display text-[var(--color-text)] mb-3">Request Received!</h3>
               <p className="text-[var(--color-text-muted)] mb-8 leading-relaxed">
                 Thank you for your interest in Bevisly. We are currently rolling out access to a limited number of employers. We will review your request and send an invitation code to <strong className="text-[var(--color-text)]">{email}</strong> soon.
               </p>
               <Button onClick={resetAndClose} className="w-full">
                 Return to Login
               </Button>
             </div>
          ) : (
            <>
              <div className="mb-8">
                <h3 className="text-2xl font-bold font-display text-[var(--color-text)] mb-2">Request Access</h3>
                <p className="text-[var(--color-text-muted)]">
                  Join the waitlist to get early access to Bevisly's proof-based hiring platform.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    label="Company Name *"
                    placeholder="Acme Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                  <Building size={16} className="absolute right-4 top-10 text-[var(--color-text-muted)]" />
                </div>

                <div className="relative">
                  <Input
                    label="Your Name *"
                    placeholder="Jane Doe"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                  <User size={16} className="absolute right-4 top-10 text-[var(--color-text-muted)]" />
                </div>

                <div className="relative">
                  <Input
                    label="Work Email *"
                    type="email"
                    placeholder="jane@acmecorp.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail size={16} className="absolute right-4 top-10 text-[var(--color-text-muted)]" />
                </div>

                <div className="relative">
                  <Input
                    label="Website (Optional)"
                    placeholder="https://acmecorp.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                  <Globe size={16} className="absolute right-4 top-10 text-[var(--color-text-muted)]" />
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-4" 
                  isLoading={loading}
                  rightIcon={<Send size={16} />}
                >
                  Join Waitlist
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
