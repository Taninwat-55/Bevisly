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
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  UserCircle, Building2, Bell, Shield,
  Moon, Sun, LogOut, Trash2, Camera,
  Mail, Upload, Loader2, FileJson,
  Eye, EyeOff, CreditCard, ChevronRight,
  Sparkles, Lock, Receipt, ImagePlus, X
} from "lucide-react";
import { Button } from "@/components/ui/Button";

type Tab = "profile" | "account" | "billing" | "notifications" | "security" | "privacy";

const tabConfig: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: UserCircle },
  { id: "account", label: "Account", icon: Building2 },
  { id: "billing", label: "Billing", icon: Receipt },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "privacy", label: "Privacy & Data", icon: FileJson },
];

function SettingsCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[var(--color-surface,var(--color-bg))] border border-[var(--color-border)] rounded-2xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function SettingsRow({
  icon,
  iconBg,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <div className="flex items-center gap-4 min-w-0">
        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text)] leading-tight">{title}</p>
          {description && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-snug">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="px-5 pt-5 pb-4 border-b border-[var(--color-border)]">
      <h3 className="text-sm font-bold text-[var(--color-text)] tracking-tight">{title}</h3>
      {description && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{description}</p>}
    </div>
  );
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-[var(--color-text-muted)] mt-1.5">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-muted)]/60 focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent outline-none transition-all";

const textareaCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-muted)]/60 focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent outline-none transition-all resize-y";

