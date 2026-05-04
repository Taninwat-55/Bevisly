import { useState } from "react";
import { MessageSquare, X, Send, Bug, Lightbulb, HelpCircle, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { notify } from "@/components/common/Notify";
import { motion, AnimatePresence } from "framer-motion";

export default function FeedbackButton() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false); 
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔒 Safeguard: Only show feedback button to authenticated users
  if (!user) return null;

  const categories = [
    { id: "general", label: "General", icon: <MessageCircle size={14} />, color: "text-blue-500" },
    { id: "bug", label: "Bug Report", icon: <Bug size={14} />, color: "text-red-500" },
    { id: "suggestion", label: "Suggestion", icon: <Lightbulb size={14} />, color: "text-amber-500" },
    { id: "question", label: "Question", icon: <HelpCircle size={14} />, color: "text-teal-500" },
  ];

  const handleSubmit = async () => {
    if (!message.trim()) return notify.error("Please enter a message.");
    setLoading(true);

    const { error } = await supabase.from("feedback_messages").insert([
      {
        user_id: user?.id || null,
        email: user ? user.email : email || null,
        category,
        message,
        page: window.location.pathname,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      notify.error("Failed to send feedback");
    } else {
      notify.success("Thanks for your feedback");
      setMessage("");
      setCategory("general");
      setEmail("");
      setOpen(false);
    }
  };

  return (
    <>
      {/* 🧭 Floating Glass Tab */}
      <motion.div
        initial={{ x: "85%" }}
        whileHover={{ x: "0%" }}
        className="fixed bottom-[15%] right-0 z-[60] cursor-pointer"
      >
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 pl-4 pr-6 py-3.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-2xl rounded-l-2xl group transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <MessageSquare size={18} />
          </div>
          <span className="font-bold text-sm text-[var(--color-text)] whitespace-nowrap">
            Feedback
          </span>
        </button>
      </motion.div>

      {/* 🪟 Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-md overflow-hidden relative border border-white/10 dark:border-white/5 shadow-2xl backdrop-blur-2xl bg-white/90 dark:bg-slate-900/90 rounded-[2rem] p-8 flex flex-col gap-6"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-6 right-6 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all"
              >
                <X size={20} />
              </button>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-display text-[var(--color-text)] tracking-tight">
                  Share feedback
                </h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Help us build the future of verified skills.
                </p>
              </div>

              <div className="space-y-5">
                {!user && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-100 dark:bg-white/5 border border-transparent focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-900 rounded-2xl px-4 py-3 text-sm transition-all outline-none"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                          category === cat.id
                            ? "bg-blue-500/10 border-blue-500/30 text-blue-500 shadow-sm"
                            : "bg-slate-100 dark:bg-white/5 border-transparent text-[var(--color-text-muted)] hover:border-slate-300 dark:hover:border-white/10"
                        }`}
                      >
                        <span className={category === cat.id ? "text-blue-500" : cat.color}>
                          {cat.icon}
                        </span>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                    Your Message
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What can we improve?"
                    className="w-full bg-slate-100 dark:bg-white/5 border border-transparent focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-900 rounded-2xl px-4 py-3 text-sm transition-all outline-none resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
