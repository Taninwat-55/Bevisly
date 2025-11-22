import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { updateProfileData } from "@/lib/api/profiles"; 
import { User, Building2, Edit2, Check, X } from "lucide-react";

export default function UserSettings() {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  const [emailNotif, setEmailNotif] = useState(true);
  const [deleting, setDeleting] = useState(false);
  
  // Profile State
  const [name, setName] = useState(""); 
  const [isEditing, setIsEditing] = useState(false);
  const [loadingName, setLoadingName] = useState(false);

  const isEmployer = user?.role === "employer";
  const label = isEmployer ? "Company Name" : "Display Name";
  const field = isEmployer ? "company_name" : "full_name";

  // 📥 Fetch existing name
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, company_name").eq("id", user.id).single()
      .then(({ data }) => {
        if (data) {
          const targetName = isEmployer ? data.company_name : data.full_name;
          setName(targetName ?? ""); 
        }
      });
  }, [user, isEmployer]);

  const handleSaveName = async () => {
    if (!name.trim()) return toast.error("Name cannot be empty");
    setLoadingName(true);
    try {
      await updateProfileData(user!.id, { [field]: name });
      toast.success(`✅ ${label} updated!`);
      setIsEditing(false);
    } catch {
      toast.error("Failed to update name");
    } finally {
      setLoadingName(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("👋 Logged out successfully");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ This will permanently delete your account. Cannot be undone.")) return;
    setDeleting(true);
    try {
      const { error } = await supabase.rpc("delete_user_account");
      if (error) throw error;
      await signOut();
      window.location.href = "/";
    } catch {
      toast.error("Failed to delete account.");
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] px-6 md:px-10 py-12 transition-colors">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="heading-lg flex items-center gap-2">⚙️ Account Settings</h1>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl space-y-6"
      >
        {/* 👤 Profile Section */}
        <section className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] border border-[var(--color-border)] p-6">
          <h2 className="heading-md mb-6 flex items-center gap-2">
            {isEmployer ? <Building2 size={20} /> : <User size={20} />} 
            Profile
          </h2>
          
          <div className="space-y-6">
            {/* Name Field with Edit Mode */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-[var(--color-text-muted)]">{label}</label>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="text-xs text-[var(--color-employer)] hover:underline flex items-center gap-1">
                    <Edit2 size={12} /> Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input 
                    autoFocus
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 border border-[var(--color-border)] rounded-[var(--radius-button)] px-3 py-2 bg-[var(--color-bg)] focus:ring-2 focus:ring-[var(--color-candidate)] text-sm"
                  />
                  <button onClick={handleSaveName} disabled={loadingName} className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <p className="text-lg font-medium text-[var(--color-text)]">{name || "—"}</p>
              )}
            </div>

            <div className="pt-4 border-t border-[var(--color-border)]">
                <label className="text-sm font-medium text-[var(--color-text-muted)]">Email</label>
                <p className="text-[var(--color-text)] mt-1">{user?.email}</p>
            </div>
          </div>
        </section>

        {/* 🎛 Preferences Section (New Toggles) */}
        <section className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] border border-[var(--color-border)] p-6">
          <h2 className="heading-md mb-6">Preferences</h2>
          
          <div className="space-y-5">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--color-text)]">Dark Mode</p>
                <p className="text-xs text-[var(--color-text-muted)]">Switch between light and dark themes</p>
              </div>
              <ToggleSwitch checked={isDark} onChange={toggleTheme} />
            </div>

            <div className="border-t border-[var(--color-border)]" />

            {/* Email Notifications Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--color-text)]">Email Notifications</p>
                <p className="text-xs text-[var(--color-text-muted)]">Receive updates about your applications</p>
              </div>
              <ToggleSwitch checked={emailNotif} onChange={() => {
                  setEmailNotif(!emailNotif);
                  toast.success(emailNotif ? "Notifications disabled" : "Notifications enabled");
              }} />
            </div>
          </div>
        </section>

        {/* ⚠️ Danger Zone */}
        <section className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] border border-red-100 dark:border-red-900/30 p-6">
          <h2 className="heading-md mb-4 text-red-600">Danger Zone</h2>
          <div className="flex flex-wrap gap-4">
            <button onClick={handleLogout} className="border border-[var(--color-border)] px-5 py-2.5 rounded-[var(--radius-button)] text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition text-sm font-medium">
              Log Out
            </button>
            <button onClick={handleDeleteAccount} disabled={deleting} className="bg-red-50 text-red-600 border border-red-100 px-5 py-2.5 rounded-[var(--radius-button)] hover:bg-red-100 transition ml-auto text-sm font-medium">
              {deleting ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </section>
      </motion.div>
    </div>
  );
}

// 💅 Custom Toggle Component
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button 
      onClick={onChange}
      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-candidate)] ${
        checked ? 'bg-[var(--color-candidate)]' : 'bg-[var(--color-border)]'
      }`}
    >
      <div 
        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ease-in-out ${
          checked ? 'translate-x-6' : 'translate-x-0'
        }`} 
      />
    </button>
  );
}