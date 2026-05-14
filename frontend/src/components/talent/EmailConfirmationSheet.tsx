import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X, Send } from "lucide-react";
import type { HiringStage } from "@/types";

export interface PendingEmail {
  submissionId: string;
  candidateName: string;
  stage: "interview" | "offer_sent" | "rejected";
}

interface Props {
  pending: PendingEmail | null;
  onSend: (note: string) => void;
  onSkip: () => void;
}

const STAGE_CONFIG: Record<
  "interview" | "offer_sent" | "rejected",
  {
    label: string;
    accentColor: string;
    preview: (firstName: string, note: string) => string;
  }
> = {
  interview: {
    label: "Interview Invitation",
    accentColor: "bg-cyan-500",
    preview: (firstName, note) =>
      `Hi ${firstName},\n\nYour proof submission caught the team's attention and they'd like to invite you to an interview for this role.${
        note ? `\n\nMessage from the employer:\n"${note}"` : ""
      }\n\nReply directly to this email with any questions.`,
  },
  offer_sent: {
    label: "Offer",
    accentColor: "bg-violet-500",
    preview: (firstName, note) =>
      `Hi ${firstName},\n\nCongratulations — after reviewing your proof, the team would like to extend you an offer.${
        note ? `\n\nMessage from the employer:\n"${note}"` : ""
      }\n\nThey'll reach out directly with the details.`,
  },
  rejected: {
    label: "Rejection",
    accentColor: "bg-red-500",
    preview: (firstName, note) =>
      `Hi ${firstName},\n\nThank you for your proof submission. After careful review, the team has decided not to move forward at this time.${
        note ? `\n\nNote from the employer:\n"${note}"` : ""
      }\n\nYour feedback from the review panel is also included in this email.`,
  },
};

// Keep TypeScript happy — HiringStage is imported but only used for the exported type below
export type EmailStage = Extract<HiringStage, "interview" | "offer_sent" | "rejected">;

export default function EmailConfirmationSheet({ pending, onSend, onSkip }: Props) {
  const [note, setNote] = useState("");

  const config = pending ? STAGE_CONFIG[pending.stage] : null;
  const firstName = pending?.candidateName.split(" ")[0] ?? "";

  function handleSend() {
    onSend(note);
    setNote("");
  }

  function handleSkip() {
    onSkip();
    setNote("");
  }

  return createPortal(
    <AnimatePresence>
      {pending && config && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Centered modal */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="w-full max-w-lg bg-[var(--color-bg)] border border-[var(--color-border)] shadow-2xl rounded-2xl pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${config.accentColor}`} />
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-text-muted)]">
                    {config.label}
                  </p>
                  <p className="text-base font-bold text-[var(--color-text)] leading-tight">
                    Send email to {pending.candidateName}?
                  </p>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Live email preview */}
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)] mb-2">
                  What {firstName} will receive
                </p>
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[var(--color-border)]">
                    <Mail size={13} className="text-[var(--color-brand-primary)] shrink-0" />
                    <p className="text-xs font-semibold text-[var(--color-text)]">
                      {config.label} — sent via Bevisly on behalf of the employer
                    </p>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line">
                    {config.preview(firstName, note)}
                  </p>
                </div>
              </div>

              {/* Personal note */}
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)] block mb-2">
                  Add a personal note{" "}
                  <span className="normal-case font-normal">(optional — appears in the email above)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    pending.stage === "interview"
                      ? `e.g. "We'd love to schedule a 30-min call — let us know your availability next week."`
                      : pending.stage === "offer_sent"
                      ? `e.g. "We're excited to have you on board — expect an email from HR by Friday."`
                      : `e.g. "Your proof was strong — we'd encourage you to apply again in the future."`
                  }
                  rows={2}
                  className="w-full text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/30 transition-shadow"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleSend}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-brand-primary)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  <Send size={14} />
                  Send Email
                </button>
                <button
                  onClick={handleSkip}
                  className="px-5 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold text-sm hover:bg-[var(--color-surface-hover)] transition-colors whitespace-nowrap"
                >
                  Move without email
                </button>
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
