import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("bevis_cookie_consent");
    if (!consent) {
      setTimeout(() => setVisible(true), 1000);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("bevis_cookie_consent", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl rounded-[var(--radius-card)] p-5 z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-sm text-[var(--color-text-muted)]">
        <strong className="text-[var(--color-text)] block mb-1">We respect your data.</strong>
        We use essential cookies to manage user sessions. No third-party tracking ads.
        <br />
        <Link to="/privacy" className="underline hover:text-[var(--color-candidate)]">Read Privacy Policy</Link>.
      </div>
      <div className="flex gap-2">
        <button onClick={accept} className="flex-1 bg-[var(--color-candidate)] text-white text-sm py-2 rounded-[var(--radius-button)] hover:brightness-110 transition">
          Accept
        </button>
        <button onClick={() => setVisible(false)} className="px-3 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          Dismiss
        </button>
      </div>
    </div>
  );
}