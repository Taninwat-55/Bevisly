import { Linkedin, Link2, Check } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface ShareToLinkedInProps {
    taskTitle: string;
    companyName: string;
    rating?: number;
    username?: string | null;
    variant?: "button" | "icon" | "card";
    className?: string;
}

/**
 * Generates LinkedIn share URL with pre-filled post content
 */
function generateLinkedInShareUrl(
    taskTitle: string,
    companyName: string,
    rating: number | undefined,
    username: string | null | undefined
): string {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://bevisly.com";
    const profileUrl = username ? `${baseUrl}/@${username}` : baseUrl;

    const ratingText = rating ? `and earned a ${rating}-star rating` : "";

    const postText = `🚀 I just verified my skills on Bevisly!

Completed a real Proof Task "${taskTitle}" for ${companyName} ${ratingText}.

No more resumes. Just proof.

Check out my verified portfolio: ${profileUrl}

#ProofOfWork #HiringDoneRight #Bevisly #SkillsVerification`;

    // LinkedIn share URL with text
    const linkedInUrl = new URL("https://www.linkedin.com/sharing/share-offsite/");
    linkedInUrl.searchParams.set("url", profileUrl);

    // Note: LinkedIn's share URL doesn't support custom text directly
    // We'll use the feed/share endpoint for better control
    const feedUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(postText)}`;

    return feedUrl;
}

export default function ShareToLinkedIn({
    taskTitle,
    companyName,
    rating,
    username,
    variant = "button",
    className = "",
}: ShareToLinkedInProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = generateLinkedInShareUrl(taskTitle, companyName, rating, username);
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://bevisly.com";
    const profileUrl = username ? `${baseUrl}/@${username}` : `${baseUrl}/leaderboard`;

    const handleShare = () => {
        window.open(shareUrl, "_blank", "width=600,height=600");
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(profileUrl);
            setCopied(true);
            toast.success("Profile link copied!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy link");
        }
    };

    if (variant === "icon") {
        return (
            <button
                onClick={handleShare}
                className={`p-2 rounded-lg hover:bg-[var(--color-surface)] text-[#0A66C2] hover:scale-105 transition-all ${className}`}
                title="Share to LinkedIn"
            >
                <Linkedin size={20} />
            </button>
        );
    }

    if (variant === "card") {
        return (
            <div className={`glass-panel rounded-2xl p-6 ${className}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-[#0A66C2]/10">
                        <Linkedin size={24} className="text-[#0A66C2]" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[var(--color-text)]">Share Your Achievement</h3>
                        <p className="text-sm text-[var(--color-text-muted)]">Let your network know!</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <motion.button
                        onClick={handleShare}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0A66C2] text-white rounded-xl font-medium hover:bg-[#004182] transition-colors"
                    >
                        <Linkedin size={18} />
                        Share on LinkedIn
                    </motion.button>

                    <motion.button
                        onClick={handleCopyLink}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2.5 border border-[var(--color-border)] text-[var(--color-text)] rounded-xl font-medium hover:bg-[var(--color-surface)] transition-colors"
                    >
                        <AnimatePresence mode="wait">
                            {copied ? (
                                <motion.span
                                    key="check"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                >
                                    <Check size={18} className="text-emerald-500" />
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="copy"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                >
                                    <Link2 size={18} />
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </div>
        );
    }

    // Default: button variant
    return (
        <motion.button
            onClick={handleShare}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white rounded-xl font-medium hover:bg-[#004182] transition-colors ${className}`}
        >
            <Linkedin size={16} />
            Share on LinkedIn
        </motion.button>
    );
}

// Export utility for external use
export { generateLinkedInShareUrl };
