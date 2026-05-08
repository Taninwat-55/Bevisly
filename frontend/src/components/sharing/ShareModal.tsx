import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Linkedin, Link2, Twitter, Check, PartyPopper } from "lucide-react";
import toast from "react-hot-toast";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskTitle: string;
    companyName: string;
    rating?: number;
    username?: string | null;
}

export default function ShareModal({
    isOpen,
    onClose,
    taskTitle,
    companyName,
    rating,
    username,
}: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://bevisly.com";
    const profileUrl = username ? `${baseUrl}/@${username}` : `${baseUrl}/leaderboard`;

    const ratingText = rating ? ` and earned a ${rating}-star rating` : "";

    const shareText = `🚀 I just verified my skills on Bevisly!\n\nCompleted "${taskTitle}" for ${companyName}${ratingText}.\n\nNo resumes. Just proof.\n\n${profileUrl}\n\n#ProofOfWork #Bevisly`;

    const handleLinkedInShare = () => {
        const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText)}`;
        window.open(url, "_blank", "width=600,height=600");
    };

    const handleTwitterShare = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(url, "_blank", "width=600,height=600");
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(profileUrl);
            setCopied(true);
            toast.success("Link copied!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-x-4 top-1/2 -translate-y-1/2 mx-auto max-w-md z-[60]"
                    >
                        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
                            {/* Confetti Background Effect */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-yellow-300/20 to-orange-300/20 rounded-full blur-3xl" />
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl" />
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                            >
                                <X size={20} />
                            </button>

                            {/* Content */}
                            <div className="relative z-10 text-center">
                                {/* Celebration Icon */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", delay: 0.1 }}
                                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white mb-4 shadow-lg"
                                >
                                    <PartyPopper size={32} />
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-2xl font-bold text-[var(--color-text)] mb-2"
                                >
                                    Proof Verified!
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-[var(--color-text-muted)] mb-6"
                                >
                                    Your work on <span className="font-medium text-[var(--color-text)]">{taskTitle}</span> has been reviewed.
                                    {rating && rating >= 4 && (
                                        <span className="block mt-1 text-emerald-600 dark:text-emerald-400">
                                            Great job earning {rating} stars!
                                        </span>
                                    )}
                                </motion.p>

                                {/* Share Options */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="space-y-3"
                                >
                                    <p className="text-sm text-[var(--color-text-muted)] mb-3">
                                        Share your achievement
                                    </p>

                                    <div className="flex gap-3">
                                        {/* LinkedIn */}
                                        <motion.button
                                            onClick={handleLinkedInShare}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0A66C2] text-white rounded-xl font-medium hover:bg-[#004182] transition-colors"
                                        >
                                            <Linkedin size={18} />
                                            LinkedIn
                                        </motion.button>

                                        {/* Twitter/X */}
                                        <motion.button
                                            onClick={handleTwitterShare}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                                        >
                                            <Twitter size={18} />
                                            X / Twitter
                                        </motion.button>
                                    </div>

                                    {/* Copy Link */}
                                    <motion.button
                                        onClick={handleCopyLink}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-[var(--color-border)] text-[var(--color-text)] rounded-xl font-medium hover:bg-[var(--color-surface)] transition-colors"
                                    >
                                        {copied ? (
                                            <>
                                                <Check size={18} className="text-emerald-500" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Link2 size={18} />
                                                Copy Profile Link
                                            </>
                                        )}
                                    </motion.button>
                                </motion.div>

                                {/* Skip */}
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    onClick={onClose}
                                    className="mt-4 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                                >
                                    Maybe later
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
