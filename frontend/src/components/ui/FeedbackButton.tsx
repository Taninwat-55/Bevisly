// src/components/ui/FeedbackButton.tsx
import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { notify } from "@/components/ui/Notify";

export default function FeedbackButton() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // 🧩 Show tooltip automatically on first visit
  useEffect(() => {
    const hasSeen = localStorage.getItem("seen_feedback_tooltip");
    if (!hasSeen) {
      setTooltipVisible(true);
      localStorage.setItem("seen_feedback_tooltip", "true");
      const timer = setTimeout(() => setTooltipVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

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
      {/* Floating button + tooltip */}
      <div className="fixed bottom-5 right-5 z-40 group">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-[var(--color-candidate)] text-white px-4 py-3 rounded-full shadow-lg hover:brightness-110 transition"
          title="Share your feedback"
        >
          <MessageCircle size={18} />
          <span className="hidden sm:inline font-medium">Feedback</span>
        </button>

        {/* Tooltip — shows automatically first time OR on hover */}
        {(tooltipVisible || <div></div>) && (
          <div
            className={`absolute bottom-16 right-0 bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-md px-3 py-2 text-xs transition-opacity duration-300 ${
              tooltipVisible
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            } pointer-events-none w-[200px]`}
          >
            💡 Have an idea or found a bug? We’d love your feedback!
          </div>
        )}
      </div>

      {/* Modal */}
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
