import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Copy,
  Check,
  Loader2,
  Mail,
  Building2,
  User,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import {
  createInvitation,
  sendInviteEmail,
  listInvitations,
  listWaitlist,
  updateWaitlistStatus,
  type Invitation,
  type WaitlistEntry,
} from "@/lib/api/invitations";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminInviteModal({ isOpen, onClose }: InviteModalProps) {
  const [tab, setTab] = useState<"create" | "history" | "waitlist">("create");

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [createdInvite, setCreatedInvite] = useState<Invitation | null>(null);
  const [copied, setCopied] = useState(false);

  // History state
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Waitlist state
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loadingWaitlist, setLoadingWaitlist] = useState(false);

  useEffect(() => {
    if (isOpen && tab === "history") {
      loadHistory();
    } else if (isOpen && tab === "waitlist") {
      loadWaitlist();
    }
  }, [isOpen, tab]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await listInvitations();
      setInvitations(data);
    } catch {
      toast.error("Failed to load invitation history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadWaitlist = async () => {
    setLoadingWaitlist(true);
    try {
      const data = await listWaitlist();
      setWaitlist(data);
    } catch {
      toast.error("Failed to load waitlist");
    } finally {
      setLoadingWaitlist(false);
    }
  };

  const handleApproveWaitlist = async (entry: WaitlistEntry) => {
    if (!confirm(`Generate invite and send email to ${entry.contact_name} at ${entry.company_name}?`)) return;

    try {
      toast.loading("Generating invite and sending email...", { id: "approve" });
      
      const invite = await createInvitation({
        company_name: entry.company_name,
        contact_name: entry.contact_name,
        contact_email: entry.email,
      });

      await sendInviteEmail(invite);
      await updateWaitlistStatus(entry.id, "invited");
      
      toast.success(`Invite sent to ${entry.email}!`, { id: "approve" });
      loadWaitlist(); // Refresh waitlist
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to approve request", { id: "approve" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim() || !contactEmail.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSending(true);
    try {
      // 1. Create the invitation record
      const invite = await createInvitation({
        company_name: companyName.trim(),
        contact_name: contactName.trim(),
        contact_email: contactEmail.trim(),
        message: message.trim() || undefined,
      });

      // 2. Send the email
      await sendInviteEmail(invite);

      setCreatedInvite(invite);
      toast.success(`Invite sent to ${contactEmail}!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send invite. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyLink = (code: string) => {
    const url = `${window.location.origin}/auth?tab=signup&role=employer&invite=${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied!");
  };

  const resetForm = () => {
    setCompanyName("");
    setContactName("");
    setContactEmail("");
    setMessage("");
    setCreatedInvite(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] mx-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 flex items-center justify-center">
                <Mail size={20} className="text-[var(--color-brand-primary)]" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display text-[var(--color-text)]">
                  Employer Invitations
                </h2>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Invite companies to join Bevisly
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tab Switch */}
          <div className="flex gap-1 px-6 pt-4">
            <button
              onClick={() => setTab("create")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === "create"
                  ? "bg-[var(--color-brand-primary)] text-white"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              Send Invite
            </button>
            <button
              onClick={() => setTab("history")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === "history"
                  ? "bg-[var(--color-brand-primary)] text-white"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              History
              {invitations.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                  {invitations.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab("waitlist")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
                tab === "waitlist"
                  ? "bg-[var(--color-brand-primary)] text-white"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              Waitlist
              {waitlist.filter(w => w.status === 'pending').length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {waitlist.filter(w => w.status === 'pending').length}
                </span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {tab === "create" && !createdInvite && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Company Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)] mb-2">
                    <Building2 size={14} className="text-[var(--color-brand-primary)]" />
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Inc."
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] transition-all"
                    required
                  />
                </div>

                {/* Contact Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)] mb-2">
                    <User size={14} className="text-[var(--color-brand-primary)]" />
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Sarah Johnson"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] transition-all"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)] mb-2">
                    <Mail size={14} className="text-[var(--color-brand-primary)]" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. sarah@acme.com"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] transition-all"
                    required
                  />
                </div>

                {/* Personal Message (optional) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)] mb-2">
                    <MessageSquare size={14} className="text-[var(--color-brand-primary)]" />
                    Personal Message <span className="text-[var(--color-text-muted)] font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. Hey Sarah, I saw your post about hiring junior devs. I think Bevisly could be a great fit..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] transition-all resize-none"
                  />
                </div>

                {/* Preview */}
                <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
                    Email Preview
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    <strong className="text-[var(--color-text)]">Subject:</strong>{" "}
                    {contactName || "Contact"}, you're invited to Bevisly — hire junior talent with proof
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-2">
                    The email includes: invite code, signup link, personal message (if provided), and early access benefits.
                  </p>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSending || !companyName.trim() || !contactName.trim() || !contactEmail.trim()}
                >
                  {isSending ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Generating & Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      Generate Invite & Send Email
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Success State */}
            {tab === "create" && createdInvite && (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                  <Sparkles size={28} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
                  Invite Sent Successfully!
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-6">
                  An email has been sent to <strong>{createdInvite.contact_email}</strong> with their invite code.
                </p>

                {/* Invite Code Display */}
                <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-6 mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
                    Invite Code
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <code className="text-2xl font-bold font-mono text-[var(--color-brand-primary)] tracking-widest">
                      {createdInvite.code}
                    </code>
                    <button
                      onClick={() => handleCopyCode(createdInvite.code)}
                      className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-muted)]"
                      title="Copy code"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                {/* Copy Link */}
                <Button
                  variant="outline"
                  onClick={() => handleCopyLink(createdInvite.code)}
                  className="mb-4"
                >
                  {copied ? <Check size={14} className="mr-2" /> : <ExternalLink size={14} className="mr-2" />}
                  {copied ? "Link Copied!" : "Copy Signup Link"}
                </Button>

                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={resetForm}>
                    Send Another Invite
                  </Button>
                  <Button onClick={onClose}>
                    Done
                  </Button>
                </div>
              </div>
            )}

            {/* History Tab */}
            {tab === "history" && (
              <div>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-12 text-[var(--color-text-muted)]">
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Loading...
                  </div>
                ) : invitations.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail size={32} className="mx-auto text-[var(--color-text-muted)] opacity-40 mb-3" />
                    <p className="text-sm text-[var(--color-text-muted)]">
                      No invitations sent yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invitations.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-start gap-4 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-border-strong)] transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-subtle)] flex items-center justify-center text-[var(--color-brand-primary)] font-bold text-sm shrink-0">
                          {inv.company_name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm text-[var(--color-text)] truncate">
                              {inv.company_name}
                            </h4>
                            {inv.is_used ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                USED
                              </span>
                            ) : inv.sent_at ? (
                              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                                SENT
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                                PENDING
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {inv.contact_name} · {inv.contact_email}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <code className="text-[10px] font-mono text-[var(--color-text-muted)] bg-[var(--color-surface)] px-2 py-0.5 rounded">
                              {inv.code}
                            </code>
                            <button
                              onClick={() => handleCopyLink(inv.code)}
                              className="text-[10px] text-[var(--color-brand-primary)] hover:underline flex items-center gap-1"
                            >
                              <Copy size={10} /> Copy Link
                            </button>
                            <span className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
                              <Clock size={10} />
                              {new Date(inv.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Waitlist Tab */}
            {tab === "waitlist" && (
              <div>
                {loadingWaitlist ? (
                  <div className="flex items-center justify-center py-12 text-[var(--color-text-muted)]">
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Loading...
                  </div>
                ) : waitlist.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 size={32} className="mx-auto text-[var(--color-text-muted)] opacity-40 mb-3" />
                    <p className="text-sm text-[var(--color-text-muted)]">
                      No waitlist requests right now.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {waitlist.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-border-strong)] transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-hover)] flex items-center justify-center text-[var(--color-text-muted)] font-bold text-sm shrink-0">
                            {entry.company_name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm text-[var(--color-text)] truncate">
                                {entry.company_name}
                              </h4>
                              {entry.status === 'invited' ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                  INVITED
                                </span>
                              ) : entry.status === 'rejected' ? (
                                <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold">
                                  REJECTED
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                                  PENDING
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[var(--color-text-muted)] truncate">
                              {entry.contact_name} · {entry.email} {entry.website && `· ${entry.website}`}
                            </p>
                            <span className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)] mt-1.5">
                              <Clock size={10} />
                              {new Date(entry.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {entry.status === 'pending' && (
                           <div className="shrink-0">
                             <Button size="sm" onClick={() => handleApproveWaitlist(entry)}>
                               Approve & Invite
                             </Button>
                           </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
