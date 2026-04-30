import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import {
    Copy, Loader2, Star, BadgeCheck, Briefcase,
    Lock, UserX
} from "lucide-react";
import toast from "react-hot-toast";
import type { ProfileLite, ProofCardLite } from "@/types/shared";
import BackButton from "@/components/common/BackButton";
import { ShareToLinkedIn } from "@/components/sharing";
import { motion } from "framer-motion";

interface PublicProfile extends ProfileLite {
    username?: string | null;
    is_public?: boolean;
    email?: string | null;
}

export default function PublicProfilePage() {
    const { username, id } = useParams<{ username?: string; id?: string }>();
    const { user } = useAuth();
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [cards, setCards] = useState<ProofCardLite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<"not_found" | "private" | null>(null);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        if (!username && !id) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Look up by username (SEO route) or by UUID (legacy route)
                const query = supabase
                    .from("profiles")
                    .select("id, full_name, credits, email, avatar_url");

                const { data: prof, error: profErr } = username
                    ? await query.eq("username", username.toLowerCase()).single()
                    : await query.eq("id", id!).single();

                if (profErr || !prof) {
                    setError("not_found");
                    return;
                }

                // Type assert for extended fields
                const profileData = prof as unknown as PublicProfile;

                // Check if profile is public (default to public if column missing)
                if (profileData.is_public === false) {
                    setError("private");
                    setProfile(profileData);
                    return;
                }

                setProfile(profileData);

                // Fetch proofs
                const { data: rpcTimeline } = await supabase.rpc("get_recent_activity", { user_id: prof.id });

                if (rpcTimeline && Array.isArray(rpcTimeline) && rpcTimeline.length > 0) {
                    setCards(rpcTimeline);
                } else {
                    // Fallback to direct query
                    const { data: fallbackProofs } = await supabase
                        .from("proof_cards")
                        .select("id, job_title, rating, comments, reviewed_at, submission_id")
                        .eq("user_id", prof.id)
                        .order("reviewed_at", { ascending: false })
                        .limit(10);
                    setCards(fallbackProofs ?? []);
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError("not_found");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [username]);

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen gap-3">
                <Loader2 className="animate-spin text-[var(--color-candidate)]" size={32} />
                <p className="text-sm text-[var(--color-text-muted)]">Loading profile...</p>
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
                    <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Profile Not Found</h1>
                    <p className="text-[var(--color-text-muted)] mb-6">
                        The profile <span className="font-medium">@{username}</span> doesn't exist or may have been removed.
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
                    <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Private Profile</h1>
                    <p className="text-[var(--color-text-muted)] mb-6">
                        <span className="font-medium">{profile?.full_name || `@${username}`}</span> has set their profile to private.
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

    const visibleCards = showAll ? cards : cards.slice(0, 6);
    const profileUrl = typeof window !== "undefined"
        ? `${window.location.origin}/@${username}`
        : `https://bevisly.com/@${username}`;

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
                <title>{profile.full_name || username} - Bevisly Profile</title>
                <meta
                    name="description"
                    content={`${profile.full_name || username}'s verified skills portfolio. ${cards.length} proofs completed.`}
                />
                
                {/* Open Graph (Targeting LinkedIn & Facebook) */}
                <meta property="og:site_name" content="Bevisly" />
                <meta property="og:title" content={`${profile.full_name || username} | Bevisly Profile`} />
                <meta property="og:description" content={`View ${profile.full_name || username}'s verified proof portfolio. ${cards.length} proofs completed.`} />
                <meta property="og:type" content="profile" />
                <meta property="og:url" content={profileUrl} />
                <meta property="og:image" content={profile.avatar_url || "https://bevisly.com/og-card-default.png"} />
                <meta property="og:image:alt" content={`${profile.full_name || username}'s Profile avatar`} />
                {profile.username && <meta property="profile:username" content={profile.username} />}

                {/* Twitter Cards fallback */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@bevisly" />
                <meta name="twitter:title" content={`${profile.full_name || username} | Bevisly Profile`} />
                <meta name="twitter:description" content={`View ${profile.full_name || username}'s verified proof portfolio. ${cards.length} proofs completed.`} />
                <meta name="twitter:image" content={profile.avatar_url || "https://bevisly.com/og-card-default.png"} />

                <link rel="canonical" href={profileUrl} />
                <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            </Helmet>

            <motion.div
                className="min-h-screen bg-[var(--color-bg)] px-4 md:px-6 py-8 md:py-12 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="max-w-4xl mx-auto">
                    <BackButton label="Back to Home" to="/" />

                    {/* Profile Header Card */}
                    <div className="mt-8 relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8 shadow-sm text-center">
                        {/* Accent Bar */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-candidate)] to-purple-500" />

                        <div className="relative z-10 flex flex-col items-center">
                            {/* Avatar */}
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[var(--color-candidate)] to-purple-600 flex items-center justify-center text-white text-3xl md:text-4xl font-bold mb-4 shadow-lg">
                                {profile.full_name?.charAt(0) || "U"}
                            </div>

                            {/* Name with Badge */}
                            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] flex items-center gap-2">
                                {profile.full_name ?? "Anonymous"}
                                <BadgeCheck className="text-blue-500" size={24} fill="white" />
                            </h1>

                            {/* Username */}
                            <p className="text-sm text-[var(--color-text-muted)] mt-1">@{username}</p>

                            {/* Stats */}
                            <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm font-medium text-[var(--color-text-muted)]">
                                <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full font-bold">
                                    <BadgeCheck size={16} className="text-emerald-500" />
                                    {cards.length} Verified Proof{cards.length === 1 ? '' : 's'}
                                </span>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap justify-center gap-3 mt-6">
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

                    {/* Verified Proofs Grid */}
                    <section className="mt-10">
                        <h2 className="text-xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-2">
                            <BadgeCheck className="text-[var(--color-candidate)]" />
                            Verified Portfolio
                        </h2>

                        {cards.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface)]">
                                <p className="text-[var(--color-text-muted)]">No verified proofs yet.</p>
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
                                            "{card.comments || "Excellent work demonstrating core skills."}"
                                        </p>

                                        <div className="pt-3 border-t border-[var(--color-border)] flex justify-between items-center text-xs text-[var(--color-text-muted)]">
                                            <span className="flex items-center gap-1">
                                                <BadgeCheck size={12} className="text-green-500" />
                                                Verified
                                            </span>
                                            <span>{new Date(card.reviewed_at ?? "").toLocaleDateString()}</span>
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

                    {/* LinkedIn Share CTA — only visible to the profile owner */}
                    {cards.length > 0 && user?.id === profile?.id && (
                        <section className="mt-8">
                            <ShareToLinkedIn
                                taskTitle={cards[0]?.job_title || "Proof Task"}
                                companyName="Bevisly"
                                rating={cards[0]?.rating ?? undefined}
                                username={username}
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
                            Hire {profile.full_name?.split(' ')[0] || "Candidate"}
                        </a>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
