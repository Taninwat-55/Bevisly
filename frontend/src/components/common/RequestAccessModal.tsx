import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabaseClient";
import { notify } from "@/components/common/Notify";
import { X, Mail, User, Building, Send } from "lucide-react";
import { getAdminNotificationTemplate, getUserConfirmationTemplate } from "@/lib/emailTemplates";

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RequestAccessModal({ isOpen, onClose }: RequestAccessModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: adminMailError } = await supabase.functions.invoke("send-email", {
        body: {
          to: ["bevislyapp@gmail.com"], // Send request to admin
          subject: `🚀 New Beta Request: ${name} (${company})`,
          html: getAdminNotificationTemplate(name, email, company, "Beta Access"),
        },
      });

      if (adminMailError) throw adminMailError;

      // 2. Send confirmation to User (Optional but nice)
      /* 
      // Temporarily disabled until domain is fully verified/propagated
      await supabase.functions.invoke("send-email", {
        body: {
          to: [email],
          subject: "We've received your request - Bevisly Beta",
          html: getUserConfirmationTemplate(name),
        },
      });
      */

      notify.success("Request sent! We've received your details.");
      onClose();
      setEmail("");
      setName("");
      setCompany("");
    } catch (error) {
      console.error("Error sending request:", error);
      notify.error("Failed to send request. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold leading-6 text-[var(--color-text)]"
                  >
                    Request Beta Access
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    leftIcon={<User size={16} />}
                  />
                  
                  <Input
                    label="Work Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    required
                    leftIcon={<Mail size={16} />}
                  />

                  <Input
                    label="Company Name"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Inc."
                    leftIcon={<Building size={16} />}
                  />

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full"
                      isLoading={loading}
                      rightIcon={!loading && <Send size={16} />}
                    >
                      Join Waitlist
                    </Button>
                  </div>
                  
                  <p className="text-xs text-center text-[var(--color-text-muted)]">
                    We'll never share your email. Unsubscribe anytime.
                  </p>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
