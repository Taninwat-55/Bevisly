import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { notify } from "@/components/ui/Notify";

export default function FeedbackButton() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false); 
  const [expanded, setExpanded] = useState(false); 
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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
      notify.success("Thanks for your feedback! 💬");
      setMessage("");
      setCategory("general");
      setEmail("");
      setOpen(false);
    }
  };

  return (
    <>
      {/* 🧭 Floating Edge Tab */}
      <div
        className={`fixed bottom-[4%] right-[-1.5rem] z-40 group transition-all duration-300 ease-out`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <button
          onClick={() => setOpen(true)}
          title="Share your feedback"
          className={`flex items-center gap-2 bg-[var(--color-candidate)] text-white shadow-lg 
                     hover:brightness-110 focus:ring-2 focus:ring-[var(--color-candidate-dark)]
                     rounded-l-full transition-all duration-300 origin-right
                     ${expanded ? "pl-5 pr-4 py-3" : "pl-3 pr-2 py-3"} `}
          style={{
            transform: expanded ? "translateX(0)" : "translateX(40%)",
          }}
        >
          <MessageCircle size={18} className="shrink-0" />
          <span
            className={`font-medium text-sm whitespace-nowrap transition-opacity duration-300 ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
          >
            Feedback
          </span>
        </button>
      </div>

      {/* 🪟 Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-card)] shadow-xl w-[90%] max-w-md border border-[var(--color-border)] relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              <X size={18} />
            </button>

            <h3 className="font-semibold mb-3 text-[var(--color-text)]">
              💬 Share your feedback
            </h3>

            {!user && (
              <>
                <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                  Your Email (optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full mb-3 border border-[var(--color-border)] rounded-[var(--radius-button)] px-3 py-2 text-sm bg-[var(--color-bg)]"
                />
              </>
            )}

            <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mb-3 border border-[var(--color-border)] rounded-[var(--radius-button)] px-3 py-2 text-sm bg-[var(--color-bg)]"
            >
              <option value="bug">🐞 Bug Report</option>
              <option value="suggestion">💡 Suggestion</option>
              <option value="question">❓ Question</option>
              <option value="general">💬 General Feedback</option>
            </select>

            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you think..."
              className="w-full border border-[var(--color-border)] rounded-[var(--radius-button)] px-3 py-2 text-sm mb-4"
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[var(--color-candidate)] text-white px-4 py-2 rounded-[var(--radius-button)] hover:brightness-110 transition w-full disabled:opacity-50"
            >
              {loading ? "Sending..." : "Submit Feedback"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
