import { useState, useRef, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";
import { X, Camera, Loader2, Plus, Briefcase, Code, Link as LinkIcon, Linkedin, Github, Globe, Languages } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabaseClient";
import { updateProfileData } from "@/lib/api/profiles";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentAvatarUrl: string | null;
  currentSkills?: string[];
  currentLanguages?: string[];
  currentWorkStatus?: string;
  currentBio?: string;
  currentLinkedin?: string;
  currentGithub?: string;
  currentWebsite?: string;
  currentVideoIntro?: string;
  onUpdate: () => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  currentName,
  currentAvatarUrl,
  currentSkills = [],
  currentLanguages = [],
  currentWorkStatus = "open",
  currentBio = "",
  currentLinkedin = "",
  currentGithub = "",
  currentWebsite = "",
  currentVideoIntro = "",
  onUpdate,
}: EditProfileModalProps) {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState(currentName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl);
  const [skills, setSkills] = useState<string[]>(currentSkills);
  const [languages, setLanguages] = useState<string[]>(currentLanguages);
  const [workStatus, setWorkStatus] = useState(currentWorkStatus);
  const [bio, setBio] = useState(currentBio);
  const [linkedin, setLinkedin] = useState(currentLinkedin);
  const [github, setGithub] = useState(currentGithub);
  const [website, setWebsite] = useState(currentWebsite);
  const [videoIntro, setVideoIntro] = useState(currentVideoIntro);
  
  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(currentName);
    setAvatarUrl(currentAvatarUrl);
    setSkills(currentSkills || []);
    setLanguages(currentLanguages || []);
    setWorkStatus(currentWorkStatus || "open");
    setBio(currentBio || "");
    setLinkedin(currentLinkedin || "");
    setWebsite(currentWebsite || "");
    setVideoIntro(currentVideoIntro || "");
  }, [currentName, currentAvatarUrl, currentSkills, currentLanguages, currentWorkStatus, currentBio, currentLinkedin, currentGithub, currentWebsite, currentVideoIntro, isOpen]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        if (uploadError.message.includes("not found")) {
          toast.error("Avatar storage not configured.");
          return;
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success("Image uploaded. Click Save to apply.");

    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      toast.error("Skill already added");
      return;
    }
    setSkills([...skills, trimmed]);
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddLanguage = () => {
    const trimmed = newLanguage.trim();
    if (!trimmed) return;
    if (languages.includes(trimmed)) {
      toast.error("Language already added");
      return;
    }
    setLanguages([...languages, trimmed]);
    setNewLanguage("");
  };

  const handleRemoveLanguage = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfileData(user.id, {
        full_name: name,
        avatar_url: avatarUrl,
        skills: skills,
        languages: languages,
        work_status: workStatus,
        linkedin_url: linkedin,
        github_url: github,
        website_url: website,
        video_intro_url: videoIntro,
      });
      
      await refreshProfile?.(); 
      onUpdate(); 
      toast.success("Profile updated successfully");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-[var(--color-surface)] p-6 text-left align-middle shadow-xl transition-all border border-[var(--color-border)]">
                <div className="flex justify-between items-center mb-6">
                  <DialogTitle
                    as="h3"
                    className="text-xl font-bold leading-6 text-[var(--color-text)]"
                  >
                    Edit Profile
                  </DialogTitle>
                  <button
                    onClick={onClose}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                  
                  {/* Identity Section */}
                  <div className="flex flex-col items-center gap-4 py-4 border-b border-[var(--color-border)]">
                    <div className="relative group">
                      <div
                        className="w-24 h-24 rounded-full bg-[var(--color-brand-primary)] flex items-center justify-center text-3xl font-bold text-white overflow-hidden cursor-pointer"
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
                        {uploading ? <Loader2 className="animate-spin text-white" /> : <Camera className="text-white" />}
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
                    {avatarUrl && (
                        <button 
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                            onClick={handleRemoveAvatar}
                        >
                            Remove Photo
                        </button>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2 flex justify-between">
                      Bio / Introduction
                      <span className={`text-xs ${bio.length > 280 ? 'text-red-500' : 'text-[var(--color-text-muted)]'}`}>
                        {bio.length}/300
                      </span>
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={300}
                      placeholder="Briefly introduce yourself (max 300 chars)..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  </div>

                  {/* Work Status */}
                  <div>
                     <label className="block text-sm font-medium text-[var(--color-text)] mb-2 flex items-center gap-2">
                        <Briefcase size={16} className="text-[var(--color-text-muted)]" />
                        Work Status
                     </label>
                     <select
                        value={workStatus}
                        onChange={(e) => setWorkStatus(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                     >
                        <option value="open">Open to Work (Active)</option>
                        <option value="partial">Casually Looking (Passive)</option>
                        <option value="closed">Not Open to Work</option>
                     </select>
                  </div>

                  {/* Social & Media Links */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-[var(--color-text)] flex items-center gap-2">
                        <LinkIcon size={16} className="text-[var(--color-text-muted)]" />
                        Links & Media
                    </label>
                    
                    <div className="flex items-center gap-2">
                        <div className="w-8 flex justify-center text-[var(--color-text-muted)]"><Globe size={18} /></div>
                        <input
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="Personal Website / Portfolio URL"
                            className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 flex justify-center text-red-500"><Camera size={18} /></div>
                        <input
                            type="url"
                            value={videoIntro}
                            onChange={(e) => setVideoIntro(e.target.value)}
                            placeholder="Video Intro URL (YouTube, Loom, etc.)"
                            className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 flex justify-center text-[var(--color-text-muted)]"><Linkedin size={18} /></div>
                        <input
                            type="url"
                            value={linkedin}
                            onChange={(e) => setLinkedin(e.target.value)}
                            placeholder="LinkedIn URL"
                            className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 flex justify-center text-[var(--color-text-muted)]"><Github size={18} /></div>
                        <input
                            type="url"
                            value={github}
                            onChange={(e) => setGithub(e.target.value)}
                            placeholder="GitHub URL"
                            className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2 flex items-center gap-2">
                        <Code size={16} className="text-[var(--color-text-muted)]" />
                        Skills
                    </label>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                            placeholder="Add a skill (e.g. React)"
                            className="flex-1 px-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                        <Button size="sm" onClick={handleAddSkill} disabled={!newSkill.trim()}>
                            <Plus size={16} />
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                            <span
                                key={skill}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm border border-blue-100 dark:border-blue-800"
                            >
                                {skill}
                                <button
                                    onClick={() => handleRemoveSkill(skill)}
                                    className="hover:text-red-500 transition-colors ml-1"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                        {skills.length === 0 && (
                            <p className="text-sm text-[var(--color-text-muted)] italic">No skills added yet.</p>
                        )}
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2 flex items-center gap-2">
                        <Languages size={16} className="text-[var(--color-text-muted)]" />
                        Languages
                    </label>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={newLanguage}
                            onChange={(e) => setNewLanguage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddLanguage()}
                            placeholder="Add a language (e.g. Thai, English)"
                            className="flex-1 px-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                        />
                        <Button size="sm" onClick={handleAddLanguage} disabled={!newLanguage.trim()}>
                            <Plus size={16} />
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {languages.map((lang) => (
                            <span
                                key={lang}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm border border-emerald-100 dark:border-emerald-800"
                            >
                                {lang}
                                <button
                                    onClick={() => handleRemoveLanguage(lang)}
                                    className="hover:text-red-500 transition-colors ml-1"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                        {languages.length === 0 && (
                            <p className="text-sm text-[var(--color-text-muted)] italic">No languages added yet.</p>
                        )}
                    </div>
                  </div>

                </div>

                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-[var(--color-border)]">
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    isLoading={saving}
                    disabled={uploading}
                  >
                    Save Changes
                  </Button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
