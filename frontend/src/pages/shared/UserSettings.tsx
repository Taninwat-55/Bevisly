import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import BackButton from "@/components/ui/BackButton";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { updateProfileName } from "@/lib/api/profiles"; // ✅ Import

export default function UserSettings() {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [emailNotif, setEmailNotif] = useState(true);
  const [deleting, setDeleting] = useState(false);
  
  // ✅ Name state
  const [fullName, setFullName] = useState(""); 
  const [loadingName, setLoadingName] = useState(false);

  const handleSave = async () => {
    if(fullName.trim()) {
        setLoadingName(true);
        try {
            await updateProfileName(fullName);
            toast.success("✅ Name & Settings saved!");
        } catch {
            toast.error("Failed to update name");
        } finally {
            setLoadingName(false);
        }
    } else {
        toast.success("✅ Preferences saved!");
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("👋 Logged out successfully");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ Are you sure? This will permanently delete your account. This cannot be undone.")) return;
    try {
      setDeleting(true);
      const { error } = await supabase.rpc("delete_user_account");
      if (error) throw error;
      await signOut();
      window.location.href = "/";
    } catch {
      toast.error("Failed to delete account.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] px-6 md:px-10 py-12 transition-colors">
      <header className="mb-8 flex flex-col gap-2">
        <BackButton to={`/${user?.role}`} label="Back" className="mb-2 border-transparent hover:border-[var(--color-border)]" />
        <h1 className="heading-lg flex items-center gap-2">⚙️ Account Settings</h1>
        <p className="body-base text-[var(--color-text-muted)]">Manage your profile, preferences, and account.</p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] border border-[var(--color-border)] p-6 space-y-8 max-w-2xl"
      >
        <section>
          <h2 className="heading-md mb-4">Profile</h2>
          <div className="space-y-4 text-sm">
            <div>
                <label className="block font-medium text-[var(--color-text)] mb-1">Display Name</label>
                <input 
                    type="text" 
                    placeholder="Enter your full name" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-[var(--color-border)] rounded-[var(--radius-button)] px-3 py-2 bg-[var(--color-bg)] focus:ring-2 focus:ring-[var(--color-candidate)]"
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-1">This name will appear to employers.</p>
            </div>
            <p><span className="font-medium text-[var(--color-text)]">Email:</span> <span className="text-[var(--color-text-muted)]">{user?.email ?? "—"}</span></p>
            <p><span className="font-medium text-[var(--color-text)]">Role:</span> <span className="capitalize text-[var(--color-text-muted)]">{user?.role ?? "—"}</span></p>
          </div>
        </section>

        <section>
          <h2 className="heading-md mb-4">Preferences</h2>
           <div className="flex flex-col gap-3 text-sm">
            <label className="flex items-center justify-between cursor-pointer border border-[var(--color-border)] rounded-[var(--radius-button)] px-4 py-2 hover:bg-[var(--color-bg-hover)] transition">
              <span>Email notifications</span>
              <input type="checkbox" checked={emailNotif} onChange={() => setEmailNotif((prev) => !prev)} className="accent-[var(--color-candidate-dark)] cursor-pointer" />
            </label>

            <div className="flex items-center justify-between border border-[var(--color-border)] rounded-[var(--radius-button)] px-4 py-2 transition hover:bg-[var(--color-bg-hover)]">
              <span className="text-sm">Dark mode</span>
              <button onClick={toggleTheme} className="rounded-lg p-2 hover-bg-soft transition">
                 {isDark ? "🌙" : "☀️"} 
              </button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="heading-md mb-4">Account</h2>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleSave} disabled={loadingName} className="bg-[var(--color-candidate)] text-white px-5 py-2 rounded-[var(--radius-button)] hover:bg-[var(--color-candidate-dark)] transition shadow-[var(--shadow-soft)]">
              {loadingName ? "Saving..." : "💾 Save Changes"}
            </button>
            <button onClick={handleLogout} className="border border-[var(--color-border)] px-5 py-2 rounded-[var(--radius-button)] text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition">
              🚪 Log Out
            </button>
            <button onClick={handleDeleteAccount} disabled={deleting} className="bg-red-100 text-red-700 border border-red-200 px-5 py-2 rounded-[var(--radius-button)] hover:bg-red-200 transition ml-auto">
              {deleting ? "Deleting..." : "⚠️ Delete Account"}
            </button>
          </div>
        </section>
      </motion.div>
    </div>
  );
}