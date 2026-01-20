import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { notify } from "@/components/ui/Notify";
import BackButton from "@/components/ui/BackButton";

export default function RequestResetPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return notify.error("Please enter your email.");

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://bevisly.com/auth/reset',
      });
      if (error) throw error;
      notify.success("📧 Reset link sent! Check your inbox.");
      navigate("/auth");
    } catch (err) {
      console.error(err);
      notify.error("Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] relative">
      <div className="absolute left-4 top-4">
        <BackButton
          to="/auth"
          label="Back to Login"
          className="border-transparent hover:border-[var(--color-border)]"
        />
      </div>

      <div className="bg-[var(--color-surface)] transition-colors p-8 rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-4 text-[var(--color-candidate-dark)]">
          Forgot Password
        </h1>

        <form onSubmit={handleSendLink} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[var(--color-border)] rounded-[var(--radius-button)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-candidate-light)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-candidate-dark)] text-white py-2 rounded-[var(--radius-button)] hover:bg-[var(--color-candidate)] transition disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}