export default function UserSettings() {
  const { user, signOut, refreshProfile } = useAuth();
  const { company: currentCompanyRecord, refresh: refreshCompany } = useCompany();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const validTabs: Tab[] = ["profile", "account", "billing", "notifications", "security", "privacy"];
  const tabParam = searchParams.get("tab") as Tab | null;

  const isEmployer = user?.role === "employer";
  const hasPassword = user?.app_metadata?.providers?.includes("email");
  const defaultTabSet = useRef(false);

  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam && validTabs.includes(tabParam) ? tabParam : "account"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Profile state
  const [name, setName] = useState(user?.full_name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [company, setCompany] = useState(user?.company_name || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Company profile state (employer-only)
  const [companyDescription, setCompanyDescription] = useState("");
  const [companyMission, setCompanyMission] = useState("");
  const [companyCulture, setCompanyCulture] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyTeamPhotos, setCompanyTeamPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const teamPhotoInputRef = useRef<HTMLInputElement>(null);

  // Prefs state
  const [emailNotif, setEmailNotif] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Set default tab to "profile" for employers once, on first load
  useEffect(() => {
    if (!defaultTabSet.current && isEmployer && !tabParam) {
      defaultTabSet.current = true;
      setActiveTab("profile");
    }
  }, [isEmployer, tabParam]);

  useEffect(() => {
    if (user) {
      setName(user.full_name || "");
      setUsername(user.username || "");
      setCompany(user.company_name || "");
      setAvatarUrl(user.avatar_url || null);
    }
  }, [user]);

  useEffect(() => {
    if (currentCompanyRecord) {
      setCompanyDescription(currentCompanyRecord.description || "");
      setCompanyMission(currentCompanyRecord.mission || "");
      setCompanyCulture(currentCompanyRecord.culture || "");
      setCompanyWebsite(currentCompanyRecord.website_url || "");
      setCompanyTeamPhotos(currentCompanyRecord.team_photos ?? []);
    }
  }, [currentCompanyRecord]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be less than 2MB"); return; }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) {
        if (uploadError.message.includes("not found")) { toast.error("Avatar storage not configured."); return; }
        throw uploadError;
      }
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      await updateProfileData(user.id, { avatar_url: publicUrl });
      setAvatarUrl(publicUrl);
      await refreshProfile?.();
      if (user.role === "employer" && currentCompanyRecord?.id) {
        await supabase.from("companies").update({ logo_url: publicUrl }).eq("id", currentCompanyRecord.id);
        await refreshCompany?.();
      }
      toast.success("Photo updated!");
    } catch {
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
      await refreshProfile?.();
      if (user.role === "employer" && currentCompanyRecord?.id) {
        await supabase.from("companies").update({ logo_url: null }).eq("id", currentCompanyRecord.id);
        await refreshCompany?.();
      }
      toast.success("Photo removed");
    } catch {
      toast.error("Failed to remove photo");
    }
  };

  const handleTeamPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be less than 5MB"); return; }
    if (companyTeamPhotos.length >= 3) { toast.error("Maximum 3 images allowed"); return; }

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("company-photos").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("company-photos").getPublicUrl(filePath);
      const updated = [...companyTeamPhotos, publicUrl];
      setCompanyTeamPhotos(updated);
      const { getCurrentCompanyId } = await import("@/lib/api/companies");
      const companyId = currentCompanyRecord?.id || (await getCurrentCompanyId());
      if (companyId) {
        await updateCompanyProfile(companyId, { team_photos: updated });
        await refreshCompany();
      }
      toast.success("Photo added!");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      if (teamPhotoInputRef.current) teamPhotoInputRef.current.value = "";
    }
  };

  const handleRemoveTeamPhoto = async (url: string) => {
    const updated = companyTeamPhotos.filter(p => p !== url);
    setCompanyTeamPhotos(updated);
    try {
      const { getCurrentCompanyId } = await import("@/lib/api/companies");
      const companyId = currentCompanyRecord?.id || (await getCurrentCompanyId());
      if (companyId) {
        await updateCompanyProfile(companyId, { team_photos: updated });
        await refreshCompany();
      }
      toast.success("Photo removed");
    } catch {
      toast.error("Failed to remove photo");
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const updates: Record<string, string | null> = { full_name: name };
      if (isEmployer) {
        updates.company_name = company;
      } else {
        updates.username = username || null;
      }
      await updateProfileData(user!.id, updates);

      if (isEmployer && company) {
        const { updateCompanyName, getCurrentCompanyId } = await import("@/lib/api/companies");
        const companyId = currentCompanyRecord?.id || (await getCurrentCompanyId());
        if (companyId) {
          await updateCompanyName(companyId, company);
          await updateCompanyProfile(companyId, {
            description: companyDescription || null,
            mission: companyMission || null,
            culture: companyCulture || null,
            website_url: companyWebsite || null,
          });
          await refreshCompany();
        }
      }
      await refreshProfile?.();
      toast.success("Saved!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    const form = e.target as HTMLFormElement;
    const currentPassword = (form.elements.namedItem("current_password") as HTMLInputElement).value;
    const newPassword = (form.elements.namedItem("new_password") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirm_password") as HTMLInputElement).value;
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setIsLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
      if (signInError) throw new Error("Incorrect current password");
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      toast.success("Password updated!");
      form.reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    const form = e.target as HTMLFormElement;
    const newEmail = (form.elements.namedItem("new_email") as HTMLInputElement).value;
    let currentPassword = "";
    if (hasPassword) currentPassword = (form.elements.namedItem("current_password_email") as HTMLInputElement).value;
    if (newEmail === user.email) { toast.error("New email must differ from current"); return; }
    setIsLoading(true);
    try {
      if (hasPassword) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
        if (signInError) throw new Error("Incorrect current password");
      }
      const { error: updateError } = await supabase.auth.updateUser({ email: newEmail });
      if (updateError) throw updateError;
      toast.success("Confirmation sent to both emails!");
      form.reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadData = async () => {
    if (!user) return;
    toast.promise(
      (async () => {
        const role = user.role === "demo_admin" ? "admin" : (user.role || "candidate");
        const blob = await downloadUserData(user.id, role);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bevis-data-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })(),
      { loading: "Preparing export...", success: "Download started!", error: "Failed to export data" }
    );
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Delete your account permanently? This cannot be undone.")) return;
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

  // Avatar shared component
  const AvatarSection = () => (
    <div className="flex items-center gap-5 p-5">
      <div className="relative group shrink-0">
        <div
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-brand-primary)] to-purple-600 flex items-center justify-center text-2xl font-bold text-white overflow-hidden cursor-pointer shadow-lg"
          onClick={() => fileInputRef.current?.click()}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span>{(name[0] || user?.email?.[0] || "?").toUpperCase()}</span>
          )}
        </div>
        <div
          className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? <Loader2 className="text-white animate-spin" size={20} /> : <Camera className="text-white" size={20} />}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
      </div>
      <div>
        <p className="font-semibold text-[var(--color-text)] text-sm">
          {isEmployer ? (company || name || "Company") : (name || "Your Name")}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mb-3">{user?.email}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            {uploading ? "Uploading..." : "Change photo"}
          </button>
          {avatarUrl && (
            <button
              onClick={handleRemoveAvatar}
              className="text-xs font-medium px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-[var(--color-text-muted)]/60 mt-1.5">JPG, PNG or GIF · Max 2MB</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">Settings</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Manage your {isEmployer ? "company profile and" : ""} account preferences.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar */}
          <nav className="lg:w-52 shrink-0">
            <ul className="space-y-0.5">
              {tabConfig.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <li key={id}>
                    <button
                      onClick={() => setActiveTab(id)}
                      className={[
                        "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-[var(--color-brand-primary)] text-white shadow-md shadow-blue-500/20"
                          : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]",
                      ].join(" ")}
                    >
                      <Icon size={16} className="shrink-0" />
                      <span>{id === "profile" && isEmployer ? "Company" : label}</span>
                      {isActive && <ChevronRight size={14} className="ml-auto opacity-70" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">

              {/* ── PROFILE TAB ── */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  <SettingsCard>
                    <SectionHeader
                      title={isEmployer ? "Company Identity" : "Public Profile"}
                      description={isEmployer ? "This information appears on your job listings and brand page." : "How you appear to employers on Bevis."}
                    />
                    <AvatarSection />
                  </SettingsCard>

                  <SettingsCard>
                    <SectionHeader title={isEmployer ? "Contact & Company Details" : "Display Name"} />
                    <div className="p-5 space-y-4">
                      <FormField label={isEmployer ? "Contact Person Name" : "Display Name"}>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          className={inputCls}
                        />
                      </FormField>

                      {!isEmployer && (
                        <FormField label="Username" hint="Share your profile at bevisly.com/@yourname">
                          <div className="flex items-stretch">
                            <span className="flex items-center px-3.5 bg-[var(--color-surface-hover)] border border-r-0 border-[var(--color-border)] rounded-l-xl text-sm text-[var(--color-text-muted)] font-medium">
                              @
                            </span>
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                              placeholder="username"
                              className={`${inputCls} rounded-l-none`}
                            />
                          </div>
                        </FormField>
                      )}

                      {isEmployer && (
                        <FormField label="Company Name">
                          <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="Your company name"
                            className={inputCls}
                          />
                        </FormField>
                      )}

                      {isEmployer && (
                        <>
                          <FormField label="About the Company" hint="Tell candidates what makes your company unique.">
                            <textarea
                              value={companyDescription}
                              onChange={(e) => setCompanyDescription(e.target.value)}
                              placeholder="We're building..."
                              rows={4}
                              className={textareaCls}
                            />
                          </FormField>
                          <FormField label="Mission Statement">
                            <textarea
                              value={companyMission}
                              onChange={(e) => setCompanyMission(e.target.value)}
                              placeholder="What drives your company..."
                              rows={2}
                              className={textareaCls}
                            />
                          </FormField>
                          <FormField label="Culture & Values">
                            <textarea
                              value={companyCulture}
                              onChange={(e) => setCompanyCulture(e.target.value)}
                              placeholder="Describe your team culture..."
                              rows={3}
                              className={textareaCls}
                            />
                          </FormField>
                          <FormField label="Company Website">
                            <input
                              type="url"
                              value={companyWebsite}
                              onChange={(e) => setCompanyWebsite(e.target.value)}
                              placeholder="https://yourcompany.com"
                              className={inputCls}
                            />
                          </FormField>
                          <FormField label="Images" hint="Up to 3 photos · JPG, PNG · Max 5MB each — shown on your company brand page.">
                            <div className="flex flex-wrap gap-3 mt-1">
                              {companyTeamPhotos.map((url) => (
                                <div key={url} className="relative w-24 h-24 rounded-xl overflow-hidden border border-[var(--color-border)] group shrink-0">
                                  <img src={url} className="w-full h-full object-cover" alt="Team photo" />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTeamPhoto(url)}
                                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X size={10} className="text-white" />
                                  </button>
                                </div>
                              ))}
                              {companyTeamPhotos.length < 3 && (
                                <button
                                  type="button"
                                  onClick={() => teamPhotoInputRef.current?.click()}
                                  disabled={uploadingPhoto}
                                  className="w-24 h-24 rounded-xl border-2 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center gap-1 hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-muted)] shrink-0 disabled:opacity-50"
                                >
                                  {uploadingPhoto ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                                  <span className="text-[10px]">Add photo</span>
                                </button>
                              )}
                            </div>
                            <input ref={teamPhotoInputRef} type="file" accept="image/*" className="hidden" onChange={handleTeamPhotoUpload} disabled={uploadingPhoto} />
                          </FormField>
                        </>
                      )}

                      <div className="pt-2">
                        <Button onClick={handleSaveProfile} isLoading={isLoading} size="sm">
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </SettingsCard>
                </motion.div>
              )}

              {/* ── ACCOUNT TAB ── */}
              {activeTab === "account" && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  {/* Account overview */}
                  <SettingsCard>
                    <SectionHeader title="Account Overview" />
                    <div className="divide-y divide-[var(--color-border)]">
                      <SettingsRow
                        icon={<Mail size={16} />}
                        iconBg="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        title="Email Address"
                        description={user?.email}
                        action={
                          <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                            Verified
                          </span>
                        }
                      />
                      <SettingsRow
                        icon={isDark ? <Moon size={16} /> : <Sun size={16} />}
                        iconBg="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        title="Appearance"
                        description={isDark ? "Dark mode" : "Light mode"}
                        action={
                          <Button size="sm" variant="outline" onClick={toggleTheme}>
                            Toggle
                          </Button>
                        }
                      />
                      <SettingsRow
                        icon={<Sparkles size={16} />}
                        iconBg="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                        title="Subscription Tier"
                        description={
                          isEmployer
                            ? ((user?.subscription_tier === "growth" || user?.original_role === "admin" || user?.original_role === "demo_admin") ? "Growth Plan — maximum reach"
                              : user?.subscription_tier === "starter" ? "Starter Plan — essential hiring tools"
                              : "Free Plan — upgrade to unlock more tools")
                            : ((user?.subscription_tier === "plus" || user?.original_role === "admin" || user?.original_role === "demo_admin") ? "Plus Plan — premium candidate features"
                              : "Free Plan — upgrade to stand out")
                        }
                        action={
                          ((isEmployer && user?.subscription_tier !== "growth" && user?.original_role !== "admin" && user?.original_role !== "demo_admin") || (!isEmployer && user?.subscription_tier !== "plus" && user?.original_role !== "admin" && user?.original_role !== "demo_admin")) && (
                            <Button size="sm" variant="outline" onClick={() => navigate("/pricing")}>
                              Upgrade
                            </Button>
                          )
                        }
                      />
                      {!isEmployer && (
                        <SettingsRow
                          icon={<CreditCard size={16} />}
                          iconBg="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                          title="Available Credits"
                          description={`${user?.credits ?? 0} credits remaining`}
                          action={
                            <Button size="sm" variant="outline" onClick={() => navigate("/candidate")}>
                              Get More
                            </Button>
                          }
                        />
                      )}
                    </div>
                  </SettingsCard>

                  {/* Change email */}
                  <SettingsCard>
                    <SectionHeader title="Change Email Address" description="A confirmation link will be sent to both your current and new email." />
                    <form onSubmit={handleUpdateEmail} className="p-5 space-y-4">
                      <FormField label="New Email Address">
                        <input name="new_email" type="email" placeholder="new@example.com" required className={inputCls} />
                      </FormField>
                      {hasPassword && (
                        <FormField label="Confirm with Current Password">
                          <input name="current_password_email" type="password" placeholder="••••••••" required className={inputCls} />
                        </FormField>
                      )}
                      <div className="flex justify-end">
                        <Button type="submit" size="sm" isLoading={isLoading}>
                          Update Email
                        </Button>
                      </div>
                    </form>
                  </SettingsCard>

                  {/* Danger zone */}
                  <SettingsCard className="border-red-200 dark:border-red-900/40">
                    <div className="px-5 pt-5 pb-4 border-b border-red-100 dark:border-red-900/30">
                      <h3 className="text-sm font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">These actions are permanent and cannot be undone.</p>
                    </div>
                    <div className="p-5 flex flex-col sm:flex-row gap-3">
                      <Button variant="outline" onClick={handleLogout} leftIcon={<LogOut size={15} />} size="sm">
                        Sign Out
                      </Button>
                      <Button
                        variant="danger"
                        onClick={handleDeleteAccount}
                        isLoading={deleting}
                        leftIcon={<Trash2 size={15} />}
                        size="sm"
                      >
                        Delete Account
                      </Button>
                    </div>
                  </SettingsCard>
                </motion.div>
              )}

              {/* ── BILLING TAB ── */}
              {activeTab === "billing" && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  {isEmployer ? (
                    <>
                      <SettingsCard>
                        <SectionHeader title="Subscription Details" description="Manage your current plan and limits." />
                        <div className="p-5 space-y-5">
                          <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl">
                            <div>
                              <p className="text-sm font-bold text-amber-800 dark:text-amber-400 capitalize">
                                {(user?.original_role === "admin" || user?.original_role === "demo_admin") ? "Growth Plan" : (user?.subscription_tier && user.subscription_tier !== "free" ? `${user.subscription_tier} Plan` : "Free Plan")}
                              </p>
                              <p className="text-xs text-amber-700/80 dark:text-amber-500/80 mt-1">
                                {(user?.subscription_tier === "growth" || user?.original_role === "admin" || user?.original_role === "demo_admin")
                                  ? "You have maximum access to premium features." 
                                  : "Upgrade to unlock more job posts and higher visibility."}
                              </p>
                            </div>
                            <div className="shrink-0">
                              <Sparkles className="text-amber-500 opacity-20" size={40} />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)]">
                              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Active Jobs</p>
                              <p className="text-xl font-bold text-[var(--color-text)]">0 <span className="text-sm font-medium text-[var(--color-text-muted)]">/ {user?.subscription_tier === "pro_saas" ? "Unlimited" : "1"}</span></p>
                            </div>
                            <div className="p-4 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)]">
                              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Monthly Posts</p>
                              <p className="text-xl font-bold text-[var(--color-text)]">0 <span className="text-sm font-medium text-[var(--color-text-muted)]">/ {user?.subscription_tier === "pro_saas" ? "Unlimited" : "1"}</span></p>
                            </div>
                          </div>
                          
                          <div className="pt-2 flex justify-end">
                            <Button
                              onClick={() => toast.success("Stripe integration coming soon!")}
                            >
                              Manage Subscription
                            </Button>
                          </div>
                        </div>
                      </SettingsCard>
                      
                      <SettingsCard>
                        <SectionHeader title="Billing History" description="View past invoices and receipts." />
                        <div className="p-10 text-center text-sm text-[var(--color-text-muted)]">
                          No billing history available yet.
                        </div>
                      </SettingsCard>
                    </>
                  ) : (
                    <>
                      <SettingsCard>
                        <SectionHeader title="Subscription Details" description="Manage your current plan and features." />
                        <div className="p-5 space-y-5">
                          <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/30 rounded-xl">
                            <div>
                              <p className="text-sm font-bold text-purple-800 dark:text-purple-400 capitalize">
                                {(user?.subscription_tier === "plus" || user?.original_role === "admin" || user?.original_role === "demo_admin") ? "Plus Plan" : "Free Plan"}
                              </p>
                              <p className="text-xs text-purple-700/80 dark:text-purple-500/80 mt-1">
                                {(user?.subscription_tier === "plus" || user?.original_role === "admin" || user?.original_role === "demo_admin")
                                  ? "You have unlocked premium profile features."
                                  : "Upgrade to plus to stand out to employers."}
                              </p>
                            </div>
                            <div className="shrink-0">
                              <Sparkles className="text-purple-500 opacity-20" size={40} />
                            </div>
                          </div>
                          <div className="pt-2 flex justify-end">
                            <Button
                              onClick={() => toast.success("Stripe integration coming soon!")}
                            >
                              Manage Subscription
                            </Button>
                          </div>
                        </div>
                      </SettingsCard>
                      <SettingsCard>
                        <SectionHeader title="Credits & Billing" description="Manage your Bevisly Credits balance." />
                        <div className="p-5 space-y-5">
                          <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl">
                            <div>
                              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Current Balance</p>
                              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-500 mt-1">
                                {user?.credits || 0} <span className="text-base font-bold opacity-70">CR</span>
                              </p>
                            </div>
                            <div className="shrink-0">
                              <CreditCard className="text-emerald-500 opacity-20" size={40} />
                            </div>
                          </div>
                          
                          <div className="pt-2 flex justify-end">
                            <Button
                              onClick={() => toast.success("Stripe integration coming soon!")}
                            >
                              Purchase Credits
                            </Button>
                          </div>
                        </div>
                      </SettingsCard>
                      
                      <SettingsCard>
                        <SectionHeader title="Transaction History" description="View past credit purchases and usage." />
                        <div className="p-10 text-center text-sm text-[var(--color-text-muted)]">
                          No transaction history available yet.
                        </div>
                      </SettingsCard>
                    </>
                  )}
                </motion.div>
              )}

              {/* ── NOTIFICATIONS TAB ── */}
              {activeTab === "notifications" && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <SettingsCard>
                    <SectionHeader title="Email Notifications" description="Choose which emails you receive from Bevis." />
                    <div className="divide-y divide-[var(--color-border)]">
                      {[
                        {
                          key: "emailNotif" as const,
                          icon: <Bell size={16} />,
                          iconBg: emailNotif
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400",
                          title: "Platform Updates",
                          description: isEmployer
                            ? "New applications, submission reviews, and platform news."
                            : "Status changes on your applications and new opportunities.",
                          checked: emailNotif,
                          onChange: () => setEmailNotif((v) => !v),
                          color: "bg-emerald-500",
                        },
                        {
                          key: "marketingEmails" as const,
                          icon: <Mail size={16} />,
                          iconBg: marketingEmails
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400",
                          title: "Tips & Marketing",
                          description: isEmployer
                            ? "Recruitment tips, feature highlights, and product news."
                            : "Profile tips, job search advice, and Bevis news.",
                          checked: marketingEmails,
                          onChange: () => setMarketingEmails((v) => !v),
                          color: "bg-purple-500",
                        },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center justify-between gap-4 p-5 cursor-pointer hover:bg-[var(--color-surface-hover)]/50 transition-colors"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${item.iconBg}`}>
                              {item.icon}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[var(--color-text)]">{item.title}</p>
                              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.description}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={item.onChange}
                            className={[
                              "relative shrink-0 inline-flex h-6 w-11 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]",
                              item.checked ? item.color : "bg-slate-200 dark:bg-slate-700",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                                item.checked ? "translate-x-5" : "translate-x-0",
                              ].join(" ")}
                            />
                          </button>
                        </label>
                      ))}
                    </div>
                  </SettingsCard>
                </motion.div>
              )}

              {/* ── SECURITY TAB ── */}
              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  <SettingsCard>
                    <SectionHeader title="Password" description={hasPassword ? "Update your login password." : "You're signed in with a social account."} />
                    <div className="p-5">
                      {hasPassword ? (
                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                          <FormField label="Current Password">
                            <input name="current_password" type="password" placeholder="••••••••" required className={inputCls} />
                          </FormField>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField label="New Password">
                              <input name="new_password" type="password" placeholder="••••••••" required minLength={6} className={inputCls} />
                            </FormField>
                            <FormField label="Confirm Password">
                              <input name="confirm_password" type="password" placeholder="••••••••" required minLength={6} className={inputCls} />
                            </FormField>
                          </div>
                          <div className="flex justify-end pt-1">
                            <Button type="submit" size="sm" isLoading={isLoading}>
                              Update Password
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
                          <Lock size={16} className="shrink-0 text-blue-500" />
                          Signed in via Google or GitHub — no password needed.
                        </div>
                      )}
                    </div>
                  </SettingsCard>

                  <SettingsCard>
                    <SectionHeader title="Two-Factor Authentication" description="Add an extra layer of security to your account." />
                    <div className="p-5">
                      <MFASettings />
                    </div>
                  </SettingsCard>
                </motion.div>
              )}

              {/* ── PRIVACY TAB ── */}
              {activeTab === "privacy" && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  {!isEmployer && (
                    <SettingsCard>
                      <SectionHeader title="Profile Visibility" description="Control who can discover and view your profile." />
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex items-start gap-4">
                            <div
                              className={[
                                "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                user?.is_public
                                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-400",
                              ].join(" ")}
                            >
                              {user?.is_public ? <Eye size={16} /> : <EyeOff size={16} />}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[var(--color-text)]">
                                {user?.is_public ? "Public profile" : "Private profile"}
                              </p>
                              <p className="text-xs text-[var(--color-text-muted)] mt-0.5 max-w-sm">
                                {user?.is_public
                                  ? "Employers can discover you in searches and invite you to apply."
                                  : "You won't appear in employer searches. You can still apply to jobs directly."}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              if (!user) return;
                              const newVal = !user.is_public;
                              try {
                                await updateProfileData(user.id, { is_public: newVal });
                                await refreshProfile?.();
                                toast.success(newVal ? "Profile is now public" : "Profile is now private");
                              } catch {
                                toast.error("Failed to update visibility");
                              }
                            }}
                            className={[
                              "relative shrink-0 inline-flex h-6 w-11 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                              user?.is_public ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                                user?.is_public ? "translate-x-5" : "translate-x-0",
                              ].join(" ")}
                            />
                          </button>
                        </div>
                      </div>
                    </SettingsCard>
                  )}

                  <SettingsCard>
                    <SectionHeader title="Your Data" description="Download everything Bevis stores about you." />
                    <div className="p-5">
                      <p className="text-sm text-[var(--color-text-muted)] mb-5 max-w-lg">
                        In line with GDPR and data portability rights, you can request a full export of your personal data — including your profile, applications, submissions, and account history.
                      </p>
                      <Button onClick={handleDownloadData} variant="outline" leftIcon={<FileJson size={15} />} size="sm">
                        Export Data (JSON)
                      </Button>
                    </div>
                  </SettingsCard>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
