import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useCompany } from "@/hooks/useCompany";
import { motion, AnimatePresence } from "framer-motion";
import MFASettings from "@/components/auth/MFASettings";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { updateProfileData, downloadUserData } from "@/lib/api/profiles";
import { updateCompanyProfile } from "@/lib/api/companies";
import { useNavigate } from "react-router-dom";
import {
  User, Building2, Bell, Shield,
  Moon, Sun, LogOut, Trash2, Camera,
  Mail, Upload, Loader2,
  FileJson, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/Button";

type Tab = "profile" | "account" | "notifications" | "security" | "privacy";

export default function UserSettings() {
  const { user, signOut, refreshProfile } = useAuth();
  const { company: currentCompanyRecord, refresh: refreshCompany } = useCompany();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Default tab depends on role. Candidates don't have "profile" tab here anymore.
  // We can default to "account" for everyone or check role.
  // Since user might be null initially, we start with "account" which is safe for all.
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [isLoading, setIsLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Profile State
  // Initialize from context to prevent empty fields
  const [name, setName] = useState(user?.full_name || "");
  const [company, setCompany] = useState(user?.company_name || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Company Profile State (employer-only)
  const [companyDescription, setCompanyDescription] = useState("");
  const [companyMission, setCompanyMission] = useState("");
  const [companyCulture, setCompanyCulture] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");

  // Prefs State
  const [emailNotif, setEmailNotif] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const isEmployer = user?.role === "employer";
  const hasPassword = user?.app_metadata?.providers?.includes('email');

  // If employer, we might want to default to profile, but account is fine too.
  // Or we can use an effect to switch if we really want "profile" first for employers.
  useEffect(() => {
    if (isEmployer && activeTab === 'account') {
       // Optional: Force profile tab for employer? 
       // Let's leave it as 'account' default to be consistent.
       // Actually, previous default was 'profile'. Let's switch it for employers.
       setActiveTab("profile"); 
    }
  }, [isEmployer, activeTab]);

  // Sync state with user context updates (e.g. after refreshProfile)
  useEffect(() => {
    if (user) {
      setName(user.full_name || "");
      setCompany(user.company_name || "");
      setAvatarUrl(user.avatar_url || null);
    }
  }, [user]);

  // Sync company profile fields from company context
  useEffect(() => {
    if (currentCompanyRecord) {
      setCompanyDescription(currentCompanyRecord.description || "");
      setCompanyMission(currentCompanyRecord.mission || "");
      setCompanyCulture(currentCompanyRecord.culture || "");
      setCompanyWebsite(currentCompanyRecord.website_url || "");
    }
  }, [currentCompanyRecord]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        // If bucket doesn't exist, show helpful message
        if (uploadError.message.includes("not found")) {
          toast.error("Avatar storage not configured. Please create an 'avatars' bucket in Supabase.");
          return;
        }
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      await updateProfileData(user.id, { avatar_url: publicUrl });
      setAvatarUrl(publicUrl);
      await refreshProfile?.(); // Refresh context for immediate UI update
      toast.success("Profile photo updated!");
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    try {
      await updateProfileData(user.id, { avatar_url: null });
      setAvatarUrl(null);
      await refreshProfile?.(); // Refresh context for immediate UI update
      toast.success("Profile photo removed");
    } catch {
      toast.error("Failed to remove photo");
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const updates: Record<string, string | null> = { full_name: name };
      if (isEmployer) updates.company_name = company;

      await updateProfileData(user!.id, updates);

      // Also sync company name to the real companies table
      if (isEmployer && company) {
        const { updateCompanyName, getCurrentCompanyId } = await import("@/lib/api/companies");
        const companyId = currentCompanyRecord?.id || await getCurrentCompanyId();
        if (companyId) {
          await updateCompanyName(companyId, company);
          // Save company profile fields
          await updateCompanyProfile(companyId, {
            description: companyDescription || null,
            mission: companyMission || null,
            culture: companyCulture || null,
            website_url: companyWebsite || null,
          });
          await refreshCompany(); // Update global context immediately
        }
      }

      await refreshProfile?.(); // Refresh context for immediate UI update
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user?.email) return;

      const form = e.target as HTMLFormElement;
      const currentPassword = (form.elements.namedItem('current_password') as HTMLInputElement).value;
      const newPassword = (form.elements.namedItem('new_password') as HTMLInputElement).value;
      const confirmPassword = (form.elements.namedItem('confirm_password') as HTMLInputElement).value;

      if(newPassword !== confirmPassword) {
          toast.error("New passwords do not match");
          return;
      }
      
      setIsLoading(true);
      try {
          // 1. Re-authenticate to verify current password
          const { error: signInError } = await supabase.auth.signInWithPassword({
              email: user.email,
              password: currentPassword
          });

          if (signInError) {
              throw new Error("Incorrect current password");
          }

          // 2. Update password if verified
          const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
          if(updateError) throw updateError;
          
          toast.success("Password updated successfully");
          form.reset();
      } catch (err: unknown) {
          console.error(err);
          const message = err instanceof Error ? err.message : "Failed to update password";
          toast.error(message);
      } finally {
          setIsLoading(false);
      }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    const form = e.target as HTMLFormElement;
    const newEmail = (form.elements.namedItem('new_email') as HTMLInputElement).value;
    
    // Only get current password if user has one
    let currentPassword = "";
    if (hasPassword) {
        currentPassword = (form.elements.namedItem('current_password_email') as HTMLInputElement).value;
    }

    if (newEmail === user.email) {
      toast.error("New email must be different from current email");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Re-authenticate ONLY if user has a password
      if (hasPassword) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword
        });

        if (signInError) {
            throw new Error("Incorrect current password");
        }
      }

      // 2. Update email
      const { error: updateError } = await supabase.auth.updateUser({ email: newEmail });
      if (updateError) throw updateError;

      toast.success("Confirmation link sent to both emails!");
      form.reset();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to update email";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadData = async () => {
      if(!user) return;
      
      toast.promise(
          (async () => {
               // Default to "candidate" if role is null (shouldn't happen for logged in users) check
               const role = user.role === "demo_admin" ? "admin" : (user.role || "candidate");
               const blob = await downloadUserData(user.id, role);
               const url = window.URL.createObjectURL(blob);
               const a = document.createElement('a');
               a.href = url;
               a.download = `bevis-data-export-${new Date().toISOString().split('T')[0]}.json`;
               document.body.appendChild(a);
               a.click();
               window.URL.revokeObjectURL(url);
               document.body.removeChild(a);
          })(),
          {
              loading: 'Preparing data export...',
              success: 'Download started!',
              error: 'Failed to export data'
          }
      );
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      const { error } = await supabase.rpc("delete_user_account");
      if (error) throw error;
      await signOut();
      window.location.href = "/";
    } catch {
      toast.error("Failed to delete account");
      setDeleting(false);
    }
  };

  const TabButton = ({ id, label, icon: Icon }: { id: Tab, label: string, icon: React.ElementType }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === id
        ? "bg-[var(--color-brand-primary)] text-white shadow-lg shadow-blue-500/20"
        : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
        }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-6 md:px-10 py-12 font-sans transition-colors">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold font-display text-[var(--color-text)] mb-2">Settings</h1>
          <p className="text-[var(--color-text-muted)]">Manage your account preferences and profile.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar Navigation */}
          <nav className="space-y-2">
            {isEmployer && <TabButton id="profile" label="Company Profile" icon={User} />}
            <TabButton id="account" label="Account" icon={Building2} />
            <TabButton id="notifications" label="Notifications" icon={Bell} />
            <TabButton id="security" label="Security" icon={Shield} />
            <TabButton id="privacy" label="Privacy & Data" icon={FileJson} />
          </nav>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="glass-panel min-h-[500px] border border-[var(--color-border)] rounded-2xl p-8 relative overflow-hidden">
              <AnimatePresence mode="wait">

                {/* ── PROFILE TAB ──────────────────────────────── */}
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-2xl"
                  >

                    <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">
                      {isEmployer ? "Company Profile" : "Public Profile"}
                    </h2>

                    {/* Avatar Upload */}
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative group">
                        <div
                          className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl overflow-hidden cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            name[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()
                          )}
                        </div>
                        <div
                          className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {uploading ? (
                            <Loader2 className="text-white animate-spin" size={24} />
                          ) : (
                            <Camera className="text-white" size={24} />
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={uploading}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-[var(--color-text)]">
                          {isEmployer
                            ? (company || name || "Company Name")
                            : (name || "Your Name")}
                        </h3>
                        <p className="text-sm text-[var(--color-text-muted)] mb-3 font-medium">
                          {user?.email}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            leftIcon={uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                          >
                            {uploading ? "Uploading..." : "Change"}
                          </Button>
                          {avatarUrl && (
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={handleRemoveAvatar}>
                              Remove
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] mt-2 opacity-70">Recommended 400x400px, max 2MB</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                          {isEmployer ? "Contact Person Name" : "Display Name"}
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>

                      {isEmployer && (
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Company Name</label>
                          <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          />
                        </div>
                      )}

                      {isEmployer && (
                        <>
                          <div className="pt-4 border-t border-[var(--color-border)]">
                            <h3 className="text-sm font-bold text-[var(--color-text)] mb-1">Company Profile</h3>
                            <p className="text-xs text-[var(--color-text-muted)] mb-4">These details appear on all your job posts automatically.</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">About the Company</label>
                            <textarea
                              value={companyDescription}
                              onChange={(e) => setCompanyDescription(e.target.value)}
                              placeholder="Tell candidates what your company does, what makes it unique..."
                              rows={4}
                              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-y"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Mission Statement</label>
                            <textarea
                              value={companyMission}
                              onChange={(e) => setCompanyMission(e.target.value)}
                              placeholder="What is your company's mission or purpose?"
                              rows={2}
                              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-y"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Culture & Values</label>
                            <textarea
                              value={companyCulture}
                              onChange={(e) => setCompanyCulture(e.target.value)}
                              placeholder="Describe your team culture, work environment, and core values..."
                              rows={3}
                              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-y"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Company Website</label>
                            <input
                              type="url"
                              value={companyWebsite}
                              onChange={(e) => setCompanyWebsite(e.target.value)}
                              placeholder="https://yourcompany.com"
                              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                          </div>
                        </>
                      )}

                      <div className="pt-6">
                        <Button onClick={handleSaveProfile} isLoading={isLoading}>
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── ACCOUNT TAB ──────────────────────────────── */}
                {activeTab === "account" && (
                  <motion.div
                    key="account"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-2xl"
                  >
                    <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">Account Preferences</h2>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {isDark ? <Moon size={20} /> : <Sun size={20} />}
                          </div>
                          <div>
                            <h3 className="font-medium text-[var(--color-text)]">Appearance</h3>
                            <p className="text-sm text-[var(--color-text-muted)]">
                              Current: {isDark ? "Dark Mode" : "Light Mode"}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={toggleTheme}>
                          Toggle Theme
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                            <Mail size={20} />
                          </div>
                          <div>
                            <h3 className="font-medium text-[var(--color-text)]">Email Address</h3>
                            <p className="text-sm text-[var(--color-text-muted)]">{user?.email}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 uppercase tracking-wide">
                          Verified
                        </span>
                      </div>

                      {/* Employer Subscription Info */}
                      {isEmployer && (
                        <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                               <Shield size={20} />
                            </div>
                            <div>
                              <h3 className="font-medium text-[var(--color-text)]">Subscription Plan</h3>
                              <p className="text-sm text-[var(--color-text-muted)]">
                                {user?.subscription_tier === 'pro_saas' ? 'Pro Plan' : 'Free Tier'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Change Email Form */}
                      <div className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600">
                             <Mail size={20} />
                          </div>
                          <div>
                            <h3 className="font-medium text-[var(--color-text)]">Change Email Address</h3>
                             <p className="text-sm text-[var(--color-text-muted)]">Update the email used to sign in.</p>
                          </div>
                        </div>

                        <form onSubmit={handleUpdateEmail} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--color-text)] uppercase tracking-wider mb-1">New Email Address</label>
                                <input name="new_email" type="email" placeholder="new@example.com" required className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]" />
                            </div>
                            {hasPassword && (
                                <div>
                                    <label className="block text-xs font-bold text-[var(--color-text)] uppercase tracking-wider mb-1">Confirm with Current Password</label>
                                    <input name="current_password_email" type="password" placeholder="••••••••" required className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]" />
                                </div>
                            )}
                            <div className="flex justify-end">
                                <Button type="submit" size="sm" isLoading={isLoading}>Update Email</Button>
                            </div>
                        </form>
                      </div>
                      
                      {/* Candidate Credits Info */}
                      {!isEmployer && (
                         <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                               <Building2 size={20} /> 
                            </div>
                            <div>
                              <h3 className="font-medium text-[var(--color-text)]">Available Credits</h3>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-lg">{user?.credits || 0}</span>
                                <Button size="sm" variant="outline" onClick={() => navigate('/candidate')}>Get More</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Danger Zone */}
                      <div className="mt-12 pt-8 border-t border-[var(--color-border)]">
                        <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                          <Trash2 size={18} /> Danger Zone
                        </h3>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button variant="outline" onClick={handleLogout} leftIcon={<LogOut size={16} />}>
                            Sign Out
                          </Button>
                          <Button
                            variant="danger"
                            onClick={handleDeleteAccount}
                            isLoading={deleting}
                            leftIcon={<Trash2 size={16} />}
                          >
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── NOTIFICATIONS TAB ────────────────────────── */}
                {activeTab === "notifications" && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-2xl"
                  >
                    <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">Notification Settings</h2>

                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg)]/50 transition cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${emailNotif ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                            <Bell size={20} />
                          </div>
                          <div>
                            <h3 className="font-medium text-[var(--color-text)]">Platform Updates</h3>
                            <p className="text-sm text-[var(--color-text-muted)]">Get notified about status changes and new features.</p>
                          </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${emailNotif ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${emailNotif ? 'translate-x-6' : ''}`} />
                        </div>
                        <input type="checkbox" className="hidden" checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
                      </label>

                      <label className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg)]/50 transition cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${marketingEmails ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                            <Mail size={20} />
                          </div>
                          <div>
                            <h3 className="font-medium text-[var(--color-text)]">Marketing & Tips</h3>
                            <p className="text-sm text-[var(--color-text-muted)]">Receive tips to improve your profile and task success.</p>
                          </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${marketingEmails ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${marketingEmails ? 'translate-x-6' : ''}`} />
                        </div>
                        <input type="checkbox" className="hidden" checked={marketingEmails} onChange={() => setMarketingEmails(!marketingEmails)} />
                      </label>
                    </div>
                  </motion.div>
                )}

                {/* ── SECURITY TAB ────────────────────────────── */}
                {activeTab === "security" && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-2xl"
                  >
                    <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">Login & Security</h2>

                    <div className="space-y-6">
                      {hasPassword ? (
                      <div className="p-6 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
                        <div className="flex items-center gap-3 mb-4">
                          <Shield className="text-orange-600 dark:text-orange-400" size={24} />
                          <h3 className="font-bold text-orange-900 dark:text-orange-100">Password</h3>
                        </div>
                          <form onSubmit={handlePasswordUpdate}>
                              <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-orange-800 dark:text-orange-200 uppercase tracking-wider mb-1">Current Password</label>
                                    <input name="current_password" type="password" placeholder="••••••••" required className="w-full bg-white dark:bg-black/20 border border-orange-200 dark:border-orange-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-orange-800 dark:text-orange-200 uppercase tracking-wider mb-1">New Password</label>
                                    <input name="new_password" type="password" placeholder="••••••••" required minLength={6} className="w-full bg-white dark:bg-black/20 border border-orange-200 dark:border-orange-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-orange-800 dark:text-orange-200 uppercase tracking-wider mb-1">Confirm Password</label>
                                    <input name="confirm_password" type="password" placeholder="••••••••" required minLength={6} className="w-full bg-white dark:bg-black/20 border border-orange-200 dark:border-orange-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500" />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button type="submit" size="sm" isLoading={isLoading} className="bg-orange-600 hover:bg-orange-700 text-white border-transparent">Update Password</Button>
                                </div>
                              </div>
                          </form>
                      </div>
                      ) : (
                        <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className="text-blue-600 dark:text-blue-400" size={24} />
                                <h3 className="font-bold text-blue-900 dark:text-blue-100">Social Login Active</h3>
                            </div>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                You are logged in via a social provider (Google/GitHub). You don't need a password.
                            </p>
                        </div>
                      )}

                      {/* Two-Factor Authentication Settings */}
                      <MFASettings />
                    </div>
                  </motion.div>
                )}

                {/* ── PRIVACY TAB ──────────────────────────────── */}
                {activeTab === "privacy" && (
                   <motion.div
                    key="privacy"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-2xl"
                  >
                     <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">Privacy & Data Control</h2>
                     
                     <div className="space-y-6">
                        {/* Profile Visibility (Candidates Only) */}
                        {!isEmployer && (
                            <div className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${user?.is_public ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                            {user?.is_public ? <Eye size={20} /> : <EyeOff size={20} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[var(--color-text)]">Profile Visibility</h3>
                                            <p className="text-sm text-[var(--color-text-muted)]">
                                                {user?.is_public ? 'Your profile is visible to employers' : 'Your profile is hidden'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                     {/* Simple Toggle - could use a switch component if available */}
                                     <Button 
                                        size="sm" 
                                        variant={user?.is_public ? "outline" : "primary"}
                                        onClick={async () => {
                                            if(!user) return;
                                            try {
                                                const newVal = !user.is_public;
                                                // Optimistic update via updateProfileData (which doesn't exist locally as state, so we call API)
                                                // We rely on user context refresh or local state if we had it. 
                                                // user object is immutable from context usually, so we trigger refresh
                                                await updateProfileData(user.id, { is_public: newVal });
                                                await refreshProfile?.();
                                                toast.success(newVal ? "Profile is now public" : "Profile is now hidden");
                                            } catch {
                                                toast.error("Failed to update visibility");
                                            }
                                        }}
                                     >
                                        {user?.is_public ? 'Make Private' : 'Make Public'}
                                     </Button>
                                </div>
                                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                                    When public, verified employers can discover your profile and invite you to apply for jobs. hiding your profile means you can only apply to jobs directly.
                                </p>
                            </div>
                        )}

                        {/* GDPR Data Export */}
                         <div className="w-full p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50">
                             <div className="flex items-center gap-3 mb-4">
                                <FileJson className="text-blue-500" size={24} />
                                <h3 className="font-bold text-[var(--color-text)]">Download Your Data</h3>
                             </div>
                             <p className="text-sm text-[var(--color-text-muted)] mb-6">
                                 In compliance with GDPR and data portability standards, you can download a copy of all your personal data stored on our platform, including your profile, job submissions, and account history.
                             </p>
                             <Button onClick={handleDownloadData} variant="outline" leftIcon={<FileJson size={16} />}>
                                 Download Data (JSON)
                             </Button>
                         </div>
                     </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}