import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useCandidateStats } from "@/hooks/useCandidateStats";
import ProofCardsGrid from "@/components/proofs/ProofCardsGrid";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import {
  Pencil,
  Copy,
  CheckCircle,
  UploadCloud,
  FileText,
  Mail,
  Calendar,
  Award,
  Download,
  ShieldCheck,
  Code,
  Linkedin,
  Github,
  Globe,
  Languages
} from "lucide-react";
import { uploadResume, getProfileResume } from "@/lib/api/profiles";
import EditProfileModal from "@/components/profile/EditProfileModal";

export default function CandidateProfile() {
  const { user } = useAuth();
  const { proofsCompleted, avgScore, credits, loading } = useCandidateStats();

  const [joined, setJoined] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [skills, setSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [workStatus, setWorkStatus] = useState<string>("open");
  const [bio, setBio] = useState<string>("");
  const [linkedin, setLinkedin] = useState<string>("");
  const [github, setGithub] = useState<string>("");
  const [website, setWebsite] = useState<string>("");

  const [username, setUsername] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resumeUpdatedAt, setResumeUpdatedAt] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const resumeInputRef = useRef<HTMLInputElement>(null);

  /* Fetch profile info */
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;

    const { data } = await supabase
      .from("profiles")
      .select("created_at, full_name, skills, languages, work_status, bio, linkedin_url, github_url, website_url, username")
      .eq("id", user.id)
      .single();

    if (data) {
      if (data.created_at)
        setJoined(new Date(data.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }));
      setFullName(data.full_name || "");
      setSkills(data.skills || []);
      setLanguages((data as Record<string, unknown>).languages as string[] || []);
      setWorkStatus(data.work_status || "open");
      setBio(data.bio || "");
      setLinkedin(data.linkedin_url || "");
      setGithub(data.github_url || "");
      setWebsite(data.website_url || "");
      setUsername((data as Record<string, unknown>).username as string | null ?? null);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /* Fetch resume */
  useEffect(() => {
    if (!user?.id) return;
    getProfileResume(user.id)
      .then((res) => {
        setResumeUrl(res?.resume_url || null);
        setResumeUpdatedAt(res?.resume_updated_at || null);
      })
      .catch(() => { });
  }, [user?.id]);
  
  const handleProfileUpdate = () => {
    fetchProfile(); 
  };

  // Listen to user object changes to update name immediately
  useEffect(() => {
    if (user?.full_name) setFullName(user.full_name);
  }, [user]);

  /* Handle CV upload */
  const handleUploadCV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".pdf") && !file.name.endsWith(".docx")) {
      toast.error("Only PDF or DOCX files are allowed.");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadResume(file);
      setResumeUrl(url);
      toast.success("✅ CV uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload CV");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleTriggerUpload = () => {
    resumeInputRef.current?.click();
  };

  /* Copy public link */
  const handleCopyLink = () => {
    const url = username
      ? `${window.location.origin}/@${username}`
      : `${window.location.origin}/candidate/${user?.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Profile link copied!");
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadCV = async () => {
    if (!resumeUrl) return;
    try {
      const response = await fetch(resumeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Resume.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(resumeUrl, '_blank');
    }
  };

  const getWorkStatusBadge = () => {
    switch (workStatus) {
      case 'open':
            return (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Open to Work
                </span>
            );
      case 'partial':
            return (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Partial Look for Work
                </span>
            );
      case 'closed':
            return (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    Not Open to Work
                </span>
            );
      default:
        return null;
    }
  };

  if (loading)
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-[var(--color-text-muted)]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-brand-primary)] border-t-transparent animate-spin mb-4" />
        <p>Loading profile...</p>
      </div>
    );

  return (
    <div className="space-y-8 pb-12">

      {/* ── Header / Hero Card ────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl group">
        {/* Banner Pattern */}
        <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md"
              onClick={handleCopyLink}
              leftIcon={copied ? <CheckCircle size={14} /> : <Copy size={14} />}
            >
              {copied ? "Copied" : "Share Profile"}
            </Button>
            <Button
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Pencil size={14} />}
            >
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="px-8 pb-8 pt-0 flex flex-col md:flex-row items-center md:items-start gap-6 -mt-12">
          {/* Avatar */}
          <div className="relative">
            <div className="w-28 h-28 rounded-2xl bg-white dark:bg-zinc-900 p-1 shadow-2xl overflow-hidden">
               {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-xl bg-white dark:bg-zinc-800" />
               ) : (
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-4xl font-bold text-[var(--color-text-muted)]">
                    {user?.email?.[0].toUpperCase()}
                  </div>
               )}
            </div>
            {workStatus === 'open' && (
                <div className="absolute bottom-2 -right-2 bg-green-500 w-5 h-5 rounded-full border-[3px] border-white dark:border-zinc-900" title="Online" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 mt-4 md:mt-14 text-center md:text-left">
             <div>
                <h1 className="text-3xl font-bold font-display text-[var(--color-text)] flex items-center justify-center md:justify-start gap-2">
                  {fullName || "Anonymous Candidate"}
                  {proofsCompleted > 0 && <ShieldCheck className="text-blue-500" size={24} />}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-[var(--color-text-muted)] mt-2 mb-3">
                  <span className="flex items-center gap-1.5"><Mail size={14} /> {user?.email}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> Joined {joined}</span>
                  {getWorkStatusBadge()}
                </div>

                {/* Social Links */}
                <div className="flex justify-center md:justify-start gap-2">
                    {linkedin && (
                        <a href={linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[#0077b5] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="LinkedIn">
                            <Linkedin size={18} />
                        </a>
                    )}
                    {github && (
                        <a href={github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="GitHub">
                            <Github size={18} />
                        </a>
                    )}
                    {website && (
                        <a href={website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors" title="Website">
                            <Globe size={18} />
                        </a>
                    )}
                </div>
             </div>

          </div>

          {/* Quick Stats */}
          <div className="flex gap-6 md:border-l md:border-[var(--color-border)] md:pl-8 mb-2 md:mt-14">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--color-text)]">{proofsCompleted}</div>
              <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium">Proofs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--color-text)]">{avgScore || "-"}</div>
              <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--color-text)]">{credits}</div>
              <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium">Credits</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bio Section ── */}
      {bio && (
        <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
             <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">About Me</h3>
             <p className="text-[var(--color-text)] leading-relaxed whitespace-pre-line">{bio}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left Column: Skills & Resume ────────────────────────────── */}
        <div className="space-y-8">
          {/* Skills Card */}
          <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
            <h2 className="heading-md mb-4 flex items-center gap-2 text-[var(--color-text)] font-semibold">
              <Code size={18} className="text-purple-400" /> Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.length > 0 ? (
                  skills.map((skill) => (
                    <div
                      key={skill}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium border flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                    >
                      {skill}
                    </div>
                  ))
              ) : (
                  <p className="text-sm text-[var(--color-text-muted)]">No skills added yet.</p>
              )}
            </div>

            {(languages.length > 0) && (
              <>
                <div className="mt-5 mb-3 flex items-center gap-2">
                  <Languages size={15} className="text-emerald-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Languages</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <div
                      key={lang}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium border flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                    >
                      {lang}
                    </div>
                  ))}
                </div>
              </>
            )}

            <Button variant="ghost" size="sm" className="w-full mt-4 text-[var(--color-text-muted)]" onClick={() => setIsEditModalOpen(true)}>
              + Add / Edit Skills & Languages
            </Button>
          </div>

          {/* Resume Card */}
          <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
            <h2 className="heading-md mb-4 flex items-center gap-2 text-[var(--color-text)] font-semibold">
              <FileText size={18} className="text-orange-400" /> Resume
            </h2>

            {resumeUrl ? (
              <div className="bg-[var(--color-bg)] p-4 rounded-xl border border-[var(--color-border)] mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--color-text)] truncate">Resume.pdf</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{resumeUpdatedAt ? new Date(resumeUpdatedAt).toLocaleDateString() : 'Just now'}</p>
                  </div>
                  <button onClick={handleDownloadCV} className="p-2 hover:bg-[var(--color-surface-hover)] rounded-full text-[var(--color-text-muted)] transition">
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-[var(--color-border)] rounded-xl mb-4 bg-[var(--color-bg)]/50">
                <UploadCloud className="mx-auto text-[var(--color-text-muted)] mb-2" size={24} />
                <p className="text-sm text-[var(--color-text-muted)]">No resume uploaded</p>
              </div>
            )}

            <div>
              <Button 
                variant="outline" 
                className="w-full" 
                isLoading={uploading} 
                leftIcon={<UploadCloud size={16} />}
                onClick={handleTriggerUpload}
              >
                {uploading ? "Uploading..." : resumeUrl ? "Update Resume" : "Upload Resume"}
              </Button>
              <input 
                ref={resumeInputRef}
                type="file" 
                className="hidden" 
                accept=".pdf,.docx" 
                onChange={handleUploadCV} 
                disabled={uploading} 
              />
            </div>
          </div>
        </div>

        {/* ── Right Column: Proofs ────────────────────────────── */}
        <div className="lg:col-span-2">
          <h2 className="heading-md mb-6 flex items-center gap-2 text-[var(--color-text)] font-semibold">
            <Award size={20} className="text-amber-400" /> Verified Proofs Vault
          </h2>

          {/* Using the existing grid component but wrapped nicely */}
          <div className="bg-[var(--color-surface)]/50 rounded-2xl">
            <ProofCardsGrid allowTogglePublic={true} />
          </div>
        </div>

      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentName={fullName}
        currentAvatarUrl={user?.avatar_url || null}
        currentSkills={skills}
        currentLanguages={languages}
        currentWorkStatus={workStatus}
        currentBio={bio}
        currentLinkedin={linkedin}
        currentGithub={github}
        currentWebsite={website}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
}