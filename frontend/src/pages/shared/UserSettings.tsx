import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import BackButton from "@/components/ui/BackButton";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function UserSettings() {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [emailNotif, setEmailNotif] = useState(true);

  const handleSave = () => {
    toast.success("✅ Settings saved!");
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("👋 Logged out successfully");
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] px-6 md:px-10 py-12 transition-colors">
      {/* 🧭 Header */}
      <header className="mb-8 flex flex-col gap-2">
        <BackButton
          to={`/${user?.role}`}
          label="Back"
          className="mb-2 border-transparent hover:border-[var(--color-border)]"
        />
        <h1 className="heading-lg flex items-center gap-2">
          ⚙️ Account Settings
        </h1>
        <p className="body-base text-[var(--color-text-muted)]">
          Manage your profile, preferences, and account.
        </p>
      </header>

      {/* ⚙️ Settings Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] border border-[var(--color-border)] p-6 space-y-8 max-w-2xl"
      >
        {/* 👤 Basic Info */}
        <section>
          <h2 className="heading-md mb-4">Profile</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium text-[var(--color-text)]">
                Email:
              </span>{" "}
              <span className="text-[var(--color-text-muted)]">
                {user?.email ?? "—"}
              </span>
            </p>
            <p>
              <span className="font-medium text-[var(--color-text)]">
                Role:
              </span>{" "}
              <span className="capitalize text-[var(--color-text-muted)]">
                {user?.role ?? "—"}
              </span>
            </p>
          </div>
        </section>

        {/* 🔔 Preferences */}
        <section>
          <h2 className="heading-md mb-4">Preferences</h2>
          <div className="flex flex-col gap-3 text-sm">
            <label className="flex items-center justify-between cursor-pointer border border-[var(--color-border)] rounded-[var(--radius-button)] px-4 py-2 hover:bg-[var(--color-bg-hover)] transition">
              <span>Email notifications</span>
              <input
                type="checkbox"
                checked={emailNotif}
                onChange={() => setEmailNotif((prev) => !prev)}
                className="accent-[var(--color-candidate-dark)] cursor-pointer"
              />
            </label>

            <div className="flex items-center justify-between border border-[var(--color-border)] rounded-[var(--radius-button)] px-4 py-2 transition hover:bg-[var(--color-bg-hover)]">
              <span className="text-sm">Dark mode</span>
              <button
                onClick={toggleTheme}
                className="rounded-lg p-2 hover-bg-soft transition"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="cursor-pointer w-4 h-4 text-[var(--color-employer-dark)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m8.66-11.34l-.7.7M4.04 19.96l-.7.7m0-16.32l.7.7M19.96 19.96l.7.7M4 12H3m18 0h-1M7 17a5 5 0 0010 0 5 5 0 00-10 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="cursor-pointer w-4 h-4 text-[var(--color-employer-dark)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* ⚙️ Account Actions */}
        <section>
          <h2 className="heading-md mb-4">Account</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              className="bg-[var(--color-candidate)] text-white px-5 py-2 rounded-[var(--radius-button)] hover:bg-[var(--color-candidate-dark)] transition shadow-[var(--shadow-soft)]"
            >
              💾 Save Changes
            </button>
            <button
              onClick={() => toast("🔐 Password reset feature coming soon")}
              className="border border-[var(--color-border)] px-5 py-2 rounded-[var(--radius-button)] text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition"
            >
              🔒 Change Password
            </button>
            <button
              onClick={handleLogout}
              className="bg-[var(--color-error)] text-white px-5 py-2 rounded-[var(--radius-button)] hover:brightness-110 transition shadow-[var(--shadow-soft)]"
            >
              🚪 Log Out
            </button>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
