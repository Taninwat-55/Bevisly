import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import {
  X,
  Globe,
  Linkedin,
  Github,
  Star,
  BadgeCheck,
  Code,
  Languages,
  ExternalLink,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CandidateProfile {
  full_name: string | null;
  bio: string | null;
  skills: string[] | null;
  languages: string[] | null;
  work_status: string | null;
  avatar_url: string | null;
  username: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
}

interface PublicProof {
  id: string | null;
  job_title: string | null;
  company_name: string | null;
  rating: number | null;
  comments: string | null;
  reviewed_at: string | null;
}

interface CandidateProfileDrawerProps {
  userId: string | null;
  onClose: () => void;
}

export default function CandidateProfileDrawer({ userId, onClose }: CandidateProfileDrawerProps) {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [proofs, setProofs] = useState<PublicProof[]>([]);
  const [verifiedSkills, setVerifiedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setProfile(null);
    setProofs([]);
    setVerifiedSkills([]);
    setLoading(true);

    const fetch = async () => {
      const [{ data: profileData }, { data: proofData }, { data: submissions }] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, bio, skills, languages, work_status, avatar_url, username, linkedin_url, github_url, website_url")
          .eq("id", userId)
          .single(),
        supabase
          .from("proof_cards")
          .select("id, job_title, company_name, rating, comments, reviewed_at")
          .eq("user_id", userId)
          .eq("is_public", true)
          .order("reviewed_at", { ascending: false })
          .limit(4),
        supabase
          .from("submissions")
          .select(`
            id,
            status,
            feedback ( stars ),
            jobs ( required_skills )
          `)
          .eq("user_id", userId)
          .eq("status", "reviewed")
      ]);

      setProfile(profileData as CandidateProfile | null);
      setProofs((proofData as PublicProof[]) ?? []);

      // Process verified skills
      if (submissions) {
        const verified = new Set<string>();
        submissions.forEach((s: any) => {
          const feedbackArr = Array.isArray(s.feedback) ? s.feedback : [s.feedback];
          const maxStars = Math.max(0, ...feedbackArr.map((f: any) => f?.stars ?? 0));
          
          if (maxStars >= 4 && s.jobs?.required_skills) {
            s.jobs.required_skills.forEach((skill: string) => verified.add(skill.toLowerCase()));
          }
        });
        setVerifiedSkills(Array.from(verified));
      }

      setLoading(false);
    };

    fetch();
  }, [userId]);

  const workStatusBadge = (status: string | null) => {
    switch (status) {
      case "open":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Open to Work
          </span>
        );
      case "partial":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Passively Looking
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-400 text-xs font-semibold border border-slate-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Not Open to Work
          </span>
        );
      default:
        return null;
    }
  };

  return createPortal(
    <AnimatePresence>
      {userId && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-[var(--color-bg)] border-l border-[var(--color-border)] shadow-2xl flex flex-col"
          >
            {/* Sticky header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
              <span className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Candidate Profile</span>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--color-brand-primary)] border-t-transparent animate-spin" />
                  <p className="text-sm text-[var(--color-text-muted)]">Loading profile…</p>
                </div>
              ) : !profile ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <p className="text-sm text-[var(--color-text-muted)]">Profile not available.</p>
                </div>
              ) : (
                <div className="p-6 space-y-6">

                  {/* Identity */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shrink-0 overflow-hidden shadow-lg">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        profile.full_name?.[0]?.toUpperCase() ?? "?"
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-1.5 flex-wrap">
                        {profile.full_name || "Anonymous"}
                        {proofs.length > 0 && <BadgeCheck size={18} className="text-blue-500 shrink-0" />}
                      </h2>
                      <div className="mt-1.5">{workStatusBadge(profile.work_status)}</div>

                      {/* Social links */}
                      <div className="flex gap-1.5 mt-3">
                        {profile.linkedin_url && (
                          <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[#0077b5] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="LinkedIn">
                            <Linkedin size={14} />
                          </a>
                        )}
                        {profile.github_url && (
                          <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="GitHub">
                            <Github size={14} />
                          </a>
                        )}
                        {profile.website_url && (
                          <a href={profile.website_url} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                            title="Website">
                            <Globe size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)]">
                      <p className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-line">{profile.bio}</p>
                    </div>
                  )}

                  {/* Skills + Languages */}
                  {((profile.skills && profile.skills.length > 0) || (profile.languages && profile.languages.length > 0)) && (
                    <div className="space-y-3">
                      {profile.skills && profile.skills.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Code size={13} className="text-purple-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Skills</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.skills.map((s) => {
                              const isVerified = verifiedSkills.includes(s.toLowerCase());
                              return (
                                <span
                                  key={s}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all
                                    ${isVerified
                                      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300/50 dark:border-amber-700/50 text-amber-700 dark:text-amber-300 ring-1 ring-amber-400/20"
                                      : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                                    }`}
                                  title={isVerified ? "Skill verified via Bevisly Proof Task" : undefined}
                                >
                                  {isVerified && <BadgeCheck size={12} className="text-amber-500" fill="currentColor" />}
                                  {s}
                                </span>
                              );
                            })}
                          </div>
                          {verifiedSkills.length > 0 && (
                            <p className="mt-2 text-[9px] text-[var(--color-text-muted)] flex items-center gap-1 italic px-0.5">
                              <BadgeCheck size={10} className="text-amber-500" />
                              Verified skills earned via 4+ star Proof Tasks
                            </p>
                          )}
                        </div>
                      )}
                      {profile.languages && profile.languages.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Languages size={13} className="text-emerald-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Languages</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.languages.map((l) => (
                              <span key={l} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                                {l}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Public Proofs */}
                  {proofs.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-3">
                        <BadgeCheck size={13} className="text-violet-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                          Verified Proofs ({proofs.length})
                        </span>
                      </div>
                      <div className="space-y-2.5">
                        {proofs.map((proof) => (
                          <div
                            key={proof.id}
                            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                {proof.company_name && (
                                  <p className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1 mb-0.5">
                                    <Building2 size={10} className="shrink-0" />
                                    {proof.company_name}
                                  </p>
                                )}
                                <p className="text-sm font-semibold text-[var(--color-text)] leading-snug truncate">
                                  {proof.job_title}
                                </p>
                              </div>
                              {proof.rating != null && (
                                <div className="flex items-center gap-0.5 shrink-0">
                                  {[1, 2, 3, 4, 5].map((n) => (
                                    <Star
                                      key={n}
                                      size={11}
                                      className={n <= Math.round(proof.rating!) ? "fill-amber-400 text-amber-400" : "fill-white/10 text-white/10"}
                                    />
                                  ))}
                                  <span className="ml-1 text-[11px] font-bold text-amber-400">{proof.rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                            {proof.comments && (
                              <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mt-2 italic leading-relaxed">
                                "{proof.comments}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {proofs.length === 0 && (
                    <div className="text-center py-6 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]">
                      <p className="text-xs text-[var(--color-text-muted)]">No public proofs yet.</p>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Sticky footer CTA */}
            {!loading && profile && (
              <div className="shrink-0 px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
                {profile.username ? (
                  <a
                    href={`/@${profile.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button className="w-full" rightIcon={<ExternalLink size={14} />}>
                      View Full Profile
                    </Button>
                  </a>
                ) : (
                  <a
                    href={`/candidate/${userId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button className="w-full" rightIcon={<ExternalLink size={14} />}>
                      View Full Profile
                    </Button>
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
