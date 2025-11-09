import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function EmployerFeedbackSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/employer/dashboard"), 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)] text-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-soft)] rounded-[var(--radius-card)] p-10 max-w-md">
        <h1 className="text-3xl font-semibold text-[var(--color-employer-dark)] mb-4">
          🎉 Feedback Submitted!
        </h1>
        <p className="text-[var(--color-text-muted)] mb-6">
          Your feedback has been successfully recorded and sent to the
          candidate.
        </p>
        <button
          onClick={() => navigate("/employer/dashboard")}
          className="bg-[var(--color-employer)] text-white px-6 py-2 rounded-[var(--radius-button)] hover:bg-[var(--color-employer-dark)] transition"
        >
          ← Back to Dashboard
        </button>
      </div>
    </motion.div>
  );
}
