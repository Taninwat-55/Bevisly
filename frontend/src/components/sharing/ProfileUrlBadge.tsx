import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface ProfileUrlBadgeProps {
    username: string | null | undefined;
    isPublic?: boolean;
    showEditPrompt?: boolean;
    onEditClick?: () => void;
}

export default function ProfileUrlBadge({
    username,
    isPublic = false,
    showEditPrompt = false,
    onEditClick,
}: ProfileUrlBadgeProps) {
    const [copied, setCopied] = useState(false);

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://bevisly.com";
    const profileUrl = username ? `${baseUrl}/@${username}` : null;

    const handleCopy = async () => {
        if (!profileUrl) return;
        try {
            await navigator.clipboard.writeText(profileUrl);
            setCopied(true);
            toast.success("Profile URL copied!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy");
        }
    };

    // No username set yet
    if (!username) {
        return (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Claim your public URL
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                        Set a username to get a shareable profile link
                    </p>
                </div>
                {showEditPrompt && onEditClick && (
                    <motion.button
                        onClick={onEditClick}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                    >
                        Set Username
                    </motion.button>
                )}
            </div>
        );
    }

    // Profile not public yet
    if (!isPublic) {
        return (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--color-text-muted)] truncate">
                        {profileUrl}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                        🔒 Profile is private
                    </p>
                </div>
                {showEditPrompt && onEditClick && (
                    <button
                        onClick={onEditClick}
                        className="text-sm text-[var(--color-candidate)] hover:underline"
                    >
                        Make Public
                    </button>
                )}
            </div>
        );
    }

    // Public profile with URL
    return (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 truncate">
                    {profileUrl}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                    ✓ Public profile active
                </p>
            </div>

            <div className="flex items-center gap-1">
                <motion.button
                    onClick={handleCopy}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors"
                    title="Copy URL"
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                </motion.button>

                <a
                    href={profileUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors"
                    title="View profile"
                >
                    <ExternalLink size={16} />
                </a>
            </div>
        </div>
    );
}
