import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabaseClient";
import { notify } from "@/components/common/Notify";
import { X, Mail, User, Send, MessageSquare } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send email to Admin
      const { error: mailError } = await supabase.functions.invoke("send-email", {
        body: {
          to: ["bevislyapp@gmail.com"],
          reply_to: email, // Allow direct reply
          subject: `📬 New Contact Inquiry from ${name}`,
          html: `
            <h1>New Contact Inquiry</h1>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <hr />
            <h3>Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          `,
        },
      });

      if (mailError) throw mailError;

      notify.success("Message sent! We'll get back to you shortly.");
      onClose();
      setEmail("");
      setName("");
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      notify.error("Failed to send message. Please try again.");
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
                    Contact Us
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
                    placeholder="Your Name"
                    required
                    leftIcon={<User size={16} />}
                  />
                  
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    leftIcon={<Mail size={16} />}
                  />

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[var(--color-text)]">
                      Message
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-[var(--color-text-muted)]">
                        <MessageSquare size={16} />
                      </div>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="How can we help?"
                        required
                        rows={4}
                        className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent outline-none transition-all placeholder:text-[var(--color-text-muted)] resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full"
                      isLoading={loading}
                      rightIcon={!loading && <Send size={16} />}
                    >
                      Send Message
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
