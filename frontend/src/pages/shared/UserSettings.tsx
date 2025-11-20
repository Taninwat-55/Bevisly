import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import BackButton from "@/components/ui/BackButton";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient"; // ✅ Import supabase

export default function UserSettings() {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [emailNotif, setEmailNotif] = useState(true);
  const [deleting, setDeleting] = useState(false); // ✅ Add state

  const handleSave = () => {
    toast.success("✅ Settings saved!");
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("👋 Logged out successfully");
  };

  // ✅ Add Delete Logic
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "⚠️ Are you sure? This will permanently delete your account, proofs, and submissions. This cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      const { error } = await supabase.rpc("delete_user_account");
      if (error) throw error;

      await signOut();
      toast.success("Account deleted.");
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete account.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] px-6 md:px-10 py-12 transition-colors">
      <header className="mb-8 flex flex-col gap-2">
        <BackButton
          to={`/${user?.role}`}
          label="Back"
          className="mb-2 border-transparent hover:border-[var(--color-border)]"
        />
        <h1 className="heading-lg flex items-center gap-2">
          ⚙️ Account Settings
        </h1>
        <p className="body-base text-[var(--color-text-muted)]">
          Manage your profile, preferences, and account.
        </p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] border border-[var(--color-border)] p-6 space-y-8 max-w-2xl"
      >
        {/* ... (Profile and Preferences sections stay the same) ... */}
        <section>
          <h2 className="heading-md mb-4">Profile</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium text-[var(--color-text)]">Email:</span> <span className="text-[var(--color-text-muted)]">{user?.email ?? "—"}</span></p>
            <p><span className="font-medium text-[var(--color-text)]">Role:</span> <span className="capitalize text-[var(--color-text-muted)]">{user?.role ?? "—"}</span></p>
          </div>
        </section>

        <section>
          <h2 className="heading-md mb-4">Preferences</h2>
           {/* ... (Keep your existing preferences JSX here) ... */}
           <div className="flex flex-col gap-3 text-sm">
            <label className="flex items-center justify-between cursor-pointer border border-[var(--color-border)] rounded-[var(--radius-button)] px-4 py-2 hover:bg-[var(--color-bg-hover)] transition">
              <span>Email notifications</span>
              <input
                type="checkbox"
                checked={emailNotif}
                onChange={() => setEmailNotif((prev) => !prev)}
                className="accent-[var(--color-candidate-dark)] cursor-pointer"
              />
            </label>

            <div className="flex items-center justify-between border border-[var(--color-border)] rounded-[var(--radius-button)] px-4 py-2 transition hover:bg-[var(--color-bg-hover)]">
              <span className="text-sm">Dark mode</span>
              <button onClick={toggleTheme} className="rounded-lg p-2 hover-bg-soft transition">
                 {/* ... (Keep your existing SVG icons) ... */}
                 {isDark ? "🌙" : "☀️"} 
              </button>
            </div>
          </div>
        </section>

        {/* ⚙️ Account Actions */}
        <section>
          <h2 className="heading-md mb-4">Account</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              className="bg-[var(--color-candidate)] text-white px-5 py-2 rounded-[var(--radius-button)] hover:bg-[var(--color-candidate-dark)] transition shadow-[var(--shadow-soft)]"
            >
              💾 Save Changes
            </button>
            <button
              onClick={handleLogout}
              className="border border-[var(--color-border)] px-5 py-2 rounded-[var(--radius-button)] text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition"
            >
              🚪 Log Out
            </button>
            
            {/* ✅ Added Delete Button */}
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-red-100 text-red-700 border border-red-200 px-5 py-2 rounded-[var(--radius-button)] hover:bg-red-200 transition ml-auto"
            >
              {deleting ? "Deleting..." : "⚠️ Delete Account"}
            </button>
          </div>
        </section>
      </motion.div>
    </div>
  );
}