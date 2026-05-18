import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import {
  Copy,
  Loader2,
  Star,
  BadgeCheck,
  Briefcase,
  Lock,
  UserX,
  Code,
  Zap,
  Bookmark,
  ShieldCheck,
  AtSign,
  GraduationCap,
} from "lucide-react";
import toast from "react-hot-toast";
import type { ProfileLite, ProofCardLite } from "@/types/shared";
import BackButton from "@/components/common/BackButton";
import { ShareToLinkedIn } from "@/components/sharing";
import CandidateProjects from "@/components/profile/CandidateProjects";
import { motion } from "framer-motion";

interface PublicProfile extends ProfileLite {
  username?: string | null;
  is_public?: boolean;
  email?: string | null;
  bevisly_score?: number | null;
  reliability_score?: number | null;
  banner_url?: string | null;
  video_intro_url?: string | null;
  skills?: string[] | null;
  education?: { level: string; field?: string; institution?: string; graduation_year?: string }[] | null;
  experience?: { years?: string } | null;
}

export default function PublicProfilePage({ isWorkspaceView = false }: { isWorkspaceView?: boolean }) {
  const { username, id } = useParams<{ username?: string; id?: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [cards, setCards] = useState<ProofCardLite[]>([]);
  const [featuredCards, setFeaturedCards] = useState<ProofCardLite[]>([]);
  const [verifiedSkills, setVerifiedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"not_found" | "private" | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const targetId = id || (!username ? user?.id : undefined);
    if (!username && !targetId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Look up by username (SEO route) or by UUID (legacy route)
        const query = supabase
          .from("profiles")
          .select(
            "id, full_name, credits, bevisly_score, reliability_score, email, avatar_url, banner_url, video_intro_url, skills, is_public, username, education, experience",
          );

        const { data: prof, error: profErr } = username
          ? await query.eq("username", username.toLowerCase()).single()
          : await query.eq("id", targetId!).single();

        if (profErr || !prof) {
          setError("not_found");
          return;
        }

        // Type assert for extended fields
        const profileData = prof as unknown as PublicProfile;

        // Check if profile is public — owners always see their own profile
        const isOwner = user?.id === profileData.id;
        if (profileData.is_public === false && !isOwner) {
          setError("private");
          setProfile(profileData);
          return;
        }

        setProfile(profileData);

        // Fetch proofs, featured proofs, and verified skills
        const [
          { data: rpcTimeline },
          { data: submissions },
          { data: featured },
        ] = await Promise.all([
          supabase.rpc("get_recent_activity", { user_id: prof.id }),
          supabase
            .from("submissions")
            .select(
              `
                            id,
                            status,
                            feedback ( stars ),
                            jobs ( required_skills )
                        `,
            )
            .eq("user_id", prof.id)
            .eq("status", "reviewed"),
          supabase
            .from("proof_cards")
            .select(
              "id, job_title, rating, comments, reviewed_at, submission_id, is_featured",
            )
            .eq("user_id", prof.id)
            .eq("is_featured", true)
            .order("reviewed_at", { ascending: false }),
        ]);

        setFeaturedCards(featured ?? []);

        if (
          rpcTimeline &&
          Array.isArray(rpcTimeline) &&
          rpcTimeline.length > 0
        ) {
          setCards(rpcTimeline);
        } else {
          // Fallback to direct query
          const { data: fallbackProofs } = await supabase
            .from("proof_cards")
            .select(
              "id, job_title, rating, comments, reviewed_at, submission_id, is_featured",
            )
            .eq("user_id", prof.id)
            .order("reviewed_at", { ascending: false })
            .limit(10);
          setCards(fallbackProofs ?? []);
        }

        // Process verified skills
        if (submissions) {
          const verified = new Set<string>();
          submissions.forEach((s) => {
            const sub = s as unknown as {
              feedback: { stars: number } | { stars: number }[] | null;
              jobs: { required_skills: string[] } | null;
            };
            const feedbackArr = Array.isArray(sub.feedback)
              ? sub.feedback
              : [sub.feedback];
            const maxStars = Math.max(
              0,
              ...feedbackArr.map((f) => f?.stars ?? 0),
            );

            if (maxStars >= 4 && sub.jobs?.required_skills) {
              sub.jobs.required_skills.forEach((skill: string) =>
                verified.add(skill.toLowerCase()),
              );
            }
          });
          setVerifiedSkills(Array.from(verified));
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("not_found");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, id, user?.id]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-3">
        <Loader2
          className="animate-spin text-[var(--color-candidate)]"
          size={32}
        />
        <p className="text-sm text-[var(--color-text-muted)]">
          Loading profile...
        </p>
      </div>
    );
  }

  // Profile not found
  if (error === "not_found") {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
            <UserX size={36} className="text-[var(--color-text-muted)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
            Profile Not Found
          </h1>
          <p className="text-[var(--color-text-muted)] mb-6">
            The profile <span className="font-medium">{username ? `@${username}` : "you're looking for"}</span> doesn't
            exist or may have been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-candidate)] text-white rounded-xl font-medium hover:opacity-90 transition"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Private profile
  if (error === "private") {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Lock size={36} className="text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
            Private Profile
          </h1>
          <p className="text-[var(--color-text-muted)] mb-6">
            <span className="font-medium">
              {profile?.full_name || (username ? `@${username}` : "This user")}
            </span>{" "}
            has set their profile to private.
          </p>
          <Link
            to="/leaderboard"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl font-medium hover:bg-[var(--color-bg)] transition"
          >
            View Leaderboard
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const isOwner = user?.id === profile.id;
  const visibleCards = showAll ? cards : cards.slice(0, 6);
  const publicIdentifier = profile.username ? `@${profile.username}` : `candidate/${profile.id}`;
  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${publicIdentifier}`
      : `https://bevisly.com/${publicIdentifier}`;
  const displayName = profile.full_name || profile.username || "Candidate";

  // Structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.full_name,
    url: profileUrl,
    description: `Verified skills portfolio on Bevisly with ${cards.length} proofs`,
    sameAs: [profileUrl],
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{displayName} - Bevisly Profile</title>
        <meta
          name="description"
          content={`${displayName}'s verified skills portfolio. ${cards.length} proofs completed.`}
        />

        {/* Open Graph (Targeting LinkedIn & Facebook) */}
        <meta property="og:site_name" content="Bevisly" />
        <meta
          property="og:title"
          content={`${displayName} | Bevisly Profile`}
        />
        <meta
          property="og:description"
          content={`View ${displayName}'s verified proof portfolio. ${cards.length} proofs completed.`}
        />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={profileUrl} />
        <meta
          property="og:image"
          content={
            profile.avatar_url || "https://bevisly.com/og-card-default.png"
          }
        />
        <meta
          property="og:image:alt"
          content={`${displayName}'s Profile avatar`}
        />
        {profile.username && (
          <meta property="profile:username" content={profile.username} />
        )}

        {/* Twitter Cards fallback */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@bevisly" />
        <meta
          name="twitter:title"
          content={`${displayName} | Bevisly Profile`}
        />
        <meta
          name="twitter:description"
          content={`View ${displayName}'s verified proof portfolio. ${cards.length} proofs completed.`}
        />
        <meta
          name="twitter:image"
          content={
            profile.avatar_url || "https://bevisly.com/og-card-default.png"
          }
        />

        <link rel="canonical" href={profileUrl} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <motion.div
        className="min-h-screen bg-[var(--color-bg)] px-4 md:px-6 py-8 md:py-12 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-4xl mx-auto">
          {!isWorkspaceView && <BackButton label="Back to Home" to="/" />}

          {/* Profile Header Card */}
          <div className="mt-8 relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm text-center">
            {/* Accent Bar or Banner */}
            <div
              className="w-full h-32 md:h-48 bg-gradient-to-r from-[var(--color-candidate)] to-purple-500 relative"
              style={
                profile.banner_url
                  ? {
                      backgroundImage: `url(${profile.banner_url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {}
              }
            />

            <div className="relative z-10 flex flex-col items-center px-6 pb-8 md:px-8 -mt-12 md:-mt-16">
              {/* Avatar */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[var(--color-candidate)] to-purple-600 flex items-center justify-center text-white text-3xl md:text-4xl font-bold mb-4 shadow-lg overflow-hidden shrink-0">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={`${profile.full_name}'s avatar`}
                    className="w-full h-full object-cover bg-white"
                  />
                ) : (
                  profile.full_name?.charAt(0) || "U"
                )}
              </div>

              {/* Name with Badge */}
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] flex items-center gap-2">
                {profile.full_name ?? "Anonymous"}
                <BadgeCheck className="text-blue-500" size={24} fill="white" />
              </h1>

              {/* Username */}
              {profile.username && (
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  @{profile.username}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm font-medium text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full font-bold">
                  <BadgeCheck size={16} className="text-emerald-500" />
                  {cards.length} Verified Proof{cards.length === 1 ? "" : "s"}
                </span>
                {(profile.bevisly_score ?? 0) > 0 && (
                  <span className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full font-bold">
                    <Zap size={16} className="text-indigo-500" />
                    {profile.bevisly_score} Bevisly Score
                  </span>
                )}
                {(profile.reliability_score ?? 0) > 0 && (
                  <span
                    className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full font-bold"
                    title="Reliability Score — based on proof completion rate and profile completeness"
                  >
                    <ShieldCheck size={16} className="text-emerald-500" />
                    {profile.reliability_score} Reliable
                  </span>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                {profile.video_intro_url && (
                  <a
                    href={profile.video_intro_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl font-semibold transition shadow-sm"
                  >
                    <Zap size={16} />
                    Watch Video Intro
                  </a>
                )}
                <a
                  href={`mailto:${profile.email}?subject=Interview Request via Bevisly`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-text)] text-[var(--color-bg)] rounded-xl font-semibold hover:opacity-90 transition shadow-md"
                >
                  <Briefcase size={16} />
                  Hire This Candidate
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(profileUrl);
                    toast.success("Profile link copied!");
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl font-medium hover:bg-[var(--color-surface)] transition"
                >
                  <Copy size={16} />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Set-username nudge — owner is viewing via UUID and has no username yet */}
          {isOwner && !profile.username && (
            <div className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-500 dark:text-blue-300 text-sm">
              <AtSign size={16} className="shrink-0" />
              <span>
                Pick a username to share your profile at{" "}
                <strong>/@yourname</strong> instead of a long ID.{" "}
                <Link
                  to="/candidate/settings"
                  className="underline font-semibold hover:opacity-80 transition"
                >
                  Set username in Settings.
                </Link>
              </span>
            </div>
          )}

          {/* Private profile banner — only visible to the owner */}
          {isOwner && !profile.is_public && (
            <div className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
              <Lock size={16} className="shrink-0" />
              <span>
                Your profile is <strong>private</strong> — employers can't see
                it yet.{" "}
                <Link
                  to="/candidate/settings?tab=privacy"
                  className="underline font-semibold hover:text-amber-300 transition"
                >
                  Go to Settings to make it public.
                </Link>
              </span>
            </div>
          )}

          {/* Skills Section */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="mt-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
                <Code size={16} /> Skills & Expertise
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => {
                  const isVerified = verifiedSkills.includes(
                    skill.toLowerCase(),
                  );
                  return (
                    <div
                      key={skill}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border flex items-center gap-2 transition-all shadow-sm
                                                ${
                                                  isVerified
                                                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300/50 dark:border-amber-700/50 text-amber-700 dark:text-amber-300 ring-1 ring-amber-400/20"
                                                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                                                }`}
                      title={
                        isVerified
                          ? "Skill verified via Bevisly Proof Task"
                          : undefined
                      }
                    >
                      {isVerified && (
                        <BadgeCheck
                          size={14}
                          className="text-amber-500"
                          fill="currentColor"
                        />
                      )}
                      {skill}
                    </div>
                  );
                })}
              </div>

              {verifiedSkills.length > 0 && (
                <p className="mt-4 text-[10px] text-[var(--color-text-muted)] flex items-center gap-1.5 px-1 italic">
                  <BadgeCheck size={12} className="text-amber-500" />
                  Verified skills are earned via 4+ star Proof Tasks
                </p>
              )}
            </div>
          )}

          {/* Education & Experience */}
          {(profile.education?.length || profile.experience?.years) && (
            <div className="mt-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
                <GraduationCap size={16} /> Education & Experience
              </h2>
              <div className="space-y-3">
                {profile.education?.map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-hover)] flex items-center justify-center shrink-0 mt-0.5">
                      <GraduationCap size={14} className="text-[var(--color-text-muted)]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        {entry.level}{entry.field ? ` · ${entry.field}` : ""}
                      </p>
                      {(entry.institution || entry.graduation_year) && (
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                          {[entry.institution, entry.graduation_year].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {profile.experience?.years && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-hover)] flex items-center justify-center shrink-0">
                      <Briefcase size={14} className="text-[var(--color-text-muted)]" />
                    </div>
                    <p className="text-sm text-[var(--color-text)]">
                      <span className="font-semibold">{profile.experience.years}</span> of relevant experience
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Featured Proofs */}
          {featuredCards.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-2">
                <Bookmark
                  size={20}
                  className="text-amber-400"
                  fill="currentColor"
                />
                Featured Work
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {featuredCards.map((card) => (
                  <motion.div
                    key={card.submission_id ?? card.id}
                    whileHover={{ y: -2 }}
                    className="relative p-px rounded-2xl"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(251,191,36,0.6) 0%, rgba(30,30,40,0) 50%, rgba(245,158,11,0.45) 100%)",
                    }}
                  >
                    <div className="rounded-[calc(1rem-1px)] bg-[var(--color-surface)] p-5 h-full">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Bookmark
                              size={11}
                              className="text-amber-400 shrink-0"
                              fill="currentColor"
                            />
                            <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400">
                              Featured
                            </span>
                          </div>
                          <h3 className="font-semibold text-[var(--color-text)] text-lg line-clamp-1">
                            {card.job_title}
                          </h3>
                        </div>
                        {card.rating && (
                          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded text-xs font-bold text-amber-700 dark:text-amber-400 shrink-0">
                            <Star size={12} fill="currentColor" />
                            {card.rating.toFixed(1)}
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2 italic">
                        "
                        {card.comments ||
                          "Excellent work demonstrating core skills."}
                        "
                      </p>

                      <div className="pt-3 border-t border-white/5 flex justify-between items-center text-xs text-[var(--color-text-muted)]">
                        <span className="flex items-center gap-1">
                          <BadgeCheck size={12} className="text-green-500" />
                          Verified
                        </span>
                        <span>
                          {new Date(
                            card.reviewed_at ?? "",
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Verified Proofs Grid */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-2">
              <BadgeCheck className="text-[var(--color-candidate)]" />
              Verified Portfolio
            </h2>

            {cards.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface)]">
                <p className="text-[var(--color-text-muted)]">
                  No verified proofs yet.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {visibleCards.map((card) => (
                  <motion.div
                    key={card.id ?? card.job_title}
                    whileHover={{ y: -2 }}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm hover:shadow-md transition group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-[var(--color-text)] text-lg line-clamp-1 group-hover:text-[var(--color-candidate-dark)] transition">
                        {card.job_title}
                      </h3>
                      {card.rating && (
                        <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded text-xs font-bold text-yellow-700 dark:text-yellow-400">
                          <Star size={12} fill="currentColor" />
                          {card.rating.toFixed(1)}
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2 italic">
                      "
                      {card.comments ||
                        "Excellent work demonstrating core skills."}
                      "
                    </p>

                    <div className="pt-3 border-t border-[var(--color-border)] flex justify-between items-center text-xs text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1">
                        <BadgeCheck size={12} className="text-green-500" />
                        Verified
                      </span>
                      <span>
                        {new Date(card.reviewed_at ?? "").toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {cards.length > 6 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-sm text-[var(--color-candidate)] hover:underline"
                >
                  {showAll ? "Show Less" : `Show All (${cards.length})`}
                </button>
              </div>
            )}
          </section>

          {/* Candidate Projects */}
          <section className="mt-10">
            <CandidateProjects userId={profile.id} isOwner={isOwner} />
          </section>

          {/* LinkedIn Share CTA — only visible to the profile owner */}
          {cards.length > 0 && isOwner && (
            <section className="mt-8">
              <ShareToLinkedIn
                taskTitle={cards[0]?.job_title || "Proof Task"}
                companyName="Bevisly"
                rating={cards[0]?.rating ?? undefined}
                username={profile.username || undefined}
                variant="card"
              />
            </section>
          )}
        </div>

        {/* Sticky CTA Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)] to-transparent z-50 pointer-events-none flex justify-center pb-8">
          <div className="pointer-events-auto shadow-[0_0_40px_rgba(var(--color-brand-primary),0.3)] rounded-full">
            <a
              href={`mailto:${profile.email}?subject=Interview Request via Bevisly`}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[var(--color-candidate)] to-[var(--color-candidate-dark)] text-white rounded-full font-bold text-lg hover:scale-105 transition-transform"
            >
              <Briefcase size={20} />
              Hire {profile.full_name?.split(" ")[0] || "Candidate"}
            </a>
          </div>
        </div>
      </motion.div>
    </>
  );
}
